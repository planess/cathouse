import type {
  CategoryFormState,
  InventoryAcceptanceFormState,
  InventoryCategoryNode,
  InventoryCategoryOption,
  InventoryCategoryRow,
  InventoryReportFormState,
  InventorySourceOption,
  InventoryStorageRow,
  InventoryTableCategoryNode,
  InventoryTransferFormState,
  StorageFormState,
} from './inventory.types';
import type { ReactNode } from 'react';

export type InventoryTableProps = {
  categories: InventoryTableCategoryNode[];
  storages: InventoryStorageRow[];
  peopleOptions: InventorySourceOption[];
  clinicOptions: InventorySourceOption[];
  volunteerOptions: InventorySourceOption[];
};

export type StorageModalProps = {
  storages: InventoryStorageRow[];
  onRefresh: () => void;
};

export type StorageFormModalOptions = {
  title: string;
  submitLabel: string;
  initialState: StorageFormState;
  onSubmit: (state: StorageFormState) => Promise<void>;
};

export type CategoriesModalProps = {
  categories: InventoryCategoryNode[];
  options: InventoryCategoryOption[];
  onRefresh: () => void;
};

export type CategoryFormModalOptions = {
  title: string;
  submitLabel: string;
  initialState: CategoryFormState;
  availableOptions: InventoryCategoryOption[];
  onSubmit: (state: CategoryFormState) => Promise<void>;
};

export type InventoryReportFormProps = {
  initialState: InventoryReportFormState;
  storages: InventoryStorageRow[];
  categories: InventoryCategoryOption[];
  onChange: (state: InventoryReportFormState) => void;
  onValidityChange: (isValid: boolean) => void;
};

export type InventoryAcceptanceFormProps = {
  initialState: InventoryAcceptanceFormState;
  storages: InventoryStorageRow[];
  categoryTree: InventoryCategoryNode[];
  peopleOptions: InventorySourceOption[];
  clinicOptions: InventorySourceOption[];
  volunteerOptions: InventorySourceOption[];
  onChange: (state: InventoryAcceptanceFormState) => void;
  onValidityChange: (isValid: boolean) => void;
};

export type InventoryTransferFormProps = {
  initialState: InventoryTransferFormState;
  storages: InventoryStorageRow[];
  peopleOptions: InventorySourceOption[];
  clinicOptions: InventorySourceOption[];
  volunteerOptions: InventorySourceOption[];
  onChange: (state: InventoryTransferFormState) => void;
  onValidityChange: (isValid: boolean) => void;
};

export type FormErrors = {
  name?: string;
  type?: string;
  quantity?: string;
  categoryId?: string;
  storageId?: string;
  toId?: string;
  transactionDate?: string;
  estimatedCost?: string;
};

export type AcceptanceFormErrors = {
  name?: string;
  categoryId?: string;
  batchNumber?: string;
  unit?: string;
  serialNumber?: string;
  individualId?: string;
  fromId?: string;
  fromName?: string;
  toStorageId?: string;
  quantity?: string;
  remainingQuantity?: string;
  transactionDate?: string;
  estimatedCost?: string;
};

export type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export type CategoryFormProps = {
  initialState: CategoryFormState;
  options: InventoryCategoryOption[];
  onChange: (state: CategoryFormState) => void;
  onValidityChange: (isValid: boolean) => void;
};

export type StorageFormProps = {
  initialState: StorageFormState;
  onChange: (state: StorageFormState) => void;
  onValidityChange: (isValid: boolean) => void;
};

export type CategoryTreeProps = {
  rows: InventoryCategoryRow[];
  onEdit: (row: InventoryCategoryRow) => void;
  onDelete: (row: InventoryCategoryRow) => void;
  emptyState: ReactNode;
  labels: {
    name: string;
    inherits: string;
    createdAt: string;
    actions: string;
    edit: string;
    delete: string;
  };
};
