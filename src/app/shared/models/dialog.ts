import { ValidatorFn } from "@angular/forms";
import { Option } from "./option";

export interface DialogWarningData {
  title: string;
  message?: string;
  itemName?: string;
  isDestructive?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export interface DialogFormData {
  title: string;
  fields?: FieldControlConfig[];
}

export type FieldType = 'text' | 'select';

export interface FieldControlConfig {
  type: FieldType;
  name: string;
  label: string;
  options?: Option[];
  validators?: ValidatorFn[];
}
