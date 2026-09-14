"use client";

import { useState } from "react";
import { Track, TrackAnnotation } from "@/lib/types";
import LyricsAnnotator from "./LyricsAnnotator";

export interface TrackWithAnnotations extends Track {
  annotations: TrackAnnotation[];
}

// 상세 페이지에서 트랙 목록을 보여주는 읽기 전용 아코디언.
// 트랙이 많을 수 있어서 기본은 접혀 있고, 제목을 누르면 그 곡의 가사(+해석)만 펼쳐진다.
export default function TrackListView({
  tracks,
}: {
  tracks: TrackWithAnnotations[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (tracks.length === 0) return null;

  return (
    <ul className="track-items">
      {tracks.map((track) => (
        <li key={track.id} className="track-item">
          <button
            type="button"
            className="track-item-header track-item-header--view"
            onClick={() => setOpenId(openId === track.id ? null : track.id)}
          >
            <span className="text-body-strong">{track.title}</span>
            <span className="text-caption">
              {openId === track.id ? "숨기기" : "가사 보기"}
            </span>
          </button>
          {openId === track.id && (
            <div className="track-item-body">
              {track.lyrics ? (
                <LyricsAnnotator
                  lyrics={track.lyrics}
                  annotations={track.annotations}
                />
              ) : (
                <p className="text-caption">아직 가사가 없어요.</p>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
