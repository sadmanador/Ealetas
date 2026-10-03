import { allDivision, districtsOf, upazilasOf } from 'bd-geo-address';

export function getDivisions() {
  try {
    return allDivision() || [];
  } catch (e) {
    return ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  }
}

export function getDistricts(division) {
  if (!division) return [];
  try {
    return districtsOf(division) || [];
  } catch (e) {
    return [];
  }
}

export function getUpazilas(district) {
  if (!district) return [];
  try {
    const list = upazilasOf(district) || [];
    return list.map((item) => (typeof item === 'string' ? item : item.upazila || item.name || ''));
  } catch (e) {
    return [];
  }
}

const nonCityCorpDhakaUpazilas = ['dhamrai', 'dohar', 'keraniganj', 'nawabganj', 'savar'];

/**
 * Checks if a given location is within Dhaka City Corporation (North & South)
 * and its child metropolitan thanas.
 */
export function isInsideDhakaCityCorp(division, district, upazila) {
  if (!division || division.toLowerCase().trim() !== 'dhaka') return false;
  if (!district || district.toLowerCase().trim() !== 'dhaka') return false;
  if (!upazila || !upazila.trim()) return false;

  const clean = upazila.toLowerCase().trim();
  // If it's one of the non-city corporation rural/suburban upazilas of Dhaka
  if (nonCityCorpDhakaUpazilas.some((non) => clean.includes(non))) {
    return false;
  }

  // All other metropolitan thanas in Dhaka District belong to Dhaka City Corp
  return true;
}
