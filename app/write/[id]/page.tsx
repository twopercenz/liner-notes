import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EntryForm from "@/components/EntryForm";
import { Entry } from "@/lib/types";

export const revalidate = 0;

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: entry } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  if (!entry) notFound();

  return (
    <section className="page-form">
      <h1 className="text-display-md">글 수정하기</h1>
      <EntryForm initial={entry as Entry} />
    </section>
  );
}
