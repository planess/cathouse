import type { MediaAsset } from './media-asset';
import type { ObjectId } from 'mongodb';

export const animalSpeciesList = ['cat', 'dog', 'bird'] as const;

export type AnimalSpecies = (typeof animalSpeciesList)[number] | (string & {});

export type Informator = ObjectId;

export type Clinic = ObjectId;

export enum AnimalSex {
  male = 'male',
  female = 'female',
  unknown = 'unknown',
}

export enum AnimalStatus {
  free = 'free', // discovered but was not caught yet
  underTreatment = 'under-treatment', // animal is under treatment now
  sheltered = 'sheltered', // animal was caught and remains in shelter
  returned = 'returned', // animal was caught and returned to the place of discovery
  adopted = 'adopted', // animal is adopted now
  dead = 'dead', // animal is dead
  unknown = 'unknown', // status is unknown
}

export interface ParasitesRecord {
  date: Date;
  name: string;
}

export interface VaccinationRecord {
  date: Date;
  name: string;
  clinic?: Clinic;
}

export interface VetMarkers {
  sterilized?: {
    date: Date;
    method?: string;
    clinic?: Clinic;
  };
  parasites?: ParasitesRecord[];
  rabiesVaccination?: VaccinationRecord[];
  virusVaccination?: VaccinationRecord[];
}

export interface VetInterventionRecord {
  date: Date;
  description: string;
  clinic?: Clinic;
}

export interface VetMedicineRecord {
  name: string;
  dosage?: string;
  startDate: Date;
  endDate?: Date;
  clinic?: Clinic;
}

export interface VetTreatmentRecord {
  complaints: string;
  startDate: Date;
  endDate?: Date;
  interventions?: VetInterventionRecord[];
  medications?: VetMedicineRecord[];
  summary?: string;
}

export interface ObservationLocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface ObservationLocation {
  address: string;
  coordinates: ObservationLocationCoordinates;
}

export interface AnimalObservation {
  date: Date;
  note?: string;
  location?: ObservationLocation;
  assets?: MediaAsset[];
  informator?: Informator;
  health?: number; // 0 to 10
  createdBy?: ObjectId;
  createdAt?: Date;
}

export interface AnimalDocument {
  _id?: ObjectId;
  species: AnimalSpecies;
  name: string;
  sex: AnimalSex;
  description?: string;
  passportCode?: string;
  birthday?: Date;
  chipNumber?: string;
  informator?: ObjectId;
  vetMarkers?: VetMarkers;
  vetTreatments?: VetTreatmentRecord[];
  mainAsset?: MediaAsset;
  observations?: AnimalObservation[];
  status: AnimalStatus;
  draft: boolean;
  createdAt: Date;
  createdBy: ObjectId;
}
