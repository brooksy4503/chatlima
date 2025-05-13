-- Drop all tables in the database
DROP TABLE IF EXISTS polar_usage_events CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS verification CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS _drizzle_migrations CASCADE;

-- The tables will be recreated using Drizzle migrations 