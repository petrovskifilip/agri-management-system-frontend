import { IrrigationStatus } from './enums';

export interface Irrigation {
  id: number;
  parcelId: number;
  parcelName?: string;
  scheduledDatetime: string;
  durationMinutes?: number;
  waterAmountLiters?: number;
  status: IrrigationStatus;
  startDatetime?: string;
  finishedDatetime?: string;
  retryCount: number;
  lastRetryAt?: string;
  statusDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IrrigationRequest {
  parcelId: number;
  scheduledDatetime: string;
  durationMinutes?: number;
  waterAmountLiters?: number;
  status?: IrrigationStatus;
}

