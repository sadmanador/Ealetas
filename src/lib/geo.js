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
