// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zzfvaxhwpktehsgimylz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6ZnZheGh3cGt0ZWhzZ2lteWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mzk0NDksImV4cCI6MjA2NTUxNTQ0OX0.egRv29ms1goFK_7qDKZrgkQkGdcG6ejSwZ8r6Hv4i3o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);