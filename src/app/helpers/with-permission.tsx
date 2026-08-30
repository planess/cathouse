import { usePermission } from '@app/hooks/use-permissions';

export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  resource: string,
  action: string,
  context?: string,
) {
  return function PermissionWrappedComponent(props: P) {
    const { access, isLoading } = usePermission(`${resource}:${action}`, context);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return access ? <Component {...props} /> : null;
  };
}
