import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uybrvedtaptizpdqbavx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YnJ2ZWR0YXB0aXpwZHFiYXZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA0MTM2MSwiZXhwIjoyMDYxNjE3MzYxfQ.63bJgqRHgn_ex_vk-h0IcqMtcUxvcRw-qgQP2ATRvdg'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})