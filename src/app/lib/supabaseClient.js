import { createClient } from '@supabase/supabase-js'

//const supabaseUrl = 'https://crahzxxfbobchwmrkjay.supabase.co' // Replace this
//const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYWh6eHhmYm9iY2h3bXJramF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NDg2MDksImV4cCI6MjA2MDQyNDYwOX0.Noby7YwtwIRHSYBPWPuhTNb6Hyn3kW0yUcTzl2RgOec' // Replace this


//export const supabase = createClient(supabaseUrl, supabaseAnonKey)

//import { createClient } from '@supabase/supabase-js';





// Hardcoding the values directly
const supabaseUrl = 'https://crahzxxfbobchwmrkjay.supabase.co'; // Replace with your actual Supabase URL
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYWh6eHhmYm9iY2h3bXJramF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDg0ODYwOSwiZXhwIjoyMDYwNDI0NjA5fQ.c6MQivDJFXZdY2V8zVnYtN25lsQHBfGJHQkdxgjMtOU'; // Replace with your actual Service Role Key

// Initialize the Supabase client with the URL and Service Role Key
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);