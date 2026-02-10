-- SUPPORTING FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLES
-- Profiles (extends Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auctions
CREATE TABLE public.auctions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  starting_price DECIMAL(12, 2) NOT NULL,
  current_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  winner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids
CREATE TABLE public.bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('outbid', 'won', 'ended', 'system')),
  message TEXT NOT NULL,
  related_id UUID, -- Can be auction_id
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES
CREATE INDEX idx_auctions_status ON public.auctions(status);
CREATE INDEX idx_auctions_end_time ON public.auctions(end_time);
CREATE INDEX idx_auctions_seller_id ON public.auctions(seller_id);
CREATE INDEX idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- 3. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auctions
CREATE POLICY "Auctions are viewable by everyone" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Sellers can create auctions" ON public.auctions FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own auctions" ON public.auctions FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Admins can delete any auction" ON public.auctions FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Bids
CREATE POLICY "Bids are viewable by everyone" ON public.bids FOR SELECT USING (true);
-- Insert is handled via RPC function for safety, but we allow it if checks pass (optional, better to force RPC)
CREATE POLICY "Users can insert bids via RPC" ON public.bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 4. FUNCTIONS & TRIGGERS

-- Handle New User (Auto Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON public.auctions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- KEY FUNCTION: PLACE BID (Atomic + Anti-Sniping)
CREATE OR REPLACE FUNCTION place_bid(auction_id UUID, bid_amount DECIMAL)
RETURNS JSON AS $$
DECLARE
  auction_record RECORD;
  new_end_time TIMESTAMPTZ;
BEGIN
  -- 1. Get Auction Data (Lock row for update)
  SELECT * FROM public.auctions WHERE id = auction_id FOR UPDATE INTO auction_record;

  -- 2. Validations
  IF auction_record.status != 'active' THEN
    RAISE EXCEPTION 'Auction is not active';
  END IF;

  IF NOW() > auction_record.end_time THEN
    UPDATE public.auctions SET status = 'ended' WHERE id = auction_id;
    RAISE EXCEPTION 'Auction has ended';
  END IF;

  IF auth.uid() = auction_record.seller_id THEN
    RAISE EXCEPTION 'You cannot bid on your own auction';
  END IF;

  IF bid_amount <= auction_record.current_price THEN
    RAISE EXCEPTION 'Bid amount must be higher than current price';
  END IF;

  -- 3. Insert Bid
  INSERT INTO public.bids (auction_id, bidder_id, amount)
  VALUES (auction_id, auth.uid(), bid_amount);

  -- 4. Anti-Sniping Logic (Extend if < 5 mins left)
  IF (auction_record.end_time - NOW()) < INTERVAL '5 minutes' THEN
    new_end_time := NOW() + INTERVAL '5 minutes';
  ELSE
    new_end_time := auction_record.end_time;
  END IF;

  -- 5. Update Auction
  UPDATE public.auctions
  SET current_price = bid_amount,
      winner_id = auth.uid(),
      end_time = new_end_time,
      updated_at = NOW()
  WHERE id = auction_id;

  IF auction_record.winner_id IS NOT NULL AND auction_record.winner_id != auth.uid() THEN
    INSERT INTO public.notifications (user_id, type, message, related_id)
    VALUES (auction_record.winner_id, 'outbid', 'You have been outbid on ' || auction_record.title, auction_id);
  END IF;

  RETURN json_build_object('success', true, 'new_price', bid_amount, 'new_end_time', new_end_time);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Watchlist Table
CREATE TABLE public.watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  auction_id UUID REFERENCES public.auctions(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, auction_id)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their watchlist" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from their watchlist" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);
