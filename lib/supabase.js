const { createClient } = require("@supabase/supabase-js")

// Configuration Supabase
const supabaseUrl =//vcblxllocphmtvoallqv.supabase.co
const supabaseServiceKey =eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjYmx4bGxvY3BobXR2b2FsbHF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU2NTc5MiwiZXhwIjoyMDcxMTQxNzkyfQ.jUi2to1LpQMTz5GrYJ8oRdaFetPp78DHjLelZHpNstY
const supabaseAnonKey =eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjYmx4bGxvY3BobXR2b2FsbHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NjU3OTIsImV4cCI6MjA3MTE0MTc5Mn0.5lxeTeRPDlVB6di5nYHKa1SlxhAJuHP3WEmvw71YlNQ

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is required")
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required")
}

// Client avec service role pour les opérations admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Client public pour les opérations publiques
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey)

module.exports = {
  supabaseAdmin,
  supabasePublic,
}
