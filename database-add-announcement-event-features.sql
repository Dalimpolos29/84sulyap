-- ============================================
-- Add new features to announcements and events
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add new columns to announcements table
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cta_text TEXT,
ADD COLUMN IF NOT EXISTS cta_link TEXT,
ADD COLUMN IF NOT EXISTS attachments TEXT[];

-- 2. Add new columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS registration_deadline DATE,
ADD COLUMN IF NOT EXISTS cost TEXT DEFAULT 'Free',
ADD COLUMN IF NOT EXISTS contact_person_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. Create event_rsvps table for RSVP tracking
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (response IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);

-- 5. Enable Row Level Security on event_rsvps
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for event_rsvps
-- Anyone can view RSVPs
CREATE POLICY "Anyone can view event RSVPs"
  ON event_rsvps FOR SELECT
  USING (true);

-- Users can create/update their own RSVPs
CREATE POLICY "Users can manage own RSVPs"
  ON event_rsvps FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Create function to get RSVP counts
CREATE OR REPLACE FUNCTION public.get_event_rsvp_counts(event_id_input UUID)
RETURNS TABLE (
  going_count BIGINT,
  maybe_count BIGINT,
  not_going_count BIGINT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE response = 'going') as going_count,
    COUNT(*) FILTER (WHERE response = 'maybe') as maybe_count,
    COUNT(*) FILTER (WHERE response = 'not_going') as not_going_count,
    COUNT(*) as total_count
  FROM event_rsvps
  WHERE event_id = event_id_input;
END;
$$;

-- 8. Create function to get event attendees (only those who said "going")
CREATE OR REPLACE FUNCTION public.get_event_attendees(event_id_input UUID)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  profile_picture TEXT,
  response TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.profile_picture,
    r.response
  FROM event_rsvps r
  JOIN profiles p ON p.id = r.user_id
  WHERE r.event_id = event_id_input
    AND r.response = 'going'
  ORDER BY r.created_at ASC;
END;
$$;

-- 9. Create function to auto-archive expired announcements
CREATE OR REPLACE FUNCTION public.archive_expired_announcements()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE announcements
  SET status = 'archived'
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND status = 'active';
END;
$$;

-- 10. Create a scheduled job to run the archive function (requires pg_cron extension)
-- Note: You may need to enable pg_cron extension in Supabase dashboard first
-- Uncomment the lines below after enabling pg_cron:

-- SELECT cron.schedule(
--   'archive-expired-announcements',
--   '0 0 * * *', -- Run daily at midnight
--   $$SELECT archive_expired_announcements()$$
-- );

-- 11. Grant permissions
GRANT SELECT ON event_rsvps TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'New features added:';
  RAISE NOTICE '- Announcements: image, expiration, CTA, attachments';
  RAISE NOTICE '- Events: registration deadline, cost, contact person';
  RAISE NOTICE '- RSVP system with tracking and attendee list';
END $$;
