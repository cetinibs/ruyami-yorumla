-- Add ai_model column to dreams table
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'gemini';

-- Update existing records to have 'gemini' as default
UPDATE public.dreams
SET ai_model = 'gemini'
WHERE ai_model IS NULL;

-- Comment on the column
COMMENT ON COLUMN public.dreams.ai_model IS 'The AI model used for dream interpretation (e.g., gemini, deepseek)';
