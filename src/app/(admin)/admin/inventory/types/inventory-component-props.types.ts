import type {
  CategoryFormState,
  InventoryCategoryNode,
  InventoryCategoryOption,
  InventoryCategoryRow,
  InventoryReportFormState,
  InventoryReportRow,
  InventoryStorageRow,
  StorageFormState,
} from './inventory.types';
import type { ReactNode } from 'react';

export type TableCategoryNode = {
  id: string;
  name: string;
  children: TableCategoryNode[];
  reports: InventoryReportRow[];
  totalCount: number;
};

export type InventoryTableProps = {
  categories: InventoryCategoryNode[];
  reports: InventoryReportRow[];
  onEditReport: (report: InventoryReportRow) => void;
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

export type FormErrors = {
  name?: string;
  type?: string;
  quantity?: string;
  categoryId?: string;
  storageId?: string;
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
