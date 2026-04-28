require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const AppError = require("../utils/appError");

// Read Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;

// 🔥 USE SERVICE ROLE KEY (NOT ANON KEY)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new AppError(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env file",
    500
  );
}

// 🔥 Create client with SERVICE ROLE KEY (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;