export type EntryType = "album" | "ep" | "single" | "song";

export interface Entry {
  id: string;
  type: EntryType;
  artist: string;
  title: string;
  year: string | null;
  cover_url: string | null;
  apple_music_id: string | null;
  rating: number;
  review: string | null;
  /** @deprecated 줄/구절 단위 해석(annotations) 이전에 쓰던 자유 텍스트 해석. 하위호환용. */
  interpretation: string | null;
  lyrics: string | null;
  created_at: string;
}

/** DB에 저장된 해석(annotation). entries.lyrics 문자열 기준 [start_offset, end_offset) 구간. */
export interface Annotation {
  id: string;
  entry_id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
  created_at: string;
}

/** 아직 저장하지 않은, 폼에서 작성 중인 해석. */
export interface AnnotationDraft {
  id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
}

/** 앨범/EP/싱글처럼 곡이 여러 개인 항목의 개별 트랙(곡). DB에 저장된 것. */
export interface Track {
  id: string;
  entry_id: string;
  title: string;
  track_number: number | null;
  lyrics: string | null;
  created_at: string;
}

/** DB에 저장된, 트랙 가사에 대한 구절별 해석. */
export interface TrackAnnotation {
  id: string;
  track_id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
  created_at: string;
}

/** 폼에서 작성 중인 트랙 한 곡 (아직 저장 전이면 id는 클라이언트에서 생성한 임시 id). */
export interface TrackDraft {
  id: string;
  title: string;
  lyrics: string;
  annotations: AnnotationDraft[];
}

export const TYPE_LABEL: Record<EntryType, string> = {
  album: "앨범",
  ep: "EP",
  single: "싱글",
  song: "곡",
};
