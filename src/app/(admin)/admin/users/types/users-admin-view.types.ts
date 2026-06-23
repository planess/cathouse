export type UserRow = {
  id: string;
  name: string;
  alias: string;
  email: string;
  emailVerified: boolean;
  roles: string[];
  roleIds: string[];
  about: string;
  badgeValidUntil: string;
  badgeValidUntilInput: string;
  hiredOn: string;
  hiredOnInput: string;
  isActive: boolean;
  createdAt: string;
};

export type RoleOption = {
  id: string;
  name: string;
};

export type UserFormState = {
  profilePhoto: File | null;
  alias: string;
  email: string;
  about: string;
  badgeValidUntil: string;
  hiredOn: string;
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
