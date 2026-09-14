// 랜딩 히어로 위에 떠 있는 clay 스타일 3D 오브젝트들.
// (원래 react-three-fiber로 진짜 WebGL 3D를 시도했지만, 그 라이브러리의
// react-reconciler가 React 18.3의 내부 API와 충돌하는 알려진 호환성 문제가
// 있어서 — 구버전 React에 억지로 고정해야 해서 — 대신 CSS 3D(perspective +
// rotateY/rotateX)로 구현했다. 의존성이 없고, 서버 컴포넌트로도 동작하고,
// 어떤 브라우저에서도 깨지지 않는다.)
export default function ClayShapes() {
  return (
    <div className="clay-shapes" aria-hidden="true">
      <div
        className="clay-shape clay-shape--disc"
        style={{ width: 150, height: 150, top: "58%", left: "8%", animationDuration: "13s", animationDelay: "-2s" }}
      />
      <div
        className="clay-shape clay-shape--sphere clay-shape--coral"
        style={{ width: 120, height: 120, top: "10%", left: "6%", animationDuration: "9s", animationDelay: "0s" }}
      />
      <div
        className="clay-shape clay-shape--sphere clay-shape--mint"
        style={{ width: 78, height: 78, top: "50%", left: "82%", animationDuration: "11s", animationDelay: "-4s" }}
      />
      <div
        className="clay-shape clay-shape--capsule"
        style={{ width: 132, height: 56, top: "28%", left: "48%", animationDuration: "10s", animationDelay: "-6s" }}
      />
      <div
        className="clay-shape clay-shape--sphere clay-shape--yellow"
        style={{ width: 54, height: 54, top: "16%", left: "86%", animationDuration: "7.5s", animationDelay: "-1s" }}
      />
    </div>
  );
}
