// 로그인이 없는 사이트라, 브라우저에 저장해두는 익명 id로 "좋아요 중복"만 막는다.
// 개인을 식별하거나 추적하는 용도가 아니라 단순 중복 방지용.
const KEY = "liner-notes-device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
