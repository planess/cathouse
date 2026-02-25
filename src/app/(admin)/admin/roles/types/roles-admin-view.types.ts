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

export type RoleOption = {
  id: string;
  name: string;
};

export type RoleFormState = {
  name: string;
  description: string;
  inheritsFrom: string[];
  permissions: string[];
};

export type RolesAdminViewProps = {
  roles: RoleRow[];
  permissions: PermissionOption[];
};

export type RoleModalOptions = {
  title: string;
  initialState: RoleFormState;
  submitLabel: string;
  excludeRoleId?: string;
  onSubmit: (state: RoleFormState) => Promise<void>;
};

export type RoleFormProps = {
  initialState: RoleFormState;
  roleOptions: RoleOption[];
  permissionOptions: PermissionOption[];
  excludeRoleId?: string;
  onChange: (state: RoleFormState) => void;
};

export type PermissionLabelProps = {
  permission: PermissionOption;
};
