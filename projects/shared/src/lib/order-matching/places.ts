const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Chad', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras',
  'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
  'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
  'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco',
  'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const CITIES = [
  'Abu Dhabi', 'Accra', 'Addis Ababa', 'Alexandria', 'Amman', 'Amsterdam', 'Ankara', 'Antalya', 'Athens', 'Auckland',
  'Baku', 'Bali', 'Bangkok', 'Barcelona', 'Beijing', 'Beirut', 'Belgrade', 'Berlin', 'Bern', 'Bogotá', 'Bologna', 'Boston',
  'Bratislava', 'Brussels', 'Bucharest', 'Budapest', 'Buenos Aires', 'Cairo', 'Cancún', 'Cape Town', 'Casablanca', 'Chicago',
  'Copenhagen', 'Dallas', 'Delhi', 'Doha', 'Dubai', 'Dublin', 'Dubrovnik', 'Edinburgh', 'Eilat', 'Florence', 'Frankfurt',
  'Geneva', 'Haifa', 'Hamburg', 'Hanoi', 'Havana', 'Helsinki', 'Ho Chi Minh City', 'Honolulu', 'Istanbul',
  'Jakarta', 'Jerusalem', 'Johannesburg', 'Kathmandu', 'Kraków', 'Kuala Lumpur', 'Kyiv', 'Lagos', 'Larnaca',
  'Las Vegas', 'Lima', 'Lisbon', 'Ljubljana', 'London', 'Los Angeles', 'Lyon', 'Madrid', 'Málaga', 'Manila', 'Marrakech',
  'Marseille', 'Melbourne', 'Mexico City', 'Miami', 'Milan', 'Montreal', 'Moscow', 'Mumbai', 'Munich', 'Nairobi', 'Naples',
  'New York', 'Newark', 'Nice', 'Oslo', 'Paris', 'Phuket', 'Prague', 'Reykjavík', 'Riga', 'Rio de Janeiro', 'Rome',
  'Salzburg', 'San Francisco', 'Santiago', 'Santorini', 'São Paulo', 'Seoul', 'Seville', 'Shanghai', 'Sofia',
  'Split', 'Stockholm', 'Sydney', 'Tallinn', 'Tbilisi', 'Tel Aviv', 'Thessaloniki', 'Tirana', 'Tokyo', 'Toronto', 'Tunis',
  'Valencia', 'Vancouver', 'Venice', 'Vienna', 'Vilnius', 'Warsaw', 'Washington', 'Yerevan', 'Zagreb', 'Zürich'
];

/** Compares places the way people type them: no case, no accents, single spaces. */
export function normalisePlace(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export const KNOWN_PLACES: readonly string[] = /* @__PURE__ */ [...new Set([...COUNTRIES, ...CITIES])].sort((a, b) => a.localeCompare(b));

const KNOWN_NORMALISED = /* @__PURE__ */ new Set(KNOWN_PLACES.map(normalisePlace));

export const isKnownPlace = (value: unknown): boolean => KNOWN_NORMALISED.has(normalisePlace(value));

export function suggestPlaces(typed: unknown, limit = 8): string[] {
  const query = normalisePlace(typed);
  return KNOWN_PLACES.filter(place => normalisePlace(place).includes(query)).slice(0, limit);
}
