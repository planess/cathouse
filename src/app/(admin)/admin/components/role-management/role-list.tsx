import clsx from 'clsx';

import { PermissionGuard } from '@app/components/permission-guard/permission-guard';
import { Permission } from '@app/models/permission';
import { Role } from '@app/models/role';

interface RoleListProps {
  roles: Role[];
  permissions: Permission[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

export default function RoleList({
  roles,
  permissions,
  onEdit,
  onDelete,
}: RoleListProps) {
  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div key={role._id} className="border rounded-lg p-4">
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
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Permissions:
            </h4>
            <div className="flex flex-wrap gap-1">
              {role.permissions.map((permossionCode) => {
                const permission = permissions.find(
                  ({ _id }) => _id === permossionCode,
                );

                return permission ? (
                  <span
                    key={permossionCode}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {permission.name}({permission.resource}:{permission.action})
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
