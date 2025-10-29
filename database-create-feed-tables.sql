-- ============================================
-- Create tables for announcements, events, and posts
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal')),
  pinned BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT NOT NULL,
  image_url TEXT,
  max_attendees INTEGER,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[],
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(pinned);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for announcements
-- Everyone can view active announcements
CREATE POLICY "Anyone can view active announcements"
  ON announcements FOR SELECT
  USING (status = 'active');

-- Only Officers and Super Admin can insert/update/delete
CREATE POLICY "Officers can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Officer', 'Super Admin')
    )
  );

-- 7. RLS Policies for events
-- Everyone can view events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

-- Only Officers and Super Admin can manage events
CREATE POLICY "Officers can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Officer', 'Super Admin')
    )
  );

-- 8. RLS Policies for posts
-- Everyone can view published posts
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- Users can create their own posts
CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own posts
CREATE POLICY "Users can manage own posts"
  ON posts FOR ALL
  USING (auth.uid() = user_id);

-- Officers can delete any post
CREATE POLICY "Officers can delete any post"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Officer', 'Super Admin')
    )
  );

-- 9. Create RPC functions to bypass RLS for admin operations

-- Function to create announcement
CREATE OR REPLACE FUNCTION public.create_announcement(
  p_title TEXT,
  p_content TEXT,
  p_priority TEXT,
  p_pinned BOOLEAN,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO announcements (title, content, priority, pinned, created_by)
  VALUES (p_title, p_content, p_priority, p_pinned, p_created_by)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Function to create event
CREATE OR REPLACE FUNCTION public.create_event(
  p_title TEXT,
  p_description TEXT,
  p_event_date DATE,
  p_event_time TEXT,
  p_location TEXT,
  p_image_url TEXT,
  p_max_attendees INTEGER,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO events (title, description, event_date, event_time, location, image_url, max_attendees, created_by)
  VALUES (p_title, p_description, p_event_date, p_event_time, p_location, p_image_url, p_max_attendees, p_created_by)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Function to create post
CREATE OR REPLACE FUNCTION public.create_post(
  p_user_id UUID,
  p_content TEXT,
  p_images TEXT[],
  p_status TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO posts (user_id, content, images, status)
  VALUES (p_user_id, p_content, p_images, p_status)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- 10. Grant permissions
GRANT SELECT ON announcements TO authenticated;
GRANT SELECT ON events TO authenticated;
GRANT SELECT ON posts TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Tables created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify tables exist: SELECT * FROM announcements;';
  RAISE NOTICE '2. Verify tables exist: SELECT * FROM events;';
  RAISE NOTICE '3. Verify tables exist: SELECT * FROM posts;';
END $$;
