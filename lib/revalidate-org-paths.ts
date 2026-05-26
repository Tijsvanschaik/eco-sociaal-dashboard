import { revalidatePath } from "next/cache";

export function revalidateOrgPaths(orgSlug: string, shareSlug: string | null) {
  revalidatePath(`/${orgSlug}/dashboard`);
  revalidatePath(`/${orgSlug}/registratie`);
  revalidatePath(`/${orgSlug}/registraties`);
  revalidatePath(`/${orgSlug}/instellingen`);
  revalidatePath(`/${orgSlug}/beheer`);

  if (shareSlug) {
    revalidatePath(`/p/${shareSlug}`);
    revalidatePath(`/tv/${shareSlug}`);
    revalidatePath(`/embed/${shareSlug}`);
  }
}
