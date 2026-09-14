import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { PostWithContext, Tag, WorkType } from "./types";

// posts를 work/track 컨텍스트 + 좋아요/댓글 수 + 태그까지 한 번에 조인해서 가져오는
// 공통 select. PostgREST의 임베디드 리소스 문법으로 count 집계까지 한 번에 받는다.
const POST_SELECT = `
  id, track_id, start_offset, end_offset, quote, note, created_at,
  track:tracks!inner (
    id, title, lyrics,
    work:works!inner ( id, type, artist, title, year, cover_url )
  ),
  likes:likes(count),
  comments:comments(count),
  post_tags ( tag:tags(id, name, slug) )
`;

interface RawPostRow {
  id: string;
  track_id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
  created_at: string;
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
  likes: { count: number }[];
  comments: { count: number }[];
  post_tags: { tag: Tag }[];
}

function normalize(row: RawPostRow): PostWithContext {
  return {
    id: row.id,
    track_id: row.track_id,
    start_offset: row.start_offset,
    end_offset: row.end_offset,
    quote: row.quote,
    note: row.note,
    created_at: row.created_at,
    track: row.track,
    like_count: row.likes?.[0]?.count ?? 0,
    comment_count: row.comments?.[0]?.count ?? 0,
    tags: (row.post_tags ?? []).map((pt) => pt.tag).filter(Boolean),
  };
}

export async function fetchFeed(
  client: SupabaseClient = supabase,
  limit = 30
): Promise<PostWithContext[]> {
  const { data, error } = await client
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("피드 조회 실패:", error.message);
    return [];
  }
  return ((data ?? []) as unknown as RawPostRow[]).map(normalize);
}

export async function fetchPostById(
  id: string,
  client: SupabaseClient = supabase
): Promise<PostWithContext | null> {
  const { data, error } = await client
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("post 조회 실패:", error.message);
    return null;
  }
  return normalize(data as unknown as RawPostRow);
}

export async function fetchPostsByTagSlug(
  slug: string,
  client: SupabaseClient = supabase
): Promise<PostWithContext[]> {
  const { data: tag } = await client
    .from("tags")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!tag) return [];

  const { data, error } = await client
    .from("post_tags")
    .select(`post:posts!inner(${POST_SELECT})`)
    .eq("tag_id", tag.id);

  if (error) {
    console.error("태그별 조회 실패:", error.message);
    return [];
  }
  return ((data ?? []) as unknown as { post: RawPostRow }[])
    .map((row) => normalize(row.post))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function searchPosts(
  query: string,
  client: SupabaseClient = supabase
): Promise<PostWithContext[]> {
  const term = query.trim();
  if (!term) return [];

  // 공백으로 나눠서 "부분 접두어 AND 검색"으로 만든다 (예: "이별 밤" -> 이별:* & 밤:*).
  const tsQuery = term
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.replace(/[:&|!()]/g, "")}:*`)
    .join(" & ");

  const { data, error } = await client
    .from("posts")
    .select(POST_SELECT)
    .textSearch("search_vector", tsQuery, { config: "simple" })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("검색 실패:", error.message);
    return [];
  }
  return ((data ?? []) as unknown as RawPostRow[]).map(normalize);
}

export async function fetchAllTags(
  client: SupabaseClient = supabase
): Promise<Tag[]> {
  const { data } = await client.from("tags").select("*").order("name");
  return (data ?? []) as Tag[];
}
