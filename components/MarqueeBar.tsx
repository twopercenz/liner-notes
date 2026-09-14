const ITEMS = ["앨범 리뷰", "싱글 & EP", "가사 해석", "구절별 해석", "나만의 라이너 노트"];

// 맥시멀리즘 시그니처: 쉬지 않고 흐르는 노란 마키(marquee) 띠.
// 순수 CSS 애니메이션이라 JS 없이 동작하고, 서버 컴포넌트로도 문제 없다.
export default function MarqueeBar() {
  const track = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {track.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item} <span className="marquee-star">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
