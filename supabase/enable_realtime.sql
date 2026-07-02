-- ============================================================
-- Enable Supabase Realtime for the Analytics Activity Feed
-- এই SQL একবার Supabase SQL Editor এ run করলেই হবে।
--
-- এটা কী করে:
--   1. visitors, cv_downloads, messages টেবিলগুলো realtime পাবলিকেশনে যোগ করে
--      (যাতে নতুন INSERT ইভেন্ট ড্যাশবোর্ডে পৌঁছায়)
--   2. anon ইউজার যেন visitors ও cv_downloads থেকে SELECT করতে পারে
--      (realtime চ্যানেল RLS মানতে পারে সেই জন্য)
--   3. messages টেবিলের SELECT শুধু service_role এর জন্য রাখে (নিরাপত্তা)
-- ============================================================

-- ১. টেবিলগুলো realtime পাবলিকেশনে যোগ করো
ALTER PUBLICATION supabase_realtime
  ADD TABLE public.visitors;

ALTER PUBLICATION supabase_realtime
  ADD TABLE public.cv_downloads;

ALTER PUBLICATION supabase_realtime
  ADD TABLE public.messages;

-- ২. visitors ও cv_downloads এ anon SELECT পলিসি (realtime এর জন্য দরকারি)
--    (এগুলো আগে থেকে থাকলে DROP IF EXISTS করে আবার তৈরি করে)
DROP POLICY IF EXISTS "Realtime read visitors" ON public.visitors;
CREATE POLICY "Realtime read visitors"
  ON public.visitors FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Realtime read cv_downloads" ON public.cv_downloads;
CREATE POLICY "Realtime read cv_downloads"
  ON public.cv_downloads FOR SELECT
  TO anon, authenticated
  USING (true);

-- বিঃদ্রঃ messages টেবিলের SELECT পলিসি যোগ করা হচ্ছে না —
-- visitor-এর নাম/ইমেইল প্রাইভেট রাখতে। Realtime এ "New message" টাইপের
-- ইভেন্ট শুধু সংখ্যা হিসেবে দেখাবে, বিস্তারিত নয়।
-- (আপনি যদি চান যে message-এর প্রেরকের নাম feed-এ দেখাক, তাহলে
--  নিচের পলিসি আনকমেন্ট করুন।)
-- DROP POLICY IF EXISTS "Realtime read messages" ON public.messages;
-- CREATE POLICY "Realtime read messages"
--   ON public.messages FOR SELECT
--   TO anon, authenticated
--   USING (true);

-- যাচাই করার উপায় (এই query চালান):
-- SELECT schemaname, tablename FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime';
-- ফলাফলে visitors, cv_downloads, messages দেখা উচিত।
