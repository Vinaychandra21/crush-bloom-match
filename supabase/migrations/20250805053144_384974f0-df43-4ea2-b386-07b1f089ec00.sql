-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create crushes table
CREATE TABLE public.crushes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, priority),
  UNIQUE(user_id, phone_number)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user1_priority INTEGER NOT NULL,
  user2_priority INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('app-assets', 'app-assets', true);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crushes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Crushes policies
CREATE POLICY "Users can view their own crushes" ON public.crushes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crushes" ON public.crushes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crushes" ON public.crushes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crushes" ON public.crushes
  FOR DELETE USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their own matches" ON public.matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for app assets
CREATE POLICY "App assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-assets');

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to find matches
CREATE OR REPLACE FUNCTION public.find_matches()
RETURNS VOID AS $$
BEGIN
  -- Insert new matches when two users have each other in their crush lists
  INSERT INTO public.matches (user1_id, user2_id, user1_priority, user2_priority)
  SELECT DISTINCT
    c1.user_id as user1_id,
    c2.user_id as user2_id,
    c1.priority as user1_priority,
    c2.priority as user2_priority
  FROM public.crushes c1
  JOIN public.crushes c2 ON c1.phone_number = (
    SELECT phone_number FROM public.profiles WHERE user_id = c2.user_id
  )
  JOIN public.profiles p1 ON p1.user_id = c1.user_id
  WHERE c2.phone_number = p1.phone_number
    AND c1.user_id != c2.user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE (m.user1_id = c1.user_id AND m.user2_id = c2.user_id)
         OR (m.user1_id = c2.user_id AND m.user2_id = c1.user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;