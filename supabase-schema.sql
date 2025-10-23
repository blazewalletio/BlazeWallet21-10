-- BLAZE Priority List Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Priority List Registrations Table
CREATE TABLE IF NOT EXISTS priority_list_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  telegram TEXT,
  twitter TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT REFERENCES priority_list_registrations(wallet_address),
  is_verified BOOLEAN DEFAULT FALSE,
  is_early_bird BOOLEAN DEFAULT FALSE,
  position INTEGER,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_verified_at TIMESTAMP WITH TIME ZONE,
  email_verification_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_wallet_address ON priority_list_registrations(wallet_address);
CREATE INDEX IF NOT EXISTS idx_email ON priority_list_registrations(email);
CREATE INDEX IF NOT EXISTS idx_referral_code ON priority_list_registrations(referral_code);
CREATE INDEX IF NOT EXISTS idx_referred_by ON priority_list_registrations(referred_by);
CREATE INDEX IF NOT EXISTS idx_registered_at ON priority_list_registrations(registered_at);
CREATE INDEX IF NOT EXISTS idx_position ON priority_list_registrations(position);

-- Admin Dashboard Stats View
CREATE OR REPLACE VIEW priority_list_stats AS
SELECT
  COUNT(*) as total_registered,
  COUNT(*) FILTER (WHERE is_verified = TRUE) as verified_count,
  COUNT(*) FILTER (WHERE referred_by IS NOT NULL) as referral_count,
  COUNT(*) FILTER (WHERE is_early_bird = TRUE) as early_bird_count,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as email_provided_count,
  MAX(registered_at) as last_registration
FROM priority_list_registrations;

-- Referral Leaderboard View
CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT
  r.wallet_address,
  r.email,
  r.referral_code,
  COUNT(referred.id) as referral_count,
  r.registered_at
FROM priority_list_registrations r
LEFT JOIN priority_list_registrations referred ON referred.referred_by = r.wallet_address
GROUP BY r.id, r.wallet_address, r.email, r.referral_code, r.registered_at
HAVING COUNT(referred.id) > 0
ORDER BY referral_count DESC, r.registered_at ASC
LIMIT 100;

-- Function to automatically set position number
CREATE OR REPLACE FUNCTION set_position_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL THEN
    NEW.position := (SELECT COALESCE(MAX(position), 0) + 1 FROM priority_list_registrations);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set position
CREATE TRIGGER before_insert_position
BEFORE INSERT ON priority_list_registrations
FOR EACH ROW
EXECUTE FUNCTION set_position_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_priority_list_registrations_updated_at
BEFORE UPDATE ON priority_list_registrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(wallet TEXT)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  hash_val INTEGER;
BEGIN
  hash_val := ABS(('x' || MD5(wallet))::bit(32)::int);
  code := 'BLAZE' || UPPER(SUBSTRING(TO_HEX(hash_val) FROM 1 FOR 6));
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE priority_list_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public to read stats (not individual entries)
CREATE POLICY "Allow public read access to own registration" ON priority_list_registrations
  FOR SELECT
  USING (true);

-- Allow public to insert (register)
CREATE POLICY "Allow public insert" ON priority_list_registrations
  FOR INSERT
  WITH CHECK (true);

-- Only allow users to update their own registration
CREATE POLICY "Allow update own registration" ON priority_list_registrations
  FOR UPDATE
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Admin Dashboard Table (for tracking admin actions)
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_wallet TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_email ON admin_actions(admin_email);

-- Email Verification Tokens Table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL REFERENCES priority_list_registrations(wallet_address),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_wallet ON email_verification_tokens(wallet_address);

-- Function to check if email is already registered
CREATE OR REPLACE FUNCTION is_email_registered(email_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM priority_list_registrations
    WHERE LOWER(email) = LOWER(email_param)
  );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

