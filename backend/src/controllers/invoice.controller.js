const { Invoice, InvoiceItem, User } = require('../models');

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, doc_type } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (doc_type) whereClause.doc_type = doc_type;
    
    // For non-admin users, only show their own invoices
    if (req.user.role !== 'admin') {
      whereClause.issued_by = req.user.id;
    }
    
    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: invoices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบกำกับภาษี' });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'username', 'email']
        },
        {
          model: InvoiceItem,
          as: 'items',
          order: [['item_no', 'ASC']]
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'ไม่พบใบกำกับภาษีที่ระบุ' });
    }
    
    // Check if user can access this invoice
    if (req.user.role !== 'admin' && invoice.issued_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงใบกำกับภาษีนี้' });
    }
    
    res.json({
      success: true,
      data: invoice
    });
    
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบกำกับภาษี' });
  }
};

// Create new invoice
const createInvoice = async (req, res) => {
  try {
    const {
      doc_date,
      customer_id,
      note,
      lines
    } = req.body;
    
    console.log('Received invoice data:', { doc_date, customer_id, note, lines });
    
    // Validate required fields
    if (!doc_date || !customer_id || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (วันที่, ลูกค้า, รายการสินค้า)' 
      });
    }

    // Check if all lines have description
    const emptyLines = lines.filter(line => !line.description || line.description.trim() === '');
    if (emptyLines.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกรายละเอียดสินค้า/บริการให้ครบทุกรายการ' 
      });
    }

    // Get customer information from API (we'll use a placeholder for now)
    let customer = null;
    try {
      // TODO: Implement proper customer/party lookup when Party model is available
      // For now, use placeholder data
      customer = {
        name: `ลูกค้า ID ${customer_id}`,
        tax_id: null,
        address: null,
        phone: null
      };
    } catch (error) {
      console.log('Customer lookup not available, using placeholder');
    }
    
    // Calculate totals from lines
    let subtotal = 0;
    let totalVat = 0;
    let totalWht = 0;
    
    const processedItems = lines.map((line, index) => {
      const lineAmount = (line.qty || 1) * (line.unit_price || 0);
      subtotal += lineAmount;
      
      let lineVat = 0;
      let lineWht = 0;
      
      if (line.vat) {
        lineVat = Math.round(lineAmount * 0.07 * 100) / 100; // 7% VAT
        totalVat += lineVat;
      }
      
      if (line.wht && line.kind === 'service') {
        const whtRate = (line.whtRate || 3) / 100;
        lineWht = Math.round(lineAmount * whtRate * 100) / 100;
        totalWht += lineWht;
      }
      
      return {
        item_no: index + 1,
        description: line.description,
        quantity: line.qty || 1,
        unit: line.unit || 'ชิ้น',
        unit_price: line.unit_price || 0,
        amount: lineAmount,
        vat_rate: line.vat ? 7.00 : 0.00,
        vat_amount: lineVat,
        wht_rate: (line.wht && line.kind === 'service') ? (line.whtRate || 3) : 0.00,
        wht_amount: lineWht,
        total_amount: lineAmount + lineVat - lineWht
      };
    });
    
    const grandTotal = subtotal + totalVat;
    
    // Generate document number
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    // Find the next sequence number for this month
    const lastInvoice = await require('../models').Invoice.findOne({
      where: {
        doc_no: {
          [require('sequelize').Op.like]: `INV${year}${month}%`
        }
      },
      order: [['doc_no', 'DESC']]
    });
    
    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.doc_no.slice(-4));
      sequence = lastSequence + 1;
    }
    
    const doc_no = `INV${year}${month}${String(sequence).padStart(4, '0')}`;
    
    console.log('Generated doc_no:', doc_no);
    console.log('Calculated totals:', { subtotal, totalVat, totalWht, grandTotal });
    
    // Create invoice
    const invoice = await Invoice.create({
      doc_no,
      doc_type: 'invoice',
      doc_date,
      due_date: null,
      customer_id,
      customer_name: customer ? customer.name : `ลูกค้า ID ${customer_id}`,
      customer_tax_id: customer ? customer.tax_id : null,
      customer_address: customer ? customer.address : null,
      customer_phone: customer ? customer.phone : null,
      subtotal: Math.round(subtotal * 100) / 100,
      vat_rate: totalVat > 0 ? 7.00 : 0.00,
      vat_amount: Math.round(totalVat * 100) / 100,
      wht_rate: totalWht > 0 ? 3.00 : 0.00,
      wht_amount: Math.round(totalWht * 100) / 100,
      grand_total: Math.round(grandTotal * 100) / 100,
      paid_amount: 0.00,
      note: note || '',
      issued_by: req.user.id,
      status: 'issued',
      payment_status: 'unpaid'
    });
    
    console.log('Created invoice:', invoice.id);
    
    // Create invoice items
    const invoiceItems = processedItems.map(item => ({
      invoice_id: invoice.id,
      ...item
    }));
    
    await InvoiceItem.bulkCreate(invoiceItems);
    console.log('Created invoice items:', invoiceItems.length);
    
    // Get the created invoice with items
    const createdInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'username', 'email']
        },
        {
          model: InvoiceItem,
          as: 'items'
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'สร้างใบกำกับภาษีสำเร็จ',
      data: createdInvoice,
      doc_no: invoice.doc_no,
      invoice_id: invoice.id
    });
    
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างใบกำกับภาษี' });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      doc_date,
      customer_id,
      note,
      lines
    } = req.body;
    
    console.log('Updating invoice:', id, { doc_date, customer_id, note, lines });
    
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'ไม่พบใบกำกับภาษีที่ระบุ' });
    }
    
    // Check if user can update this invoice
    if (req.user.role !== 'admin' && invoice.issued_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์แก้ไขใบกำกับภาษีนี้' });
    }
    
    // Validate required fields
    if (!doc_date || !customer_id || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (วันที่, ลูกค้า, รายการสินค้า)' 
      });
    }

    // Check if all lines have description
    const emptyLines = lines.filter(line => !line.description || line.description.trim() === '');
    if (emptyLines.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกรายละเอียดสินค้า/บริการให้ครบทุกรายการ' 
      });
    }

    // Calculate totals from lines
    let subtotal = 0;
    let totalVat = 0;
    let totalWht = 0;
    
    const processedItems = lines.map((line, index) => {
      const lineAmount = (line.qty || 1) * (line.unit_price || 0);
      subtotal += lineAmount;
      
      let lineVat = 0;
      let lineWht = 0;
      
      if (line.vat) {
        lineVat = Math.round(lineAmount * 0.07 * 100) / 100; // 7% VAT
        totalVat += lineVat;
      }
      
      if (line.wht && line.kind === 'service') {
        const whtRate = (line.whtRate || 3) / 100;
        lineWht = Math.round(lineAmount * whtRate * 100) / 100;
        totalWht += lineWht;
      }
      
      return {
        item_no: index + 1,
        description: line.description,
        quantity: line.qty || 1,
        unit: line.unit || 'ชิ้น',
        unit_price: line.unit_price || 0,
        amount: lineAmount,
        vat_rate: line.vat ? 7.00 : 0.00,
        vat_amount: lineVat,
        wht_rate: (line.wht && line.kind === 'service') ? (line.whtRate || 3) : 0.00,
        wht_amount: lineWht,
        total_amount: lineAmount + lineVat - lineWht
      };
    });
    
    const grandTotal = subtotal + totalVat;
    
    console.log('Calculated totals for update:', { subtotal, totalVat, totalWht, grandTotal });
    
    // Update invoice
    await invoice.update({
      doc_date,
      customer_id,
      subtotal: Math.round(subtotal * 100) / 100,
      vat_rate: totalVat > 0 ? 7.00 : 0.00,
      vat_amount: Math.round(totalVat * 100) / 100,
      wht_rate: totalWht > 0 ? 3.00 : 0.00,
      wht_amount: Math.round(totalWht * 100) / 100,
      grand_total: Math.round(grandTotal * 100) / 100,
      note: note || ''
    });
    
    // Delete existing items and create new ones
    await InvoiceItem.destroy({ where: { invoice_id: id } });
    
    const invoiceItems = processedItems.map(item => ({
      invoice_id: id,
      ...item
    }));
    
    await InvoiceItem.bulkCreate(invoiceItems);
    console.log('Updated invoice items:', invoiceItems.length);
    
    // Get the updated invoice
    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'username', 'email']
        },
        {
          model: InvoiceItem,
          as: 'items'
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'อัปเดตใบกำกับภาษีสำเร็จ',
      data: updatedInvoice
    });
    
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตใบกำกับภาษี' });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'ไม่พบใบกำกับภาษีที่ระบุ' });
    }
    
    // Check if user can delete this invoice
    if (req.user.role !== 'admin' && invoice.issued_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ลบใบกำกับภาษีนี้' });
    }
    
    // Only allow deletion if invoice is in draft status
    if (invoice.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'ไม่สามารถลบใบกำกับภาษีที่ออกแล้วได้' });
    }
    
    // Delete invoice items first
    await InvoiceItem.destroy({ where: { invoice_id: id } });
    
    // Delete invoice
    await invoice.destroy();
    
    res.json({
      success: true,
      message: 'ลบใบกำกับภาษีสำเร็จ'
    });
    
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบใบกำกับภาษี' });
  }
};

// Issue invoice (change status from draft to issued)
const issueInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'ไม่พบใบกำกับภาษีที่ระบุ' });
    }
    
    // Check if user can issue this invoice
    if (req.user.role !== 'admin' && invoice.issued_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ออกใบกำกับภาษีนี้' });
    }
    
    // Only allow issuing if invoice is in draft status
    if (invoice.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'ใบกำกับภาษีนี้ถูกออกไปแล้ว' });
    }
    
    // Update status to issued
    await invoice.update({
      status: 'issued',
      issued_at: new Date()
    });
    
    res.json({
      success: true,
      message: 'ออกใบกำกับภาษีสำเร็จ',
      data: invoice
    });
    
  } catch (error) {
    console.error('Error issuing invoice:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการออกใบกำกับภาษี' });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  issueInvoice
}; 