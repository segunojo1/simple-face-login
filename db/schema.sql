-- Create tables for users and a single face embedding per user
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

-- Store a single 128-d or 512-d descriptor (face-api.js uses 128-d)
CREATE TABLE IF NOT EXISTS face_embeddings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  descriptor float8[] NOT NULL
);
