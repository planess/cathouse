export type UserRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  roles: string[];
  roleIds: string[];
  isActive: boolean;
  createdAt: string;
};

export type RoleOption = {
  id: string;
  name: string;
};

export type UserFormState = {
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  roles: string[];
};

export type UsersAdminViewProps = {
  users: UserRow[];
  roleOptions: RoleOption[];
};

export type UserModalOptions = {
  title: string;
  initialState: UserFormState;
  submitLabel: string;
  onSubmit: (state: UserFormState) => Promise<void>;
};

export type UserFormProps = {
  initialState: UserFormState;
  roleOptions: RoleOption[];
  onChange: (state: UserFormState) => void;
};
