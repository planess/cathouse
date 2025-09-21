import { usePermission } from '@app/hooks/use-permissions';

// Permission guard component
export function PermissionGuard({
  children,
  resource,
  action,
  context,
  fallback = null,
}: {
  children: React.ReactNode;
  resource: string;
  action: string;
  context?: string;
  fallback?: React.ReactNode;
}) {
  const { access, isLoading } = usePermission(`${resource}:${action}`, context);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!access) {
    return <>{fallback} </>;
  }

  return <>{children} </>;
}
