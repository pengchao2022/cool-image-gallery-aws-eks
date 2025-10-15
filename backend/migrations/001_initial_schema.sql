-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create comics table
CREATE TABLE IF NOT EXISTS comics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags VARCHAR(500),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_urls TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comics_user_id ON comics(user_id);
CREATE INDEX IF NOT EXISTS idx_comics_created_at ON comics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comics_tags ON comics USING gin(tags gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable trigram extension for better text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
