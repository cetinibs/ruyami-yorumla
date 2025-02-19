-- Drop existing trigger
DROP TRIGGER IF EXISTS set_updated_at ON public.dreams;

-- Drop existing function
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Drop existing table (this will also drop associated policies)
DROP TABLE IF EXISTS public.dreams;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create dreams table
CREATE TABLE public.dreams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    interpretation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

-- Create policy to enable CRUD for users based on user_id
CREATE POLICY "Enable CRUD for users based on user_id"
ON public.dreams
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS dreams_user_id_idx ON public.dreams(user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.dreams
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
