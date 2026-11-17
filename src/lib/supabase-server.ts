import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client using Service Role Key
// CRITICAL SECURITY RULE:
// This file must ONLY be imported in server-side contexts (API routes, getServerSideProps, server components).
// Never import this file in client components ('use client').
// The SERVICE_ROLE_KEY bypasses Row Level Security (RLS) to manage private bucket storage.

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase server configuration missing. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in environment variables.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'campus-resources';

