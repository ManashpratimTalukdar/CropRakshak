-- ----------------------------------------------------------------------------
-- Add field_size_acres to diagnoses so the scan-time field size (collected in
-- the /scan wizard's "Field size" step) survives into the diagnosis/action
-- pages instead of being silently dropped. Nullable + no default change
-- needed for existing rows (they simply show as "Unspecified" in the view).
-- ----------------------------------------------------------------------------
ALTER TABLE diagnoses ADD COLUMN field_size_acres REAL;
