export interface Crop {
  id: number;
  name: string;
  irrigationFrequencyDays?: number;
  fertilizationFrequencyDays?: number;
  fertilizerType?: string;
  irrigationDurationMinutes?: number;
  waterRequirementLitersPerSqm?: number;
}

export interface CropRequest {
  name: string;
  irrigationFrequencyDays?: number;
  fertilizationFrequencyDays?: number;
  fertilizerType?: string;
  irrigationDurationMinutes?: number;
  waterRequirementLitersPerSqm?: number;
}

