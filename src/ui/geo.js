/**
 * Geo & Region Detection Utility
 * Detects user country, phone calling code, flag, and currency preference.
 */

const COUNTRY_DATA = {
  IN: { name: 'India', prefix: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  US: { name: 'United States', prefix: '+1', flag: '🇺🇸', placeholder: '(555) 000-0000' },
  CA: { name: 'Canada', prefix: '+1', flag: '🇨🇦', placeholder: '(555) 000-0000' },
  GB: { name: 'United Kingdom', prefix: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  AU: { name: 'Australia', prefix: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  DE: { name: 'Germany', prefix: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  FR: { name: 'France', prefix: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  AE: { name: 'United Arab Emirates', prefix: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  SG: { name: 'Singapore', prefix: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  NL: { name: 'Netherlands', prefix: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  ES: { name: 'Spain', prefix: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  IT: { name: 'Italy', prefix: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  BR: { name: 'Brazil', prefix: '+55', flag: '🇧🇷', placeholder: '(11) 91234-5678' },
  MX: { name: 'Mexico', prefix: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  JP: { name: 'Japan', prefix: '+81', flag: '🇯🇵', placeholder: '90-1234-5678' },
  KR: { name: 'South Korea', prefix: '+82', flag: '🇰🇷', placeholder: '10-1234-5678' },
  ZA: { name: 'South Africa', prefix: '+27', flag: '🇿🇦', placeholder: '81 234 5678' },
  NZ: { name: 'New Zealand', prefix: '+64', flag: '🇳🇿', placeholder: '21 123 4567' },
  IE: { name: 'Ireland', prefix: '+353', flag: '🇮🇪', placeholder: '85 123 4567' },
  SE: { name: 'Sweden', prefix: '+46', flag: '🇸🇪', placeholder: '70 123 45 67' },
  CH: { name: 'Switzerland', prefix: '+41', flag: '🇨🇭', placeholder: '78 123 45 67' },
  SA: { name: 'Saudi Arabia', prefix: '+966', flag: '🇸🇦', placeholder: '50 123 4567' },
  NO: { name: 'Norway', prefix: '+47', flag: '🇳🇴', placeholder: '401 23 456' },
  DK: { name: 'Denmark', prefix: '+45', flag: '🇩🇰', placeholder: '20 12 34 56' },
  FI: { name: 'Finland', prefix: '+358', flag: '🇫🇮', placeholder: '40 123 4567' },
  AT: { name: 'Austria', prefix: '+43', flag: '🇦🇹', placeholder: '664 1234567' },
  BE: { name: 'Belgium', prefix: '+32', flag: '🇧🇪', placeholder: '470 12 34 56' },
  PT: { name: 'Portugal', prefix: '+351', flag: '🇵🇹', placeholder: '912 345 678' },
  PL: { name: 'Poland', prefix: '+48', flag: '🇵🇱', placeholder: '512 345 678' },
  IL: { name: 'Israel', prefix: '+972', flag: '🇮🇱', placeholder: '50-123-4567' },
  TR: { name: 'Turkey', prefix: '+90', flag: '🇹🇷', placeholder: '501 234 56 78' },
  MY: { name: 'Malaysia', prefix: '+60', flag: '🇲🇾', placeholder: '12-345 6789' },
  ID: { name: 'Indonesia', prefix: '+62', flag: '🇮🇩', placeholder: '812-3456-7890' },
  TH: { name: 'Thailand', prefix: '+66', flag: '🇹🇭', placeholder: '81 234 5678' },
  PH: { name: 'Philippines', prefix: '+63', flag: '🇵🇭', placeholder: '912 345 6789' },
  VN: { name: 'Vietnam', prefix: '+84', flag: '🇻🇳', placeholder: '91 234 56 78' },
  HK: { name: 'Hong Kong', prefix: '+852', flag: '🇭🇰', placeholder: '9123 4567' },
  TW: { name: 'Taiwan', prefix: '+886', flag: '🇹🇼', placeholder: '912 345 678' },
  QA: { name: 'Qatar', prefix: '+974', flag: '🇶🇦', placeholder: '3312 3456' },
  KW: { name: 'Kuwait', prefix: '+965', flag: '🇰🇼', placeholder: '5012 3456' },
  BH: { name: 'Bahrain', prefix: '+973', flag: '🇧🇭', placeholder: '3912 3456' },
  OM: { name: 'Oman', prefix: '+968', flag: '🇴🇲', placeholder: '9123 4567' }
};

let cachedRegion = null;

export async function getUserRegion() {
  if (cachedRegion) return cachedRegion;

  let countryCode = 'US'; // default

  // Method 1: Check timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) countryCode = 'IN';
    else if (tz.includes('London')) countryCode = 'GB';
    else if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Perth')) countryCode = 'AU';
    else if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Edmonton') || tz.includes('Winnipeg')) countryCode = 'CA';
    else if (tz.includes('Berlin') || tz.includes('Frankfurt')) countryCode = 'DE';
    else if (tz.includes('Paris')) countryCode = 'FR';
    else if (tz.includes('Dubai')) countryCode = 'AE';
    else if (tz.includes('Singapore')) countryCode = 'SG';
    else if (tz.includes('Tokyo')) countryCode = 'JP';
    else if (tz.includes('Seoul')) countryCode = 'KR';
    else if (tz.includes('Amsterdam')) countryCode = 'NL';
    else if (tz.includes('Madrid')) countryCode = 'ES';
    else if (tz.includes('Rome')) countryCode = 'IT';
    else if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles') || tz.includes('Denver') || tz.includes('Phoenix')) countryCode = 'US';
  } catch (e) {}

  // Method 2: Check locale if timezone didn't give explicit match or to refine
  try {
    const languages = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (const lang of languages) {
      const parts = lang.toUpperCase().split('-');
      if (parts.length > 1 && COUNTRY_DATA[parts[1]]) {
        countryCode = parts[1];
        break;
      }
    }
  } catch (e) {}

  // Method 3: Network GeoIP Fetch (High accuracy)
  try {
    const response = await fetch('https://api.country.is/', { signal: AbortSignal.timeout(3500) });
    if (response.ok) {
      const data = await response.json();
      if (data.country && COUNTRY_DATA[data.country]) {
        countryCode = data.country;
      }
    }
  } catch (e) {
    try {
      const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) });
      if (response.ok) {
        const data = await response.json();
        if (data.country_code && COUNTRY_DATA[data.country_code]) {
          countryCode = data.country_code;
        }
      }
    } catch (e2) {}
  }

  const data = COUNTRY_DATA[countryCode] || COUNTRY_DATA['US'];
  cachedRegion = {
    code: countryCode,
    name: data.name,
    prefix: data.prefix,
    flag: data.flag,
    placeholder: data.placeholder,
    isIndia: countryCode === 'IN'
  };

  return cachedRegion;
}

export function getCountryDataByPrefix(prefixStr) {
  const clean = prefixStr.trim();
  for (const key in COUNTRY_DATA) {
    if (COUNTRY_DATA[key].prefix === clean) {
      return { code: key, ...COUNTRY_DATA[key] };
    }
  }
  return null;
}
