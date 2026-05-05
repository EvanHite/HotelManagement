INSERT INTO hotels (id, name, location) VALUES
('milledgeville-grand', 'Milledgeville Grand', 'Milledgeville, Georgia'),
('lakeview-suites', 'Lakeview Suites', 'Lake Sinclair, Georgia');

INSERT INTO app_settings (setting_key, setting_value) VALUES
('hotelName', 'Harbor House Milledgeville'),
('contactEmail', 'ops@harborhouse.example'),
('checkInTime', '15:00'),
('checkOutTime', '11:00'),
('quietHours', '22:00'),
('businessDate', '2026-04-15'),
('arrivalAlerts', '1'),
('inventoryAlerts', '1'),
('maintenanceAlerts', '1');

INSERT INTO amenities (id, name, detail, amenity_group, sort_order) VALUES
('amenity-breakfast', 'Complimentary breakfast', 'Served daily from 6:30 AM to 10:00 AM in the lobby lounge.', 'included', 10),
('amenity-wifi', 'Fiber Wi-Fi', 'Property-wide connectivity with guest and conference access.', 'included', 20),
('amenity-fitness', 'Fitness studio', 'Open 24 hours with card access and fresh towel pickup.', 'included', 30),
('amenity-room-service', 'Room service', 'Available from 6:00 AM to 10:00 PM with express delivery windows.', 'requestable', 40),
('amenity-meeting-room', 'Meeting room access', 'Bookable through the front desk for business or private events.', 'requestable', 50),
('amenity-laundry', 'Same-day laundry', 'Submit before 10:00 AM for evening delivery.', 'requestable', 60);

INSERT INTO guest_profiles (id, name, email, phone, loyalty_tier, company, notes) VALUES
('guest-1', 'Ava Bennett', 'ava.bennett@example.com', '(478) 555-0123', 'Gold', 'Southland Advisory', 'Prefers a quiet room and a late check-out when available.'),
('guest-2', 'Marcus Reed', 'marcus.reed@example.com', '(478) 555-0118', 'Silver', 'Reed Logistics', 'Usually books early breakfast and meeting room access.'),
('guest-3', 'Priya Sharma', 'priya.sharma@example.com', '(478) 555-0147', 'Platinum', 'Mercer Health', 'Requests allergy-safe toiletries and digital folios.'),
('guest-4', 'Lauren Cole', 'lauren.cole@example.com', '(478) 555-0179', 'Standard', 'Personal Travel', 'Weekend stays, usually books double queen rooms.'),
('guest-5', 'Devon Ellis', 'devon.ellis@example.com', '(478) 555-0134', 'Gold', 'Peachtree Events', 'Needs early arrival support during event weeks.'),
('guest-6', 'Sofia Martinez', 'sofia.martinez@example.com', '(478) 555-0161', 'Silver', 'Personal Travel', 'Often uses room service and valet laundry.');

INSERT INTO staff_users (id, name, role, employee_id, email, password) VALUES
('staff-reception-1', 'Jordan Lee', 'reception', 'REC100', 'jordan.lee@harborhouse.example', 'staff123'),
('staff-housekeeping-1', 'Marisol Diaz', 'housekeeping', 'HK100', 'marisol.diaz@harborhouse.example', 'staff123'),
('staff-maintenance-1', 'Theo Grant', 'maintenance', 'MX100', 'theo.grant@harborhouse.example', 'staff123'),
('staff-management-1', 'Elena Foster', 'management', 'MGR100', 'elena.foster@harborhouse.example', 'manager123');

INSERT INTO rooms (id, number, type, floor, beds, rate, capacity, notes) VALUES
('room-101', '101', 'Deluxe King', 1, 1, 189, 2, 'Courtyard-facing room with workspace and lounge chair.'),
('room-102', '102', 'Double Queen', 1, 2, 209, 4, 'Popular for family bookings and event weekends.'),
('room-103', '103', 'Standard King', 1, 1, 169, 2, 'Compact room near lobby for late arrivals.'),
('room-201', '201', 'Executive Suite', 2, 1, 289, 3, 'Separate sitting area, extended-stay friendly layout.'),
('room-202', '202', 'Courtyard Queen', 2, 1, 199, 2, 'Near elevator, often used for quick corporate stays.'),
('room-203', '203', 'Standard Double', 2, 2, 179, 4, 'Flexible layout for short stays and small groups.'),
('room-301', '301', 'Signature King', 3, 1, 239, 2, 'Top-floor room with preferred guest demand.'),
('room-302', '302', 'Double Queen', 3, 2, 214, 4, 'Ideal for conference guests with late departure requests.'),
('room-303', '303', 'Accessible King', 3, 1, 189, 2, 'Accessible shower, wider turning radius, near lift.');

INSERT INTO reservations
(id, guest_id, guest_name, room_id, room_number, room_type, check_in, check_out, status, payment_status, payment_method, amount_paid, balance_due, authorized_amount, payment_history, adults, total, source, created_at, notes) VALUES
('res-1001', 'guest-1', 'Ava Bennett', 'room-301', '301', 'Signature King', '2026-04-16', '2026-04-19', 'confirmed', 'authorized', JSON_OBJECT('brand', 'Visa', 'last4', '4242', 'expiry', '12/28', 'cardholderName', 'Ava Bennett'), 0, 717, 717, JSON_ARRAY(), 2, 717, 'Guest Portal', '2026-04-10 09:20:00', 'Requested quiet floor and digital receipt.'),
('res-1002', 'guest-2', 'Marcus Reed', 'room-102', '102', 'Double Queen', '2026-04-15', '2026-04-17', 'checked-in', 'captured', NULL, 418, 0, 0, JSON_ARRAY(), 2, 418, 'Front Desk', '2026-04-11 14:50:00', 'Needs breakfast vouchers for two.'),
('res-1003', 'guest-3', 'Priya Sharma', 'room-201', '201', 'Executive Suite', '2026-04-15', '2026-04-18', 'checked-in', 'captured', NULL, 867, 0, 0, JSON_ARRAY(), 1, 867, 'Corporate', '2026-04-08 12:15:00', 'Allergy-safe toiletries requested before arrival.'),
('res-1004', 'guest-4', 'Lauren Cole', 'room-103', '103', 'Standard King', '2026-04-18', '2026-04-20', 'pending', 'pending', NULL, 0, 338, 0, JSON_ARRAY(), 2, 338, 'Guest Portal', '2026-04-14 17:32:00', 'Awaiting card authorization.'),
('res-1005', 'guest-5', 'Devon Ellis', 'room-302', '302', 'Double Queen', '2026-04-13', '2026-04-15', 'checked-out', 'captured', NULL, 428, 0, 0, JSON_ARRAY(), 3, 428, 'Front Desk', '2026-04-06 10:04:00', 'Conference block booking.'),
('res-1006', 'guest-6', 'Sofia Martinez', 'room-202', '202', 'Courtyard Queen', '2026-04-12', '2026-04-14', 'checked-out', 'captured', NULL, 398, 0, 0, JSON_ARRAY(), 1, 398, 'Online Travel', '2026-04-03 16:20:00', 'Requested laundry turnaround same day.');

INSERT INTO housekeeping_tasks
(id, room_id, room_number, task_type, urgency, status, assigned_to, due_by, readiness, supplies_needed) VALUES
('hk-201', 'room-302', '302', 'Departure reset', 'high', 'queued', 'Marisol Diaz', '11:30', 'Blocked', JSON_ARRAY('Fresh linens', 'Bath towels')),
('hk-202', 'room-203', '203', 'Towel restock', 'standard', 'in-progress', 'Nina Alvarez', '13:00', 'Partial', JSON_ARRAY('Bath towels', 'Hand towels')),
('hk-203', 'room-201', '201', 'Allergy-safe amenities setup', 'high', 'queued', 'Marisol Diaz', '10:45', 'Blocked', JSON_ARRAY('Hypoallergenic toiletries')),
('hk-204', 'room-101', '101', 'Light touch service', 'standard', 'completed', 'Lana Brooks', '09:30', 'Ready', JSON_ARRAY());

INSERT INTO maintenance_requests
(id, room_id, room_number, location, issue_type, issue, priority, status, assigned_to, reported_at, submitted_date) VALUES
('mx-101', 'room-202', '202', 'Guest room', 'Plumbing', 'Bathroom sink drainage is slow', 'high', 'open', 'Theo Grant', '08:20', '2026-04-15'),
('mx-102', 'room-303', '303', 'Guest room', 'HVAC', 'Thermostat calibration check', 'medium', 'in-progress', 'Darius Mills', '09:05', '2026-04-15'),
('mx-103', 'room-103', '103', 'Guest room', 'Electronics', 'Television input reset', 'medium', 'resolved', 'Theo Grant', 'Yesterday', '2026-04-14');

INSERT INTO inventory_items
(id, category, name, stock, reorder_level, unit, vendor) VALUES
('inv-101', 'Linens', 'Bath towels', 42, 50, 'pieces', 'Peachtree Linens'),
('inv-102', 'Toiletries', 'Shampoo bottles', 78, 60, 'units', 'Southern Supply Co.'),
('inv-103', 'Toiletries', 'Conditioner bottles', 51, 55, 'units', 'Southern Supply Co.'),
('inv-104', 'Housekeeping', 'Glass cleaner', 12, 15, 'bottles', 'Civic Janitorial'),
('inv-105', 'Food Service', 'Breakfast coffee pods', 120, 80, 'pods', 'Blue Oak Roasters'),
('inv-106', 'Front Desk', 'Key cards', 18, 25, 'cards', 'Access Secure');
