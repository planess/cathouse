export type AccountRow = {
  id: string;
  name: string;
  iban: string;
  balance: number;
  thisMonthNet: number;
  debtTotal: number;
  active: boolean;
};
