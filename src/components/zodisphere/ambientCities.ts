/**
 * Ambient world cities — always-on points so the globe reads as a living
 * Earth even before any community data exists. Purely decorative/geographic
 * (public place coordinates), NOT people. Curated global spread of major
 * metros; community activity points render brighter on top of these.
 */
export interface AmbientCity {
  name: string;
  lat: number;
  lng: number;
}

export const AMBIENT_CITIES: AmbientCity[] = [
  // North America
  { name: 'New York', lat: 40.7128, lng: -74.006 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { name: 'Atlanta', lat: 33.749, lng: -84.388 },
  { name: 'Miami', lat: 25.7617, lng: -80.1918 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { name: 'Vancouver', lat: 49.2827, lng: -123.1207 },
  { name: 'Houston', lat: 29.7604, lng: -95.3698 },
  // Caribbean (Align's home region)
  { name: 'Nassau', lat: 25.0343, lng: -77.3963 },
  { name: 'Kingston', lat: 17.9712, lng: -76.7936 },
  { name: 'Bridgetown', lat: 13.1132, lng: -59.5988 },
  { name: 'Port of Spain', lat: 10.6596, lng: -61.5086 },
  { name: 'Havana', lat: 23.1136, lng: -82.3666 },
  { name: 'Santo Domingo', lat: 18.4861, lng: -69.9312 },
  { name: 'San Juan', lat: 18.4655, lng: -66.1057 },
  // South America
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'Lima', lat: -12.0464, lng: -77.0428 },
  { name: 'Bogotá', lat: 4.711, lng: -74.0721 },
  { name: 'Santiago', lat: -33.4489, lng: -70.6693 },
  { name: 'Caracas', lat: 10.4806, lng: -66.9036 },
  // Europe
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Berlin', lat: 52.52, lng: 13.405 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Lisbon', lat: 38.7223, lng: -9.1393 },
  { name: 'Athens', lat: 37.9838, lng: 23.7275 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
  { name: 'Dublin', lat: 53.3498, lng: -6.2603 },
  { name: 'Warsaw', lat: 52.2297, lng: 21.0122 },
  // Africa
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { name: 'Accra', lat: 5.6037, lng: -0.187 },
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { name: 'Addis Ababa', lat: 9.145, lng: 40.4897 },
  { name: 'Dakar', lat: 14.7167, lng: -17.4677 },
  // Middle East
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Tel Aviv', lat: 32.0853, lng: 34.7818 },
  { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
  { name: 'Tehran', lat: 35.6892, lng: 51.389 },
  // Asia
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Seoul', lat: 37.5665, lng: 126.978 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Manila', lat: 14.5995, lng: 120.9842 },
  { name: 'Kuala Lumpur', lat: 3.139, lng: 101.6869 },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297 },
  // Oceania
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
  { name: 'Auckland', lat: -36.8485, lng: 174.7633 },
  { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
  { name: 'Perth', lat: -31.9505, lng: 115.8605 },
];
