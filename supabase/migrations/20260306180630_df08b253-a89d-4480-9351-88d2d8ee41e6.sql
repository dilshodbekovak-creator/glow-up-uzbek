
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📚',
  price INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  content TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);

-- Create completed_lessons table
CREATE TABLE public.completed_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.completed_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their completed lessons" ON public.completed_lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark lessons complete" ON public.completed_lessons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove completion" ON public.completed_lessons FOR DELETE USING (auth.uid() = user_id);

-- Create period_tracking table
CREATE TABLE public.period_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  predicted_next_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.period_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own periods" ON public.period_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own periods" ON public.period_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own periods" ON public.period_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own periods" ON public.period_tracking FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_period_tracking_updated_at BEFORE UPDATE ON public.period_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed modules
INSERT INTO public.modules (id, title, emoji, price, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Sog''liq va Gigiyena', '🩺', 49000, 1),
  ('b2222222-2222-2222-2222-222222222222', 'Hayz Sikli Ilmi', '🌸', 49000, 2),
  ('c3333333-3333-3333-3333-333333333333', 'Psixologiya', '🧠', 49000, 3);

-- Lessons for Module 1
INSERT INTO public.lessons (module_id, title, video_url, content, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Shaxsiy gigiyena asoslari', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Shaxsiy gigiyena — bu sog''liqni saqlashning eng muhim qismidir. Har kuni dush qabul qilish, tishlarni tozalash, qo''llarni yuvish va kiyimlarni toza saqlash asosiy gigiyena qoidalaridir.', 1),
  ('a1111111-1111-1111-1111-111111111111', 'To''g''ri ovqatlanish', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'To''g''ri ovqatlanish tana uchun zarur vitaminlar va minerallarni olishning asosiy yo''lidir. Har kuni meva, sabzavot, don mahsulotlari va oqsil iste''mol qilish kerak.', 2),
  ('a1111111-1111-1111-1111-111111111111', 'Uyqu va dam olish', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Yetarli uyqu olish sog''liq uchun juda muhimdir. 12-22 yosh orasidagi qizlarga kuniga 8-10 soat uyqu tavsiya etiladi.', 3),
  ('a1111111-1111-1111-1111-111111111111', 'Jismoniy faollik', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Muntazam jismoniy harakatlar sog''liq uchun zarurdir. Yugurish, yurish, suzish yoki yoga kabi mashqlar tanani mustahkamlaydi.', 4);

-- Lessons for Module 2
INSERT INTO public.lessons (module_id, title, video_url, content, sort_order) VALUES
  ('b2222222-2222-2222-2222-222222222222', 'Hayz nima?', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Hayz — bu qizlarning voyaga yetish jarayonida boshlanadigan tabiiy biologik jarayon. Bu bachadon devorining har oyda yangilanishi natijasida sodir bo''ladi.', 1),
  ('b2222222-2222-2222-2222-222222222222', 'Hayz sikli bosqichlari', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Hayz sikli odatda 28 kun davom etadi, lekin 21-35 kun orasida bo''lishi normal. Sikl 4 bosqichdan iborat.', 2),
  ('b2222222-2222-2222-2222-222222222222', 'Gigienik vositalar', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Hayz davrida ishlatilishi mumkin bo''lgan turli gigienik vositalar mavjud: prokladkalar, tamponlar va menstrual kosachalar.', 3),
  ('b2222222-2222-2222-2222-222222222222', 'Og''riq bilan kurashish', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Hayz davrida qorin og''rig''i ko''pchilik qizlarda kuzatiladi. Iliq kompress qo''yish, engil mashqlar og''riqni kamaytirishi mumkin.', 4);

-- Lessons for Module 3
INSERT INTO public.lessons (module_id, title, video_url, content, sort_order) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'Hissiyotlarni boshqarish', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Hissiyotlarni boshqarish — bu o''z his-tuyg''ularingizni tushunish va ularni sog''lom yo''l bilan ifodalash qobiliyatidir.', 1),
  ('c3333333-3333-3333-3333-333333333333', 'Stress bilan ishlash', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Stress hayotning tabiiy qismidir, lekin uni boshqarish muhim. Meditatsiya, jismoniy mashqlar stress darajasini pasaytiradi.', 2),
  ('c3333333-3333-3333-3333-333333333333', 'O''z-o''ziga ishonch', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'O''z-o''ziga ishonch — bu o''z qobiliyatlaringiz va qadriyatlaringizga bo''lgan ishonchdir.', 3),
  ('c3333333-3333-3333-3333-333333333333', 'Sog''lom munosabatlar', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Sog''lom munosabatlar hurmat, ishonch va ochiq muloqotga asoslanadi.', 4);
