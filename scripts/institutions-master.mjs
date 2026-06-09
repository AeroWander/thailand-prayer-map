import { autonomous } from './data/autonomous.mjs';
import { traditional } from './data/traditional.mjs';
import { rajabhat } from './data/rajabhat.mjs';
import { rajamangala } from './data/rajamangala.mjs';
import { privateInstitutions } from './data/private.mjs';
import { international } from './data/international.mjs';

/**
 * @typedef {Object} InstitutionSeed
 * @property {string} id
 * @property {string} name
 * @property {string} nameTh
 * @property {string} province
 * @property {'Bangkok'|'Central'|'Northern'|'Northeastern'|'Eastern'|'Southern'} region
 * @property {'public'|'private'|'rajabhat'|'rajamangala'|'international'} type
 * @property {number} studentPopulation
 * @property {number} foundingYear
 * @property {number} lat
 * @property {number} lng
 * @property {string} website
 */

export const institutions = [
  ...autonomous,
  ...traditional,
  ...rajabhat,
  ...rajamangala,
  ...privateInstitutions,
  ...international,
];
