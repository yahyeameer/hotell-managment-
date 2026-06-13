import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing Supabase connection to:", supabaseUrl);
  try {
    const { data, error } = await supabase.from('hotels').select('*').limit(1);
    if (error) {
      console.error("Database connection failed. Error from Supabase:");
      console.error(error);
      process.exit(1);
    } else {
      console.log("Database connection successful!");
      console.log("Hotels data:", data);
    }
  } catch (err) {
    console.error("Unexpected error:");
    console.error(err);
    process.exit(1);
  }
}

testConnection();
