import { redirect } from "next/navigation";

type Params = Promise<{ orgSlug: string }>;

export default async function LegacyRegistratiesRedirect({ params }: { params: Params }) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/activiteiten`);
}
