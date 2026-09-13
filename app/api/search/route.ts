import { NextRequest, NextResponse } from "next/server";

// iTunes Search API를 대신 호출해주는 프록시 라우트.
// 브라우저에서 직접 itunes.apple.com을 호출하면 CORS 문제가 생길 수 있어
// 서버(Next.js API Route)를 한 번 거치도록 했다.
// entity=album -> 앨범/EP/싱글 검색, entity=song -> 곡 검색
// (iTunes Search API는 무료이며 API 키가 필요 없다.)

interface ItunesAlbum {
  collectionId: number;
  artistName: string;
  collectionName: string;
  releaseDate?: string;
  artworkUrl100?: string;
}

interface ItunesSong {
  trackId: number;
  artistName: string;
  trackName: string;
  releaseDate?: string;
  artworkUrl100?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term")?.trim();
  const type = searchParams.get("type") === "song" ? "song" : "album";

  if (!term) {
    return NextResponse.json({ results: [] });
  }

  const entity = type === "song" ? "song" : "album";
  const upstream = new URL("https://itunes.apple.com/search");
  upstream.searchParams.set("term", term);
  upstream.searchParams.set("entity", entity);
  upstream.searchParams.set("country", "KR");
  upstream.searchParams.set("limit", "8");

  try {
    const res = await fetch(upstream.toString(), {
      // 검색어마다 최신 결과를 받도록 캐시하지 않는다.
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: 502 });
    }

    const data = await res.json();
    const rawResults: (ItunesAlbum | ItunesSong)[] = data.results ?? [];

    const results = rawResults.map((item) => {
      if (entity === "song") {
        const song = item as ItunesSong;
        return {
          appleMusicId: String(song.trackId),
          artist: song.artistName,
          title: song.trackName,
          year: song.releaseDate ? song.releaseDate.slice(0, 4) : "",
          cover: upscaleArtwork(song.artworkUrl100),
        };
      }
      const album = item as ItunesAlbum;
      return {
        appleMusicId: String(album.collectionId),
        artist: album.artistName,
        title: album.collectionName,
        year: album.releaseDate ? album.releaseDate.slice(0, 4) : "",
        cover: upscaleArtwork(album.artworkUrl100),
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}

// iTunes가 기본으로 주는 100x100 썸네일을 600x600으로 키워서 받는다.
function upscaleArtwork(url?: string): string {
  if (!url) return "";
  return url.replace("100x100", "600x600");
}
