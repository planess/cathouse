import { RoleCreatingProps } from './types/role-management-props';

export default function RoleCreating({
  submit,
  cancel,
  permissions,
  roles,
}: RoleCreatingProps) {
  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Create New Role</h3>
      <form action={submit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Role Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Inherits From
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Select one or more roles whose permissions should be inherited.
          </p>
          <select
            name="inheritsFrom"
            multiple
            className="w-full px-3 py-2 border rounded-md min-h-[7rem]"
            size={Math.min(roles.length, 6) || 1}
          >
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Permissions</label>
          <div className="grid grid-cols-2 gap-2">
            {permissions.map((permission) => (
              <label key={permission._id} className="flex items-center">
                <input
                  type="checkbox"
                  name="permissions"
                  value={permission._id}
                  className="mr-2"
                />
                <span className="text-sm">
                  {permission.name} ({permission.resource}:{permission.action})
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Role
          </button>
          <button
            type="button"
            onClick={cancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
