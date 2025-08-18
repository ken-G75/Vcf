const { createClient } = require("@supabase/supabase-js")

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

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
