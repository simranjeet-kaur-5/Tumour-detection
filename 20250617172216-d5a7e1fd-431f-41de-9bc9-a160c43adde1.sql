
-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table for medical information
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_id TEXT UNIQUE NOT NULL, -- Hospital/clinic patient ID
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scans table for MRI scan records
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  scan_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scan_type TEXT NOT NULL DEFAULT 'MRI',
  image_url TEXT, -- Supabase storage URL
  original_filename TEXT,
  file_size INTEGER,
  scan_notes TEXT,
  technician_name TEXT,
  referring_doctor TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictions table for AI model results
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
  model_version TEXT NOT NULL DEFAULT 'v1.0',
  prediction_result TEXT NOT NULL CHECK (prediction_result IN ('tumor_detected', 'no_tumor', 'inconclusive')),
  confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  processing_time_ms INTEGER,
  tumor_location TEXT,
  tumor_size_mm DECIMAL(8,2),
  additional_findings TEXT,
  reviewed_by_doctor BOOLEAN DEFAULT FALSE,
  doctor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user sessions table for login tracking
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  login_method TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for patients
CREATE POLICY "Users can view own patient data" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own patient data" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patient data" ON public.patients
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for scans
CREATE POLICY "Users can view own scans" ON public.scans
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.patients WHERE patients.id = scans.patient_id AND patients.user_id = auth.uid()
  ));
CREATE POLICY "Users can create own scans" ON public.scans
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.patients WHERE patients.id = scans.patient_id AND patients.user_id = auth.uid()
  ));

-- RLS Policies for predictions
CREATE POLICY "Users can view own predictions" ON public.predictions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.scans 
    JOIN public.patients ON scans.patient_id = patients.id 
    WHERE scans.id = predictions.scan_id AND patients.user_id = auth.uid()
  ));

-- RLS Policies for user sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for MRI images
INSERT INTO storage.buckets (id, name, public) VALUES ('mri-scans', 'mri-scans', false);

-- Storage policies for MRI scans
CREATE POLICY "Users can upload own MRI scans" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'mri-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own MRI scans" ON storage.objects
  FOR SELECT USING (bucket_id = 'mri-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
