"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("이 글을 삭제할까요? 되돌릴 수 없어요.")) return;
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) {
      alert("삭제에 실패했어요: " + error.message);
      return;
    }
    router.push("/browse");
    router.refresh();
  }

  return (
    <button type="button" className="link-danger" onClick={handleDelete}>
      삭제
    </button>
  );
}
