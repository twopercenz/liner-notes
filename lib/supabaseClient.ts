import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // 배포 환경에서 환경변수를 설정하지 않으면 여기서 바로 알 수 있도록 경고만 남기고,
  // 빌드 자체는 막지 않는다 (Vercel 프리뷰에서 env 설정 전에도 빌드는 되어야 하므로).
  console.warn(
    "Supabase 환경변수가 설정되지 않았습니다. .env.local 또는 Vercel 환경변수를 확인하세요."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
