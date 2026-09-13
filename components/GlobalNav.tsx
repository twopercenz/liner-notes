import Link from "next/link";

export default function GlobalNav() {
  return (
    <header className="global-nav">
      <div className="global-nav-inner">
        <Link href="/" className="global-nav-logo">
          Liner Notes
        </Link>
        <Link href="/write" className="btn-dark-utility">
          새 글쓰기
        </Link>
      </div>
    </header>
  );
}
