# Client-Side Permissions System

This document explains the new client-side permissions system that provides secure, API-based access to the RBAC (Role-Based Access Control) functionality.

## Architecture

### Server-Side vs Client-Side

- **`RBACService`**: Server-side only, directly accesses the database
- **`ClientPermissionsService`**: Client-side only, makes API calls to server endpoints
- **API Routes**: Bridge between client and server, providing secure endpoints for permissions

### Security Model

1. **Server-Side Validation**: All permission checks are ultimately validated on the server
2. **API Authentication**: All API routes can be protected with authentication middleware
3. **No Direct Database Access**: Client code never accesses the database directly
4. **Secure by Default**: Client-side permissions are for UI logic only, server enforces security

## Client-Side Services

### ClientPermissionsService

The main service for client-side permission operations:

```typescript
import { clientPermissionsService } from '@app/services/client-permissions.service';

// Check single permission
const hasPermission = await clientPermissionsService.hasPermission({
  userId: 'user123',
  resource: 'user',
  action: 'create'
});

// Get all user permissions
const permissions = await clientPermissionsService.getUserPermissions('user123');

// Check multiple permissions at once
const results = await clientPermissionsService.checkMultiplePermissions('user123', [
  { resource: 'user', action: 'create' },
  { resource: 'user', action: 'delete' }
]);
```

## React Hooks

### usePermissions

Primary hook for permission management in React components:

```typescript
import { usePermissions } from '@app/hooks';

function MyComponent() {
  const {
    hasPermission,           // Async permission check
    hasPermissionSync,       // Sync check using cache
    userPermissions,         // Array of all user permissions
    isLoading,              // Loading state
    error,                  // Error state
    refreshPermissions      // Refresh all permissions
  } = usePermissions();

  // Async permission check
  const handleAction = async () => {
    if (await hasPermission('user', 'create')) {
      // User can create users
    }
  };

  // Sync permission check (uses cache)
  const canEdit = hasPermissionSync('user', 'update');

  return (
    <div>
      {canEdit && <button>Edit User</button>}
    </div>
  );
}
```

### useIsAdmin

Convenient hook for checking admin permissions:

```typescript
import { useIsAdmin } from '@app/hooks';

function AdminPanel() {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) return <div>Loading...</div>;

  return isAdmin ? <AdminInterface /> : <AccessDenied />;
}
```

### useCanManageResource

Check CRUD permissions for a specific resource:

```typescript
import { useCanManageResource } from '@app/hooks';

function UserManagement() {
  const { canCreate, canRead, canUpdate, canDelete } = useCanManageResource('user');

  return (
    <div>
      {canCreate && <button>Add User</button>}
      {canUpdate && <button>Edit User</button>}
      {canDelete && <button>Delete User</button>}
    </div>
  );
}
```

### useSystemPermissions

Overview of all system permissions:

```typescript
import { useSystemPermissions } from '@app/hooks';

function Dashboard() {
  const {
    permissions,      // Object with all permission flags
    canManageUsers,   // Convenient getter
    canManageRoles,   // Convenient getter
    canViewHistory    // Convenient getter
  } = useSystemPermissions();

  return (
    <div>
      {canManageUsers && <UserManagementLink />}
      {canManageRoles && <RoleManagementLink />}
      {canViewHistory && <HistoryLink />}
    </div>
  );
}
```

## API Endpoints

### Permission Checking

- **`POST /api/permissions/check`**: Check if user has specific permission
- **`GET /api/permissions/check`**: Alternative GET method with query params

```typescript
// POST method
const response = await fetch('/api/permissions/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    resource: 'user',
    action: 'create',
    context: 'optional-context'
  })
});

// GET method
const response = await fetch('/api/permissions/check?userId=user123&resource=user&action=create');
```

### User Permissions

- **`GET /api/permissions/user/[userId]`**: Get all permissions for a user

```typescript
const response = await fetch('/api/permissions/user/user123?context=optional');
const { permissions } = await response.json();
```

### Admin Endpoints

- **`GET /api/admin/permissions`**: Get all available permissions (admin only)
- **`POST /api/admin/permissions`**: Create new permission (admin only)

## Migration Guide

### Before (Server-Side RBACService in Client)

```typescript
// ❌ DON'T DO THIS - Server-side service in client
'use client';

import { RBACService } from '@app/services/rbac.service';

function MyComponent() {
  const rbacService = RBACService.getInstance(); // ❌ Server-side only!
  
  // This won't work in client components
}
```

### After (Client-Side Service)

```typescript
// ✅ DO THIS - Client-side service
'use client';

import { usePermissions } from '@app/hooks';

function MyComponent() {
  const { hasPermission, hasPermissionSync } = usePermissions();
  
  // Works correctly in client components
}
```

## Performance Considerations

### Caching

The hooks implement intelligent caching:

1. **Permission Cache**: Results are cached to avoid repeated API calls
2. **Sync Access**: `hasPermissionSync` provides immediate access to cached results
3. **Cache Invalidation**: Use `refreshPermissions()` to clear cache and reload

### Batch Operations

Use batch operations for better performance:

```typescript
// ✅ Good - Single API call for multiple checks
const results = await clientPermissionsService.checkMultiplePermissions(userId, [
  { resource: 'user', action: 'create' },
  { resource: 'user', action: 'update' },
  { resource: 'user', action: 'delete' }
]);

// ❌ Avoid - Multiple API calls
const canCreate = await clientPermissionsService.hasPermission({ userId, resource: 'user', action: 'create' });
const canUpdate = await clientPermissionsService.hasPermission({ userId, resource: 'user', action: 'update' });
const canDelete = await clientPermissionsService.hasPermission({ userId, resource: 'user', action: 'delete' });
```

## Security Best Practices

1. **Server-Side Validation**: Always validate permissions on the server before performing sensitive operations
2. **UI Enhancement Only**: Use client-side permissions for UI logic, not security enforcement
3. **Authentication Required**: Protect API routes with proper authentication
4. **Context Validation**: Validate context parameters to prevent unauthorized access
5. **Error Handling**: Handle permission errors gracefully

## Testing

Example test for permission hooks:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { usePermissions } from '@app/hooks';

// Mock the service
jest.mock('@app/services/client-permissions.service');

test('usePermissions hook works correctly', async () => {
  const { result } = renderHook(() => usePermissions('user123'));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.userPermissions).toEqual(['user:read', 'user:create']);
});
```

## Troubleshooting

### Common Issues

1. **"RBACService not found" Error**: Make sure you're using `clientPermissionsService` instead of `RBACService` in client components

2. **API Route 500 Errors**: Check server logs for database connection issues

3. **Permission Cache Issues**: Use `refreshPermissions()` to clear cache if permissions seem stale

4. **Sync Permissions Return False**: `hasPermissionSync` only works with cached data - call `hasPermission` first to populate cache

### Debug Mode

Enable debug logging:

```typescript
// In development, log permission checks
if (process.env.NODE_ENV === 'development') {
  console.log('Permission check:', { userId, resource, action, result });
}
```