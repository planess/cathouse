'use client';

import { useEffect, useState } from 'react';

import { PermissionGuard } from '@app/components/permission-guard';
import { Permission } from '@app/models/permission';
import { Role } from '@app/models/role';

import RoleCreating from '../role-creating';
import RoleEditing from '../role-editing';
import RoleList from '../role-list';

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isRolesLoading, setIsRolesLoading] = useState(true);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    void loadRoles();
    void loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');

      if (response.ok) {
        const data = (await response.json()) as { roles: Role[] };

        setRoles(data.roles);
      } else {
        setError('Failed to load roles');
      }
    } catch (error) {
      setError(
        `Failed to load roles: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsRolesLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      // TODO: Create API endpoint for permissions
      const response = await fetch('/api/admin/permissions');

      if (response.ok) {
        const data = (await response.json()) as { permissions: Permission[] };

        setPermissions(data.permissions);
      } else {
        setError('Failed to load permissions');
      }
    } catch (error) {
      // console.error('Failed to load permissions:', error);
      setError(
        `Failed to load permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsPermissionsLoading(false);
    }
  };

  const handleCreateRole = async (formData: FormData) => {
    try {
      const roleData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        permissions: formData.getAll('permissions') as string[],
        inheritsFrom: formData.getAll('inheritsFrom').filter(Boolean) as string[],
      };

      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        setShowCreateForm(false);

        void loadRoles();
      } else {
        setError('Failed to create role');
      }
    } catch (err) {
      setError('Failed to create role');
    }
  };

  const handleUpdateRole = async (formData: FormData) => {
    if (!editingRole) return;

    try {
      const roleData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        permissions: formData.getAll('permissions') as string[],
        inheritsFrom: formData.getAll('inheritsFrom') as string[],
        isActive: formData.get('isActive') === 'true',
      };

      const response = await fetch(`/api/admin/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        setEditingRole(null);
        loadRoles();
      } else {
        setError('Failed to update role');
      }
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadRoles();
      } else {
        setError('Failed to delete role');
      }
    } catch (err) {
      setError('Failed to delete role');
    }
  };

  if (isRolesLoading) {
    return <div>Loading roles...</div>;
  }

  if (isPermissionsLoading) {
    return <div>Loading permissions...</div>;
  }

  if (error !== null) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Role Management</h2>
        <PermissionGuard
          resource="role"
          action="create"
          fallback={
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
            >
              Create Role
            </button>
          }
        >
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Role
          </button>
        </PermissionGuard>
      </div>

      {/* Create Role Form */}
      {showCreateForm && (
        <RoleCreating
          permissions={permissions}
          roles={roles}
          submit={handleCreateRole}
          cancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Role Form */}
      {editingRole && (
        <RoleEditing
          activeRole={editingRole}
          permissions={permissions}
          submit={handleUpdateRole}
          cancel={() => setEditingRole(null)}
        />
      )}

      {/* Roles List */}
      <RoleList
        roles={roles}
        permissions={permissions}
        onEdit={(role) => setEditingRole(role)}
        onDelete={(roleId) => void handleDeleteRole(roleId)}
      />
    </div>
  );
}
