import { NextRequest, NextResponse } from "next/server";

// 앨범/EP/싱글의 apple_music_id(iTunes collectionId)로 그 안에 들어있는
// 곡 목록(트랙명)을 가져오는 프록시 라우트. iTunes Lookup API는 무료이며
// API 키가 필요 없다.

interface LookupTrack {
  wrapperType: string;
  trackName?: string;
  trackNumber?: number;
}

export interface TracklistItem {
  title: string;
  trackNumber: number | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collectionId")?.trim();

  if (!collectionId || !/^\d+$/.test(collectionId)) {
    return NextResponse.json(
      { tracks: [], error: "앨범 정보가 없어요. 먼저 Apple Music 검색으로 앨범을 선택해주세요." },
      { status: 400 }
    );
  }

  try {
    let tracks = await lookupTracks(collectionId, "KR");
    if (tracks.length === 0) {
      tracks = await lookupTracks(collectionId, "US");
    }
    if (tracks.length === 0) {
      return NextResponse.json(
        { tracks: [], error: "트랙 목록을 찾지 못했어요. 트랙을 직접 추가해주세요." },
        { status: 404 }
      );
    }
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("트랙 목록 조회 실패:", err);
    return NextResponse.json(
      { tracks: [], error: "트랙 목록 조회에 실패했어요. 트랙을 직접 추가해주세요." },
      { status: 502 }
    );
  }
}

async function lookupTracks(
  collectionId: string,
  country: string
): Promise<TracklistItem[]> {
  const url = new URL("https://itunes.apple.com/lookup");
  url.searchParams.set("id", collectionId);
  url.searchParams.set("entity", "song");
  url.searchParams.set("country", country);
  url.searchParams.set("limit", "200");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];

  const data = await res.json();
  const results: LookupTrack[] = data.results ?? [];

  return results
    .filter((r) => r.wrapperType === "track" && r.trackName)
    .map((r) => ({
      title: r.trackName as string,
      trackNumber: r.trackNumber ?? null,
    }));
}
