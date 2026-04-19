export interface SelectorProps {
  list: Map<string, string>;
  attach: (roleId: string) => Promise<void>;
}

export interface ChipProps {
  label: string;
  close?: () => Promise<void>;
}
