export interface KvestPageData {
  id: string;
  title: string;
  description: string;
  image?: string | KvestImage;
  canSkip?: boolean;
  secret?: boolean;
  challenge?: Challenge;
  geopoint_ids?: string[];
}

export interface Challenge {
  type: ChallengeType;
  answer: string | string[];
  options?: ChallengeOption[];
}

type ChallengeType = 'input-text' | 'input-number' | 'radio' | 'arrange';

export interface ChallengeOption {
  id: number;
  title: string;
}

export interface GeoPoint {
  id: string;
  lat: number;
  lon: number;
}

export interface KvestData {
  title: string;
  pages: KvestPageData[];
  geopoints: GeoPoint[];
}

export interface KvestImage {
  items: string[];
}

export interface KvestPage extends KvestPageData {
  commonData: KvestData;
  geopoints?: GeoPoint[];
  images?: KvestImage;
  last: boolean;
  passed?: boolean;
}
