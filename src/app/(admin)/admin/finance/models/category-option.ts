export type CategoryOption = {
  id: string;
  name: string;
  inheritsFrom?: string | null;
  active: boolean;
};

export type CategoryIncomingOption = CategoryOption & {
  specific: boolean;
};

export type CategoryOutgoingOption = CategoryOption & {
  linkedToIncoming?: string | null;
};
