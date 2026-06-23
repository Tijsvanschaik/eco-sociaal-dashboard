import { redirect } from "next/navigation";

type Params = Promise<{ id: string; orgSlug: string }>;

export default async function LegacyRegistratieEditRedirect({ params }: { params: Params }) {
  const { orgSlug, id } = await params;
  redirect(`/${orgSlug}/activiteiten/${id}/bewerken`);
}
