-- =============================================================
-- BidVault V2 Migration — Run AFTER the original SUPABASE_MIGRATION.sql
-- This is ADDITIVE: does not drop or alter existing data destructively.
-- =============================================================

-- =============================================
-- 1. EXTEND PROFILES TABLE
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='username') THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='location') THEN
    ALTER TABLE public.profiles ADD COLUMN location TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='seller_rating') THEN
    ALTER TABLE public.profiles ADD COLUMN seller_rating DECIMAL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='buyer_rating') THEN
    ALTER TABLE public.profiles ADD COLUMN buyer_rating DECIMAL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='total_sales') THEN
    ALTER TABLE public.profiles ADD COLUMN total_sales INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='total_purchases') THEN
    ALTER TABLE public.profiles ADD COLUMN total_purchases INTEGER DEFAULT 0;
  END IF;
END $$;

-- =============================================
-- 2. EXTEND AUCTIONS TABLE
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='category') THEN
    ALTER TABLE public.auctions ADD COLUMN category TEXT DEFAULT 'Other';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='subcategory') THEN
    ALTER TABLE public.auctions ADD COLUMN subcategory TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='condition') THEN
    ALTER TABLE public.auctions ADD COLUMN condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'for_parts'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='min_increment') THEN
    ALTER TABLE public.auctions ADD COLUMN min_increment DECIMAL(12,2) DEFAULT 10.00;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='tags') THEN
    ALTER TABLE public.auctions ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='shipping_cost') THEN
    ALTER TABLE public.auctions ADD COLUMN shipping_cost DECIMAL(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='seller_location') THEN
    ALTER TABLE public.auctions ADD COLUMN seller_location TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='local_pickup') THEN
    ALTER TABLE public.auctions ADD COLUMN local_pickup BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='thumbnail_url') THEN
    ALTER TABLE public.auctions ADD COLUMN thumbnail_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='reserve_price') THEN
    ALTER TABLE public.auctions ADD COLUMN reserve_price DECIMAL(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='buy_now_price') THEN
    ALTER TABLE public.auctions ADD COLUMN buy_now_price DECIMAL(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='auctions' AND column_name='view_count') THEN
    ALTER TABLE public.auctions ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_auctions_category ON public.auctions(category);
CREATE INDEX IF NOT EXISTS idx_auctions_condition ON public.auctions(condition);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_auctions_search ON public.auctions USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));

-- =============================================
-- 3. AUCTION WINNERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.auction_winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE UNIQUE,
  winner_id UUID NOT NULL REFERENCES public.profiles(id),
  winning_bid DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_date TIMESTAMPTZ,
  shipped BOOLEAN DEFAULT FALSE,
  tracking_number TEXT,
  delivered_at TIMESTAMPTZ,
  buyer_feedback_given BOOLEAN DEFAULT FALSE,
  seller_feedback_given BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_winners_auction ON public.auction_winners(auction_id);
CREATE INDEX IF NOT EXISTS idx_winners_winner ON public.auction_winners(winner_id);

ALTER TABLE public.auction_winners ENABLE ROW LEVEL SECURITY;

-- Everyone can view winners (public results)
CREATE POLICY "Winners are viewable by everyone" ON public.auction_winners FOR SELECT USING (true);
-- Only system/service role inserts (via functions)
CREATE POLICY "Service can insert winners" ON public.auction_winners FOR INSERT WITH CHECK (true);
-- Involved parties can update (payment status etc.)
CREATE POLICY "Involved parties can update" ON public.auction_winners FOR UPDATE USING (
  auth.uid() = winner_id OR auth.uid() IN (SELECT seller_id FROM public.auctions WHERE id = auction_id)
);

-- =============================================
-- 4. FEEDBACK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id),
  to_user_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('buyer', 'seller')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (auction_id, from_user_id, feedback_type)
);

CREATE INDEX IF NOT EXISTS idx_feedback_to_user ON public.feedback(to_user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_from_user ON public.feedback(from_user_id);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feedback is viewable by everyone" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "Users can insert feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- =============================================
-- 5. EXTEND NOTIFICATIONS TYPE CHECK
-- =============================================
-- Drop and recreate the check constraint to allow more notification types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'outbid', 'won', 'ended', 'system',
  'auction_won', 'auction_lost', 'auction_ended',
  'first_bid', 'new_bid', 'bid_accepted', 'ending_soon',
  'payment_received', 'item_shipped'
));

-- Add title column to notifications if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='title') THEN
    ALTER TABLE public.notifications ADD COLUMN title TEXT DEFAULT '';
  END IF;
END $$;

-- =============================================
-- 6. CLOSE EXPIRED AUCTIONS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION close_expired_auctions()
RETURNS JSON AS $$
DECLARE
  auction_record RECORD;
  highest_bid RECORD;
  closed_count INTEGER := 0;
BEGIN
  FOR auction_record IN
    SELECT * FROM public.auctions
    WHERE status = 'active' AND end_time <= NOW()
  LOOP
    -- Find highest bid
    SELECT * INTO highest_bid
    FROM public.bids
    WHERE auction_id = auction_record.id
    ORDER BY amount DESC, created_at ASC
    LIMIT 1;

    IF highest_bid IS NOT NULL THEN
      -- Insert winner record
      INSERT INTO public.auction_winners (auction_id, winner_id, winning_bid)
      VALUES (auction_record.id, highest_bid.bidder_id, highest_bid.amount)
      ON CONFLICT (auction_id) DO NOTHING;

      -- Notify winner
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        highest_bid.bidder_id,
        'auction_won',
        'You won an auction!',
        'Congratulations! You won "' || auction_record.title || '" for $' || highest_bid.amount,
        auction_record.id
      );

      -- Notify seller
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        auction_record.seller_id,
        'auction_ended',
        'Your auction has sold!',
        'Your auction "' || auction_record.title || '" sold for $' || highest_bid.amount,
        auction_record.id
      );

      -- Notify losing bidders
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      SELECT DISTINCT bidder_id, 'auction_lost', 'Auction ended',
        'The auction "' || auction_record.title || '" has ended. You were outbid.',
        auction_record.id
      FROM public.bids
      WHERE auction_id = auction_record.id
        AND bidder_id != highest_bid.bidder_id;
    ELSE
      -- No bids — notify seller
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        auction_record.seller_id,
        'auction_ended',
        'Your auction has ended',
        'Your auction "' || auction_record.title || '" ended without bids.',
        auction_record.id
      );
    END IF;

    -- Close the auction
    UPDATE public.auctions SET status = 'ended', updated_at = NOW()
    WHERE id = auction_record.id;

    closed_count := closed_count + 1;
  END LOOP;

  RETURN json_build_object('closed', closed_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. ENABLE REALTIME FOR NEW TABLES
-- =============================================
-- Note: Run these in Supabase dashboard if ALTER PUBLICATION is not available
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_winners;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
