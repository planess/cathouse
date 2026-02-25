import { Permission } from '@app/models/permission';
import { Role } from '@app/models/role';

export interface RoleListProps {
  roles: Role[];
  permissions: Permission[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

export interface RoleEditingProps {
  activeRole: Role;
  permissions: Permission[];
  roles: Role[];
  cancel: () => void;
  submit: (formData: FormData) => void;
}

export interface RoleCreatingProps {
  submit: (formData: FormData) => void;
  cancel: () => void;
  roles: Role[];
  permissions: Permission[];
}
