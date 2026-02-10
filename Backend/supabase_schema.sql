-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUCTIONS
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

-- BIDS
CREATE TABLE public.bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUCTION PARTICIPANTS (Watchlist / Joined)
CREATE TABLE public.auction_participants (
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (auction_id, user_id)
);

-- INDEXES
CREATE INDEX idx_auctions_status ON public.auctions(status);
CREATE INDEX idx_auctions_end_time ON public.auctions(end_time);
CREATE INDEX idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);

-- RLS POLICIES (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_participants ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, User update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auctions: Public read, Seller create/update own
CREATE POLICY "Auctions are viewable by everyone" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Sellers can create auctions" ON public.auctions FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own auctions" ON public.auctions FOR UPDATE USING (auth.uid() = seller_id);

-- Bids: Public read, Authenticated create
CREATE POLICY "Bids are viewable by everyone" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can place bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- TRIGGER: Update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON public.auctions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- TRIGGER: Automatic Profile Creation on Sign Up
-- (This assumes you will use Supabase Auth hooks or client-side creation, but a database trigger is safer)
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
