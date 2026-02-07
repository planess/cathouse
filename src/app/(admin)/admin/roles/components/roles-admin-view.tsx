'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  createRole,
  softDeleteRole,
  updateRole,
} from '../../../../actions/roles.server';
import { useModal } from '@app/hooks/use-modal';

export type RoleRow = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inheritsFrom: string[];
  isActive: boolean;
  createdAt?: string;
};

export type PermissionOption = {
  id: string;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
};

type RoleOption = {
  id: string;
  name: string;
};

type RoleFormState = {
  name: string;
  description: string;
  inheritsFrom: string[];
  permissions: string[];
};

const defaultFormState: RoleFormState = {
  name: '',
  description: '',
  inheritsFrom: [],
  permissions: [],
};

export function RolesAdminView({
  roles,
  permissions,
}: {
  roles: RoleRow[];
  permissions: PermissionOption[];
}) {
  const router = useRouter();
  const { showModal } = useModal();
  const [busyId, setBusyId] = useState<string | null>(null);

  const roleOptions = useMemo<RoleOption[]>(
    () => roles.map((role) => ({ id: role.id, name: role.name })),
    [roles],
  );

  const permissionsById = useMemo(() => {
    return permissions.reduce<Record<string, PermissionOption>>(
      (acc, permission) => {
        acc[permission.id] = permission;
        return acc;
      },
      {},
    );
  }, [permissions]);

  const openRoleModal = (options: {
    title: string;
    initialState: RoleFormState;
    submitLabel: string;
    excludeRoleId?: string;
    onSubmit: (state: RoleFormState) => Promise<void>;
  }) => {
    const formStateRef = { current: options.initialState };

    void showModal({
      title: options.title,
      content: (
        <RoleForm
          initialState={options.initialState}
          roleOptions={roleOptions}
          permissionOptions={permissions}
          excludeRoleId={options.excludeRoleId}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
        />
      ),
      actions: [
        {
          label: 'Cancel',
          tone: 'ghost',
        },
        {
          label: options.submitLabel,
          tone: 'primary',
          onSelect: async () => {
            await options.onSubmit(formStateRef.current);
            router.refresh();
          },
        },
      ],
      size: 'lg',
    });
  };

  const handleAddRole = () => {
    openRoleModal({
      title: 'Create Role',
      initialState: defaultFormState,
      submitLabel: 'Create Role',
      onSubmit: async (state) => {
        await createRole({
          name: state.name,
          description: state.description,
          inheritsFrom: state.inheritsFrom,
          permissions: state.permissions,
        });
      },
    });
  };

  const handleEditRole = (role: RoleRow) => {
    openRoleModal({
      title: `Edit ${role.name}`,
      initialState: {
        name: role.name,
        description: role.description,
        inheritsFrom: role.inheritsFrom,
        permissions: role.permissions,
      },
      submitLabel: 'Save Changes',
      excludeRoleId: role.id,
      onSubmit: async (state) => {
        await updateRole({
          id: role.id,
          name: state.name,
          description: state.description,
          inheritsFrom: state.inheritsFrom,
          permissions: state.permissions,
        });
      },
    });
  };

  const handleDeleteRole = (role: RoleRow) => {
    void showModal({
      title: 'Delete role?',
      content: (
        <div className="text-sm text-slate-600">
          This will mark <span className="font-semibold">{role.name}</span> as
          inactive.
        </div>
      ),
      actions: [
        {
          label: 'Cancel',
          tone: 'ghost',
        },
        {
          label: 'Delete',
          tone: 'danger',
          onSelect: async () => {
            setBusyId(role.id);
            await softDeleteRole(role.id);
            setBusyId(null);
            router.refresh();
          },
        },
      ],
      size: 'sm',
    });
  };

  const memoizedRoles = useMemo(() => roles, [roles]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Role Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {roles.length} total roles in the system.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600"
              onClick={handleAddRole}
              type="button"
            >
              Create Role
            </button>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Inherits</th>
                <th className="px-6 py-4">Permissions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {memoizedRoles.map((role) => (
                <tr
                  key={role.id}
                  className={`transition ${
                    role.isActive
                      ? 'hover:bg-slate-50/80 dark:hover:bg-slate-900/60'
                      : 'bg-rose-50/70 hover:bg-rose-100/70'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {role.name}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${
                          role.isActive ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {role.description || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {role.inheritsFrom.length > 0 ? (
                        role.inheritsFrom.map((roleId) => {
                          const match = roleOptions.find(
                            (option) => option.id === roleId,
                          );
                          return (
                            <span
                              key={`${role.id}-inherit-${roleId}`}
                              className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600"
                            >
                              {match?.name ?? roleId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.length > 0 ? (
                        role.permissions.map((permissionId) => {
                          const permission = permissionsById[permissionId];
                          return (
                            <span
                              key={`${role.id}-permission-${permissionId}`}
                              className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600"
                            >
                              {permission ? (
                                <PermissionLabel permission={permission} />
                              ) : (
                                permissionId
                              )}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300"
                        type="button"
                        onClick={() => handleEditRole(role)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-500 transition hover:border-rose-300 dark:border-rose-500/40 dark:text-rose-300"
                        type="button"
                        onClick={() => handleDeleteRole(role)}
                        disabled={busyId === role.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RoleForm({
  initialState,
  roleOptions,
  permissionOptions,
  excludeRoleId,
  onChange,
}: {
  initialState: RoleFormState;
  roleOptions: RoleOption[];
  permissionOptions: PermissionOption[];
  excludeRoleId?: string;
  onChange: (state: RoleFormState) => void;
}) {
  const [formState, setFormState] = useState<RoleFormState>(initialState);

  const filteredRoleOptions = roleOptions.filter(
    (role) => role.id !== excludeRoleId,
  );

  const selectedRoles = formState.inheritsFrom.map((roleId) => {
    const match = filteredRoleOptions.find((role) => role.id === roleId);

    return match ?? { id: roleId, name: roleId };
  });

  const availableRoles = filteredRoleOptions.filter(
    (role) => !formState.inheritsFrom.includes(role.id),
  );

  const selectedPermissions = formState.permissions.map((permissionId) => {
    const match = permissionOptions.find(
      (permission) => permission.id === permissionId,
    );
    return match ?? { id: permissionId, name: permissionId };
  });

  const availablePermissions = permissionOptions.filter(
    (permission) => !formState.permissions.includes(permission.id),
  );

  const updateState = (nextState: RoleFormState) => {
    setFormState(nextState);
    onChange(nextState);
  };

  const addRole = (roleId: string) => {
    if (formState.inheritsFrom.includes(roleId)) {
      return;
    }

    updateState({
      ...formState,
      inheritsFrom: [...formState.inheritsFrom, roleId],
    });
  };

  const removeRole = (roleId: string) => {
    updateState({
      ...formState,
      inheritsFrom: formState.inheritsFrom.filter((id) => id !== roleId),
    });
  };

  const addPermission = (permissionId: string) => {
    if (formState.permissions.includes(permissionId)) {
      return;
    }

    updateState({
      ...formState,
      permissions: [...formState.permissions, permissionId],
    });
  };

  const removePermission = (permissionId: string) => {
    updateState({
      ...formState,
      permissions: formState.permissions.filter((id) => id !== permissionId),
    });
  };

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Name</label>
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          value={formState.name}
          onChange={(event) =>
            updateState({ ...formState, name: event.target.value })
          }
          type="text"
          placeholder="Shelter Manager"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          Description
        </label>
        <textarea
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          value={formState.description}
          onChange={(event) =>
            updateState({ ...formState, description: event.target.value })
          }
          rows={3}
          placeholder="Describe what this role can do."
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Inherits</label>
        <div className="min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <div className="flex flex-wrap gap-2">
            {selectedRoles.length > 0 ? (
              selectedRoles.map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600"
                >
                  {role.name}
                  <button
                    type="button"
                    className="text-slate-400 transition hover:text-slate-600"
                    onClick={() => removeRole(role.id)}
                    aria-label={`Remove ${role.name}`}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No roles selected.</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableRoles.length > 0 ? (
            availableRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
                onClick={() => addRole(role.id)}
              >
                {role.name}
              </button>
            ))
          ) : (
            <span className="text-xs text-slate-400">
              No more roles to add.
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400">
          Click a role to add it. Use the × button to remove.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          Permissions
        </label>
        <div className="min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <div className="flex flex-wrap gap-2">
            {selectedPermissions.length > 0 ? (
              selectedPermissions.map((permission) => (
                <span
                  key={permission.id}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600"
                >
                  <PermissionLabel permission={permission} />
                  <button
                    type="button"
                    className="text-slate-400 transition hover:text-slate-600"
                    onClick={() => removePermission(permission.id)}
                    aria-label={`Remove ${permission.name}`}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">
                No permissions selected.
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {availablePermissions.length > 0 ? (
            availablePermissions.map((permission) => (
              <button
                key={permission.id}
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
                onClick={() => addPermission(permission.id)}
              >
                <PermissionLabel permission={permission} />
              </button>
            ))
          ) : (
            <span className="text-xs text-slate-400">
              No more permissions to add.
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400">
          Click a permission to add it. Use the × button to remove.
        </p>
      </div>
    </form>
  );
}

function PermissionLabel({ permission }: { permission: PermissionOption }) {
  return (
    <span className="flex min-w-0 flex-col items-start">
      <span className="truncate">{permission.name}</span>
      <span className="text-[10px] font-normal text-slate-400">
        {permission.description || 'No description'}
      </span>
    </span>
  );
}
