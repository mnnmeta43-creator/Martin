-- 001_init — skema fillestare e Global Business Brain (initial schema).
-- Runs on PostgreSQL 13+ and PGlite (gen_random_uuid() is built in).
-- Numeric columns use double precision because NUMERIC is returned as a string by the drivers.
-- Every user-owned table cascades from users so deleting an account removes all of its data.

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  password_hash text,
  is_guest boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_normalized CHECK (email IS NULL OR (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254)),
  -- A registered account always has both email and password; a guest has neither.
  CONSTRAINT users_guest_shape CHECK (
    (is_guest AND email IS NULL AND password_hash IS NULL)
    OR (NOT is_guest AND email IS NOT NULL AND password_hash IS NOT NULL)
  )
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
  archetype_id text NOT NULL,
  country_code text NOT NULL CHECK (country_code ~ '^[A-Z]{3}$'),
  city text,
  registration_country text CHECK (registration_country IS NULL OR registration_country ~ '^[A-Z]{3}$'),
  customer_countries jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(customer_countries) = 'array'),
  financial_inputs jsonb NOT NULL CHECK (jsonb_typeof(financial_inputs) = 'object'),
  score_weights jsonb NOT NULL CHECK (jsonb_typeof(score_weights) = 'object'),
  data_snapshot jsonb NOT NULL CHECK (jsonb_typeof(data_snapshot) = 'object'),
  notes text,
  analysis_date timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX projects_user_id_idx ON projects (user_id, updated_at DESC);

CREATE TABLE tasks (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  id text NOT NULL,
  phase_id text NOT NULL CHECK (phase_id IN ('p00_10', 'p10_20', 'p20_30', 'p30_40', 'p40_50', 'p50_60', 'p60_70', 'p70_80', 'p80_90', 'p90_100')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  day_offset integer NOT NULL CHECK (day_offset >= 0),
  duration_days integer NOT NULL CHECK (duration_days >= 0),
  weight double precision NOT NULL CHECK (weight >= 0),
  status text NOT NULL DEFAULT 'per_tu_bere' CHECK (status IN ('per_tu_bere', 'ne_progres', 'perfunduar', 'anashkaluar')),
  proof text NOT NULL DEFAULT '',
  completed_at timestamptz,
  notes text,
  sort integer NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, id)
);

CREATE TABLE evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('interviste', 'vezhgim', 'oferte_cmimi', 'parapagim', 'pagese', 'konkurrent', 'kosto_e_verifikuar', 'tjeter')),
  summary text NOT NULL,
  quantity double precision,
  amount double precision,
  source text NOT NULL DEFAULT '',
  collected_at date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX evidence_project_id_idx ON evidence (project_id, collected_at DESC);

CREATE TABLE chat_messages (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_user_project_idx ON chat_messages (user_id, project_id, id DESC);

CREATE TABLE observations (
  source_id text NOT NULL,
  indicator_code text NOT NULL,
  country_code text NOT NULL,
  period text NOT NULL,
  value double precision, -- NULL = source reports no value (shown as "mungon", never 0)
  unit text NOT NULL,
  currency text,
  is_projection boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  obs_status text,
  source_url text NOT NULL,
  source_last_updated date,
  retrieved_at timestamptz NOT NULL,
  PRIMARY KEY (source_id, indicator_code, country_code, period),
  -- Demo values may only live in the fictional demo economies.
  CONSTRAINT observations_demo_only_in_demo_economies CHECK (NOT is_demo OR country_code IN ('ZZA', 'ZZB', 'ZZC'))
);
CREATE INDEX observations_country_indicator_idx ON observations (country_code, indicator_code);

CREATE TABLE fetch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL,
  scope text NOT NULL,
  started_at timestamptz NOT NULL,
  finished_at timestamptz,
  status text NOT NULL CHECK (status IN ('ok', 'gabim', 'pjesshem', 'anashkaluar')),
  http_status integer,
  row_count integer CHECK (row_count IS NULL OR row_count >= 0),
  message text
);
CREATE INDEX fetch_log_source_scope_idx ON fetch_log (source_id, scope, started_at DESC);
CREATE INDEX fetch_log_started_at_idx ON fetch_log (started_at DESC);

CREATE TABLE fx_rates (
  base text NOT NULL CHECK (base ~ '^[A-Z]{3}$'),
  quote text NOT NULL CHECK (quote ~ '^[A-Z]{3}$'),
  rate double precision NOT NULL CHECK (rate > 0),
  rate_date date NOT NULL,
  source_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('reference_ditore', 'mesatare_vjetore', 'manuale', 'demo')),
  retrieved_at timestamptz NOT NULL,
  PRIMARY KEY (base, quote, source_id, rate_date)
);

CREATE TABLE country_meta (
  code text PRIMARY KEY,
  wb jsonb NOT NULL CHECK (jsonb_typeof(wb) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rate_limits (
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (key, window_start)
);
CREATE INDEX rate_limits_window_start_idx ON rate_limits (window_start);
