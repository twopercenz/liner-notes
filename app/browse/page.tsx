import { supabase } from "@/lib/supabaseClient";
import EntryBrowser from "@/components/EntryBrowser";
import { Entry } from "@/lib/types";

export const revalidate = 0;

// 메인 페이지: 전체 리뷰 목록 + 분류 필터 + 검색.
// 마케팅성 소개는 랜딩 페이지(/)에 있고, 여기는 실제 둘러보는 화면이다.
export default async function BrowsePage() {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("entries 조회 실패:", error.message);
  }

  const entries = (data ?? []) as Entry[];

  return (
    <>
      <div className="page-header">
        <h1 className="text-display-md">둘러보기</h1>
      </div>
      <EntryBrowser entries={entries} />
    </>
  );
}
