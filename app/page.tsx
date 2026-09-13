import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import EntryBrowser from "@/components/EntryBrowser";
import { Entry } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
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
      <section className="product-tile product-tile--dark">
        <h1 className="text-hero-display">Liner Notes</h1>
        <p className="text-lead">
          앨범, 싱글, EP, 곡에 대한 리뷰와 해석을 기록하는 온라인 다이어리
        </p>
        <div className="hero-actions">
          <Link href="/write" className="btn-primary">
            새 글쓰기
          </Link>
          <a href="#browse" className="btn-secondary-pill">
            둘러보기
          </a>
        </div>
      </section>

      <EntryBrowser entries={entries} />
    </>
  );
}
