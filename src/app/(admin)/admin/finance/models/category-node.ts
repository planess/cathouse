export type CategoryNode = {
  id: string;
  name: string;
  active?: boolean;
  linkedToName?: string;
  children: CategoryNode[];
};
