import { redirect } from "next/navigation";

type Params = Promise<{ orgSlug: string }>;

export default async function BeheerPage({ params }: { params: Params }) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/instellingen`);
}
