import Link from "next/link";

export default function GlobalNav() {
  return (
    <header className="global-nav">
      <div className="global-nav-inner">
        <Link href="/" className="global-nav-logo">
          Liner Notes
        </Link>
        <nav className="global-nav-links">
          <Link href="/browse" className="global-nav-link">
            둘러보기
          </Link>
          <Link href="/write" className="btn-dark-utility">
            새 글쓰기
          </Link>
        </nav>
      </div>
    </header>
  );
}
