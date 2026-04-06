require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const AppError = require("../utils/appError");

// Read Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new AppError("SUPABASE_URL and SUPABASE_KEY are required in .env file", 500);
}

// Create and export Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
