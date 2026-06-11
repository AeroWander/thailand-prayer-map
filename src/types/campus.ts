export type InstitutionType =
  | 'public'
  | 'private'
  | 'rajabhat'
  | 'rajamangala'
  | 'international';

export type Region =
  | 'Bangkok'
  | 'Central'
  | 'Northern'
  | 'Northeastern'
  | 'Eastern'
  | 'Southern';

export type Campus = {
  id: string;
  name: string;
  nameTh: string;
  university: string;
  province: string;
  region: Region;
  type: InstitutionType;
  studentPopulation: number;
  foundingYear: number;
  lat: number;
  lng: number;
  website: string;
  prayedFor: boolean;
};
