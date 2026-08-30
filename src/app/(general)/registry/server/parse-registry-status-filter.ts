export function parseRegistryStatusFilter(value: string | null): 'adoption' | null {
  return value === 'adoption' ? value : null;
}
