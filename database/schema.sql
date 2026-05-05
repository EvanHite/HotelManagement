CREATE TABLE IF NOT EXISTS hotels (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  location VARCHAR(160) NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(80) PRIMARY KEY,
  setting_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS amenities (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  detail TEXT NOT NULL,
  amenity_group VARCHAR(40) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS guest_profiles (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(40) NOT NULL,
  loyalty_tier VARCHAR(40) NOT NULL,
  company VARCHAR(120) NOT NULL,
  notes TEXT,
  password VARCHAR(120) NOT NULL DEFAULT 'guest123'
);

CREATE TABLE IF NOT EXISTS staff_users (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(40) NOT NULL,
  employee_id VARCHAR(80) NULL,
  email VARCHAR(160) NULL,
  password VARCHAR(120) NOT NULL,
  INDEX idx_staff_role (role),
  INDEX idx_staff_employee (employee_id),
  INDEX idx_staff_email (email),
  UNIQUE KEY unique_staff_employee (employee_id),
  UNIQUE KEY unique_staff_email (email)
);

CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(80) PRIMARY KEY,
  number VARCHAR(20) NOT NULL,
  type VARCHAR(80) NOT NULL,
  floor INT NOT NULL,
  beds INT NOT NULL,
  rate INT NOT NULL,
  capacity INT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS reservations (
  id VARCHAR(80) PRIMARY KEY,
  guest_id VARCHAR(80) NOT NULL,
  guest_name VARCHAR(120) NOT NULL,
  room_id VARCHAR(80) NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  room_type VARCHAR(80) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status VARCHAR(40) NOT NULL,
  payment_status VARCHAR(40) NOT NULL,
  payment_method JSON NULL,
  amount_paid INT NOT NULL DEFAULT 0,
  balance_due INT NOT NULL DEFAULT 0,
  authorized_amount INT NOT NULL DEFAULT 0,
  payment_history JSON NULL,
  adults INT NOT NULL,
  total INT NOT NULL,
  source VARCHAR(80) NOT NULL,
  created_at DATETIME NOT NULL,
  notes TEXT,
  INDEX idx_reservations_guest (guest_id),
  INDEX idx_reservations_room (room_id),
  INDEX idx_reservations_dates (check_in, check_out)
);

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id VARCHAR(80) PRIMARY KEY,
  room_id VARCHAR(80) NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  task_type VARCHAR(120) NOT NULL,
  urgency VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL,
  assigned_to VARCHAR(120) NOT NULL,
  due_by VARCHAR(20) NOT NULL,
  readiness VARCHAR(40) NOT NULL,
  supplies_needed JSON NULL,
  INDEX idx_housekeeping_room (room_id),
  INDEX idx_housekeeping_status (status)
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id VARCHAR(80) PRIMARY KEY,
  room_id VARCHAR(80) NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  location VARCHAR(120) NOT NULL,
  issue_type VARCHAR(80) NOT NULL,
  issue TEXT NOT NULL,
  priority VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL,
  assigned_to VARCHAR(120) NOT NULL,
  reported_at VARCHAR(40) NOT NULL,
  submitted_date DATE NOT NULL,
  INDEX idx_maintenance_room (room_id),
  INDEX idx_maintenance_status (status)
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id VARCHAR(80) PRIMARY KEY,
  category VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  stock INT NOT NULL,
  reorder_level INT NOT NULL,
  unit VARCHAR(40) NOT NULL,
  vendor VARCHAR(120) NOT NULL,
  INDEX idx_inventory_category (category)
);

CREATE TABLE IF NOT EXISTS login_attempts (
  login_key VARCHAR(180) NOT NULL,
  ip_address VARCHAR(80) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  last_attempt DATETIME NOT NULL,
  PRIMARY KEY (login_key, ip_address)
);
