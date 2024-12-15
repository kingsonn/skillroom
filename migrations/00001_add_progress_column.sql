-- Add progress column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{}'::jsonb;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_progress ON profiles USING GIN (progress);

-- Comment on the column
COMMENT ON COLUMN profiles.progress IS 'Stores user progress for skills and lessons in JSON format';
