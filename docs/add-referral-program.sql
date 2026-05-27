-- Migration: Add Referral & Affiliate Program Support
ALTER TABLE users ADD COLUMN referred_by_id bigint REFERENCES users(id);
ALTER TABLE users ADD COLUMN referral_paid boolean NOT null DEFAULT false;
ALTER TABLE pending_registrations ADD COLUMN referral_code varchar(32);
