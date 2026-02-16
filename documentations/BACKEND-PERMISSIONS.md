# Backend Permission Resolution System

This document describes the enhanced RBAC (Role-Based Access Control) system that transforms roles and their nested permissions into a flat list of permissions for efficient user access verification.

## Overview

The system consists of three main services:

1. **PermissionResolverService** - Resolves role hierarchy and flattens permissions
2. **AccessVerificationService** - Verifies user access to pages and API endpoints  
3. **UserTransformService** - Transforms user data with resolved permissions

## Architecture

### Database Structure

- **`roles`** collection: Contains role definitions with permissions and inheritance
- **`permissions`** collection: Defines individual permissions (resource:action format)
- **`user_roles`** collection: Maps users to roles with context and expiration

### Role Inheritance

Roles can inherit from other roles, creating a hierarchy:

```typescript
{
  _id: "admin-role",
  name: "Admin",
  permissions: ["user:create", "user:delete"],
  inheritsFrom: ["moderator-role"], // Inherits all moderator permissions
  isActive: true
}
```

### Permission Format

Permissions use the format `resource:action`:

```typescript
{
  _id: "user-create-permission",
  resource: "user",
  action: "create",
  name: "Create Users",
  description: "Allows creating new user accounts"
}
```

## Services

### PermissionResolverService

Transforms roles and nested permissions into a flat list.

#### Key Methods

```typescript
// Resolve all permissions for a user
async resolveUserPermissions(context: UserAccessContext): Promise<ResolvedUserPermissions>

// Check specific permission
async hasPermission(userId: string, permission: SystemPermission, context?: string): Promise<boolean>

// Check multiple permissions
async hasAnyPermission(userId: string, permissions: SystemPermission[], context?: string): Promise<boolean>
async hasAllPermissions(userId: string, permissions: SystemPermission[], context?: string): Promise<boolean>

// Get permissions for frontend
async getUserPermissionsForFrontend(userId: string, context?: string): Promise<SystemPermission[]>
```

#### Caching

- Automatic caching with configurable duration
- Cache invalidation on role changes
- Periodic cleanup of expired cache entries

### AccessVerificationService

Provides page and API access verification.

#### Page Protection

```typescript
// Server Component example
export default async function AdminPage() {
  const userId = await getCurrentUserId();
  
  // Automatically redirects if access denied
  await requirePermission(userId, SYSTEM_PERMISSIONS.SYSTEM_CONFIG);
  
  return <div>Admin content</div>;
}
```

#### API Protection

```typescript
// API route example
export async function GET(request: NextRequest) {
  const userId = getUserFromRequest(request);
  
  const accessService = AccessVerificationService.getInstance();
  const result = await accessService.verifyApiAccess(userId, {
    requiredPermissions: [SYSTEM_PERMISSIONS.USER_READ]
  });
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  
  // Process request...
}
```

#### Configuration Options

```typescript
interface PageAccessConfig {
  requiredPermissions?: SystemPermission[];  // User must have ALL
  anyOfPermissions?: SystemPermission[];     // User must have ANY
  context?: string;                          // Permission context
  unauthorizedRedirect?: string;             // Custom redirect path
  allowInDevelopment?: boolean;              // Bypass in dev mode
}
```

### UserTransformService

Transforms database users to include resolved permissions.

```typescript
// Transform single user
const userWithPermissions = await transformUserWithPermissions(dbUser);

// Refresh permissions after role changes
const freshPermissions = await getFreshUserPermissions(userId);

// Get permission summary for admin interfaces
const summary = await getUserPermissionsSummary(userId);
```

## Usage Examples

### 1. Protecting Pages

```typescript
import { requirePermission, requireAnyPermission } from '@app/services/access-verification.service';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';

// Require specific permission
export default async function UserManagementPage() {
  const userId = await getCurrentUserId();
  await requirePermission(userId, SYSTEM_PERMISSIONS.USER_READ);
  
  return <div>User management interface</div>;
}

// Require any of multiple permissions
export default async function ModerationPage() {
  const userId = await getCurrentUserId();
  await requireAnyPermission(userId, [
    SYSTEM_PERMISSIONS.HELP_REQUEST_APPROVE,
    SYSTEM_PERMISSIONS.CONTENT_UPDATE
  ]);
  
  return <div>Moderation interface</div>;
}
```

### 2. Conditional UI Elements

```typescript
import { hasPermission } from '@app/services/access-verification.service';

export async function ActionButtons({ userId }: { userId: string }) {
  const canDelete = await hasPermission(userId, SYSTEM_PERMISSIONS.USER_DELETE);
  const canCreate = await hasPermission(userId, SYSTEM_PERMISSIONS.USER_CREATE);
  
  return (
    <div>
      {canCreate && <button>Create User</button>}
      {canDelete && <button>Delete User</button>}
    </div>
  );
}
```

### 3. API Route Protection

```typescript
import { AccessVerificationService } from '@app/services/access-verification.service';

export async function POST(request: NextRequest) {
  const userId = getUserFromRequest(request);
  
  const accessService = AccessVerificationService.getInstance();
  const accessResult = await accessService.verifyApiAccess(userId, {
    anyOfPermissions: [
      SYSTEM_PERMISSIONS.ROLE_CREATE,
      SYSTEM_PERMISSIONS.SYSTEM_CONFIG
    ]
  });
  
  if (!accessResult.success) {
    return NextResponse.json(
      { error: accessResult.error }, 
      { status: accessResult.status }
    );
  }
  
  // Process admin request...
}
```

### 4. Enhanced RBAC Service Usage

```typescript
import { RBACService } from '@app/services/rbac.service';

const rbacService = RBACService.getInstance();

// Get user permissions (uses new resolver)
const permissions = await rbacService.getUserResolvedPermissions(userId);

// Enhanced permission checking
const hasPermission = await rbacService.hasPermissionEnhanced(
  userId, 
  SYSTEM_PERMISSIONS.USER_CREATE
);

// Clear cache after role changes
rbacService.clearUserPermissionCache(userId);
```

## Performance Considerations

### Caching Strategy

- **Default cache duration**: 5 minutes for permission checks
- **Frontend cache duration**: 10 minutes for UI permissions
- **Automatic cleanup**: Expired entries removed every 10 minutes

### Cache Management

```typescript
// Clear specific user cache
PermissionResolverService.getInstance().clearUserCache(userId, context);

// Clear all caches
PermissionResolverService.getInstance().clearAllCache();

// Start automatic cleanup (call once at startup)
PermissionResolverService.getInstance().startCacheCleanup();
```

## Error Handling

### Page Access

- Automatic redirect to `/unauthorized` or custom path
- Graceful handling of authentication failures
- Development mode bypass option

### API Access

- Structured error responses with HTTP status codes
- Detailed error messages for debugging
- Fallback to secure defaults

## Migration from Existing System

### Update User Transformation

Replace direct permission assignment with role-based resolution:

```typescript
// Before: Direct permission assignment
user.scopes = staticPermissionArray;

// After: Dynamic resolution from roles
const userWithPermissions = await transformUserWithPermissions(dbUser);
```

### Update Permission Checks

Replace basic permission checks with enhanced verification:

```typescript
// Before: Simple array check
if (user.scopes.includes(permission)) { ... }

// After: Enhanced permission checking
if (await hasPermission(userId, permission)) { ... }
```

## Security Best Practices

1. **Always verify on server side** - Client-side checks are for UI only
2. **Use specific permissions** - Avoid overly broad permissions
3. **Regular cache invalidation** - Clear cache on role changes
4. **Context isolation** - Use contexts to isolate permission scopes
5. **Audit permission changes** - Log role assignments and modifications

## Database Indexes

Recommended indexes for optimal performance:

```javascript
// user_roles collection
db.user_roles.createIndex({ userId: 1, isActive: 1 });
db.user_roles.createIndex({ userId: 1, context: 1, isActive: 1 });

// roles collection  
db.roles.createIndex({ _id: 1, isActive: 1 });

// permissions collection
db.permissions.createIndex({ _id: 1, isActive: 1 });
db.permissions.createIndex({ resource: 1, action: 1 });
```