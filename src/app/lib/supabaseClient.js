import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://crahzxxfbobchwmrkjay.supabase.co' // Replace this
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYWh6eHhmYm9iY2h3bXJramF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NDg2MDksImV4cCI6MjA2MDQyNDYwOX0.Noby7YwtwIRHSYBPWPuhTNb6Hyn3kW0yUcTzl2RgOec' // Replace this

export const supabase = createClient(supabaseUrl, supabaseAnonKey)