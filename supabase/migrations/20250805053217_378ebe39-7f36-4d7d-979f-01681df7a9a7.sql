-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
  JOIN public.crushes c2 ON c1.crushPhoneNumber = (
    SELECT crushPhoneNumber FROM public.profiles WHERE user_id = c2.user_id
  )
  JOIN public.profiles p1 ON p1.user_id = c1.user_id
  WHERE c2.crushPhoneNumber = p1.crushPhoneNumber
    AND c1.user_id != c2.user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE (m.user1_id = c1.user_id AND m.user2_id = c2.user_id)
         OR (m.user1_id = c2.user_id AND m.user2_id = c1.user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';