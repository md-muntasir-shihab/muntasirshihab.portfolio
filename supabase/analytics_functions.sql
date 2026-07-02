-- ============================================================
-- Analytics RPC Functions — Portfolio Admin Dashboard
-- এই পুরো SQL Supabase SQL Editor এ একসাথে run করতে হবে।
-- Idempotent — একাধিক বার run করলেও নিরাপদ (CREATE OR REPLACE)।
--
-- এটা এই ফিচারগুলো দেয়:
--   • get_full_analytics(p_days)  — পুরো dashboard এর জন্য একটি JSON
--   • track_visitor(...)          — visitor insert (anon-callable)
--   • update_visitor_duration(...)— পেজ ছাড়ার সময় duration update
--   • get_recent_activity(p_limit)— realtime feed এর জন্য সর্বশেষ events
-- ============================================================

-- ============================================================
-- 1. Full analytics overview (single call for dashboard)
--    Note: returning visitors = IPs seen in > 1 distinct session.
--    Note: bounce rate = % of visitors with duration < 5s.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_full_analytics(p_days int DEFAULT 30)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  v_total int;
  v_returning int;
  v_bounce int;
BEGIN
  -- Count total visitors once for reuse
  SELECT COUNT(*) INTO v_total FROM public.visitors;

  -- Returning visitors = distinct IPs that appear in more than 1 distinct session
  SELECT COUNT(DISTINCT ip) INTO v_returning
  FROM public.visitors
  WHERE ip IS NOT NULL AND ip != '' AND ip IN (
    SELECT ip FROM public.visitors
    WHERE ip IS NOT NULL AND ip != ''
    GROUP BY ip HAVING COUNT(DISTINCT session_id) > 1
  );

  -- Bounced = stayed less than 5 seconds
  SELECT COUNT(*) INTO v_bounce
  FROM public.visitors
  WHERE duration < 5;

  SELECT jsonb_build_object(
    'overview', jsonb_build_object(
      'total_visitors', v_total,
      'visitors_7d', (SELECT COUNT(*) FROM public.visitors WHERE created_at >= NOW() - INTERVAL '7 days'),
      'visitors_30d', (SELECT COUNT(*) FROM public.visitors WHERE created_at >= NOW() - INTERVAL '30 days'),
      'visitors_today', (SELECT COUNT(*) FROM public.visitors WHERE created_at::date = CURRENT_DATE),
      'total_cv_downloads', (SELECT COUNT(*) FROM public.cv_downloads),
      'cv_downloads_7d', (SELECT COUNT(*) FROM public.cv_downloads WHERE created_at >= NOW() - INTERVAL '7 days'),
      'cv_downloads_today', (SELECT COUNT(*) FROM public.cv_downloads WHERE created_at::date = CURRENT_DATE),
      'total_messages', (SELECT COUNT(*) FROM public.messages),
      'unread_messages', (SELECT COUNT(*) FROM public.messages WHERE is_read = false),
      'messages_7d', (SELECT COUNT(*) FROM public.messages WHERE created_at >= NOW() - INTERVAL '7 days'),
      'avg_duration', (SELECT COALESCE(ROUND(AVG(duration)), 0) FROM public.visitors WHERE duration > 0),
      'returning_visitors', v_returning,
      'new_visitors', COALESCE(v_total - v_returning, 0),
      'bounce_rate', COALESCE(ROUND((v_bounce::numeric / NULLIF(v_total, 0)) * 100), 0)
    ),
    'visitors_by_country', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('country', country, 'count', cnt)), '[]'::jsonb)
      FROM (SELECT country, COUNT(*) as cnt FROM public.visitors WHERE country IS NOT NULL AND country != '' GROUP BY country ORDER BY cnt DESC LIMIT 20) t
    ),
    'cv_by_country', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('country', country, 'count', cnt)), '[]'::jsonb)
      FROM (SELECT country, COUNT(*) as cnt FROM public.cv_downloads WHERE country IS NOT NULL AND country != '' GROUP BY country ORDER BY cnt DESC LIMIT 20) t
    ),
    'daily_visitors', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('date', d::text, 'count', cnt) ORDER BY d), '[]'::jsonb)
      FROM (SELECT created_at::date as d, COUNT(*) as cnt FROM public.visitors WHERE created_at >= NOW() - (p_days * INTERVAL '1 day') GROUP BY d ORDER BY d) t
    ),
    'daily_cv', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('date', d::text, 'count', cnt) ORDER BY d), '[]'::jsonb)
      FROM (SELECT created_at::date as d, COUNT(*) as cnt FROM public.cv_downloads WHERE created_at >= NOW() - (p_days * INTERVAL '1 day') GROUP BY d ORDER BY d) t
    ),
    'daily_messages', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('date', d::text, 'count', cnt) ORDER BY d), '[]'::jsonb)
      FROM (SELECT created_at::date as d, COUNT(*) as cnt FROM public.messages WHERE created_at >= NOW() - (p_days * INTERVAL '1 day') GROUP BY d ORDER BY d) t
    ),
    'devices', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', device, 'count', cnt)), '[]'::jsonb)
      FROM (SELECT device, COUNT(*) as cnt FROM public.visitors WHERE device IS NOT NULL AND device != '' GROUP BY device ORDER BY cnt DESC LIMIT 10) t
    ),
    'browsers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', browser, 'count', cnt)), '[]'::jsonb)
      FROM (SELECT browser, COUNT(*) as cnt FROM public.visitors WHERE browser IS NOT NULL AND browser != '' GROUP BY browser ORDER BY cnt DESC LIMIT 10) t
    ),
    'os_list', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', os, 'count', cnt)), '[]'::jsonb)
      FROM (SELECT os, COUNT(*) as cnt FROM public.visitors WHERE os IS NOT NULL AND os != '' GROUP BY os ORDER BY cnt DESC LIMIT 10) t
    ),
    'referrers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', referrer, 'count', cnt)), '[]'::jsonb)
      FROM (SELECT referrer, COUNT(*) as cnt FROM public.visitors WHERE referrer IS NOT NULL AND referrer != '' GROUP BY referrer ORDER BY cnt DESC LIMIT 10) t
    ),
    'recent_visitors', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', id, 'country', country, 'city', city, 'device', device,
        'browser', browser, 'os', os, 'referrer', referrer, 'duration', duration, 'created_at', created_at
      )), '[]'::jsonb)
      FROM (SELECT * FROM public.visitors ORDER BY created_at DESC LIMIT 15) t
    ),
    'recent_cv_downloads', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', id, 'country', country, 'device', device, 'created_at', created_at
      )), '[]'::jsonb)
      FROM (SELECT * FROM public.cv_downloads ORDER BY created_at DESC LIMIT 15) t
    ),
    'top_cities', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('city', city, 'country', country, 'count', cnt)), '[]'::jsonb)
      FROM (SELECT city, country, COUNT(*) as cnt FROM public.visitors WHERE city IS NOT NULL AND city != '' AND city != 'Unknown' GROUP BY city, country ORDER BY cnt DESC LIMIT 10) t
    ),
    'peak_hours', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('hour', hr, 'count', cnt) ORDER BY hr), '[]'::jsonb)
      FROM (SELECT EXTRACT(HOUR FROM created_at) as hr, COUNT(*) as cnt FROM public.visitors WHERE created_at >= NOW() - (p_days * INTERVAL '1 day') GROUP BY hr ORDER BY hr) t
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. Track visitor (insert into visitors table, callable by anon)
--    ON CONFLICT (session_id) keeps it idempotent per session.
-- ============================================================
CREATE OR REPLACE FUNCTION public.track_visitor(
  p_session_id text,
  p_country text DEFAULT '',
  p_city text DEFAULT '',
  p_device text DEFAULT '',
  p_browser text DEFAULT '',
  p_os text DEFAULT '',
  p_ip text DEFAULT '',
  p_referrer text DEFAULT ''
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.visitors (session_id, country, city, device, browser, os, ip, referrer)
  VALUES (p_session_id, p_country, p_city, p_device, p_browser, p_os, p_ip, p_referrer)
  ON CONFLICT (session_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. Update visitor duration on page unload
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_visitor_duration(p_session_id text, p_duration int)
RETURNS void AS $$
BEGIN
  UPDATE public.visitors SET duration = p_duration WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. Recent unified activity (for the realtime feed's initial seed)
--    Returns visitors + cv_downloads + messages, newest first.
--    Messages expose only a safe subset (no email/phone/body) to anon.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_recent_activity(p_limit int DEFAULT 25)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(x) ORDER BY x.created_at DESC), '[]'::jsonb) INTO result
  FROM (
    SELECT 'visitor' AS type, id, country, city, device, '' AS label, created_at
    FROM public.visitors
    UNION ALL
    SELECT 'cv' AS type, id, country, '' AS city, device, '' AS label, created_at
    FROM public.cv_downloads
    UNION ALL
    SELECT 'message' AS type, id, COALESCE(country, '') AS country, '' AS city, '', name AS label, created_at
    FROM public.messages
  ) x
  ORDER BY x.created_at DESC
  LIMIT p_limit;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Realtime (manual, one-time): publish tables so Supabase Realtime
-- delivers INSERT events to the dashboard. Run once:
--
--   ALTER PUBLICATION supabase_realtime
--     ADD TABLE public.visitors, public.cv_downloads, public.messages;
--
-- And allow anon to SELECT on visitors/cv_downloads so the channel
-- can see new rows (messages stay admin-only; the feed shows count only):
--
--   CREATE POLICY "Realtime read visitors" ON public.visitors
--     FOR SELECT TO anon USING (true);
--   CREATE POLICY "Realtime read cv_downloads" ON public.cv_downloads
--     FOR SELECT TO anon USING (true);
-- ============================================================
