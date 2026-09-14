import WorkForm from "@/components/WorkForm";

export const metadata = { title: "새 글쓰기" };

export default function NewWorkPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">새 글쓰기</h1>
      <WorkForm />
    </div>
  );
}
