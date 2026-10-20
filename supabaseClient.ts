import { createClient } from '@supabase/supabase-js';

// Supabase URL 및 anon key 가져오기
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
// URL 끝에 /rest/v1/ 이 붙어있어도 createClient가 올바르게 작동하도록 자동 보정
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
