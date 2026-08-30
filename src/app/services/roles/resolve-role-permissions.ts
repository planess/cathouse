import type { NormalizedRole } from './normalize-role-document';

export function resolveRolePermissions(
  roles: NormalizedRole[],
): NormalizedRole[] {
  const roleMap = new Map(roles.map((role) => [role._id, role]));
  const resolvedCache = new Map<string, Set<string>>();
  const resolvePermissions = (
    roleId: string,
    visiting = new Set<string>(),
  ): Set<string> => {
    const cached = resolvedCache.get(roleId);

    if (cached !== undefined) {
      return cached;
    }
    
    if (visiting.has(roleId)) {
      return new Set();
    }

    const role = roleMap.get(roleId);

    if (role === undefined) {
      return new Set();
    }

    const aggregate = new Set(role.permissions);
    const nextVisiting = new Set(visiting).add(roleId);

    role.inheritsFrom.forEach((parentId) =>
      resolvePermissions(parentId, nextVisiting).forEach((permission) =>
        aggregate.add(permission),
      ),
    );
    resolvedCache.set(roleId, aggregate);

    return aggregate;
  };

  return roles.map((role) => ({
    ...role,
    resolvedPermissions: [...resolvePermissions(role._id)],
  }));
}
