CREATE TABLE IF NOT EXISTS shm_users (
  id uuid PRIMARY KEY,
  full_name varchar(120) NOT NULL,
  phone varchar(24) NOT NULL,
  email varchar(254) NOT NULL UNIQUE,
  username varchar(32) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role varchar(16) NOT NULL CHECK (role IN ('landlord', 'tenant', 'staff')),
  staff_role varchar(16),
  email_verified_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (role = 'staff' AND staff_role = 'admin')
    OR (role IN ('landlord', 'tenant') AND staff_role IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS shm_users_single_staff_idx
  ON shm_users (role) WHERE role = 'staff';

CREATE TABLE IF NOT EXISTS shm_pending_registrations (
  id uuid PRIMARY KEY,
  verification_token_hash char(64) NOT NULL,
  full_name varchar(120) NOT NULL,
  phone varchar(24) NOT NULL,
  email varchar(254) NOT NULL UNIQUE,
  username varchar(32) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role varchar(16) NOT NULL CHECK (role IN ('landlord', 'tenant', 'staff')),
  otp_hash text NOT NULL,
  otp_attempts smallint NOT NULL DEFAULT 0 CHECK (otp_attempts BETWEEN 0 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  otp_expires_at timestamptz NOT NULL,
  registration_expires_at timestamptz NOT NULL,
  resend_after timestamptz NOT NULL
);

ALTER TABLE shm_pending_registrations
  DROP CONSTRAINT IF EXISTS shm_pending_registrations_role_check;

ALTER TABLE shm_pending_registrations
  ADD CONSTRAINT shm_pending_registrations_role_check
  CHECK (role IN ('landlord', 'tenant', 'staff'));

ALTER TABLE shm_pending_registrations
  ADD COLUMN IF NOT EXISTS registration_expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour');

CREATE INDEX IF NOT EXISTS shm_pending_registrations_registration_expiry_idx
  ON shm_pending_registrations (registration_expires_at);

CREATE TABLE IF NOT EXISTS shm_auth_rate_limits (
  bucket_key char(64) PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  hit_count integer NOT NULL CHECK (hit_count > 0),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS shm_auth_rate_limits_expiry_idx
  ON shm_auth_rate_limits (expires_at);
