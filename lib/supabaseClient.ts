import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // 환경변수가 없으면 createClient()가 즉시 예외를 던진다.
  // 그러면 이 파일을 import하는 모든 페이지/컴포넌트가 통째로 깨져서
  // (검색창 등 아무 것도 반응하지 않는) 원인을 알 수 없는 상태가 되므로,
  // 대신 더미 값으로 클라이언트를 만들고 화면에서 안내 문구를 보여주도록 한다.
  console.warn(
    "[Liner Notes] Supabase 환경변수가 설정되지 않았습니다. " +
      "Vercel 프로젝트 설정 → Environment Variables에 " +
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가하고 재배포하세요."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
