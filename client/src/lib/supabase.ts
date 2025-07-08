import { createClient } from '@supabase/supabase-js';

// Use direct values for now to ensure connection works
const supabaseUrl = 'https://vgzgdlozgyolibmhgprk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnemdkbG96Z3lvbGlibWhncHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDk2NDUsImV4cCI6MjA1OTcyNTY0NX0.D_HqLWUl10QBsfpzz04bG3jnPqQ79uniyAHM4pdM9BI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);