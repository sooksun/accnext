-- Migration Script: เพิ่มระบบภาษีไทยเข้ากับฐานข้อมูลเดิม
-- Database: accnext
-- เพิ่มฟีเจอร์ VAT 7% และ WHT (หัก ณ ที่จ่าย) ลงในระบบเดิม

USE accnext;

-- ======================================
-- 1. เพิ่มตารางใหม่สำหรับระบบภาษี
-- ======================================

-- ข้อมูลหลักองค์กร
CREATE TABLE IF NOT EXISTS org_profile (
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
CREATE TABLE IF NOT EXISTS tax_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(10) UNIQUE NOT NULL,
  type ENUM('VAT', 'WHT') NOT NULL,
  rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  description VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- คู่ค้า (ลูกค้า/ผู้ขาย) - ขยายจากระบบเดิม
CREATE TABLE IF NOT EXISTS parties (
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

-- ======================================
-- 2. ปรับปรุงตาราง incomes ให้รองรับภาษี
-- ======================================

-- เพิ่มฟิลด์ใหม่ลงในตาราง incomes
ALTER TABLE incomes 
ADD COLUMN IF NOT EXISTS customer_id INT AFTER category_id,
ADD COLUMN IF NOT EXISTS tax_invoice_no VARCHAR(20) AFTER reference_number,
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 0.00 AFTER amount,
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(12,2) DEFAULT 0.00 AFTER vat_rate,
ADD COLUMN IF NOT EXISTS wht_rate DECIMAL(5,2) DEFAULT 0.00 AFTER vat_amount,
ADD COLUMN IF NOT EXISTS wht_amount DECIMAL(12,2) DEFAULT 0.00 AFTER wht_rate,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(15,2) AFTER wht_amount,
ADD COLUMN IF NOT EXISTS income_type ENUM('goods', 'service', 'other') DEFAULT 'other' AFTER description,
ADD COLUMN IF NOT EXISTS tax_status ENUM('no_vat', 'vat_7', 'vat_0', 'exempt') DEFAULT 'no_vat' AFTER income_type,
ADD COLUMN IF NOT EXISTS wht_cert_no VARCHAR(50) AFTER wht_amount,
ADD COLUMN IF NOT EXISTS invoice_status ENUM('draft', 'issued', 'paid', 'cancelled') DEFAULT 'issued' AFTER tax_status;

-- เพิ่ม Index สำหรับ incomes
ALTER TABLE incomes 
ADD INDEX IF NOT EXISTS idx_customer_id (customer_id),
ADD INDEX IF NOT EXISTS idx_tax_invoice_no (tax_invoice_no),
ADD INDEX IF NOT EXISTS idx_invoice_status (invoice_status),
ADD INDEX IF NOT EXISTS idx_transaction_date (transaction_date);

-- ======================================
-- 3. ปรับปรุงตาราง expenses ให้รองรับภาษี
-- ======================================

-- เพิ่มฟิลด์ใหม่ลงในตาราง expenses
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS vendor_id INT AFTER category_id,
ADD COLUMN IF NOT EXISTS vendor_tax_id VARCHAR(13) AFTER vendor,
ADD COLUMN IF NOT EXISTS vendor_invoice_no VARCHAR(50) AFTER reference_number,
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 0.00 AFTER amount,
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(12,2) DEFAULT 0.00 AFTER vat_rate,
ADD COLUMN IF NOT EXISTS wht_rate DECIMAL(5,2) DEFAULT 0.00 AFTER vat_amount,
ADD COLUMN IF NOT EXISTS wht_amount DECIMAL(12,2) DEFAULT 0.00 AFTER wht_rate,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(15,2) AFTER wht_amount,
ADD COLUMN IF NOT EXISTS expense_type ENUM('goods', 'service', 'other') DEFAULT 'other' AFTER description,
ADD COLUMN IF NOT EXISTS tax_status ENUM('no_vat', 'vat_7', 'vat_0', 'exempt') DEFAULT 'no_vat' AFTER expense_type,
ADD COLUMN IF NOT EXISTS wht_cert_no VARCHAR(50) AFTER wht_amount,
ADD COLUMN IF NOT EXISTS purchase_status ENUM('draft', 'received', 'paid', 'cancelled') DEFAULT 'received' AFTER tax_status;

-- เพิ่ม Index สำหรับ expenses
ALTER TABLE expenses 
ADD INDEX IF NOT EXISTS idx_vendor_id (vendor_id),
ADD INDEX IF NOT EXISTS idx_vendor_invoice_no (vendor_invoice_no),
ADD INDEX IF NOT EXISTS idx_purchase_status (purchase_status),
ADD INDEX IF NOT EXISTS idx_transaction_date (transaction_date);

-- ======================================
-- 4. ตารางใหม่สำหรับหนังสือรับรอง WHT
-- ======================================

-- หนังสือรับรองหักภาษี ณ ที่จ่าย (ที่ลูกค้าหักเราแล้วส่งมาให้)
CREATE TABLE IF NOT EXISTS wht_cert_received (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cert_no VARCHAR(50) NOT NULL,
  cert_date DATE NOT NULL,
  income_id INT NOT NULL,
  payer_name VARCHAR(200) NOT NULL,
  payer_tax_id VARCHAR(13) NOT NULL,
  base_amount DECIMAL(12,2) NOT NULL,
  wht_rate DECIMAL(5,2) NOT NULL,
  wht_amount DECIMAL(12,2) NOT NULL,
  income_type VARCHAR(100) DEFAULT 'ค่าบริการ',
  form_type ENUM('PND3', 'PND53') DEFAULT 'PND53',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (income_id) REFERENCES incomes(id),
  INDEX idx_cert_no (cert_no),
  INDEX idx_cert_date (cert_date),
  INDEX idx_payer_tax_id (payer_tax_id)
);

-- หนังสือรับรองหักภาษี ณ ที่จ่าย (ที่เราออกให้ผู้ขาย)
CREATE TABLE IF NOT EXISTS wht_cert_issued (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cert_no VARCHAR(50) UNIQUE NOT NULL,
  cert_date DATE NOT NULL,
  expense_id INT NOT NULL,
  payee_name VARCHAR(200) NOT NULL,
  payee_tax_id VARCHAR(13) NOT NULL,
  base_amount DECIMAL(12,2) NOT NULL,
  wht_rate DECIMAL(5,2) NOT NULL,
  wht_amount DECIMAL(12,2) NOT NULL,
  income_type VARCHAR(100) DEFAULT 'ค่าบริการ',
  form_type ENUM('PND3', 'PND53') DEFAULT 'PND53',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id),
  INDEX idx_cert_no (cert_no),
  INDEX idx_cert_date (cert_date),
  INDEX idx_payee_tax_id (payee_tax_id)
);

-- ======================================
-- 5. Seed ข้อมูลเริ่มต้น
-- ======================================

-- ข้อมูลองค์กร
INSERT IGNORE INTO org_profile (org_name, tax_id, branch_no, address, logo_url, promptpay_id) VALUES
('บริษัท เทคโซลูชั่น จำกัด', '0123456789012', '00000', 'เลขที่ 123 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพมหานคร 10400', '/logo.png', '0123456789');

-- รหัสภาษี
INSERT IGNORE INTO tax_codes (code, type, rate, description) VALUES
('VAT7', 'VAT', 7.00, 'ภาษีมูลค่าเพิ่ม 7%'),
('VAT0', 'VAT', 0.00, 'ภาษีมูลค่าเพิ่ม 0% (ยกเว้น)'),
('EXEMPT', 'VAT', 0.00, 'ไม่อยู่ในระบบ VAT'),
('WHT1', 'WHT', 1.00, 'หัก ณ ที่จ่าย 1%'),
('WHT3', 'WHT', 3.00, 'หัก ณ ที่จ่าย 3%'),
('WHT5', 'WHT', 5.00, 'หัก ณ ที่จ่าย 5%'),
('WHT10', 'WHT', 10.00, 'หัก ณ ที่จ่าย 10%');

-- คู่ค้าตัวอย่าง
INSERT IGNORE INTO parties (name, tax_id, branch_no, address, party_type) VALUES
('บริษัท ลูกค้าทดสอบ จำกัด', '9876543210987', '00000', 'เลขที่ 456 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพมหานคร 10110', 'customer'),
('บริษัท ซัพพลายเออร์ จำกัด', '1111222233334', '00000', 'เลขที่ 789 ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900', 'vendor'),
('ร้าน วัสดุก่อสร้าง', '5555666677778', '00000', 'เลขที่ 321 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร 10900', 'vendor');

-- ======================================
-- 6. อัปเดตข้อมูลเดิม
-- ======================================

-- อัปเดต net_amount สำหรับรายการเดิมที่ยังไม่มีการคำนวณภาษี
UPDATE incomes SET net_amount = amount WHERE net_amount IS NULL OR net_amount = 0;
UPDATE expenses SET net_amount = amount WHERE net_amount IS NULL OR net_amount = 0;

-- ======================================
-- 7. Foreign Key Constraints (เพิ่มหลังจากมีข้อมูลแล้ว)
-- ======================================

-- เพิ่ม Foreign Key สำหรับ incomes
-- ALTER TABLE incomes ADD CONSTRAINT fk_incomes_customer FOREIGN KEY (customer_id) REFERENCES parties(id);

-- เพิ่ม Foreign Key สำหรับ expenses  
-- ALTER TABLE expenses ADD CONSTRAINT fk_expenses_vendor FOREIGN KEY (vendor_id) REFERENCES parties(id);

-- ======================================
-- 8. Views สำหรับรายงาน (Optional)
-- ======================================

-- View สำหรับรายงาน VAT รายเดือน
CREATE OR REPLACE VIEW vat_monthly_report AS
SELECT 
    YEAR(transaction_date) as report_year,
    MONTH(transaction_date) as report_month,
    'sales' as transaction_type,
    SUM(amount - vat_amount) as base_amount,
    SUM(vat_amount) as vat_amount,
    COUNT(*) as transaction_count
FROM incomes 
WHERE vat_amount > 0 
GROUP BY YEAR(transaction_date), MONTH(transaction_date)

UNION ALL

SELECT 
    YEAR(transaction_date) as report_year,
    MONTH(transaction_date) as report_month,
    'purchases' as transaction_type,
    SUM(amount - vat_amount) as base_amount,
    SUM(vat_amount) as vat_amount,
    COUNT(*) as transaction_count
FROM expenses 
WHERE vat_amount > 0 
GROUP BY YEAR(transaction_date), MONTH(transaction_date);

-- View สำหรับรายงาน WHT รายเดือน
CREATE OR REPLACE VIEW wht_monthly_report AS
SELECT 
    YEAR(cert_date) as report_year,
    MONTH(cert_date) as report_month,
    'received' as wht_type,
    form_type,
    SUM(base_amount) as total_base,
    SUM(wht_amount) as total_wht,
    COUNT(*) as cert_count
FROM wht_cert_received 
GROUP BY YEAR(cert_date), MONTH(cert_date), form_type

UNION ALL

SELECT 
    YEAR(cert_date) as report_year,
    MONTH(cert_date) as report_month,
    'issued' as wht_type,
    form_type,
    SUM(base_amount) as total_base,
    SUM(wht_amount) as total_wht,
    COUNT(*) as cert_count
FROM wht_cert_issued 
GROUP BY YEAR(cert_date), MONTH(cert_date), form_type;

-- ======================================
-- สรุป: Migration สำเร็จ
-- ======================================
-- 1. เพิ่มฟิลด์ภาษีในตาราง incomes และ expenses
-- 2. เพิ่มตารางใหม่สำหรับการจัดการภาษี
-- 3. Seed ข้อมูลเริ่มต้น
-- 4. สร้าง Views สำหรับรายงาน
-- 5. รองรับ VAT 7% และ WHT (หัก ณ ที่จ่าย)

SELECT 'Migration completed successfully! Tax system is now ready.' as status;