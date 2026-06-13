import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function syncAdminUser() {
  const { data: authData } = await supabase.auth.admin.listUsers();
  const users = authData.users;
  const { data: hotelData } = await supabase.from('hotels').select('id').limit(1).single();
  const hotelId = hotelData ? hotelData.id : '00000000-0000-0000-0000-000000000000';

  for (const user of users) {
    const { data: existingStaff } = await supabase.from('staff').select('id').eq('user_id', user.id).single();

    if (!existingStaff) {
      console.log(`Adding ${user.email}...`);
      const { error: insertError } = await supabase.from('staff').insert({
        hotel_id: hotelId,
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
        email: user.email,
        role: 'Admin',
        status: 'active',
        shift: 'Morning'
      });

      if (insertError) {
        console.error("Failed to add:", insertError);
      } else {
        console.log(`Success! Linked ${user.email} to the database as an Admin.`);
      }
    } else {
      console.log(`${user.email} already exists in staff.`);
      await supabase.from('staff').update({ role: 'Admin', email: user.email }).eq('id', existingStaff.id);
    }
  }
}

syncAdminUser();
