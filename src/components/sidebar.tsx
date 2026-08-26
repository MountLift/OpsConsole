import { UserButton } from "@clerk/nextjs";
import { getRole } from "@/lib/get-role";
import { navLinksForRole } from "@/lib/roles";
import RoleBadge from "./role-badge";
import ThemeToggle from "./theme-toggle";
import SidebarNav from "./sidebar-nav";

export default async function Sidebar() {
  const role = await getRole();
  const links = navLinksForRole(role);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-panel/95 backdrop-blur md:hidden">
        <details className="group">
          <summary className="list-none px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-display font-bold text-base tracking-tight text-lift">MountLift</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted mt-1">Ops Console</div>
              </div>
              <span className="rounded-full border border-lift/60 bg-lift/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-lift">
                Menu
              </span>
            </div>
          </summary>
          <div className="border-t border-line px-4 py-3 space-y-3">
            <RoleBadge role={role} />
            <SidebarNav links={links} mobile />
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
            </div>
          </div>
        </details>
      </header>

      <aside className="hidden md:flex w-56 shrink-0 border-r border-line bg-panel h-screen sticky top-0 flex-col relative overflow-hidden">
        {/* Topographic contour-line watermark — a nod to Mount/Lift */}
        <svg
          className="absolute -top-8 -right-16 w-64 h-64 opacity-[0.06] pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
        >
          {[30, 50, 70, 90, 110, 130].map((r) => (
            <path
              key={r}
              d={`M 100 ${100 - r} C ${100 + r * 0.9} ${100 - r}, ${100 + r} ${100 - r * 0.3}, ${100 + r} 100 C ${100 + r} ${100 + r * 0.5}, ${100 + r * 0.4} ${100 + r}, 100 ${100 + r} C ${100 - r * 0.6} ${100 + r}, ${100 - r} ${100 + r * 0.4}, ${100 - r} 100 C ${100 - r} ${100 - r * 0.3}, ${100 - r * 0.7} ${100 - r}, 100 ${100 - r} Z`}
              stroke="#E7A94C"
              strokeWidth="1"
            />
          ))}
        </svg>

        <div className="px-5 py-6 border-b border-line relative">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-display font-bold text-base tracking-tight text-lift">MountLift</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted mt-1">Ops Console</div>
            </div>
            <span className="rounded-full border border-lift/60 bg-lift/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-lift">
              Live
            </span>
          </div>
          <div className="mt-3">
            <RoleBadge role={role} />
          </div>
        </div>
        <SidebarNav links={links} />
        <div className="px-4 py-3 border-t border-line flex items-center justify-between gap-3 relative">
          <ThemeToggle iconOnly />
          <div className="flex items-center">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </aside>
    </>
  );
}
