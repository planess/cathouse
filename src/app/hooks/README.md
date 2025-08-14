# Authentication Hooks & Utilities

This directory contains authentication utilities that work for both **client components** and **server components** in the Cathouse application.

## Overview

- **Client Components**: Use `useUser()` hook and related hooks
- **Server Components**: Use `getUser()` function and related functions
- **Server Actions**: Use server functions for authentication checks

## Client-Side Authentication (Client Components)

### useUser Hook

The main hook for client components that provides real-time authentication state:

```tsx
'use client';

import { useUser } from '@/app/hooks/use-user';

function MyClientComponent() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user === null) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### Convenience Hooks

```tsx
import { useIsAuthenticated, useCurrentUser, useAuthLoading } from '@/app/hooks/use-user';

function MyComponent() {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const isLoading = useAuthLoading();
  
  // Use these values...
}
```

## Server-Side Authentication (Server Components)

### getUser Function

Use this in server components to check authentication:

```tsx
import { getUser } from '@/app/hooks/get-user';

export default async function MyServerComponent() {
  const { user, isAuthenticated } = await getUser();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

### Convenience Functions

```tsx
import { isAuthenticated, getCurrentUser } from '@/app/hooks/get-user';

export default async function AnotherServerComponent() {
  const authenticated = await isAuthenticated();
  const user = await getCurrentUser();
  
  if (!authenticated) {
    return <div>Access denied</div>;
  }
  
  return <UserProfile user={user} />;
}
```

## Server Actions

Use server functions in server actions for authentication:

```tsx
'use server';

import { getUser } from '@/app/hooks/get-user';

export async function protectedAction() {
  const { isAuthenticated, user } = await getUser();
  
  if (!isAuthenticated) {
    throw new Error('Unauthorized');
  }
  
  // Proceed with authenticated user
  return { success: true, userId: user?.id };
}
```

## API Routes

Use server functions in API routes:

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/app/hooks/get-user';

export async function GET(request: NextRequest) {
  const { isAuthenticated, user } = await getUser();
  
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({ user });
}
```

## TypeScript Interfaces

### User Interface

```tsx
interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt?: Date;
  lastLogin?: Date;
}
```

### Client AuthState

```tsx
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

### Server AuthState

```tsx
interface ServerAuthState {
  user: User | null;
  isAuthenticated: boolean;
}
```

## Implementation Guide

### 1. Token Storage

Store authentication tokens in:
- **Client**: `localStorage` or `sessionStorage`
- **Server**: HTTP-only cookies (recommended) or Authorization header

### 2. Token Validation

Implement your token validation logic:

```tsx
// In get-user.ts
async function validateToken(token: string): Promise<User | null> {
  try {
    const response = await fetch('https://your-api.com/auth/validate', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
}
```

### 3. Authentication Flow

1. **Login**: Store token in localStorage/cookies
2. **Client Components**: Use `useUser()` hook for real-time state
3. **Server Components**: Use `getUser()` function for server-side checks
4. **Logout**: Clear token and update state

## Best Practices

### Security
- Always validate tokens on the server side
- Use HTTP-only cookies for sensitive tokens
- Implement proper token expiration handling
- Add CSRF protection for forms

### Performance
- Cache authentication results when appropriate
- Use React Suspense boundaries for loading states
- Implement proper error boundaries

### User Experience
- Show loading states during authentication checks
- Provide clear feedback for authentication failures
- Implement proper redirect logic for protected routes

## Example: Protected Route Component

```tsx
import { getUser } from '@/app/hooks/get-user';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { isAuthenticated } = await getUser();
  
  if (!isAuthenticated) {
    redirect('/signin');
  }
  
  return <div>This is a protected page</div>;
}
```

## Example: Conditional Rendering

```tsx
import { getUser } from '@/app/hooks/get-user';

export default async function ConditionalComponent() {
  const { user, isAuthenticated } = await getUser();
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <button>Logout</button>
        </div>
      ) : (
        <div>
          <h1>Welcome, Guest!</h1>
          <a href="/signin">Sign In</a>
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **"use client" directive missing**: Add `'use client';` to client components
2. **localStorage not defined**: Only use `useUser()` in client components
3. **Async function in server component**: Use `await` with server functions
4. **Token not persisting**: Check cookie/localStorage configuration

### Debug Tips

- Check browser console for client-side errors
- Check server logs for server-side errors
- Verify token storage and retrieval
- Test authentication flow in both environments
