# RBAC (Role-Based Access Control) System

This document describes the comprehensive RBAC system implemented for the project, providing granular permission management and role-based access control.

## 🏗️ System Architecture

The RBAC system consists of several key components:

- **Permissions**: Granular access controls for specific resources and actions
- **Roles**: Collections of permissions that can be assigned to users
- **User Roles**: Assignments of roles to users with optional context and expiration
- **Role Inheritance**: Roles can inherit permissions from other roles
- **Context-Aware Access**: Permissions can be scoped to specific contexts (e.g., projects, organizations)

## 📁 File Structure

```
src/app/
├── models/
│   ├── permissions.server.ts          # Permission and role interfaces
│   └── user.server.ts                # Updated user model with role support
├── services/
│   └── rbac.service.ts               # Core RBAC logic and database operations
├── hooks/
│   └── use-permissions.ts            # React hooks for permission checking
├── components/
│   ├── permission-button/            # Permission-aware button component
│   └── admin/role-management/        # Admin interface for role management
├── api/admin/
│   ├── roles/                        # Role management API endpoints
│   └── users/                        # User role assignment API endpoints
├── utils/
│   └── permission-utils.ts           # Utility functions for permissions
└── scripts/
    └── init-rbac.ts                  # RBAC system initialization script
```

## 🚀 Getting Started

### 1. Initialize the RBAC System

Run the initialization script to create default roles and permissions:

```bash
npx tsx src/app/scripts/init-rbac.ts
```

This will create:
- 5 default roles (Super Admin, Admin, Moderator, User, Guest)
- 11 default permissions covering common operations
- Proper role-permission assignments

### 2. Database Collections

The system uses these MongoDB collections:

- `permissions`: Stores permission definitions
- `roles`: Stores role definitions with permission assignments
- `user_roles`: Stores user-role assignments with context and expiration
- `users`: Updated user collection with role support

### 3. Basic Usage

#### Checking Permissions in Components

```tsx
import { usePermissions, PermissionGuard } from '@app/hooks/use-permissions';

function MyComponent({ userId }: { userId: string }) {
  const { hasPermission, userPermissions } = usePermissions(userId);

  // Check permission asynchronously
  const handleAction = async () => {
    if (await hasPermission('help:request', 'approve')) {
      // User can approve help requests
    }
  };

  return (
    <div>
      {/* Show content only if user has permission */}
      <PermissionGuard
        resource="help:request"
        action="approve"
        userId={userId}
        fallback={<p>You don't have permission to approve requests</p>}
      >
        <button onClick={handleAction}>Approve Request</button>
      </PermissionGuard>
    </div>
  );
}
```

#### Using Permission-Aware Components

```tsx
import { PermissionButton } from '@app/components/permission-button';

function AdminPanel({ userId }: { userId: string }) {
  return (
    <div>
      <PermissionButton
        resource="user"
        action="create"
        userId={userId}
        className="btn btn-primary"
      >
        Create User
      </PermissionButton>
      
      <PermissionButton
        resource="role"
        action="delete"
        userId={userId}
        showWhenNoPermission={true}
        disabledWhenNoPermission={true}
        fallback={<span>Insufficient permissions</span>}
      >
        Delete Role
      </PermissionButton>
    </div>
  );
}
```

#### Server-Side Permission Checking

```tsx
import { RBACService } from '@app/services/rbac.service';

export async function POST(request: NextRequest) {
  const rbacService = RBACService.getInstance();
  
  // Check if user has permission to create help requests
  const hasPermission = await rbacService.hasPermission({
    userId: getCurrentUserId(),
    resource: 'help:request',
    action: 'create'
  });
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // Proceed with the operation
}
```

## 🔐 Permission System

### Permission Format

Permissions follow the format: `resource:action`

Examples:
- `user:create` - Can create users
- `help:request:approve` - Can approve help requests
- `history:export` - Can export history data

### Default Permissions

The system includes these predefined permissions:

| Permission | Description |
|------------|-------------|
| `user:create` | Create new users |
| `user:read` | Read user information |
| `user:update` | Update user information |
| `user:delete` | Delete users |
| `help:request:create` | Create help requests |
| `help:request:read` | Read help requests |
| `help:request:update` | Update help requests |
| `help:request:delete` | Delete help requests |
| `help:request:approve` | Approve help requests |
| `history:read` | Read system history |
| `history:export` | Export system history |

## 👥 Role System

### Default Roles

1. **Super Admin**: Full system access (all permissions)
2. **Admin**: Administrative access (all except user deletion)
3. **Moderator**: Moderation access (limited permissions)
4. **User**: Standard user access (basic permissions)
5. **Guest**: Read-only access (minimal permissions)

### Role Inheritance

Roles can inherit permissions from other roles:

```tsx
const moderatorRole = {
  name: 'Moderator',
  permissions: ['help:request:read', 'help:request:approve'],
  inheritsFrom: ['user'] // Inherits all permissions from 'user' role
};
```

### Context-Aware Roles

Roles can be assigned with specific contexts:

```tsx
// Assign moderator role for a specific project
await rbacService.assignRole(
  userId,
  moderatorRoleId,
  grantedBy,
  'project:123',
  expiresAt
);
```

## 🛠️ API Endpoints

### Role Management

- `GET /api/admin/roles` - List all roles
- `POST /api/admin/roles` - Create a new role
- `PUT /api/admin/roles/:id` - Update a role
- `DELETE /api/admin/roles/:id` - Delete a role (soft delete)

### User Role Management

- `GET /api/admin/users` - List users with their roles
- `POST /api/admin/users/:id/roles` - Assign a role to a user
- `DELETE /api/admin/users/:id/roles/:roleId` - Remove a role from a user

## 🔧 Utility Functions

```tsx
import {
  hasAnyPermission,
  hasAllPermissions,
  buildPermission,
  parsePermission
} from '@app/utils/permission-utils';

// Check if user has any of the required permissions
const canManageUsers = hasAnyPermission(userPermissions, [
  'user:create',
  'user:update',
  'user:delete'
]);

// Check if user has all required permissions
const canFullyManageUsers = hasAllPermissions(userPermissions, [
  'user:create',
  'user:read',
  'user:update',
  'user:delete'
]);

// Build permission string
const permission = buildPermission('user', 'create'); // 'user:create'

// Parse permission string
const { resource, action } = parsePermission('user:create');
// resource: 'user', action: 'create'
```

## 🎯 Best Practices

### 1. Permission Granularity

- Keep permissions granular and specific
- Use descriptive resource and action names
- Avoid overly broad permissions like `*:all`

### 2. Role Design

- Create roles based on job functions, not individual users
- Use role inheritance to avoid duplication
- Keep the number of roles manageable

### 3. Context Usage

- Use contexts for project-specific or organization-specific permissions
- Consider expiration dates for temporary role assignments
- Document context formats and conventions

### 4. Performance

- The system includes permission caching for better performance
- Use the `usePermissions` hook for client-side permission checking
- Implement server-side caching for frequently checked permissions

### 5. Security

- Always validate permissions on both client and server side
- Use the `PermissionGuard` component for UI-level access control
- Implement proper authentication before permission checking

## 🚨 Security Considerations

1. **Server-Side Validation**: Always check permissions on the server side
2. **Permission Escalation**: Prevent users from assigning themselves higher privileges
3. **Context Validation**: Validate context parameters to prevent unauthorized access
4. **Audit Logging**: Log all permission changes and role assignments
5. **Regular Review**: Periodically review and audit role assignments

## 🔄 Migration and Updates

### Adding New Permissions

1. Add the permission to the `SYSTEM_PERMISSIONS` constant
2. Update the `initializeSystemRoles` function to include the new permission
3. Assign the permission to appropriate roles
4. Run the initialization script again (it will skip existing permissions)

### Modifying Role Hierarchies

1. Update the role definitions in the initialization script
2. Consider the impact on existing users
3. Test permission inheritance thoroughly
4. Update documentation and user guides

## 📚 Additional Resources

- [RBAC Best Practices](https://en.wikipedia.org/wiki/Role-based_access_control)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Contributing

When contributing to the RBAC system:

1. Follow the existing code patterns and conventions
2. Add comprehensive tests for new functionality
3. Update this documentation for any changes
4. Consider backward compatibility and migration paths
5. Review security implications of any changes

## 🆘 Troubleshooting

### Common Issues

1. **Permissions not working**: Check if the RBAC system is initialized
2. **Role inheritance issues**: Verify role IDs in the `inheritsFrom` array
3. **Performance problems**: Check if permission caching is working properly
4. **Database errors**: Ensure MongoDB collections exist and are properly indexed

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=rbac:*
```

This will provide detailed information about permission checks and role evaluations.
