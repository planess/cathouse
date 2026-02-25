import clsx from 'clsx';

import { PermissionGuard } from '@app/components/permission-guard/permission-guard';

import { RoleListProps } from './types/role-management-props';

export default function RoleList({
  roles,
  permissions,
  onEdit,
  onDelete,
}: RoleListProps) {
  const renderPermissionBadges = (permissionIds: string[]) => {
    if (permissionIds.length === 0) {
      return (
        <span className="text-xs text-gray-500">No permissions assigned</span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {permissionIds.map((permissionId) => {
          const permission = permissions.find(
            ({ _id }) => _id === permissionId,
          );

          return permission ? (
            <span
              key={permissionId}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {permission.name}({permission.resource}:{permission.action})
            </span>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div
          key={role._id}
          className="border rounded-lg p-4"
          data-role-id={role._id}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{role.name}</h3>
              <p className="text-gray-600">{role.description}</p>
              <div className="mt-2">
                <span
                  className={clsx('px-2 py-1 text-xs rounded', {
                    'bg-green-100 text-green-800': role.isActive,
                    'bg-red-100 text-red-800': !role.isActive,
                  })}
                >
                  {role.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <PermissionGuard resource="role" action="create">
                <button
                  onClick={() => onEdit(role)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              </PermissionGuard>
              <PermissionGuard resource="role" action="delete">
                <button
                  onClick={() => onDelete(role._id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </PermissionGuard>
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Inherits From:
            </h4>
            {role.inheritsFrom.length === 0 ? (
              <span className="text-xs text-gray-500">
                Does not inherit from other roles
              </span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {role.inheritsFrom.map((parentRoleId) => {
                  const parentRole = roles.find(
                    ({ _id }) => _id === parentRoleId,
                  );

                  return parentRole ? (
                    <span
                      key={parentRoleId}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {parentRole.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <div className="mt-3 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Effective Permissions (including inherited)
              </h4>
              {renderPermissionBadges(
                role.resolvedPermissions ?? role.permissions,
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Direct Permissions
              </h4>
              {renderPermissionBadges(role.permissions)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
