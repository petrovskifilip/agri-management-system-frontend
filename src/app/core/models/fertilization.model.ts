import { FertilizationStatus } from './enums';

export interface Fertilization {
  id: number;
  parcelId: number;
  parcelName?: string;
  scheduledDatetime: string;
  fertilizerType?: string;
  status: FertilizationStatus;
  completedDatetime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FertilizationRequest {
  parcelId: number;
  scheduledDatetime: string;
  fertilizerType?: string;
  status?: FertilizationStatus;
  notes?: string;
}

