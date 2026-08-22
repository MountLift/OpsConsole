import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getRole } from "@/lib/get-role";
import { navLinksForRole, ROLE_LABELS } from "@/lib/roles";

export default async function Sidebar() {
  const role = await getRole();
  const links = navLinksForRole(role);

  return (
    <aside className="w-56 shrink-0 border-r border-line bg-panel h-screen sticky top-0 flex flex-col relative overflow-hidden">
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
        <div className="font-display font-bold text-base tracking-tight text-lift">MountLift</div>
        <div className="text-xs text-muted mt-0.5 font-mono">
          {role ? ROLE_LABELS[role] : "ops console"}
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 relative">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-ink hover:text-lift transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-line flex items-center gap-3 relative">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-xs text-muted font-mono">signed in</span>
      </div>
    </aside>
  );
}