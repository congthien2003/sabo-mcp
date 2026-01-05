-- Migration SQL for memorize-mcp v1.1
-- Supabase database schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: projects
-- Stores project/workspace information
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Table: memories
-- Stores memory records for each project
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_from TEXT
);

-- Index on project_id for fast filtering
CREATE INDEX IF NOT EXISTS idx_memories_project_id ON memories(project_id);

-- Index on timestamp for date-based queries
CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories(timestamp DESC);

-- Optional: Unique constraint on (project_id, filename) if you want one file = one memory
-- Uncomment if needed:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_project_filename ON memories(project_id, filename);

-- Comments for documentation
COMMENT ON TABLE projects IS 'Projects/workspaces that contain memories';
COMMENT ON TABLE memories IS 'Memory records saved by memorize-mcp';
COMMENT ON COLUMN memories.filename IS 'Filename from local storage (e.g., summary_v1.json)';
COMMENT ON COLUMN memories.topic IS 'Topic or title of the memory';
COMMENT ON COLUMN memories.content IS 'Full content of the memory';
COMMENT ON COLUMN memories.timestamp IS 'Logical timestamp when memory was created (ISO UTC)';
COMMENT ON COLUMN memories.created_from IS 'Source machine/user info (e.g., hostname@username)';
