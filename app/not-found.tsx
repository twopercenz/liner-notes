import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="not-found-blob">
        <span>404</span>
      </div>
      <h1 className="text-display-md">이 페이지는 없어요</h1>
      <p className="text-body">
        찾으시는 리뷰가 삭제됐거나, 주소가 잘못됐을 수 있어요.
      </p>
      <div className="hero-actions">
        <Link href="/" className="btn-primary">
          홈으로
        </Link>
        <Link href="/browse" className="btn-secondary-pill">
          둘러보기
        </Link>
      </div>
    </section>
  );
}
