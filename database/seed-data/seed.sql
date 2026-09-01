-- ============================================================================
-- CROP RAKSHAK — DEMONSTRATION SEED DATA
-- Smart India Hackathon 2026 · Team ALT-F4
--
-- ALL data below is explicitly "Prototype / Demonstration Data" (Section 53).
-- It is used to populate the admin hotspot map, dealer directory, and a
-- couple of ready-made accounts so the demo flow can be shown immediately
-- without requiring manual registration first.
--
-- Demo login credentials (password for ALL demo accounts: Demo@1234):
--   Farmer : ramesh@demo.croprakshak.in
--   Expert : expert@demo.croprakshak.in
--   Admin  : officer@demo.croprakshak.in
--   Dealer : dealer@demo.croprakshak.in
-- ============================================================================

-- Password hash below = pbkdf2$100000$<salt>$<hash> for plaintext "Demo@1234"
-- Generated once via backend/src/utils/auth.ts hashPassword() and pasted here
-- so seed data doesn't need a running Worker to bootstrap.
-- NOTE: replaced at seed-time by scripts/hash-demo-password.mjs output.

INSERT OR IGNORE INTO users (id, name, phone, email, password_hash, role, village, district, state, latitude, longitude, language, avatar_emoji, created_at, updated_at) VALUES
('usr_demo_farmer', 'Ramesh Patil', '+919820011234', 'ramesh@demo.croprakshak.in', 'pbkdf2$100000$1f032686ec9b1cb8f6e5e586d94664a6$009c4950b0e5c9cc254c7c583f861167773ccfcd2deeaa2358b844bc169832d2', 'farmer', 'Sonewadi', 'Nashik', 'Maharashtra', 20.0059, 73.8107, 'en', '🧑‍🌾', datetime('now'), datetime('now')),
('usr_demo_expert', 'Dr. S. Kulkarni', '+919021033445', 'expert@demo.croprakshak.in', 'pbkdf2$100000$1f032686ec9b1cb8f6e5e586d94664a6$009c4950b0e5c9cc254c7c583f861167773ccfcd2deeaa2358b844bc169832d2', 'expert', 'Nashik City', 'Nashik', 'Maharashtra', 19.9975, 73.7898, 'en', '🧑‍🔬', datetime('now'), datetime('now')),
('usr_demo_admin', 'Agriculture Officer', '+912532251010', 'officer@demo.croprakshak.in', 'pbkdf2$100000$1f032686ec9b1cb8f6e5e586d94664a6$009c4950b0e5c9cc254c7c583f861167773ccfcd2deeaa2358b844bc169832d2', 'admin', 'Nashik Road', 'Nashik', 'Maharashtra', 19.9615, 73.8114, 'en', '🧑‍💼', datetime('now'), datetime('now')),
('usr_demo_dealer', 'Krishi Seva Kendra', '+919823011234', 'dealer@demo.croprakshak.in', 'pbkdf2$100000$1f032686ec9b1cb8f6e5e586d94664a6$009c4950b0e5c9cc254c7c583f861167773ccfcd2deeaa2358b844bc169832d2', 'dealer', 'Sonewadi Bazar', 'Nashik', 'Maharashtra', 20.0102, 73.8055, 'en', '🏪', datetime('now'), datetime('now'));

-- ---------------------------------------------------------------------------
-- DEALERS / LABS / ADVISORY SERVICES  (Sections 16-18/33)
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO dealers (id, name, category, village, district, latitude, longitude, phone, verified, rating, is_demo, created_at) VALUES
('dlr_1', 'Krishi Seva Kendra', 'Crop Protection', 'Sonewadi Bazar', 'Nashik', 20.0102, 73.8055, '+91 98230 11234', 1, 4.6, 1, datetime('now')),
('dlr_2', 'AgroCare Agri Supplies', 'Agricultural Supplies', 'Niphad', 'Nashik', 20.0784, 74.1102, '+91 98220 55678', 1, 4.4, 1, datetime('now')),
('dlr_3', 'Anantapur AgriMart', 'Seeds', 'Kotturu Cross', 'Anantapur', 14.6819, 77.6006, '+91 94901 22110', 1, 4.3, 1, datetime('now')),
('dlr_4', 'NSC Certified Seeds Depot', 'Seeds', 'Nashik Road', 'Nashik', 19.9615, 73.8114, '+91 253 225 2000', 1, 4.7, 1, datetime('now')),
('dlr_5', 'Balipatna Fertilizer Store', 'Fertilizers', 'Balipatna', 'Khordha', 20.1394, 85.6408, '+91 674 224 5566', 1, 4.2, 1, datetime('now'));

INSERT OR IGNORE INTO labs (id, name, lab_type, village, district, latitude, longitude, phone, verified, rating, is_demo, created_at) VALUES
('lab_1', 'Nashik KVK (Krishi Vigyan Kendra)', 'KVK', 'Nashik Road', 'Nashik', 19.9615, 73.8114, '+91 253 225 1010', 1, 4.8, 1, datetime('now')),
('lab_2', 'AgroCare Soil & Leaf Testing Lab', 'Soil Testing', 'Niphad', 'Nashik', 20.0784, 74.1102, '+91 98220 55678', 1, 4.4, 1, datetime('now')),
('lab_3', 'District Extension Office', 'Extension Office', 'Anantapur Town', 'Anantapur', 14.6819, 77.6006, '+91 8554 234 556', 1, 4.5, 1, datetime('now')),
('lab_4', 'Khordha Diagnostic Lab', 'Diagnostic', 'Bolagarh', 'Khordha', 20.2394, 85.5408, '+91 674 224 7788', 1, 4.3, 1, datetime('now'));

INSERT OR IGNORE INTO advisory_services (id, name, service_type, description, contact, is_demo) VALUES
('adv_1', 'India Meteorological Department (IMD) Agromet Advisory', 'Weather', 'District-level weather-based crop advisory bulletins.', 'imdpune.gov.in', 1),
('adv_2', 'PM-KISAN / State Agriculture Department', 'Government Scheme', 'Farmer welfare schemes and subsidised input support.', 'pmkisan.gov.in', 1),
('adv_3', 'Krishi Vigyan Kendra (KVK) Extension Advisory', 'Extension Advisory', 'Local extension worker visits and farmer training.', 'kvk.icar.gov.in', 1);

-- ---------------------------------------------------------------------------
-- REGIONAL REPORTS  → feeds the hotspot map (Sections 29/30), all demo-labeled
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO regional_reports (id, diagnosis_id, crop_name, issue_name, issue_type, district, state, latitude, longitude, risk_level, is_demo, reported_at) VALUES
('rr_1', NULL, 'Wheat', 'Leaf Rust', 'disease', 'Nashik', 'Maharashtra', 20.0059, 73.8107, 'High', 1, datetime('now', '-2 days')),
('rr_2', NULL, 'Wheat', 'Leaf Rust', 'disease', 'Nashik', 'Maharashtra', 20.0300, 73.8500, 'High', 1, datetime('now', '-1 days')),
('rr_3', NULL, 'Wheat', 'Leaf Rust', 'disease', 'Nashik', 'Maharashtra', 19.9900, 73.7800, 'Critical', 1, datetime('now', '-3 days')),
('rr_4', NULL, 'Tomato', 'Whitefly', 'pest', 'Anantapur', 'Andhra Pradesh', 14.6819, 77.6006, 'Moderate', 1, datetime('now', '-1 days')),
('rr_5', NULL, 'Tomato', 'Whitefly', 'pest', 'Anantapur', 'Andhra Pradesh', 14.7000, 77.5800, 'Moderate', 1, datetime('now', '-4 days')),
('rr_6', NULL, 'Rice', 'Nutrient Stress', 'abiotic', 'Khordha', 'Odisha', 20.1394, 85.6408, 'Moderate', 1, datetime('now', '-2 days')),
('rr_7', NULL, 'Rice', 'Bacterial Leaf Blight', 'disease', 'Khordha', 'Odisha', 20.2000, 85.5900, 'Critical', 1, datetime('now', '-1 days')),
('rr_8', NULL, 'Groundnut', 'Late Leaf Spot', 'disease', 'Anantapur', 'Andhra Pradesh', 14.6600, 77.5600, 'High', 1, datetime('now', '-5 days')),
('rr_9', NULL, 'Onion', 'Thrips', 'pest', 'Nashik', 'Maharashtra', 19.8500, 74.0100, 'Low', 1, datetime('now', '-6 days')),
('rr_10', NULL, 'Wheat', 'Leaf Rust', 'disease', 'Nashik', 'Maharashtra', 20.0500, 73.9000, 'High', 1, datetime('now', '-2 days'));

-- ---------------------------------------------------------------------------
-- SAMPLE SEED VERIFICATION RECORDS  (Sections 23-28)
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO seed_records (id, user_id, crop_name, variety, batch_number, seed_source, supplier, certification_no, purchase_date, created_at) VALUES
('seedrec_1', 'usr_demo_farmer', 'Wheat', 'HD-2967', 'SB-WH-88123', 'Certified Dealer', 'NSC Certified Seeds', 'NSC-2026-88123', '2026-07-02', datetime('now', '-40 days')),
('seedrec_2', 'usr_demo_farmer', 'Tomato', 'Arka Rakshak', 'SB-TM-51042', 'Certified Dealer', 'AgriGrow Hybrid Seeds', 'IIHR-2026-51042', '2026-06-02', datetime('now', '-60 days')),
('seedrec_3', 'usr_demo_farmer', 'Rice', 'Swarna (MTU-7029)', 'SB-RC-30099', 'Local Vendor (loose stock)', 'Unbranded', NULL, '2026-06-25', datetime('now', '-55 days'));

INSERT OR IGNORE INTO seed_verifications (id, seed_record_id, status, authenticity, authenticity_score, evidence_json, is_demo, created_at) VALUES
('sv_1', 'seedrec_1', 'VERIFIED', 'Trusted', 92, '{"certMatch":true,"batchMatch":true,"supplierVerified":true,"labEvidence":true}', 1, datetime('now', '-38 days')),
('sv_2', 'seedrec_2', 'PARTIALLY VERIFIED', 'Needs Verification', 61, '{"certMatch":false,"batchMatch":true,"supplierVerified":true,"labEvidence":true}', 1, datetime('now', '-58 days')),
('sv_3', 'seedrec_3', 'SUSPICIOUS', 'Not Trusted', 18, '{"certMatch":false,"batchMatch":false,"supplierVerified":false,"labEvidence":false}', 1, datetime('now', '-53 days'));

INSERT OR IGNORE INTO seed_quality_assessments (id, seed_record_id, germination_pct, purity_pct, genetic_purity_pct, seed_treatment, lab_test_status, quality_label, created_at) VALUES
('sq_1', 'seedrec_1', 94, 98.5, 99.1, 'Fungicide-treated', 'Passed', 'GOOD', datetime('now', '-38 days')),
('sq_2', 'seedrec_2', 88, 95.2, 96.4, 'Fungicide-treated', 'Passed', 'ACCEPTABLE', datetime('now', '-58 days')),
('sq_3', 'seedrec_3', 61, 79.0, 82.0, 'Not treated', 'Not Conducted', 'POOR', datetime('now', '-53 days'));
