-- ฐานข้อมูลระบบภาษีไทยแบบครบวงจร
-- รองรับ VAT 7% และ WHT (หัก ณ ที่จ่าย) ทั้งฝั่งขายและซื้อ

CREATE DATABASE IF NOT EXISTS accnext_tax DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE accnext_tax;

-- ข้อมูลหลักองค์กร
CREATE TABLE org_profile (
  id INT PRIMARY KEY AUTO_INCREMENT,
  org_name VARCHAR(200) NOT NULL,
  tax_id VARCHAR(13) NOT NULL,
  branch_no VARCHAR(5) DEFAULT '00000',
  address TEXT NOT NULL,
  logo_url VARCHAR(255),
  promptpay_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- รหัสภาษี (VAT & WHT)
CREATE TABLE tax_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(10) UNIQUE NOT NULL,
  type ENUM('VAT', 'WHT') NOT NULL,
  rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  description VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- คู่ค้า (ลูกค้า/ผู้ขาย)
CREATE TABLE parties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  tax_id VARCHAR(13),
  branch_no VARCHAR(5) DEFAULT '00000',
  address TEXT,
  party_type ENUM('customer', 'vendor', 'both') NOT NULL,
  credit_days INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_party_type (party_type),
  INDEX idx_tax_id (tax_id)
);

-- สินค้า/บริการ
CREATE TABLE items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(50) UNIQUE,
  name VARCHAR(200) NOT NULL,
  kind ENUM('goods', 'service') NOT NULL,
  unit VARCHAR(50) DEFAULT 'หน่วย',
  default_price DECIMAL(12,2) DEFAULT 0.00,
  default_vat_code_id INT,
  default_wht_code_id INT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (default_vat_code_id) REFERENCES tax_codes(id),
  FOREIGN KEY (default_wht_code_id) REFERENCES tax_codes(id),
  INDEX idx_kind (kind),
  INDEX idx_sku (sku)
);

-- ใบกำกับภาษี/ใบเสร็จ (ฝั่งขาย - AR)
CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doc_no VARCHAR(20) UNIQUE NOT NULL,
  doc_date DATE NOT NULL,
  customer_id INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  wht_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('draft', 'issued', 'paid', 'cancelled') DEFAULT 'draft',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES parties(id),
  INDEX idx_doc_no (doc_no),
  INDEX idx_doc_date (doc_date),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status)
);

-- บรรทัดรายการใบกำกับ
CREATE TABLE invoice_lines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  item_id INT,
  description VARCHAR(200) NOT NULL,
  kind ENUM('goods', 'service') NOT NULL,
  qty DECIMAL(10,3) NOT NULL DEFAULT 1.000,
  unit VARCHAR(50) DEFAULT 'หน่วย',
  unit_price DECIMAL(12,2) NOT NULL,
  line_base DECIMAL(12,2) NOT NULL,
  vat_code_id INT,
  wht_code_id INT,
  vat_amount DECIMAL(12,2) DEFAULT 0.00,
  wht_amount DECIMAL(12,2) DEFAULT 0.00,
  line_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (vat_code_id) REFERENCES tax_codes(id),
  FOREIGN KEY (wht_code_id) REFERENCES tax_codes(id),
  INDEX idx_invoice (invoice_id),
  INDEX idx_item (item_id)
);

-- ใบเสร็จรับเงิน
CREATE TABLE receipts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  receipt_no VARCHAR(20) UNIQUE NOT NULL,
  receipt_date DATE NOT NULL,
  invoice_id INT NOT NULL,
  cash_in DECIMAL(12,2) NOT NULL,
  wht_received DECIMAL(12,2) DEFAULT 0.00,
  method ENUM('cash', 'transfer', 'cheque', 'promptpay') DEFAULT 'cash',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  INDEX idx_receipt_no (receipt_no),
  INDEX idx_receipt_date (receipt_date),
  INDEX idx_invoice (invoice_id)
);

-- หนังสือรับรองหักภาษี ณ ที่จ่าย (ที่ลูกค้าหักเราแล้วส่งมาให้)
CREATE TABLE wht_cert_received (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cert_no VARCHAR(50) NOT NULL,
  cert_date DATE NOT NULL,
  receipt_id INT NOT NULL,
  payer_name VARCHAR(200) NOT NULL,
  payer_tax_id VARCHAR(13) NOT NULL,
  base_amount DECIMAL(12,2) NOT NULL,
  wht_rate DECIMAL(5,2) NOT NULL,
  wht_amount DECIMAL(12,2) NOT NULL,
  income_type VARCHAR(100) DEFAULT 'ค่าบริการ',
  form_type ENUM('PND3', 'PND53') DEFAULT 'PND53',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (receipt_id) REFERENCES receipts(id),
  INDEX idx_cert_no (cert_no),
  INDEX idx_cert_date (cert_date),
  INDEX idx_payer_tax_id (payer_tax_id)
);

-- ใบแจ้งหนี้ซื้อ (ฝั่งซื้อ - AP)
CREATE TABLE purchase_invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doc_no VARCHAR(20) UNIQUE NOT NULL,
  doc_date DATE NOT NULL,
  vendor_id INT NOT NULL,
  vendor_doc_no VARCHAR(50),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  wht_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('draft', 'received', 'paid', 'cancelled') DEFAULT 'draft',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES parties(id),
  INDEX idx_doc_no (doc_no),
  INDEX idx_doc_date (doc_date),
  INDEX idx_vendor (vendor_id),
  INDEX idx_status (status)
);

-- บรรทัดรายการซื้อ
CREATE TABLE purchase_lines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_id INT NOT NULL,
  description VARCHAR(200) NOT NULL,
  kind ENUM('goods', 'service') NOT NULL,
  qty DECIMAL(10,3) NOT NULL DEFAULT 1.000,
  unit VARCHAR(50) DEFAULT 'หน่วย',
  unit_price DECIMAL(12,2) NOT NULL,
  line_base DECIMAL(12,2) NOT NULL,
  vat_code_id INT,
  wht_code_id INT,
  vat_amount DECIMAL(12,2) DEFAULT 0.00,
  wht_amount DECIMAL(12,2) DEFAULT 0.00,
  line_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_id) REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (vat_code_id) REFERENCES tax_codes(id),
  FOREIGN KEY (wht_code_id) REFERENCES tax_codes(id),
  INDEX idx_purchase (purchase_id)
);

-- การจ่ายเงิน
CREATE TABLE ap_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pay_no VARCHAR(20) UNIQUE NOT NULL,
  pay_date DATE NOT NULL,
  purchase_id INT NOT NULL,
  paid_cash DECIMAL(12,2) NOT NULL,
  wht_withheld DECIMAL(12,2) DEFAULT 0.00,
  method ENUM('cash', 'transfer', 'cheque', 'promptpay') DEFAULT 'transfer',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_id) REFERENCES purchase_invoices(id),
  INDEX idx_pay_no (pay_no),
  INDEX idx_pay_date (pay_date),
  INDEX idx_purchase (purchase_id)
);

-- หนังสือรับรองหักภาษี ณ ที่จ่าย (ที่เราออกให้ผู้ขาย)
CREATE TABLE wht_cert_issued (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cert_no VARCHAR(50) UNIQUE NOT NULL,
  cert_date DATE NOT NULL,
  payment_id INT NOT NULL,
  payee_name VARCHAR(200) NOT NULL,
  payee_tax_id VARCHAR(13) NOT NULL,
  base_amount DECIMAL(12,2) NOT NULL,
  wht_rate DECIMAL(5,2) NOT NULL,
  wht_amount DECIMAL(12,2) NOT NULL,
  income_type VARCHAR(100) DEFAULT 'ค่าบริการ',
  form_type ENUM('PND3', 'PND53') DEFAULT 'PND53',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES ap_payments(id),
  INDEX idx_cert_no (cert_no),
  INDEX idx_cert_date (cert_date),
  INDEX idx_payee_tax_id (payee_tax_id)
);

-- Seed ข้อมูลเริ่มต้น
INSERT INTO org_profile (org_name, tax_id, branch_no, address, logo_url, promptpay_id) VALUES
('บริษัท เทคโซลูชั่น จำกัด', '0123456789012', '00000', 'เลขที่ 123 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพมหานคร 10400', '/logo.png', '0123456789');

INSERT INTO tax_codes (code, type, rate, description) VALUES
('VAT7', 'VAT', 7.00, 'ภาษีมูลค่าเพิ่ม 7%'),
('VAT0', 'VAT', 0.00, 'ภาษีมูลค่าเพิ่ม 0% (ยกเว้น)'),
('EXEMPT', 'VAT', 0.00, 'ไม่อยู่ในระบบ VAT'),
('WHT1', 'WHT', 1.00, 'หัก ณ ที่จ่าย 1%'),
('WHT3', 'WHT', 3.00, 'หัก ณ ที่จ่าย 3%'),
('WHT5', 'WHT', 5.00, 'หัก ณ ที่จ่าย 5%'),
('WHT10', 'WHT', 10.00, 'หัก ณ ที่จ่าย 10%');

INSERT INTO parties (name, tax_id, branch_no, address, party_type) VALUES
('บริษัท ลูกค้าทดสอบ จำกัด', '9876543210987', '00000', 'เลขที่ 456 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพมหานคร 10110', 'customer'),
('บริษัท ซัพพลายเออร์ จำกัด', '1111222233334', '00000', 'เลขที่ 789 ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900', 'vendor'),
('ร้าน วัสดุก่อสร้าง', '5555666677778', '00000', 'เลขที่ 321 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร 10900', 'vendor');

INSERT INTO items (sku, name, kind, unit, default_price, default_vat_code_id, default_wht_code_id) VALUES
('STEEL001', 'เหล็กเส้น 12 มม.', 'goods', 'เส้น', 120.00, 1, NULL),
('CONCRETE001', 'คอนกรีตผสม', 'goods', 'ลบ.ม.', 2800.00, 1, NULL),
('SOFT001', 'ระบบบัญชี', 'service', 'ชุด', 50000.00, 1, 5),
('CONSULT001', 'บริการที่ปรึกษา', 'service', 'ชั่วโมง', 2000.00, 1, 5),
('DESIGN001', 'บริการออกแบบ', 'service', 'งาน', 15000.00, 1, 5);