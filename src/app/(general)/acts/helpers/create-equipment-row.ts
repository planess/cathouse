import { EquipmentInput, EquipmentRowState } from '../types';

export function createEquipmentRow(seed?: EquipmentInput): EquipmentRowState {
  return {
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    itemId: seed?.itemId ?? '',
    conditionBefore: seed?.conditionBefore ?? 'fair',
    conditionAfter: seed?.conditionAfter ?? 'fair',
    notes: seed?.notes ?? '',
    mediaInputs: [`media-${Date.now()}-${Math.random().toString(16).slice(2)}`],
  };
}
