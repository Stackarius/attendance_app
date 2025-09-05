'use client'

import { supabase } from "@/lib/supabaseClient"

export default function LogoutButton() {

    async function logout() {
        await supabase.auth.signOut()
        window.location.href = "/auth/login"
    }

    return (
        <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Logout
        </button>
    )
}