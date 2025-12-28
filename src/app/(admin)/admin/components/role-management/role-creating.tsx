import { Permission } from '@app/models/permission';
import { Role } from '@app/models/role';

interface RoleCreatingProps {
  submit: (formData: FormData) => void;
  cancel: () => void;
  roles: Role[];
  permissions: Permission[];
}

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
          <select
            name="inheritsFrom"
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a role</option>
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
