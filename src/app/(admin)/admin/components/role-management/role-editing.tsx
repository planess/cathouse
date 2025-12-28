import { Permission } from '@app/models/permission';
import { Role } from '@app/models/role';

interface RoleEditingProps {
  activeRole: Role;
  permissions: Permission[];
  cancel: () => void;
  submit: (formData: FormData) => void;
}

export default function RoleEditing({
  activeRole,
  permissions,
  cancel,
  submit,
}: RoleEditingProps) {
  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">
        Edit Role: {activeRole.name}
      </h3>
      <form action={submit} className="space-y-4">
        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
            Role Name
          </label>
          <input
            type="text"
            id="edit-name"
            name="name"
            defaultValue={activeRole.name}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="edit-description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="edit-description"
            name="description"
            defaultValue={activeRole.description}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
          />
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
                  defaultChecked={activeRole.permissions.includes(
                    permission._id,
                  )}
                  className="mr-2"
                />
                <span className="text-sm">
                  {permission.name} ({permission.resource}:{permission.action})
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked={activeRole.isActive}
              className="mr-2"
            />
            <span className="text-sm">Active</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update Role
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
