export type WorkType = "album" | "ep" | "single" | "song";

export const WORK_TYPE_LABEL: Record<WorkType, string> = {
  album: "앨범",
  ep: "EP",
  single: "싱글",
  song: "곡",
};

/** 앨범/EP/싱글/곡 — 리뷰 대상이 되는 발매 단위. 실제 가사/해석은 tracks/posts에 있다. */
export interface Work {
  id: string;
  type: WorkType;
  artist: string;
  title: string;
  year: string | null;
  cover_url: string | null;
  apple_music_id: string | null;
  rating: number;
  review: string | null;
  created_at: string;
}

/**
 * 작품 안의 곡 하나. "곡" 타입 work는 트랙이 정확히 1개(work 자신과 같은 제목)이고,
 * 앨범/EP/싱글은 여러 개일 수 있다 — 곡 단위 가사 조회 로직이 항상 동일하게 동작한다.
 */
export interface Track {
  id: string;
  work_id: string;
  title: string;
  track_number: number | null;
  lyrics: string | null;
  created_at: string;
}

/** 가사 구절 + 해석. 이 사이트의 핵심 콘텐츠 단위(피드에 흐르는 것). */
export interface Post {
  id: string;
  track_id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
  created_at: string;
}

/** 피드/상세에서 쓰는, work+track 컨텍스트가 join된 post. */
export interface PostWithContext extends Post {
  track: {
    id: string;
    title: string;
    lyrics: string | null;
    work: {
      id: string;
      type: WorkType;
      artist: string;
      title: string;
      year: string | null;
      cover_url: string | null;
    };
  };
  like_count: number;
  comment_count: number;
  tags: Tag[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/** 폼에서 작성 중인, 아직 저장 전인 해석 하나. */
export interface PostDraft {
  id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
  tags: string[];
}

/** 폼에서 작성 중인 트랙 하나 (가사 + 그 위의 해석 초안들). */
export interface TrackDraft {
  id: string;
  title: string;
  lyrics: string;
  posts: PostDraft[];
}
