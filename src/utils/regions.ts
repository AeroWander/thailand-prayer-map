import type { Region } from '../types/campus';

const BANGKOK_PROVINCES = new Set(['Bangkok']);

const CENTRAL_PROVINCES = new Set([
  'Ang Thong',
  'Ayutthaya',
  'Chainat',
  'Kanchanaburi',
  'Lopburi',
  'Nakhon Nayok',
  'Nakhon Pathom',
  'Nonthaburi',
  'Pathum Thani',
  'Phetchaburi',
  'Prachin Buri',
  'Ratchaburi',
  'Samut Prakan',
  'Samut Sakhon',
  'Samut Songkhram',
  'Saraburi',
  'Sing Buri',
  'Suphan Buri',
  'Uthai Thani',
  'Phra Nakhon Si Ayutthaya',
]);

const NORTHERN_PROVINCES = new Set([
  'Chiang Mai',
  'Chiang Rai',
  'Kamphaeng Phet',
  'Lampang',
  'Lamphun',
  'Mae Hong Son',
  'Nan',
  'Phayao',
  'Phrae',
  'Phitsanulok',
  'Phetchabun',
  'Sukhothai',
  'Tak',
  'Uttaradit',
]);

const NORTHEASTERN_PROVINCES = new Set([
  'Amnat Charoen',
  'Bueng Kan',
  'Buriram',
  'Chaiyaphum',
  'Kalasin',
  'Khon Kaen',
  'Loei',
  'Maha Sarakham',
  'Mukdahan',
  'Nakhon Phanom',
  'Nakhon Ratchasima',
  'Nong Bua Lamphu',
  'Nong Khai',
  'Roi Et',
  'Sakon Nakhon',
  'Sisaket',
  'Surin',
  'Ubon Ratchathani',
  'Udon Thani',
  'Yasothon',
]);

const EASTERN_PROVINCES = new Set([
  'Chachoengsao',
  'Chanthaburi',
  'Chonburi',
  'Rayong',
  'Sa Kaeo',
  'Trat',
]);

const SOUTHERN_PROVINCES = new Set([
  'Chumphon',
  'Krabi',
  'Nakhon Si Thammarat',
  'Narathiwat',
  'Pattani',
  'Phang Nga',
  'Phatthalung',
  'Phuket',
  'Ranong',
  'Satun',
  'Songkhla',
  'Surat Thani',
  'Trang',
  'Yala',
]);

export function provinceToRegion(province: string): Region {
  if (BANGKOK_PROVINCES.has(province)) return 'Bangkok';
  if (CENTRAL_PROVINCES.has(province)) return 'Central';
  if (NORTHERN_PROVINCES.has(province)) return 'Northern';
  if (NORTHEASTERN_PROVINCES.has(province)) return 'Northeastern';
  if (EASTERN_PROVINCES.has(province)) return 'Eastern';
  if (SOUTHERN_PROVINCES.has(province)) return 'Southern';
  return 'Central';
}

