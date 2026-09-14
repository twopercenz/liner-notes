"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import LyricsAnnotator, { AnnotationLike } from "@/components/LyricsAnnotator";

export interface TrackWithPosts {
  id: string;
  title: string;
  lyrics: string | null;
  posts: AnnotationLike[];
}

// 상세 페이지에서 트랙 목록을 보여주는 읽기 전용 아코디언.
// 트랙이 많을 수 있어서 기본은 접혀 있고, 제목을 누르면 그 곡의 가사(+해석)만 펼쳐진다.
export default function WorkTracks({ tracks }: { tracks: TrackWithPosts[] }) {
  const [openId, setOpenId] = useState<string | null>(
    tracks.length === 1 ? tracks[0].id : null
  );

  if (tracks.length === 0) return null;

  return (
    <ul className="space-y-2">
      {tracks.map((track) => {
        const isOpen = openId === track.id;
        return (
          <li key={track.id} className="overflow-hidden rounded-lg border">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : track.id)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-accent/50"
            >
              <span className="flex items-center gap-2 font-semibold">
                {isOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
                {track.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {track.posts.length > 0 ? `해석 ${track.posts.length}개` : ""}
              </span>
            </button>
            {isOpen && (
              <div className="border-t p-3">
                {track.lyrics ? (
                  <LyricsAnnotator
                    lyrics={track.lyrics}
                    annotations={track.posts}
                    linkForAnnotation={(a) => `/post/${a.id}`}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    아직 가사가 없어요.
                  </p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
