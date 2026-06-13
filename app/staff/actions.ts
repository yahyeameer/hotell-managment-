'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function createStaffUser(email: string, password: string, name: string) {
  try {
    const supabaseAdmin = createAdminClient()

    // Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for staff accounts
      user_metadata: {
        full_name: name
      }
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user." }
    }

    return { 
      success: true, 
      user: authData.user 
    }

  } catch (error: any) {
    console.error("Action error:", error)
    return { success: false, error: error.message || "An unexpected error occurred." }
  }
}

export async function resetStaffPassword(userId: string, newPassword: string) {
  try {
    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      console.error("Error resetting password:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Action error:", error)
    return { success: false, error: error.message || "An unexpected error occurred." }
  }
}
