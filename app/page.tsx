import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import EntryCard from "@/components/EntryCard";
import ClayShapes from "@/components/ClayShapes";
import { Entry } from "@/lib/types";

export const revalidate = 0;

// 랜딩 페이지: 히어로 + 최근 리뷰 미리보기만 보여준다.
// 실제 전체 목록/필터/검색은 /browse(메인 페이지)에 있다.
export default async function LandingPage() {
  const { data } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4);

  const recent = (data ?? []) as Entry[];

  return (
    <>
      <section className="hero">
        <div className="hero-scene" aria-hidden="true">
          <ClayShapes />
        </div>
        <div className="hero-content">
          <h1 className="text-hero-display">Liner Notes</h1>
          <p className="text-lead">
            앨범, 싱글, EP, 곡에 대한 리뷰와 해석을 기록하는 온라인 다이어리
          </p>
          <div className="hero-actions">
            <Link href="/write" className="btn-primary">
              새 글쓰기
            </Link>
            <Link href="/browse" className="btn-secondary-pill">
              둘러보기
            </Link>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="product-tile product-tile--parchment">
          <h2 className="text-display-md">최근 올라온 리뷰</h2>
          <div className="entry-grid entry-grid--preview">
            {recent.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
          <Link href="/browse" className="btn-secondary-pill">
            전체 보기
          </Link>
        </section>
      )}
    </>
  );
}
