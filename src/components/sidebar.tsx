import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getUnreadMessageCount } from "@/lib/message-notifications";
import { getRole } from "@/lib/get-role";
import { navLinksForRole } from "@/lib/roles";
import RoleBadge from "./role-badge";
import ThemeToggle from "./theme-toggle";
import SidebarNav from "./sidebar-nav";

export default async function Sidebar() {
  const role = await getRole();
  const links = navLinksForRole(role);
  const session = await auth();
  const unreadMessageCount = role && session.userId ? await getUnreadMessageCount({ role, clerkUserId: session.userId }) : 0;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-paper md:hidden">
        <details className="group">
          <summary className="list-none px-4 py-3 transition-colors hover:bg-panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-display font-bold text-base tracking-tight text-paper flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-[7px] bg-lift text-white flex items-center justify-center text-[10px] font-sans">ml</span>
                  MountLift
                </div>
                <div className="text-[10px] tracking-[0.1em] text-muted mt-0.5">agency ops console</div>
              </div>
              <span className="rounded-full border border-lift/40 bg-lift/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-lift">
                Menu
              </span>
            </div>
          </summary>
          <div className="border-t border-line px-4 py-3 space-y-3 bg-panel/90">
            <RoleBadge role={role} />
            <SidebarNav links={links} mobile unreadMessageCount={unreadMessageCount} />
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
            </div>
          </div>
        </details>
      </header>

      <aside className="hidden md:flex w-64 shrink-0 bg-[#421b38] text-[#fff8f2] h-screen sticky top-0 flex-col relative overflow-hidden shadow-[8px_0_30px_rgba(63,24,53,0.12)]">
        {/* Topographic contour-line watermark — MountLift Sunset Orange signature */}
        <svg
          className="absolute -top-8 -right-16 w-64 h-64 opacity-[0.08] pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
        >
          {[30, 50, 70, 90, 110, 130].map((r) => (
            <path
              key={r}
              d={`M 100 ${100 - r} C ${100 + r * 0.9} ${100 - r}, ${100 + r} ${100 - r * 0.3}, ${100 + r} 100 C ${100 + r} ${100 + r * 0.5}, ${100 + r * 0.4} ${100 + r}, 100 ${100 + r} C ${100 - r * 0.6} ${100 + r}, ${100 - r} ${100 + r * 0.4}, ${100 - r} 100 C ${100 - r} ${100 - r * 0.3}, ${100 - r * 0.7} ${100 - r}, 100 ${100 - r} Z`}
              stroke="#f7a4bd"
              strokeWidth="1.2"
            />
          ))}
        </svg>

        <div className="px-5 py-6 border-b border-white/10 relative">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-[8px] bg-[#ed4d80] text-white flex items-center justify-center text-xs font-sans">ml</span>
                MountLift
              </div>
              <div className="text-[10px] tracking-[0.1em] text-[#d6afc5] mt-1 font-mono">agency ops console</div>
            </div>
          </div>
          <div className="mt-5">
            <RoleBadge role={role} />
          </div>
        </div>

        <SidebarNav links={links} unreadMessageCount={unreadMessageCount} />

        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-3 relative bg-black/10">
          <ThemeToggle iconOnly />
          <div className="flex items-center">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </aside>
    </>
  );
}
