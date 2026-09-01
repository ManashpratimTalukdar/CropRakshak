-- ============================================================================
-- CROP RAKSHAK — INITIAL SCHEMA (Cloudflare D1 / SQLite)
-- Smart India Hackathon 2026 · Team ALT-F4 · Problem Statement SIH26131
--
-- NOTE: D1 is SQLite-flavored, not PostgreSQL. Types below use SQLite
-- storage classes (TEXT / INTEGER / REAL) — this is a deliberate, documented
-- adaptation of the originally-requested Postgres schema so the whole stack
-- can run serverless on Cloudflare (see docs/architecture.md).
--
-- All IDs are TEXT (UUID v4, generated in the application layer with
-- crypto.randomUUID()) rather than SERIAL/AUTOINCREMENT, so that rows can be
-- safely created client-side/offline and synced later without collisions.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- USERS & ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  phone         TEXT UNIQUE,
  email         TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('farmer', 'expert', 'admin', 'dealer')),
  village       TEXT,
  district      TEXT,
  state         TEXT,
  latitude      REAL,
  longitude     REAL,
  language      TEXT DEFAULT 'en',
  avatar_emoji  TEXT DEFAULT '🧑\u200d🌾',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- CROPS & FIELDS  (Section 41/42 — My Crops / Crop Detail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crops (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_name        TEXT NOT NULL,
  crop_emoji       TEXT DEFAULT '🌱',
  variety          TEXT,
  sowing_date      TEXT,
  crop_stage       TEXT CHECK (crop_stage IN ('Seedling','Vegetative','Flowering','Fruiting','Maturity')),
  field_size_acres REAL,
  village          TEXT,
  district         TEXT,
  state            TEXT,
  latitude         REAL,
  longitude        REAL,
  health_status    TEXT DEFAULT 'Unknown' CHECK (health_status IN ('Healthy','Monitor','At Risk','Unknown')),
  last_scan_at     TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_crops_user ON crops(user_id);

CREATE TABLE IF NOT EXISTS fields (
  id          TEXT PRIMARY KEY,
  crop_id     TEXT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  field_name  TEXT,
  boundary_geojson TEXT,     -- optional polygon/point geometry as JSON text
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_fields_crop ON fields(crop_id);

-- ----------------------------------------------------------------------------
-- SOIL / IRRIGATION / TREATMENT HISTORY  (Sections 39/40/7E)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS soil_data (
  id              TEXT PRIMARY KEY,
  crop_id         TEXT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  soil_type       TEXT,
  ph              REAL,
  ec              REAL,
  organic_carbon  REAL,
  nitrogen        REAL,
  phosphorus      REAL,
  potassium       REAL,
  source          TEXT DEFAULT 'manual' CHECK (source IN ('manual','sensor','lab','demo')),
  recorded_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_soil_crop ON soil_data(crop_id);

CREATE TABLE IF NOT EXISTS irrigation_data (
  id                TEXT PRIMARY KEY,
  crop_id           TEXT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  water_source      TEXT,
  irrigation_method TEXT,
  frequency         TEXT,
  water_stress      TEXT CHECK (water_stress IN ('Dry','Normal','Waterlogged')),
  recorded_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_irrigation_crop ON irrigation_data(crop_id);

CREATE TABLE IF NOT EXISTS treatment_history (
  id               TEXT PRIMARY KEY,
  crop_id          TEXT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  treatment_type   TEXT CHECK (treatment_type IN ('pesticide','fertilizer','other')),
  product_note     TEXT,
  applied_on       TEXT,
  previous_issue   TEXT,
  previous_yield   TEXT,
  budget_level     TEXT CHECK (budget_level IN ('Low','Medium','High')),
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_treatment_crop ON treatment_history(crop_id);

-- ----------------------------------------------------------------------------
-- WEATHER / ENVIRONMENT SNAPSHOTS (Section 38 — cached per diagnosis)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS environment_data (
  id              TEXT PRIMARY KEY,
  crop_id         TEXT REFERENCES crops(id) ON DELETE SET NULL,
  latitude        REAL,
  longitude       REAL,
  temperature_c   REAL,
  humidity_pct    REAL,
  rainfall_mm     REAL,
  wind_kmh        REAL,
  soil_moisture_pct REAL,
  forecast_note   TEXT,
  source          TEXT DEFAULT 'mock' CHECK (source IN ('mock','api')),
  fetched_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_env_crop ON environment_data(crop_id);

-- ----------------------------------------------------------------------------
-- DIAGNOSES  (core case record — Sections 12/48/50)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnoses (
  id                    TEXT PRIMARY KEY,
  scan_code             TEXT UNIQUE NOT NULL,
  user_id               TEXT REFERENCES users(id) ON DELETE SET NULL,
  crop_id               TEXT REFERENCES crops(id) ON DELETE SET NULL,
  crop_name             TEXT NOT NULL,
  crop_emoji            TEXT DEFAULT '🌱',
  variety               TEXT,
  crop_stage            TEXT,
  village               TEXT,
  district              TEXT,
  latitude              REAL,
  longitude             REAL,
  image_url             TEXT,              -- data URL or R2 key (kept small for D1 demo scope)
  primary_type          TEXT NOT NULL CHECK (primary_type IN ('disease','pest','abiotic')),
  primary_cause         TEXT NOT NULL,
  primary_scientific    TEXT,
  overall_confidence    INTEGER NOT NULL,  -- 0-100
  uncertain             INTEGER NOT NULL DEFAULT 0,
  uncertainty_message   TEXT,
  disease_json          TEXT NOT NULL,     -- CategoryAssessment JSON
  pest_json             TEXT NOT NULL,     -- CategoryAssessment JSON
  abiotic_json          TEXT NOT NULL,     -- CategoryAssessment JSON
  ai_source             TEXT DEFAULT 'mock' CHECK (ai_source IN ('mock','workers-ai','heuristic-fallback')),
  ai_model_used         TEXT,
  status                TEXT NOT NULL DEFAULT 'AI Analyzed' CHECK (
                            status IN ('New','AI Analyzed','Under Review','Verified','Action Recommended','Monitoring','Resolved','Rejected')
                          ),
  is_demo               INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_diag_user ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_diag_crop ON diagnoses(crop_id);
CREATE INDEX IF NOT EXISTS idx_diag_status ON diagnoses(status);
CREATE INDEX IF NOT EXISTS idx_diag_created ON diagnoses(created_at);

-- ----------------------------------------------------------------------------
-- REGIONAL REPORTS  (Section 29/30 — Early Warning / Hotspots)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS regional_reports (
  id            TEXT PRIMARY KEY,
  diagnosis_id  TEXT REFERENCES diagnoses(id) ON DELETE SET NULL,
  crop_name     TEXT NOT NULL,
  issue_name    TEXT NOT NULL,
  issue_type    TEXT CHECK (issue_type IN ('disease','pest','abiotic')),
  district      TEXT,
  state         TEXT,
  latitude      REAL,
  longitude     REAL,
  risk_level    TEXT CHECK (risk_level IN ('Low','Moderate','High','Critical')),
  is_demo       INTEGER NOT NULL DEFAULT 1, -- 1 = prototype/demonstration data
  reported_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_regional_geo ON regional_reports(district, crop_name);

-- Evidence bundle actually used for a given diagnosis (Section 8 — fusion inputs),
-- stored as a JSON snapshot so the fusion decision remains auditable/explainable.
CREATE TABLE IF NOT EXISTS diagnosis_evidence (
  id             TEXT PRIMARY KEY,
  diagnosis_id   TEXT NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  evidence_type  TEXT NOT NULL CHECK (evidence_type IN ('image','crop_field','soil','irrigation','treatment','weather','regional','seed')),
  payload_json   TEXT NOT NULL,
  weight         REAL DEFAULT 1.0,      -- relative influence in fusion (0-1), for explainability
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_evidence_diag ON diagnosis_evidence(diagnosis_id);

-- ----------------------------------------------------------------------------
-- RISK ASSESSMENTS (Section 10 — "Prototype Risk Model")
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS risk_assessments (
  id             TEXT PRIMARY KEY,
  diagnosis_id   TEXT NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  risk_score     INTEGER NOT NULL,     -- 0-100
  risk_level     TEXT NOT NULL CHECK (risk_level IN ('Low','Moderate','High','Critical')),
  factors_json   TEXT NOT NULL,        -- breakdown: weather, stage, history, severity, regional weights
  model_label    TEXT NOT NULL DEFAULT 'Prototype Risk Model v1',
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_risk_diag ON risk_assessments(diagnosis_id);

-- ----------------------------------------------------------------------------
-- RECOMMENDATIONS (Section 14/63 — curated, safety-labeled)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendations (
  id                  TEXT PRIMARY KEY,
  diagnosis_id        TEXT NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  immediate_actions_json TEXT NOT NULL,
  treatment_guidance_json TEXT NOT NULL,
  cultural_practices_json TEXT NOT NULL,
  safe_usage_json     TEXT NOT NULL,
  purchase_options_json TEXT NOT NULL,
  escalate_when       TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reco_diag ON recommendations(diagnosis_id);

-- ----------------------------------------------------------------------------
-- FOLLOW-UPS / RE-SCAN / MONITORING (Sections 19/20)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS followups (
  id                TEXT PRIMARY KEY,
  diagnosis_id      TEXT NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  rescan_after_days INTEGER NOT NULL DEFAULT 3,
  due_at            TEXT NOT NULL,
  monitor_notes_json TEXT,
  escalate_when     TEXT,
  status            TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Completed','Overdue','Escalated')),
  rescan_diagnosis_id TEXT REFERENCES diagnoses(id) ON DELETE SET NULL, -- link to the re-scan result once done
  completed_at      TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_followup_diag ON followups(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_followup_due ON followups(due_at);

-- ----------------------------------------------------------------------------
-- FARMER FEEDBACK  (Section 21)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id                TEXT PRIMARY KEY,
  diagnosis_id      TEXT NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  user_id           TEXT REFERENCES users(id) ON DELETE SET NULL,
  helpful           INTEGER,             -- 1 = helpful, 0 = not helpful, NULL = not answered
  expert_confirmed  TEXT CHECK (expert_confirmed IN ('yes','no','not_yet')),
  comment           TEXT,
  candidate_training_data INTEGER NOT NULL DEFAULT 1, -- Section 65: requires validation before retraining
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_feedback_diag ON feedback(diagnosis_id);

-- ----------------------------------------------------------------------------
-- EXPERT REVIEWS  (Section 22/37)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expert_reviews (
  id             TEXT PRIMARY KEY,
  diagnosis_id   TEXT NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  expert_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
  decision       TEXT NOT NULL CHECK (decision IN ('AI Suggested','Under Review','Expert Verified','Rejected','Resolved')),
  corrected_cause TEXT,
  notes          TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_review_diag ON expert_reviews(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_review_expert ON expert_reviews(expert_id);

-- ----------------------------------------------------------------------------
-- ALERTS  (Section 44 / 36 — personal + regional + seed)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id           TEXT PRIMARY KEY,
  user_id      TEXT REFERENCES users(id) ON DELETE CASCADE, -- NULL = broadcast/regional
  alert_type   TEXT NOT NULL CHECK (alert_type IN ('risk','weather','followup','seed','regional','system')),
  severity     TEXT NOT NULL DEFAULT 'ADVISORY' CHECK (severity IN ('WATCH','ADVISORY','HIGH RISK','CRITICAL')),
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  ref_diagnosis_id TEXT REFERENCES diagnoses(id) ON DELETE SET NULL,
  ref_seed_id  TEXT,
  is_read      INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);

-- ----------------------------------------------------------------------------
-- SEED VERIFICATION & QUALITY ASSURANCE  (Sections 23-28)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seed_records (
  id                TEXT PRIMARY KEY,
  user_id           TEXT REFERENCES users(id) ON DELETE SET NULL,
  crop_name         TEXT NOT NULL,
  variety           TEXT,
  batch_number      TEXT NOT NULL,
  seed_source       TEXT,
  supplier          TEXT,
  certification_no  TEXT,
  purchase_date     TEXT,
  packet_image_url  TEXT,
  certificate_image_url TEXT,
  invoice_image_url TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_seed_user ON seed_records(user_id);
CREATE INDEX IF NOT EXISTS idx_seed_batch ON seed_records(batch_number);

CREATE TABLE IF NOT EXISTS seed_verifications (
  id                TEXT PRIMARY KEY,
  seed_record_id    TEXT NOT NULL REFERENCES seed_records(id) ON DELETE CASCADE,
  status            TEXT NOT NULL CHECK (status IN ('VERIFIED','PARTIALLY VERIFIED','UNVERIFIED','SUSPICIOUS')),
  authenticity      TEXT NOT NULL CHECK (authenticity IN ('Trusted','Needs Verification','Not Trusted')),
  authenticity_score INTEGER NOT NULL, -- 0-100 prototype score
  evidence_json     TEXT,               -- cert match / batch match / supplier verification / lab evidence flags
  is_demo           INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_seedverif_record ON seed_verifications(seed_record_id);

CREATE TABLE IF NOT EXISTS seed_quality_assessments (
  id                 TEXT PRIMARY KEY,
  seed_record_id     TEXT NOT NULL REFERENCES seed_records(id) ON DELETE CASCADE,
  germination_pct    REAL,
  purity_pct         REAL,
  genetic_purity_pct REAL,
  seed_treatment     TEXT,
  lab_test_status    TEXT CHECK (lab_test_status IN ('Not Conducted','Pending','Passed','Failed')),
  quality_label      TEXT CHECK (quality_label IN ('GOOD','ACCEPTABLE','POOR','UNKNOWN')),
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_seedqa_record ON seed_quality_assessments(seed_record_id);

-- ----------------------------------------------------------------------------
-- ECOSYSTEM DIRECTORY — dealers, labs, advisory services (Sections 16-18, 33)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dealers (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  category      TEXT CHECK (category IN ('Seeds','Fertilizers','Crop Protection','Agricultural Supplies','Multiple')),
  village       TEXT,
  district      TEXT,
  latitude      REAL,
  longitude     REAL,
  phone         TEXT,
  verified      INTEGER NOT NULL DEFAULT 0,
  rating        REAL DEFAULT 4.0,
  is_demo       INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS labs (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  lab_type      TEXT CHECK (lab_type IN ('Soil Testing','Diagnostic','KVK','Extension Office')),
  village       TEXT,
  district      TEXT,
  latitude      REAL,
  longitude     REAL,
  phone         TEXT,
  verified      INTEGER NOT NULL DEFAULT 0,
  rating        REAL DEFAULT 4.0,
  is_demo       INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS advisory_services (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  service_type  TEXT CHECK (service_type IN ('Weather','Government Scheme','Extension Advisory')),
  description   TEXT,
  contact       TEXT,
  is_demo       INTEGER NOT NULL DEFAULT 1
);

-- ----------------------------------------------------------------------------
-- REFERRALS — connects a diagnosis's purchase-option needs to a dealer/lab
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referrals (
  id              TEXT PRIMARY KEY,
  diagnosis_id    TEXT NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  dealer_id       TEXT REFERENCES dealers(id) ON DELETE SET NULL,
  requested_item  TEXT,
  status          TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Fulfilled')),
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_referral_diag ON referrals(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_referral_dealer ON referrals(dealer_id);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS  (Section 32/57 — Web/SMS/IVR abstraction log)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  channel     TEXT NOT NULL CHECK (channel IN ('web','sms','ivr')),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','delivered','failed','mocked')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);

-- ----------------------------------------------------------------------------
-- AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   TEXT,
  meta_json   TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
