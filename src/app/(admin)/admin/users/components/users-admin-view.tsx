'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  createUser,
  softDeleteUser,
  updateUser,
} from '@app/actions/users.server';
import { useModal } from '@app/hooks/use-modal';

import {
  UserFormProps,
  UserFormState,
  UserModalOptions,
  UserRow,
  UsersAdminViewProps,
} from '../types/users-admin-view.types';

const defaultFormState: UserFormState = {
  email: '',
  emailVerified: false,
  isActive: true,
  roles: [],
};

export function UsersAdminView({ users, roleOptions }: UsersAdminViewProps) {
  const router = useRouter();
  const { showModal } = useModal();
  const [busyId, setBusyId] = useState<string | null>(null);

  const openUserModal = (options: UserModalOptions) => {
    const formStateRef = { current: options.initialState };

    void showModal({
      title: options.title,
      content: (
        <UserForm
          initialState={options.initialState}
          roleOptions={roleOptions}
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

  const handleAddUser = () => {
    openUserModal({
      title: 'Add New User',
      initialState: defaultFormState,
      submitLabel: 'Create User',
      onSubmit: async (state) => {
        await createUser({
          email: state.email,
          emailVerified: state.emailVerified,
          isActive: state.isActive,
          roles: state.roles,
        });
      },
    });
  };

  const handleEditUser = (user: UserRow) => {
    openUserModal({
      title: `Edit ${user.email}`,
      initialState: {
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        roles: user.roleIds,
      },
      submitLabel: 'Save Changes',
      onSubmit: async (state) => {
        await updateUser({
          id: user.id,
          email: state.email,
          emailVerified: state.emailVerified,
          isActive: state.isActive,
          roles: state.roles,
        });
      },
    });
  };

  const handleDeleteUser = (user: UserRow) => {
    void showModal({
      title: 'Deactivate user?',
      content: (
        <div className="text-sm text-slate-600">
          This will mark <span className="font-semibold">{user.email}</span> as
          inactive. You can re-enable it later by editing the user.
        </div>
      ),
      actions: [
        {
          label: 'Cancel',
          tone: 'ghost',
        },
        {
          label: 'Deactivate',
          tone: 'danger',
          onSelect: async () => {
            setBusyId(user.id);
            await softDeleteUser(user.id);
            setBusyId(null);
            router.refresh();
          },
        },
      ],
      size: 'sm',
    });
  };

  const memoizedRows = useMemo(() => users, [users]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              User Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {users.length} total users across all shelters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600"
              onClick={handleAddUser}
              type="button"
            >
              Add New User
            </button>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>

                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Active</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {memoizedRows.map((user, index) => (
                <tr
                  key={user.id}
                  className={`transition ${
                    user.isActive
                      ? 'hover:bg-slate-50/80 dark:hover:bg-slate-900/60'
                      : 'bg-rose-50/70 hover:bg-rose-100/70'
                  }`}
                >
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    {user.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
                        {user.name
                          .replace('Mock: ', '')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Mock: User {index + 1}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col items-center gap-1">
                      {!user.emailVerified && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                        >
                          Send
                        </button>
                      )}
                      <span
                        className={clsx({
                          'border-b-2 border-lime-600': user.emailVerified,
                        })}
                      >
                        {user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={`${user.id}-${role}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600"
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                        user.isActive ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {user.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {user.createdAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300"
                        type="button"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-500 transition hover:border-rose-300 dark:border-rose-500/40 dark:text-rose-300"
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        disabled={busyId === user.id}
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

function UserForm({ initialState, roleOptions, onChange }: UserFormProps) {
  const [formState, setFormState] = useState<UserFormState>(initialState);

  const selectedRoles = formState.roles.map((roleId) => {
    const match = roleOptions.find((role) => role.id === roleId);
    return match ?? { id: roleId, name: roleId };
  });

  const availableRoles = roleOptions.filter(
    (role) => !formState.roles.includes(role.id),
  );

  const updateState = (nextState: UserFormState) => {
    setFormState(nextState);
    onChange(nextState);
  };

  const addRole = (roleId: string) => {
    if (formState.roles.includes(roleId)) {
      return;
    }

    updateState({ ...formState, roles: [...formState.roles, roleId] });
  };

  const removeRole = (roleId: string) => {
    updateState({
      ...formState,
      roles: formState.roles.filter((id) => id !== roleId),
    });
  };

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Email</label>
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          value={formState.email}
          onChange={(event) =>
            updateState({ ...formState, email: event.target.value })
          }
          type="email"
          placeholder="user@cathouse.org"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Roles</label>
        <div className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
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
    </form>
  );
}
