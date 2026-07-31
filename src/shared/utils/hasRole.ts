import { Role } from '../../types'

const roleLevel: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.ADMIN]: 2,
  [Role.PROPIETARIO]: 3,
}; 

export function hasRole(
  currentRole: Role | undefined | null,
  requiredRole: Role
): boolean {
  if (!currentRole) return false;
  return roleLevel[currentRole] >= roleLevel[requiredRole];
}