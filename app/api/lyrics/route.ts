import { NextRequest, NextResponse } from "next/server";

// lrclib.net(LRCLIB)의 무료 공개 API로 가사를 가져오는 프록시 라우트.
// API 키가 필요 없고, 정확히 일치하는 트랙이 없으면 검색 엔드포인트로 한 번 더 시도한다.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist")?.trim();
  const title = searchParams.get("title")?.trim();

  if (!artist || !title) {
    return NextResponse.json(
      { lyrics: "", error: "아티스트와 제목을 먼저 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const lyrics = await fetchFromLrclib(artist, title);
    if (!lyrics) {
      return NextResponse.json(
        {
          lyrics: "",
          error: "가사를 찾지 못했어요. 아래에 직접 붙여넣어주세요.",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ lyrics });
  } catch (err) {
    console.error("lrclib 조회 실패:", err);
    return NextResponse.json(
      {
        lyrics: "",
        error: "가사 조회에 실패했어요. 아래에 직접 붙여넣어주세요.",
      },
      { status: 502 }
    );
  }
}

async function fetchFromLrclib(
  artist: string,
  title: string
): Promise<string> {
  // 1) 정확히 일치하는 트랙을 먼저 찾는다.
  const getUrl = new URL("https://lrclib.net/api/get");
  getUrl.searchParams.set("artist_name", artist);
  getUrl.searchParams.set("track_name", title);

  const getRes = await fetch(getUrl.toString(), { cache: "no-store" });
  if (getRes.ok) {
    const data = await getRes.json();
    if (typeof data?.plainLyrics === "string" && data.plainLyrics.trim()) {
      return data.plainLyrics;
    }
  }

  // 2) 정확히 일치하지 않으면 검색 엔드포인트에서 첫 번째로 가사가 있는 결과를 쓴다.
  const searchUrl = new URL("https://lrclib.net/api/search");
  searchUrl.searchParams.set("artist_name", artist);
  searchUrl.searchParams.set("track_name", title);

  const searchRes = await fetch(searchUrl.toString(), { cache: "no-store" });
  if (!searchRes.ok) return "";

  const results = await searchRes.json();
  if (!Array.isArray(results)) return "";

  const match = results.find(
    (r) => typeof r?.plainLyrics === "string" && r.plainLyrics.trim()
  );
  return match?.plainLyrics ?? "";
}
