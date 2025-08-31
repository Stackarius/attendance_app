import { NextResponse } from "next/server";
import { supabase } from "lib/supabaseServer";

export async function POST(req) {
    const { email, password } = await req.json()
    
    if (!email || !password) {
        return NextResponse.json({error: error.message}, {status: 400})
    }

    // Login user
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (!data || error) {
        return NextResponse.json({error: error.message}, {status: 400})
    }
    return NextResponse.json({message: "Login Successful", user: data.user})
}