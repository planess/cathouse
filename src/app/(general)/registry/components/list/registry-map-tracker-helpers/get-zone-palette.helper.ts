import { zonePalette } from './constants';

export function getZonePalette(allSterilized: boolean) {
  return allSterilized ? zonePalette.sterilized : zonePalette.mixed;
}
