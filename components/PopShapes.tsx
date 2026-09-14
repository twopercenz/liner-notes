// 랜딩 히어로 위에 떠 있는 팝아트 스티커 느낌의 3D 오브젝트들.
// (react-three-fiber로 진짜 WebGL 3D를 시도했으나, 그 라이브러리의
// react-reconciler가 React 18.3 내부 API와 충돌하는 알려진 호환성 문제가
// 있어서 순수 CSS 3D(perspective + rotateX/Y)로 구현했다. 의존성 없음.)
export default function PopShapes() {
  return (
    <div className="pop-shapes" aria-hidden="true">
      <div
        className="pop-shape pop-shape--disc"
        style={{ width: 150, height: 150, top: "56%", left: "6%", animationDuration: "12s", animationDelay: "-2s" }}
      />
      <div
        className="pop-shape pop-shape--sphere pop-shape--pink"
        style={{ width: 120, height: 120, top: "8%", left: "4%", animationDuration: "8s", animationDelay: "0s" }}
      />
      <div
        className="pop-shape pop-shape--sphere pop-shape--green"
        style={{ width: 84, height: 84, top: "48%", left: "84%", animationDuration: "10s", animationDelay: "-4s" }}
      />
      <div
        className="pop-shape pop-shape--capsule"
        style={{ width: 140, height: 60, top: "24%", left: "46%", animationDuration: "9s", animationDelay: "-6s" }}
      />
      <div
        className="pop-shape pop-shape--sphere pop-shape--yellow"
        style={{ width: 60, height: 60, top: "14%", left: "88%", animationDuration: "6.5s", animationDelay: "-1s" }}
      />
      <div
        className="pop-shape pop-shape--star"
        style={{ width: 70, height: 70, top: "72%", left: "24%", animationDuration: "11s", animationDelay: "-3s" }}
      >
        ★
      </div>
    </div>
  );
}
