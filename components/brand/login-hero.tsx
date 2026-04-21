import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type LoginHeroProps = {
  className?: string;
};

/**
 * Rechterpaneel op /login. Pure decoratie + brand-statement; het formulier
 * zit links. We hotlinken geen externe afbeelding (zoals Stitch doet) maar
 * bouwen de organische sfeer met een gradient, radial overlay en wat blurry
 * highlights. Later kan hier een eigen SVG/JPG in `public/brand/` bovenop.
 */
export function LoginHero({ className }: LoginHeroProps) {
  return (
    <aside
      className={cn(
        "relative flex min-h-[calc(100dvh-3rem)] flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-linear-to-br from-primary to-primary-dim",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(82,0,55,0.4)_100%)]" />
      <div className="pointer-events-none absolute -top-24 -left-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-12 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_20px_40px_rgba(54,50,45,0.1)] backdrop-blur-md">
          <Icon name="eco" filled className="text-5xl text-primary-foreground" />
        </div>
        <h2 className="text-5xl font-extrabold tracking-tight text-primary-foreground drop-shadow-sm">
          Eco-sociaal
          <br />
          Dashboard
        </h2>
      </div>
    </aside>
  );
}
