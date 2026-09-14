"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { Comment } from "@/lib/types";

const NICKNAME_KEY = "liner-notes-nickname";

export default function CommentSection({
  postId,
  comments,
}: {
  postId: string;
  comments: Comment[];
}) {
  const router = useRouter();
  const [name, setName] = useState(
    typeof window !== "undefined" ? window.localStorage.getItem(NICKNAME_KEY) ?? "" : ""
  );
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;

    setPosting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_name: name.trim(),
      body: body.trim(),
    });
    setPosting(false);

    if (error) {
      toast.error("댓글 등록에 실패했어요: " + error.message);
      return;
    }

    window.localStorage.setItem(NICKNAME_KEY, name.trim());
    setBody("");
    router.refresh();
  }

  return (
    <div id="comments" className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        댓글 {comments.length > 0 ? comments.length : ""}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="닉네임"
          maxLength={30}
          required
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="이 해석에 대한 생각을 남겨보세요"
          rows={2}
          required
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={posting}>
            {posting ? "등록 중…" : "댓글 남기기"}
          </Button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar className="size-8">
                <AvatarFallback>{c.author_name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{c.author_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
