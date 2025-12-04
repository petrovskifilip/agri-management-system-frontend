export interface Farm {
  id: number;
  name: string;
  location?: string;
  createdAt: string;
  parcelCount?: number;
}

export interface FarmRequest {
  name: string;
  location?: string;
}

