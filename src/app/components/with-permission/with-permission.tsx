import { usePermission } from '@app/hooks/use-permissions';

// Higher-order component for permission-based rendering
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  resource: string,
  action: string,
  context?: string,
) {
  return function PermissionWrappedComponent(props: P) {
    const { access, isLoading } = usePermission(
      `${resource}:${action}`,
      context,
    );

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!access) {
      return null; // Don't render if no permission
    }

    return <Component {...props} />;
  };
}
