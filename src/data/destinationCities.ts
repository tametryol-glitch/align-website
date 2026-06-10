/**
 * Destination cities — the curated candidate pool for the "Best 20 Places"
 * Astro-Cartography ranking.
 *
 * The full ~20k-city database remains the source for search and map taps;
 * this list only controls which cities can APPEAR in the Best-20 list, so
 * users see places people actually dream of moving to or visiting instead
 * of obscure towns that happen to sit near a line. Line astrology still
 * decides the ORDER — this list only decides eligibility.
 *
 * Keys are matched case-insensitively as `${name}|${country}` against
 * WORLD_CITIES_ALL. Keep spellings identical to the city database.
 */

const DESTINATION_CITY_LIST: Array<[string, string]> = [
  // ── North America — United States ──
  ['New York City', 'United States'], ['Los Angeles', 'United States'],
  ['San Francisco', 'United States'], ['Chicago', 'United States'],
  ['Miami', 'United States'], ['Seattle', 'United States'],
  ['Boston', 'United States'], ['Austin', 'United States'],
  ['Denver', 'United States'], ['San Diego', 'United States'],
  ['Las Vegas', 'United States'], ['Honolulu', 'United States'],
  ['Atlanta', 'United States'], ['Dallas', 'United States'],
  ['Houston', 'United States'], ['Phoenix', 'United States'],
  ['Portland', 'United States'], ['Nashville', 'United States'],
  ['New Orleans', 'United States'], ['Philadelphia', 'United States'],
  ['Washington', 'United States'], ['San Antonio', 'United States'],
  ['Charlotte', 'United States'], ['Orlando', 'United States'],
  ['Tampa', 'United States'], ['Minneapolis', 'United States'],
  ['Salt Lake City', 'United States'], ['Santa Fe', 'United States'],
  ['Savannah', 'United States'], ['Charleston', 'United States'],
  ['Asheville', 'United States'], ['Boulder', 'United States'],
  ['Scottsdale', 'United States'], ['Sedona', 'United States'],
  ['Palm Springs', 'United States'], ['Santa Barbara', 'United States'],
  ['Sacramento', 'United States'], ['Kansas City', 'United States'],
  ['St. Louis', 'United States'], ['Pittsburgh', 'United States'],
  ['Detroit', 'United States'], ['Columbus', 'United States'],
  ['Indianapolis', 'United States'], ['Raleigh', 'United States'],
  ['Richmond', 'United States'], ['Baltimore', 'United States'],
  ['Anchorage', 'United States'], ['Boise', 'United States'],
  ['Albuquerque', 'United States'], ['Tucson', 'United States'],

  // ── North America — Canada & Mexico & Central America ──
  ['Toronto', 'Canada'], ['Vancouver', 'Canada'], ['Montreal', 'Canada'],
  ['Calgary', 'Canada'], ['Ottawa', 'Canada'], ['Quebec City', 'Canada'],
  ['Victoria', 'Canada'], ['Halifax', 'Canada'],
  ['Mexico City', 'Mexico'], ['Cancun', 'Mexico'], ['Guadalajara', 'Mexico'],
  ['Monterrey', 'Mexico'], ['Tulum', 'Mexico'], ['Playa del Carmen', 'Mexico'],
  ['Puerto Vallarta', 'Mexico'], ['Oaxaca', 'Mexico'], ['Merida', 'Mexico'],
  ['San Jose', 'Costa Rica'], ['Panama City', 'Panama'],
  ['Belize City', 'Belize'], ['Guatemala City', 'Guatemala'],

  // ── Caribbean ──
  ['Nassau', 'Bahamas'], ['Havana', 'Cuba'], ['San Juan', 'United States'],
  ['Kingston', 'Jamaica'], ['Montego Bay', 'Jamaica'],
  ['Santo Domingo', 'Dominican Republic'], ['Punta Cana', 'Dominican Republic'],
  ['Bridgetown', 'Barbados'], ['Port of Spain', 'Trinidad and Tobago'],
  ['Oranjestad', 'Aruba'], ['Willemstad', 'Curaçao'],

  // ── South America ──
  ['Rio de Janeiro', 'Brazil'], ['Sao Paulo', 'Brazil'],
  ['Florianópolis', 'Brazil'], ['Salvador', 'Brazil'],
  ['Buenos Aires', 'Argentina'], ['Mendoza', 'Argentina'],
  ['San Carlos de Bariloche', 'Argentina'], ['Lima', 'Peru'], ['Cusco', 'Peru'],
  ['Bogota', 'Colombia'], ['Medellin', 'Colombia'], ['Cartagena', 'Colombia'],
  ['Santiago', 'Chile'], ['Valparaiso', 'Chile'],
  ['Quito', 'Ecuador'], ['Montevideo', 'Uruguay'], ['Asuncion', 'Paraguay'],
  ['La Paz', 'Bolivia'], ['Caracas', 'Venezuela'],

  // ── Europe ──
  ['London', 'United Kingdom'], ['Edinburgh', 'United Kingdom'],
  ['Manchester', 'United Kingdom'], ['Liverpool', 'United Kingdom'],
  ['Glasgow', 'United Kingdom'], ['Dublin', 'Ireland'], ['Cork', 'Ireland'],
  ['Paris', 'France'], ['Nice', 'France'], ['Lyon', 'France'],
  ['Marseille', 'France'], ['Bordeaux', 'France'], ['Cannes', 'France'],
  ['Rome', 'Italy'], ['Milan', 'Italy'], ['Florence', 'Italy'],
  ['Venice', 'Italy'], ['Naples', 'Italy'], ['Bologna', 'Italy'],
  ['Turin', 'Italy'], ['Palermo', 'Italy'],
  ['Barcelona', 'Spain'], ['Madrid', 'Spain'], ['Seville', 'Spain'],
  ['Valencia', 'Spain'], ['Malaga', 'Spain'], ['Bilbao', 'Spain'],
  ['Palma de Mallorca', 'Spain'], ['Granada', 'Spain'],
  ['Lisbon', 'Portugal'], ['Porto', 'Portugal'], ['Faro', 'Portugal'],
  ['Funchal', 'Portugal'],
  ['Amsterdam', 'Netherlands'], ['Rotterdam', 'Netherlands'],
  ['Brussels', 'Belgium'], ['Antwerp', 'Belgium'], ['Bruges', 'Belgium'],
  ['Berlin', 'Germany'], ['Munich', 'Germany'], ['Hamburg', 'Germany'],
  ['Frankfurt', 'Germany'], ['Cologne', 'Germany'], ['Düsseldorf', 'Germany'],
  ['Vienna', 'Austria'], ['Salzburg', 'Austria'], ['Innsbruck', 'Austria'],
  ['Zurich', 'Switzerland'], ['Geneva', 'Switzerland'], ['Lucerne', 'Switzerland'],
  ['Prague', 'Czech Republic'], ['Budapest', 'Hungary'],
  ['Warsaw', 'Poland'], ['Krakow', 'Poland'], ['Gdansk', 'Poland'],
  ['Copenhagen', 'Denmark'], ['Stockholm', 'Sweden'], ['Gothenburg', 'Sweden'],
  ['Oslo', 'Norway'], ['Bergen', 'Norway'], ['Helsinki', 'Finland'],
  ['Reykjavik', 'Iceland'], ['Athens', 'Greece'], ['Thessaloniki', 'Greece'],
  ['Istanbul', 'Turkey'], ['Antalya', 'Turkey'], ['Izmir', 'Turkey'],
  ['Dubrovnik', 'Croatia'], ['Split', 'Croatia'], ['Zagreb', 'Croatia'],
  ['Ljubljana', 'Slovenia'], ['Belgrade', 'Serbia'], ['Sarajevo', 'Bosnia and Herzegovina'],
  ['Bucharest', 'Romania'], ['Sofia', 'Bulgaria'], ['Tirana', 'Albania'],
  ['Tallinn', 'Estonia'], ['Riga', 'Latvia'], ['Vilnius', 'Lithuania'],
  ['Valletta', 'Malta'], ['Nicosia', 'Cyprus'], ['Luxembourg City', 'Luxembourg'],
  ['Monaco', 'Monaco'], ['Andorra la Vella', 'Andorra'],
  ['Kyiv', 'Ukraine'], ['Tbilisi', 'Georgia'], ['Yerevan', 'Armenia'],
  ['Baku', 'Azerbaijan'],

  // ── Middle East ──
  ['Dubai', 'United Arab Emirates'], ['Abu Dhabi', 'United Arab Emirates'],
  ['Doha', 'Qatar'], ['Tel Aviv', 'Israel'], ['Jerusalem', 'Israel'],
  ['Riyadh', 'Saudi Arabia'], ['Jeddah', 'Saudi Arabia'],
  ['Muscat', 'Oman'], ['Amman', 'Jordan'], ['Beirut', 'Lebanon'],
  ['Kuwait City', 'Kuwait'], ['Manama', 'Bahrain'],

  // ── Africa ──
  ['Cape Town', 'South Africa'], ['Johannesburg', 'South Africa'],
  ['Durban', 'South Africa'], ['Marrakech', 'Morocco'],
  ['Casablanca', 'Morocco'], ['Fes', 'Morocco'], ['Tangier', 'Morocco'],
  ['Cairo', 'Egypt'], ['Alexandria', 'Egypt'], ['Sharm El Sheikh', 'Egypt'],
  ['Nairobi', 'Kenya'], ['Mombasa', 'Kenya'], ['Lagos', 'Nigeria'],
  ['Abuja', 'Nigeria'], ['Accra', 'Ghana'], ['Dakar', 'Senegal'],
  ['Tunis', 'Tunisia'], ['Addis Ababa', 'Ethiopia'], ['Kigali', 'Rwanda'],
  ['Dar es Salaam', 'Tanzania'], ['Zanzibar City', 'Tanzania'],
  ['Port Louis', 'Mauritius'], ['Victoria', 'Seychelles'],
  ['Windhoek', 'Namibia'], ['Gaborone', 'Botswana'],

  // ── Asia ──
  ['Tokyo', 'Japan'], ['Kyoto', 'Japan'], ['Osaka', 'Japan'],
  ['Sapporo', 'Japan'], ['Fukuoka', 'Japan'], ['Naha', 'Japan'],
  ['Seoul', 'South Korea'], ['Busan', 'South Korea'], ['Jeju', 'South Korea'],
  ['Beijing', 'China'], ['Shanghai', 'China'], ['Shenzhen', 'China'],
  ['Chengdu', 'China'], ['Hong Kong', 'Hong Kong'], ['Macau', 'China'],
  ['Taipei', 'Taiwan'], ['Bangkok', 'Thailand'], ['Chiang Mai', 'Thailand'],
  ['Phuket', 'Thailand'], ['Singapore', 'Singapore'],
  ['Kuala Lumpur', 'Malaysia'], ['George Town', 'Malaysia'],
  ['Denpasar', 'Indonesia'], ['Ubud', 'Indonesia'], ['Jakarta', 'Indonesia'],
  ['Manila', 'Philippines'], ['Cebu City', 'Philippines'],
  ['Ho Chi Minh City', 'Vietnam'], ['Hanoi', 'Vietnam'], ['Da Nang', 'Vietnam'],
  ['Hoi An', 'Vietnam'], ['Phnom Penh', 'Cambodia'], ['Siem Reap', 'Cambodia'],
  ['Vientiane', 'Laos'], ['Yangon', 'Myanmar'],
  ['Mumbai', 'India'], ['Delhi', 'India'], ['Bangalore', 'India'],
  ['Jaipur', 'India'], ['Goa', 'India'], ['Chennai', 'India'],
  ['Kolkata', 'India'], ['Hyderabad', 'India'], ['Pune', 'India'],
  ['Kathmandu', 'Nepal'], ['Colombo', 'Sri Lanka'], ['Male', 'Maldives'],
  ['Dhaka', 'Bangladesh'], ['Karachi', 'Pakistan'], ['Lahore', 'Pakistan'],
  ['Islamabad', 'Pakistan'], ['Almaty', 'Kazakhstan'], ['Tashkent', 'Uzbekistan'],
  ['Ulaanbaatar', 'Mongolia'],

  // ── Oceania ──
  ['Sydney', 'Australia'], ['Melbourne', 'Australia'], ['Brisbane', 'Australia'],
  ['Perth', 'Australia'], ['Gold Coast', 'Australia'], ['Adelaide', 'Australia'],
  ['Cairns', 'Australia'], ['Hobart', 'Australia'], ['Darwin', 'Australia'],
  ['Auckland', 'New Zealand'], ['Wellington', 'New Zealand'],
  ['Christchurch', 'New Zealand'], ['Queenstown', 'New Zealand'],
  ['Suva', 'Fiji'], ['Papeete', 'French Polynesia'],

  // ── Russia & Central Asia ──
  ['Moscow', 'Russia'], ['Saint Petersburg', 'Russia'],
];

export const DESTINATION_CITY_KEYS: Set<string> = new Set(
  DESTINATION_CITY_LIST.map(([name, country]) => `${name.toLowerCase()}|${country.toLowerCase()}`),
);

export function isDestinationCity(city: { name: string; country: string }): boolean {
  return DESTINATION_CITY_KEYS.has(`${city.name.toLowerCase()}|${city.country.toLowerCase()}`);
}
