
import { createClient } from '@supabase/supabase-js';

// Supabase URL and anon key
const supabaseUrl = 'https://ugeftirrsncpdncbwkkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnZWZ0aXJyc25jcGRuY2J3a2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDE0OTgsImV4cCI6MjA2MzQxNzQ5OH0.G2S0Yu7lHC2zezFYTX4p2OXuQSX7Fw5h7RJrSJPzTpM';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined
  }
});
