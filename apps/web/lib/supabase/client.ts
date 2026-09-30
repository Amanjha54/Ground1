import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcadcgzwxmpqlhkjjujy.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_9OlTVmNUyRsyDe67RyeUzw_powhyXu-';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
