export type MigrationState = 'applied' | 'pending' | 'unknown';

export type MigrationRow = {
  name: string;
  status: MigrationState;
  timestamp: string;
};
