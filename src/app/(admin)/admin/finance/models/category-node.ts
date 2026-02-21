export type CategoryNode = {
  id: string;
  name: string;
  active?: boolean;
  specific?: boolean;
  linkedToName?: string;
  children: CategoryNode[];
};
