import { getUser } from './get-user';

// Example: Server Component using getUser function
export async function ServerAuthExample() {
  const { user, isAuthenticated } = await getUser();

  if (!isAuthenticated) {
    return <div>Access denied. Please sign in.</div>;
  }

  return (
    <div>
      <h2>Server-side authenticated user</h2>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Last login: {user?.lastLogin?.toLocaleDateString()}</p>
    </div>
  );
}

// Example: Conditional rendering based on authentication
export async function ConditionalAuthExample() {
  const { user, isAuthenticated } = await getUser();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h2>Welcome back, {user?.name}!</h2>
          <button>View Profile</button>
          <button>Sign Out</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, Guest!</h2>
          <a href="/signin">Sign In</a>
          <a href="/signup">Create Account</a>
        </div>
      )}
    </div>
  );
}
