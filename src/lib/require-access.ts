import { redirect } from "next/navigation";
import { getRole } from "./get-role";
import { canAccess, Role } from "./roles";

export async function requireAccess(pathname: string): Promise<Role> {
  const role = await getRole();
  if (!role) redirect("/pending-access");
  if (!canAccess(role, pathname)) redirect("/");
  return role;
}
