export interface CityData {
  name: string;
  country: string;
  /** Optional state / province / region for disambiguation (e.g. "Illinois") */
  region?: string;
  lat: number;
  lon: number;
  /**
   * Optional population. Only the GeoNames-sourced US cities and the
   * curated supplement carry this; the legacy hand-curated list does
   * not. The autocomplete uses it to break ties between same-name
   * cities (e.g. Dallas, TX = 1.3M vs Dallas, GA = 14k).
   */
  population?: number;
}

export const WORLD_CITIES: CityData[] = [
  // ============================================================
  // AFGHANISTAN
  // ============================================================
  { name: "Herat", country: "Afghanistan", lat: 34.3529, lon: 62.2040 },
  { name: "Kabul", country: "Afghanistan", lat: 34.5553, lon: 69.2075 },
  { name: "Kandahar", country: "Afghanistan", lat: 31.6133, lon: 65.7101 },
  { name: "Mazar-i-Sharif", country: "Afghanistan", lat: 36.7069, lon: 67.1100 },

  // ============================================================
  // ALBANIA
  // ============================================================
  { name: "Durres", country: "Albania", lat: 41.3233, lon: 19.4414 },
  { name: "Tirana", country: "Albania", lat: 41.3275, lon: 19.8187 },
  { name: "Vlore", country: "Albania", lat: 40.4667, lon: 19.4897 },

  // ============================================================
  // ALGERIA
  // ============================================================
  { name: "Algiers", country: "Algeria", lat: 36.7538, lon: 3.0588 },
  { name: "Constantine", country: "Algeria", lat: 36.3650, lon: 6.6147 },
  { name: "Oran", country: "Algeria", lat: 35.6969, lon: -0.6331 },

  // ============================================================
  // ANGOLA
  // ============================================================
  { name: "Benguela", country: "Angola", lat: -12.5763, lon: 13.4055 },
  { name: "Huambo", country: "Angola", lat: -12.7761, lon: 15.7392 },
  { name: "Lobito", country: "Angola", lat: -12.3644, lon: 13.5361 },
  { name: "Luanda", country: "Angola", lat: -8.8390, lon: 13.2894 },
  { name: "Lubango", country: "Angola", lat: -14.9167, lon: 13.5000 },

  // ============================================================
  // ANTIGUA AND BARBUDA
  // ============================================================
  { name: "St. John's", country: "Antigua and Barbuda", lat: 17.1274, lon: -61.8468 },

  // ============================================================
  // ARGENTINA
  // ============================================================
  { name: "Bahia Blanca", country: "Argentina", lat: -38.7183, lon: -62.2663 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Cordoba", country: "Argentina", lat: -31.4201, lon: -64.1888 },
  { name: "Corrientes", country: "Argentina", lat: -27.4693, lon: -58.8306 },
  { name: "La Plata", country: "Argentina", lat: -34.9205, lon: -57.9536 },
  { name: "Mar del Plata", country: "Argentina", lat: -38.0055, lon: -57.5426 },
  { name: "Mendoza", country: "Argentina", lat: -32.8895, lon: -68.8458 },
  { name: "Neuquen", country: "Argentina", lat: -38.9516, lon: -68.0591 },
  { name: "Posadas", country: "Argentina", lat: -27.3671, lon: -55.8961 },
  { name: "Resistencia", country: "Argentina", lat: -27.4606, lon: -58.9839 },
  { name: "Rosario", country: "Argentina", lat: -32.9468, lon: -60.6393 },
  { name: "Salta", country: "Argentina", lat: -24.7821, lon: -65.4232 },
  { name: "San Juan", country: "Argentina", lat: -31.5375, lon: -68.5364 },
  { name: "San Miguel de Tucuman", country: "Argentina", lat: -26.8083, lon: -65.2176 },
  { name: "Santa Fe", country: "Argentina", lat: -31.6333, lon: -60.7000 },
  { name: "Ushuaia", country: "Argentina", lat: -54.8019, lon: -68.3030 },

  // ============================================================
  // ARMENIA
  // ============================================================
  { name: "Gyumri", country: "Armenia", lat: 40.7894, lon: 43.8475 },
  { name: "Yerevan", country: "Armenia", lat: 40.1792, lon: 44.4991 },

  // ============================================================
  // AUSTRALIA
  // ============================================================
  { name: "Adelaide", country: "Australia", lat: -34.9285, lon: 138.6007 },
  { name: "Alice Springs", country: "Australia", lat: -23.6980, lon: 133.8807 },
  { name: "Brisbane", country: "Australia", lat: -27.4698, lon: 153.0251 },
  { name: "Cairns", country: "Australia", lat: -16.9186, lon: 145.7781 },
  { name: "Canberra", country: "Australia", lat: -35.2809, lon: 149.1300 },
  { name: "Darwin", country: "Australia", lat: -12.4634, lon: 130.8456 },
  { name: "Geelong", country: "Australia", lat: -38.1499, lon: 144.3617 },
  { name: "Gold Coast", country: "Australia", lat: -28.0167, lon: 153.4000 },
  { name: "Hobart", country: "Australia", lat: -42.8821, lon: 147.3272 },
  { name: "Launceston", country: "Australia", lat: -41.4332, lon: 147.1441 },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lon: 144.9631 },
  { name: "Newcastle", country: "Australia", lat: -32.9283, lon: 151.7817 },
  { name: "Perth", country: "Australia", lat: -31.9505, lon: 115.8605 },
  { name: "Sunshine Coast", country: "Australia", lat: -26.6500, lon: 153.0667 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Toowoomba", country: "Australia", lat: -27.5598, lon: 151.9507 },
  { name: "Townsville", country: "Australia", lat: -19.2590, lon: 146.8169 },
  { name: "Wollongong", country: "Australia", lat: -34.4278, lon: 150.8931 },

  // ============================================================
  // AUSTRIA
  // ============================================================
  { name: "Graz", country: "Austria", lat: 47.0707, lon: 15.4395 },
  { name: "Innsbruck", country: "Austria", lat: 47.2692, lon: 11.4041 },
  { name: "Klagenfurt", country: "Austria", lat: 46.6365, lon: 14.3122 },
  { name: "Linz", country: "Austria", lat: 48.3069, lon: 14.2858 },
  { name: "Salzburg", country: "Austria", lat: 47.8095, lon: 13.0550 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738 },

  // ============================================================
  // AZERBAIJAN
  // ============================================================
  { name: "Baku", country: "Azerbaijan", lat: 40.4093, lon: 49.8671 },
  { name: "Ganja", country: "Azerbaijan", lat: 40.6828, lon: 46.3606 },

  // ============================================================
  // BAHAMAS
  // ============================================================
  { name: "Freeport", country: "Bahamas", lat: 26.5285, lon: -78.6967 },
  { name: "Nassau", country: "Bahamas", lat: 25.0343, lon: -77.3963 },

  // ============================================================
  // BAHRAIN
  // ============================================================
  { name: "Manama", country: "Bahrain", lat: 26.2285, lon: 50.5860 },

  // ============================================================
  // BANGLADESH
  // ============================================================
  { name: "Chittagong", country: "Bangladesh", lat: 22.3569, lon: 91.7832 },
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125 },
  { name: "Khulna", country: "Bangladesh", lat: 22.8456, lon: 89.5403 },
  { name: "Rajshahi", country: "Bangladesh", lat: 24.3745, lon: 88.6042 },
  { name: "Sylhet", country: "Bangladesh", lat: 24.8949, lon: 91.8687 },

  // ============================================================
  // BARBADOS
  // ============================================================
  { name: "Bridgetown", country: "Barbados", lat: 13.1132, lon: -59.5988 },

  // ============================================================
  // BELARUS
  // ============================================================
  { name: "Brest", country: "Belarus", lat: 52.0976, lon: 23.6858 },
  { name: "Gomel", country: "Belarus", lat: 52.4345, lon: 30.9754 },
  { name: "Grodno", country: "Belarus", lat: 53.6688, lon: 23.8313 },
  { name: "Minsk", country: "Belarus", lat: 53.9006, lon: 27.5590 },

  // ============================================================
  // BELGIUM
  // ============================================================
  { name: "Antwerp", country: "Belgium", lat: 51.2194, lon: 4.4025 },
  { name: "Bruges", country: "Belgium", lat: 51.2093, lon: 3.2247 },
  { name: "Brussels", country: "Belgium", lat: 50.8503, lon: 4.3517 },
  { name: "Ghent", country: "Belgium", lat: 51.0543, lon: 3.7174 },
  { name: "Liege", country: "Belgium", lat: 50.6292, lon: 5.5797 },

  // ============================================================
  // BELIZE
  // ============================================================
  { name: "Belize City", country: "Belize", lat: 17.4986, lon: -88.1886 },
  { name: "Belmopan", country: "Belize", lat: 17.2510, lon: -88.7590 },

  // ============================================================
  // BENIN
  // ============================================================
  { name: "Cotonou", country: "Benin", lat: 6.3703, lon: 2.3912 },
  { name: "Porto-Novo", country: "Benin", lat: 6.4969, lon: 2.6289 },

  // ============================================================
  // BHUTAN
  // ============================================================
  { name: "Thimphu", country: "Bhutan", lat: 27.4728, lon: 89.6390 },

  // ============================================================
  // BOLIVIA
  // ============================================================
  { name: "Cochabamba", country: "Bolivia", lat: -17.3895, lon: -66.1568 },
  { name: "La Paz", country: "Bolivia", lat: -16.4897, lon: -68.1193 },
  { name: "Santa Cruz de la Sierra", country: "Bolivia", lat: -17.7833, lon: -63.1822 },
  { name: "Sucre", country: "Bolivia", lat: -19.0196, lon: -65.2619 },

  // ============================================================
  // BOSNIA AND HERZEGOVINA
  // ============================================================
  { name: "Banja Luka", country: "Bosnia and Herzegovina", lat: 44.7722, lon: 17.1910 },
  { name: "Mostar", country: "Bosnia and Herzegovina", lat: 43.3438, lon: 17.8078 },
  { name: "Sarajevo", country: "Bosnia and Herzegovina", lat: 43.8563, lon: 18.4131 },

  // ============================================================
  // BOTSWANA
  // ============================================================
  { name: "Gaborone", country: "Botswana", lat: -24.6282, lon: 25.9231 },

  // ============================================================
  // BRAZIL
  // ============================================================
  { name: "Belem", country: "Brazil", lat: -1.4558, lon: -48.4902 },
  { name: "Belo Horizonte", country: "Brazil", lat: -19.9167, lon: -43.9345 },
  { name: "Brasilia", country: "Brazil", lat: -15.7975, lon: -47.8919 },
  { name: "Campinas", country: "Brazil", lat: -22.9099, lon: -47.0626 },
  { name: "Campo Grande", country: "Brazil", lat: -20.4697, lon: -54.6201 },
  { name: "Cuiaba", country: "Brazil", lat: -15.5989, lon: -56.0949 },
  { name: "Curitiba", country: "Brazil", lat: -25.4284, lon: -49.2733 },
  { name: "Florianopolis", country: "Brazil", lat: -27.5954, lon: -48.5480 },
  { name: "Fortaleza", country: "Brazil", lat: -3.7172, lon: -38.5433 },
  { name: "Goiania", country: "Brazil", lat: -16.6799, lon: -49.2550 },
  { name: "Joao Pessoa", country: "Brazil", lat: -7.1195, lon: -34.8450 },
  { name: "Macapa", country: "Brazil", lat: 0.0349, lon: -51.0694 },
  { name: "Maceio", country: "Brazil", lat: -9.6658, lon: -35.7353 },
  { name: "Manaus", country: "Brazil", lat: -3.1190, lon: -60.0217 },
  { name: "Natal", country: "Brazil", lat: -5.7945, lon: -35.2110 },
  { name: "Porto Alegre", country: "Brazil", lat: -30.0346, lon: -51.2177 },
  { name: "Porto Velho", country: "Brazil", lat: -8.7612, lon: -63.9004 },
  { name: "Recife", country: "Brazil", lat: -8.0476, lon: -34.8770 },
  { name: "Rio Branco", country: "Brazil", lat: -9.9754, lon: -67.8249 },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729 },
  { name: "Salvador", country: "Brazil", lat: -12.9714, lon: -38.5124 },
  { name: "Santos", country: "Brazil", lat: -23.9608, lon: -46.3336 },
  { name: "Sao Luis", country: "Brazil", lat: -2.5297, lon: -44.2825 },
  { name: "Sao Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { name: "Teresina", country: "Brazil", lat: -5.0892, lon: -42.8019 },
  { name: "Vitoria", country: "Brazil", lat: -20.3155, lon: -40.3128 },

  // ============================================================
  // BRUNEI
  // ============================================================
  { name: "Bandar Seri Begawan", country: "Brunei", lat: 4.9031, lon: 114.9398 },

  // ============================================================
  // BULGARIA
  // ============================================================
  { name: "Burgas", country: "Bulgaria", lat: 42.5048, lon: 27.4626 },
  { name: "Plovdiv", country: "Bulgaria", lat: 42.1354, lon: 24.7453 },
  { name: "Sofia", country: "Bulgaria", lat: 42.6977, lon: 23.3219 },
  { name: "Varna", country: "Bulgaria", lat: 43.2141, lon: 27.9147 },

  // ============================================================
  // BURKINA FASO
  // ============================================================
  { name: "Ouagadougou", country: "Burkina Faso", lat: 12.3714, lon: -1.5197 },

  // ============================================================
  // BURUNDI
  // ============================================================
  { name: "Bujumbura", country: "Burundi", lat: -3.3822, lon: 29.3644 },

  // ============================================================
  // CAMBODIA
  // ============================================================
  { name: "Phnom Penh", country: "Cambodia", lat: 11.5564, lon: 104.9282 },
  { name: "Siem Reap", country: "Cambodia", lat: 13.3633, lon: 103.8564 },

  // ============================================================
  // CAMEROON
  // ============================================================
  { name: "Bamenda", country: "Cameroon", lat: 5.9631, lon: 10.1591 },
  { name: "Douala", country: "Cameroon", lat: 4.0511, lon: 9.7679 },
  { name: "Yaounde", country: "Cameroon", lat: 3.8480, lon: 11.5021 },

  // ============================================================
  // CANADA
  // ============================================================
  { name: "Brampton", country: "Canada", lat: 43.7315, lon: -79.7624 },
  { name: "Burlington", country: "Canada", lat: 43.3255, lon: -79.7990 },
  { name: "Burnaby", country: "Canada", lat: 49.2488, lon: -122.9805 },
  { name: "Calgary", country: "Canada", lat: 51.0447, lon: -114.0719 },
  { name: "Charlottetown", country: "Canada", lat: 46.2382, lon: -63.1311 },
  { name: "Edmonton", country: "Canada", lat: 53.5461, lon: -113.4938 },
  { name: "Fredericton", country: "Canada", lat: 45.9636, lon: -66.6431 },
  { name: "Halifax", country: "Canada", lat: 44.6488, lon: -63.5752 },
  { name: "Hamilton", country: "Canada", lat: 43.2557, lon: -79.8711 },
  { name: "Iqaluit", country: "Canada", lat: 63.7467, lon: -68.5170 },
  { name: "Kelowna", country: "Canada", lat: 49.8880, lon: -119.4960 },
  { name: "Kingston", country: "Canada", lat: 44.2312, lon: -76.4860 },
  { name: "Kitchener", country: "Canada", lat: 43.4516, lon: -80.4925 },
  { name: "London", country: "Canada", lat: 42.9849, lon: -81.2453 },
  { name: "Markham", country: "Canada", lat: 43.8561, lon: -79.3370 },
  { name: "Mississauga", country: "Canada", lat: 43.5890, lon: -79.6441 },
  { name: "Moncton", country: "Canada", lat: 46.0878, lon: -64.7782 },
  { name: "Montreal", country: "Canada", lat: 45.5017, lon: -73.5673 },
  { name: "Niagara Falls", country: "Canada", lat: 43.0896, lon: -79.0849 },
  { name: "Ottawa", country: "Canada", lat: 45.4215, lon: -75.6972 },
  { name: "Quebec City", country: "Canada", lat: 46.8139, lon: -71.2080 },
  { name: "Red Deer", country: "Canada", lat: 52.2681, lon: -113.8112 },
  { name: "Regina", country: "Canada", lat: 50.4452, lon: -104.6189 },
  { name: "Richmond", country: "Canada", lat: 49.1666, lon: -123.1336 },
  { name: "Saskatoon", country: "Canada", lat: 52.1332, lon: -106.6700 },
  { name: "St. John's", country: "Canada", lat: 47.5615, lon: -52.7126 },
  { name: "Surrey", country: "Canada", lat: 49.1913, lon: -122.8490 },
  { name: "Thunder Bay", country: "Canada", lat: 48.3809, lon: -89.2477 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832 },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lon: -123.1207 },
  { name: "Victoria", country: "Canada", lat: 48.4284, lon: -123.3656 },
  { name: "Whitehorse", country: "Canada", lat: 60.7212, lon: -135.0568 },
  { name: "Windsor", country: "Canada", lat: 42.3149, lon: -83.0364 },
  { name: "Winnipeg", country: "Canada", lat: 49.8951, lon: -97.1384 },
  { name: "Yellowknife", country: "Canada", lat: 62.4540, lon: -114.3718 },

  // ============================================================
  // CAPE VERDE
  // ============================================================
  { name: "Praia", country: "Cape Verde", lat: 14.9331, lon: -23.5133 },

  // ============================================================
  // CHAD
  // ============================================================
  { name: "N'Djamena", country: "Chad", lat: 12.1348, lon: 15.0557 },

  // ============================================================
  // CHILE
  // ============================================================
  { name: "Antofagasta", country: "Chile", lat: -23.6509, lon: -70.3975 },
  { name: "Arica", country: "Chile", lat: -18.4783, lon: -70.3126 },
  { name: "Concepcion", country: "Chile", lat: -36.8270, lon: -73.0503 },
  { name: "Iquique", country: "Chile", lat: -20.2141, lon: -70.1524 },
  { name: "La Serena", country: "Chile", lat: -29.9027, lon: -71.2519 },
  { name: "Puerto Montt", country: "Chile", lat: -41.4693, lon: -72.9424 },
  { name: "Punta Arenas", country: "Chile", lat: -53.1548, lon: -70.9113 },
  { name: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693 },
  { name: "Temuco", country: "Chile", lat: -38.7359, lon: -72.5904 },
  { name: "Valdivia", country: "Chile", lat: -39.8196, lon: -73.2452 },
  { name: "Valparaiso", country: "Chile", lat: -33.0472, lon: -71.6127 },
  { name: "Vina del Mar", country: "Chile", lat: -33.0153, lon: -71.5500 },

  // ============================================================
  // CHINA
  // ============================================================
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
  { name: "Changchun", country: "China", lat: 43.8171, lon: 125.3235 },
  { name: "Changsha", country: "China", lat: 28.2282, lon: 112.9388 },
  { name: "Chengdu", country: "China", lat: 30.5723, lon: 104.0665 },
  { name: "Chongqing", country: "China", lat: 29.4316, lon: 106.9123 },
  { name: "Dalian", country: "China", lat: 38.9140, lon: 121.6147 },
  { name: "Dongguan", country: "China", lat: 23.0489, lon: 113.7436 },
  { name: "Foshan", country: "China", lat: 23.0218, lon: 113.1218 },
  { name: "Fuzhou", country: "China", lat: 26.0745, lon: 119.2965 },
  { name: "Guangzhou", country: "China", lat: 23.1291, lon: 113.2644 },
  { name: "Guiyang", country: "China", lat: 26.6470, lon: 106.6302 },
  { name: "Haikou", country: "China", lat: 20.0440, lon: 110.3500 },
  { name: "Hangzhou", country: "China", lat: 30.2741, lon: 120.1551 },
  { name: "Harbin", country: "China", lat: 45.8038, lon: 126.5350 },
  { name: "Hefei", country: "China", lat: 31.8206, lon: 117.2272 },
  { name: "Hong Kong", country: "China", lat: 22.3193, lon: 114.1694 },
  { name: "Jinan", country: "China", lat: 36.6512, lon: 117.1201 },
  { name: "Kunming", country: "China", lat: 25.0389, lon: 102.7183 },
  { name: "Lanzhou", country: "China", lat: 36.0611, lon: 103.8343 },
  { name: "Lhasa", country: "China", lat: 29.6500, lon: 91.1000 },
  { name: "Macau", country: "China", lat: 22.1987, lon: 113.5439 },
  { name: "Nanchang", country: "China", lat: 28.6820, lon: 115.8579 },
  { name: "Nanjing", country: "China", lat: 32.0603, lon: 118.7969 },
  { name: "Nanning", country: "China", lat: 22.8170, lon: 108.3665 },
  { name: "Ningbo", country: "China", lat: 29.8683, lon: 121.5440 },
  { name: "Qingdao", country: "China", lat: 36.0671, lon: 120.3826 },
  { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737 },
  { name: "Shenyang", country: "China", lat: 41.8057, lon: 123.4315 },
  { name: "Shenzhen", country: "China", lat: 22.5431, lon: 114.0579 },
  { name: "Shijiazhuang", country: "China", lat: 38.0428, lon: 114.5149 },
  { name: "Suzhou", country: "China", lat: 31.2990, lon: 120.5853 },
  { name: "Taiyuan", country: "China", lat: 37.8706, lon: 112.5489 },
  { name: "Tianjin", country: "China", lat: 39.3434, lon: 117.3616 },
  { name: "Urumqi", country: "China", lat: 43.8256, lon: 87.6168 },
  { name: "Wenzhou", country: "China", lat: 27.9938, lon: 120.6994 },
  { name: "Wuhan", country: "China", lat: 30.5928, lon: 114.3055 },
  { name: "Wuxi", country: "China", lat: 31.4912, lon: 120.3119 },
  { name: "Xi'an", country: "China", lat: 34.3416, lon: 108.9398 },
  { name: "Xiamen", country: "China", lat: 24.4798, lon: 118.0894 },
  { name: "Zhengzhou", country: "China", lat: 34.7472, lon: 113.6249 },
  { name: "Zhuhai", country: "China", lat: 22.2710, lon: 113.5767 },

  // ============================================================
  // COLOMBIA
  // ============================================================
  { name: "Barranquilla", country: "Colombia", lat: 10.9685, lon: -74.7813 },
  { name: "Bogota", country: "Colombia", lat: 4.7110, lon: -74.0721 },
  { name: "Bucaramanga", country: "Colombia", lat: 7.1254, lon: -73.1198 },
  { name: "Cali", country: "Colombia", lat: 3.4516, lon: -76.5320 },
  { name: "Cartagena", country: "Colombia", lat: 10.3910, lon: -75.5144 },
  { name: "Cucuta", country: "Colombia", lat: 7.8939, lon: -72.5078 },
  { name: "Ibague", country: "Colombia", lat: 4.4389, lon: -75.2322 },
  { name: "Manizales", country: "Colombia", lat: 5.0689, lon: -75.5174 },
  { name: "Medellin", country: "Colombia", lat: 6.2476, lon: -75.5658 },
  { name: "Pereira", country: "Colombia", lat: 4.8087, lon: -75.6906 },
  { name: "Santa Marta", country: "Colombia", lat: 11.2408, lon: -74.1990 },

  // ============================================================
  // COSTA RICA
  // ============================================================
  { name: "Limon", country: "Costa Rica", lat: 9.9907, lon: -83.0360 },
  { name: "San Jose", country: "Costa Rica", lat: 9.9281, lon: -84.0907 },

  // ============================================================
  // COTE D'IVOIRE
  // ============================================================
  { name: "Abidjan", country: "Cote d'Ivoire", lat: 5.3600, lon: -4.0083 },
  { name: "Bouake", country: "Cote d'Ivoire", lat: 7.6906, lon: -5.0091 },
  { name: "Yamoussoukro", country: "Cote d'Ivoire", lat: 6.8276, lon: -5.2893 },

  // ============================================================
  // CROATIA
  // ============================================================
  { name: "Dubrovnik", country: "Croatia", lat: 42.6507, lon: 18.0944 },
  { name: "Rijeka", country: "Croatia", lat: 45.3271, lon: 14.4422 },
  { name: "Split", country: "Croatia", lat: 43.5081, lon: 16.4402 },
  { name: "Zagreb", country: "Croatia", lat: 45.8150, lon: 15.9819 },

  // ============================================================
  // CUBA
  // ============================================================
  { name: "Camaguey", country: "Cuba", lat: 21.3808, lon: -77.9169 },
  { name: "Havana", country: "Cuba", lat: 23.1136, lon: -82.3666 },
  { name: "Santiago de Cuba", country: "Cuba", lat: 20.0170, lon: -75.8301 },

  // ============================================================
  // CYPRUS
  // ============================================================
  { name: "Larnaca", country: "Cyprus", lat: 34.9229, lon: 33.6233 },
  { name: "Limassol", country: "Cyprus", lat: 34.6841, lon: 33.0379 },
  { name: "Nicosia", country: "Cyprus", lat: 35.1856, lon: 33.3823 },

  // ============================================================
  // CZECH REPUBLIC
  // ============================================================
  { name: "Brno", country: "Czech Republic", lat: 49.1951, lon: 16.6068 },
  { name: "Ostrava", country: "Czech Republic", lat: 49.8209, lon: 18.2625 },
  { name: "Plzen", country: "Czech Republic", lat: 49.7384, lon: 13.3736 },
  { name: "Prague", country: "Czech Republic", lat: 50.0755, lon: 14.4378 },

  // ============================================================
  // DEMOCRATIC REPUBLIC OF THE CONGO
  // ============================================================
  { name: "Kinshasa", country: "Democratic Republic of the Congo", lat: -4.4419, lon: 15.2663 },
  { name: "Lubumbashi", country: "Democratic Republic of the Congo", lat: -11.6876, lon: 27.5026 },
  { name: "Mbuji-Mayi", country: "Democratic Republic of the Congo", lat: -6.1500, lon: 23.6000 },

  // ============================================================
  // DENMARK
  // ============================================================
  { name: "Aarhus", country: "Denmark", lat: 56.1629, lon: 10.2039 },
  { name: "Aalborg", country: "Denmark", lat: 57.0488, lon: 9.9217 },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lon: 12.5683 },
  { name: "Odense", country: "Denmark", lat: 55.4038, lon: 10.4024 },

  // ============================================================
  // DJIBOUTI
  // ============================================================
  { name: "Djibouti", country: "Djibouti", lat: 11.5881, lon: 43.1456 },

  // ============================================================
  // DOMINICAN REPUBLIC
  // ============================================================
  { name: "Punta Cana", country: "Dominican Republic", lat: 18.5601, lon: -68.3725 },
  { name: "Santiago de los Caballeros", country: "Dominican Republic", lat: 19.4517, lon: -70.6970 },
  { name: "Santo Domingo", country: "Dominican Republic", lat: 18.4861, lon: -69.9312 },

  // ============================================================
  // ECUADOR
  // ============================================================
  { name: "Cuenca", country: "Ecuador", lat: -2.9001, lon: -79.0059 },
  { name: "Guayaquil", country: "Ecuador", lat: -2.1710, lon: -79.9224 },
  { name: "Quito", country: "Ecuador", lat: -0.1807, lon: -78.4678 },

  // ============================================================
  // EGYPT
  // ============================================================
  { name: "Alexandria", country: "Egypt", lat: 31.2001, lon: 29.9187 },
  { name: "Aswan", country: "Egypt", lat: 24.0889, lon: 32.8998 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "Giza", country: "Egypt", lat: 30.0131, lon: 31.2089 },
  { name: "Hurghada", country: "Egypt", lat: 27.2579, lon: 33.8116 },
  { name: "Luxor", country: "Egypt", lat: 25.6872, lon: 32.6396 },
  { name: "Port Said", country: "Egypt", lat: 31.2653, lon: 32.3019 },
  { name: "Sharm El Sheikh", country: "Egypt", lat: 27.9158, lon: 34.3300 },

  // ============================================================
  // EL SALVADOR
  // ============================================================
  { name: "San Salvador", country: "El Salvador", lat: 13.6929, lon: -89.2182 },
  { name: "Santa Ana", country: "El Salvador", lat: 13.9942, lon: -89.5597 },

  // ============================================================
  // ERITREA
  // ============================================================
  { name: "Asmara", country: "Eritrea", lat: 15.3229, lon: 38.9251 },

  // ============================================================
  // ESTONIA
  // ============================================================
  { name: "Tallinn", country: "Estonia", lat: 59.4370, lon: 24.7536 },
  { name: "Tartu", country: "Estonia", lat: 58.3780, lon: 26.7290 },

  // ============================================================
  // ESWATINI
  // ============================================================
  { name: "Mbabane", country: "Eswatini", lat: -26.3054, lon: 31.1367 },

  // ============================================================
  // ETHIOPIA
  // ============================================================
  { name: "Addis Ababa", country: "Ethiopia", lat: 9.0250, lon: 38.7469 },
  { name: "Dire Dawa", country: "Ethiopia", lat: 9.6009, lon: 41.8503 },

  // ============================================================
  // FIJI
  // ============================================================
  { name: "Nadi", country: "Fiji", lat: -17.7765, lon: 177.9500 },
  { name: "Suva", country: "Fiji", lat: -18.1416, lon: 178.4419 },

  // ============================================================
  // FINLAND
  // ============================================================
  { name: "Espoo", country: "Finland", lat: 60.2055, lon: 24.6559 },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384 },
  { name: "Oulu", country: "Finland", lat: 65.0121, lon: 25.4651 },
  { name: "Rovaniemi", country: "Finland", lat: 66.5039, lon: 25.7294 },
  { name: "Tampere", country: "Finland", lat: 61.4978, lon: 23.7610 },
  { name: "Turku", country: "Finland", lat: 60.4518, lon: 22.2666 },

  // ============================================================
  // FRANCE
  // ============================================================
  { name: "Bordeaux", country: "France", lat: 44.8378, lon: -0.5792 },
  { name: "Grenoble", country: "France", lat: 45.1885, lon: 5.7245 },
  { name: "Lille", country: "France", lat: 50.6292, lon: 3.0573 },
  { name: "Lyon", country: "France", lat: 45.7640, lon: 4.8357 },
  { name: "Marseille", country: "France", lat: 43.2965, lon: 5.3698 },
  { name: "Montpellier", country: "France", lat: 43.6108, lon: 3.8767 },
  { name: "Nantes", country: "France", lat: 47.2184, lon: -1.5536 },
  { name: "Nice", country: "France", lat: 43.7102, lon: 7.2620 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Rennes", country: "France", lat: 48.1173, lon: -1.6778 },
  { name: "Strasbourg", country: "France", lat: 48.5734, lon: 7.7521 },
  { name: "Toulouse", country: "France", lat: 43.6047, lon: 1.4442 },

  // ============================================================
  // GABON
  // ============================================================
  { name: "Libreville", country: "Gabon", lat: 0.4162, lon: 9.4673 },

  // ============================================================
  // GAMBIA
  // ============================================================
  { name: "Banjul", country: "Gambia", lat: 13.4549, lon: -16.5790 },

  // ============================================================
  // GEORGIA
  // ============================================================
  { name: "Batumi", country: "Georgia", lat: 41.6168, lon: 41.6367 },
  { name: "Tbilisi", country: "Georgia", lat: 41.7151, lon: 44.8271 },

  // ============================================================
  // GERMANY
  // ============================================================
  { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050 },
  { name: "Bonn", country: "Germany", lat: 50.7374, lon: 7.0982 },
  { name: "Bremen", country: "Germany", lat: 53.0793, lon: 8.8017 },
  { name: "Cologne", country: "Germany", lat: 50.9375, lon: 6.9603 },
  { name: "Dortmund", country: "Germany", lat: 51.5136, lon: 7.4653 },
  { name: "Dresden", country: "Germany", lat: 51.0504, lon: 13.7373 },
  { name: "Dusseldorf", country: "Germany", lat: 51.2277, lon: 6.7735 },
  { name: "Essen", country: "Germany", lat: 51.4556, lon: 7.0116 },
  { name: "Frankfurt", country: "Germany", lat: 50.1109, lon: 8.6821 },
  { name: "Hamburg", country: "Germany", lat: 53.5511, lon: 9.9937 },
  { name: "Hanover", country: "Germany", lat: 52.3759, lon: 9.7320 },
  { name: "Heidelberg", country: "Germany", lat: 49.3988, lon: 8.6724 },
  { name: "Leipzig", country: "Germany", lat: 51.3397, lon: 12.3731 },
  { name: "Munich", country: "Germany", lat: 48.1351, lon: 11.5820 },
  { name: "Nuremberg", country: "Germany", lat: 49.4521, lon: 11.0767 },
  { name: "Stuttgart", country: "Germany", lat: 48.7758, lon: 9.1829 },

  // ============================================================
  // GHANA
  // ============================================================
  { name: "Accra", country: "Ghana", lat: 5.6037, lon: -0.1870 },
  { name: "Kumasi", country: "Ghana", lat: 6.6885, lon: -1.6244 },
  { name: "Tamale", country: "Ghana", lat: 9.4008, lon: -0.8393 },

  // ============================================================
  // GREECE
  // ============================================================
  { name: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275 },
  { name: "Heraklion", country: "Greece", lat: 35.3387, lon: 25.1442 },
  { name: "Patras", country: "Greece", lat: 38.2466, lon: 21.7346 },
  { name: "Thessaloniki", country: "Greece", lat: 40.6401, lon: 22.9444 },

  // ============================================================
  // GUATEMALA
  // ============================================================
  { name: "Antigua Guatemala", country: "Guatemala", lat: 14.5586, lon: -90.7295 },
  { name: "Guatemala City", country: "Guatemala", lat: 14.6349, lon: -90.5069 },
  { name: "Quetzaltenango", country: "Guatemala", lat: 14.8347, lon: -91.5185 },

  // ============================================================
  // GUINEA
  // ============================================================
  { name: "Conakry", country: "Guinea", lat: 9.6412, lon: -13.5784 },

  // ============================================================
  // GUYANA
  // ============================================================
  { name: "Georgetown", country: "Guyana", lat: 6.8013, lon: -58.1551 },

  // ============================================================
  // HAITI
  // ============================================================
  { name: "Cap-Haitien", country: "Haiti", lat: 19.7578, lon: -72.2042 },
  { name: "Port-au-Prince", country: "Haiti", lat: 18.5944, lon: -72.3074 },

  // ============================================================
  // HONDURAS
  // ============================================================
  { name: "San Pedro Sula", country: "Honduras", lat: 15.5000, lon: -88.0333 },
  { name: "Tegucigalpa", country: "Honduras", lat: 14.0723, lon: -87.1921 },

  // ============================================================
  // HUNGARY
  // ============================================================
  { name: "Budapest", country: "Hungary", lat: 47.4979, lon: 19.0402 },
  { name: "Debrecen", country: "Hungary", lat: 47.5316, lon: 21.6273 },
  { name: "Szeged", country: "Hungary", lat: 46.2530, lon: 20.1414 },

  // ============================================================
  // ICELAND
  // ============================================================
  { name: "Akureyri", country: "Iceland", lat: 65.6835, lon: -18.0878 },
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lon: -21.9426 },

  // ============================================================
  // INDIA
  // ============================================================
  { name: "Agra", country: "India", lat: 27.1767, lon: 78.0081 },
  { name: "Ahmedabad", country: "India", lat: 23.0225, lon: 72.5714 },
  { name: "Amritsar", country: "India", lat: 31.6340, lon: 74.8723 },
  { name: "Bangalore", country: "India", lat: 12.9716, lon: 77.5946 },
  { name: "Bhopal", country: "India", lat: 23.2599, lon: 77.4126 },
  { name: "Bhubaneswar", country: "India", lat: 20.2961, lon: 85.8245 },
  { name: "Chandigarh", country: "India", lat: 30.7333, lon: 76.7794 },
  { name: "Chennai", country: "India", lat: 13.0827, lon: 80.2707 },
  { name: "Coimbatore", country: "India", lat: 11.0168, lon: 76.9558 },
  { name: "Dehradun", country: "India", lat: 30.3165, lon: 78.0322 },
  { name: "Delhi", country: "India", lat: 28.7041, lon: 77.1025 },
  { name: "Goa", country: "India", lat: 15.2993, lon: 74.1240 },
  { name: "Guwahati", country: "India", lat: 26.1445, lon: 91.7362 },
  { name: "Hyderabad", country: "India", lat: 17.3850, lon: 78.4867 },
  { name: "Indore", country: "India", lat: 22.7196, lon: 75.8577 },
  { name: "Jaipur", country: "India", lat: 26.9124, lon: 75.7873 },
  { name: "Jodhpur", country: "India", lat: 26.2389, lon: 73.0243 },
  { name: "Kanpur", country: "India", lat: 26.4499, lon: 80.3319 },
  { name: "Kochi", country: "India", lat: 9.9312, lon: 76.2673 },
  { name: "Kolkata", country: "India", lat: 22.5726, lon: 88.3639 },
  { name: "Lucknow", country: "India", lat: 26.8467, lon: 80.9462 },
  { name: "Ludhiana", country: "India", lat: 30.9010, lon: 75.8573 },
  { name: "Madurai", country: "India", lat: 9.9252, lon: 78.1198 },
  { name: "Mangalore", country: "India", lat: 12.9141, lon: 74.8560 },
  { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
  { name: "Mysore", country: "India", lat: 12.2958, lon: 76.6394 },
  { name: "Nagpur", country: "India", lat: 21.1458, lon: 79.0882 },
  { name: "Patna", country: "India", lat: 25.6093, lon: 85.1376 },
  { name: "Pune", country: "India", lat: 18.5204, lon: 73.8567 },
  { name: "Ranchi", country: "India", lat: 23.3441, lon: 85.3096 },
  { name: "Shimla", country: "India", lat: 31.1048, lon: 77.1734 },
  { name: "Srinagar", country: "India", lat: 34.0837, lon: 74.7973 },
  { name: "Surat", country: "India", lat: 21.1702, lon: 72.8311 },
  { name: "Thiruvananthapuram", country: "India", lat: 8.5241, lon: 76.9366 },
  { name: "Tiruchirappalli", country: "India", lat: 10.7905, lon: 78.7047 },
  { name: "Udaipur", country: "India", lat: 24.5854, lon: 73.7125 },
  { name: "Vadodara", country: "India", lat: 22.3072, lon: 73.1812 },
  { name: "Varanasi", country: "India", lat: 25.3176, lon: 82.9739 },
  { name: "Vijayawada", country: "India", lat: 16.5062, lon: 80.6480 },
  { name: "Visakhapatnam", country: "India", lat: 17.6868, lon: 83.2185 },

  // ============================================================
  // INDONESIA
  // ============================================================
  { name: "Balikpapan", country: "Indonesia", lat: -1.2654, lon: 116.8312 },
  { name: "Bandung", country: "Indonesia", lat: -6.9175, lon: 107.6191 },
  { name: "Denpasar", country: "Indonesia", lat: -8.6705, lon: 115.2126 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 },
  { name: "Makassar", country: "Indonesia", lat: -5.1477, lon: 119.4327 },
  { name: "Malang", country: "Indonesia", lat: -7.9666, lon: 112.6326 },
  { name: "Medan", country: "Indonesia", lat: 3.5952, lon: 98.6722 },
  { name: "Palembang", country: "Indonesia", lat: -2.9761, lon: 104.7754 },
  { name: "Semarang", country: "Indonesia", lat: -6.9932, lon: 110.4203 },
  { name: "Surabaya", country: "Indonesia", lat: -7.2575, lon: 112.7521 },
  { name: "Yogyakarta", country: "Indonesia", lat: -7.7956, lon: 110.3695 },

  // ============================================================
  // IRAN
  // ============================================================
  { name: "Esfahan", country: "Iran", lat: 32.6546, lon: 51.6680 },
  { name: "Mashhad", country: "Iran", lat: 36.2605, lon: 59.6168 },
  { name: "Shiraz", country: "Iran", lat: 29.5918, lon: 52.5837 },
  { name: "Tabriz", country: "Iran", lat: 38.0800, lon: 46.2919 },
  { name: "Tehran", country: "Iran", lat: 35.6892, lon: 51.3890 },

  // ============================================================
  // IRAQ
  // ============================================================
  { name: "Baghdad", country: "Iraq", lat: 33.3128, lon: 44.3615 },
  { name: "Basra", country: "Iraq", lat: 30.5085, lon: 47.7804 },
  { name: "Erbil", country: "Iraq", lat: 36.1912, lon: 44.0119 },
  { name: "Mosul", country: "Iraq", lat: 36.3350, lon: 43.1189 },

  // ============================================================
  // IRELAND
  // ============================================================
  { name: "Cork", country: "Ireland", lat: 51.8969, lon: -8.4863 },
  { name: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603 },
  { name: "Galway", country: "Ireland", lat: 53.2707, lon: -9.0568 },
  { name: "Limerick", country: "Ireland", lat: 52.6638, lon: -8.6267 },
  { name: "Waterford", country: "Ireland", lat: 52.2593, lon: -7.1101 },

  // ============================================================
  // ISRAEL
  // ============================================================
  { name: "Eilat", country: "Israel", lat: 29.5577, lon: 34.9519 },
  { name: "Haifa", country: "Israel", lat: 32.7940, lon: 34.9896 },
  { name: "Jerusalem", country: "Israel", lat: 31.7683, lon: 35.2137 },
  { name: "Tel Aviv", country: "Israel", lat: 32.0853, lon: 34.7818 },

  // ============================================================
  // ITALY
  // ============================================================
  { name: "Bari", country: "Italy", lat: 41.1171, lon: 16.8719 },
  { name: "Bologna", country: "Italy", lat: 44.4949, lon: 11.3426 },
  { name: "Catania", country: "Italy", lat: 37.5079, lon: 15.0830 },
  { name: "Florence", country: "Italy", lat: 43.7696, lon: 11.2558 },
  { name: "Genoa", country: "Italy", lat: 44.4056, lon: 8.9463 },
  { name: "Milan", country: "Italy", lat: 45.4642, lon: 9.1900 },
  { name: "Naples", country: "Italy", lat: 40.8518, lon: 14.2681 },
  { name: "Palermo", country: "Italy", lat: 38.1157, lon: 13.3615 },
  { name: "Pisa", country: "Italy", lat: 43.7228, lon: 10.4017 },
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Turin", country: "Italy", lat: 45.0703, lon: 7.6869 },
  { name: "Venice", country: "Italy", lat: 45.4408, lon: 12.3155 },
  { name: "Verona", country: "Italy", lat: 45.4384, lon: 10.9916 },

  // ============================================================
  // JAMAICA
  // ============================================================
  { name: "Kingston", country: "Jamaica", lat: 18.0179, lon: -76.8099 },
  { name: "Montego Bay", country: "Jamaica", lat: 18.4762, lon: -77.8939 },

  // ============================================================
  // JAPAN
  // ============================================================
  { name: "Fukuoka", country: "Japan", lat: 33.5904, lon: 130.4017 },
  { name: "Hamamatsu", country: "Japan", lat: 34.7108, lon: 137.7261 },
  { name: "Hiroshima", country: "Japan", lat: 34.3853, lon: 132.4553 },
  { name: "Kagoshima", country: "Japan", lat: 31.5966, lon: 130.5571 },
  { name: "Kanazawa", country: "Japan", lat: 36.5613, lon: 136.6562 },
  { name: "Kawasaki", country: "Japan", lat: 35.5308, lon: 139.7030 },
  { name: "Kobe", country: "Japan", lat: 34.6901, lon: 135.1956 },
  { name: "Kumamoto", country: "Japan", lat: 32.8032, lon: 130.7079 },
  { name: "Kyoto", country: "Japan", lat: 35.0116, lon: 135.7681 },
  { name: "Nagasaki", country: "Japan", lat: 32.7503, lon: 129.8779 },
  { name: "Nagoya", country: "Japan", lat: 35.1815, lon: 136.9066 },
  { name: "Naha", country: "Japan", lat: 26.3344, lon: 127.6809 },
  { name: "Niigata", country: "Japan", lat: 37.9161, lon: 139.0364 },
  { name: "Okayama", country: "Japan", lat: 34.6551, lon: 133.9195 },
  { name: "Osaka", country: "Japan", lat: 34.6937, lon: 135.5023 },
  { name: "Saitama", country: "Japan", lat: 35.8617, lon: 139.6455 },
  { name: "Sapporo", country: "Japan", lat: 43.0618, lon: 141.3545 },
  { name: "Sendai", country: "Japan", lat: 38.2682, lon: 140.8694 },
  { name: "Shizuoka", country: "Japan", lat: 34.9756, lon: 138.3828 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Yokohama", country: "Japan", lat: 35.4437, lon: 139.6380 },

  // ============================================================
  // JORDAN
  // ============================================================
  { name: "Amman", country: "Jordan", lat: 31.9454, lon: 35.9284 },
  { name: "Aqaba", country: "Jordan", lat: 29.5321, lon: 35.0063 },
  { name: "Irbid", country: "Jordan", lat: 32.5556, lon: 35.8500 },

  // ============================================================
  // KAZAKHSTAN
  // ============================================================
  { name: "Almaty", country: "Kazakhstan", lat: 43.2220, lon: 76.8512 },
  { name: "Astana", country: "Kazakhstan", lat: 51.1694, lon: 71.4491 },
  { name: "Karaganda", country: "Kazakhstan", lat: 49.8047, lon: 73.1094 },
  { name: "Shymkent", country: "Kazakhstan", lat: 42.3417, lon: 69.5967 },

  // ============================================================
  // KENYA
  // ============================================================
  { name: "Kisumu", country: "Kenya", lat: -0.0917, lon: 34.7680 },
  { name: "Mombasa", country: "Kenya", lat: -4.0435, lon: 39.6682 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219 },
  { name: "Nakuru", country: "Kenya", lat: -0.3031, lon: 36.0800 },

  // ============================================================
  // KUWAIT
  // ============================================================
  { name: "Kuwait City", country: "Kuwait", lat: 29.3759, lon: 47.9774 },

  // ============================================================
  // KYRGYZSTAN
  // ============================================================
  { name: "Bishkek", country: "Kyrgyzstan", lat: 42.8746, lon: 74.5698 },

  // ============================================================
  // LAOS
  // ============================================================
  { name: "Luang Prabang", country: "Laos", lat: 19.8856, lon: 102.1347 },
  { name: "Vientiane", country: "Laos", lat: 17.9757, lon: 102.6331 },

  // ============================================================
  // LATVIA
  // ============================================================
  { name: "Riga", country: "Latvia", lat: 56.9496, lon: 24.1052 },

  // ============================================================
  // LEBANON
  // ============================================================
  { name: "Beirut", country: "Lebanon", lat: 33.8938, lon: 35.5018 },
  { name: "Tripoli", country: "Lebanon", lat: 34.4367, lon: 35.8497 },

  // ============================================================
  // LESOTHO
  // ============================================================
  { name: "Maseru", country: "Lesotho", lat: -29.3151, lon: 27.4869 },

  // ============================================================
  // LIBERIA
  // ============================================================
  { name: "Monrovia", country: "Liberia", lat: 6.3156, lon: -10.8074 },

  // ============================================================
  // LIBYA
  // ============================================================
  { name: "Benghazi", country: "Libya", lat: 32.1194, lon: 20.0868 },
  { name: "Tripoli", country: "Libya", lat: 32.8872, lon: 13.1913 },

  // ============================================================
  // LITHUANIA
  // ============================================================
  { name: "Kaunas", country: "Lithuania", lat: 54.8985, lon: 23.9036 },
  { name: "Vilnius", country: "Lithuania", lat: 54.6872, lon: 25.2797 },

  // ============================================================
  // LUXEMBOURG
  // ============================================================
  { name: "Luxembourg City", country: "Luxembourg", lat: 49.6116, lon: 6.1319 },

  // ============================================================
  // MADAGASCAR
  // ============================================================
  { name: "Antananarivo", country: "Madagascar", lat: -18.8792, lon: 47.5079 },

  // ============================================================
  // MALAWI
  // ============================================================
  { name: "Blantyre", country: "Malawi", lat: -15.7862, lon: 35.0058 },
  { name: "Lilongwe", country: "Malawi", lat: -13.9626, lon: 33.7741 },

  // ============================================================
  // MALAYSIA
  // ============================================================
  { name: "George Town", country: "Malaysia", lat: 5.4141, lon: 100.3288 },
  { name: "Ipoh", country: "Malaysia", lat: 4.5975, lon: 101.0901 },
  { name: "Johor Bahru", country: "Malaysia", lat: 1.4927, lon: 103.7414 },
  { name: "Kota Kinabalu", country: "Malaysia", lat: 5.9804, lon: 116.0735 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lon: 101.6869 },
  { name: "Kuching", country: "Malaysia", lat: 1.5497, lon: 110.3634 },
  { name: "Langkawi", country: "Malaysia", lat: 6.3500, lon: 99.8000 },
  { name: "Malacca", country: "Malaysia", lat: 2.1896, lon: 102.2501 },

  // ============================================================
  // MALDIVES
  // ============================================================
  { name: "Male", country: "Maldives", lat: 4.1755, lon: 73.5093 },

  // ============================================================
  // MALI
  // ============================================================
  { name: "Bamako", country: "Mali", lat: 12.6392, lon: -8.0029 },
  { name: "Timbuktu", country: "Mali", lat: 16.7735, lon: -3.0074 },

  // ============================================================
  // MALTA
  // ============================================================
  { name: "Valletta", country: "Malta", lat: 35.8989, lon: 14.5146 },

  // ============================================================
  // MAURITANIA
  // ============================================================
  { name: "Nouakchott", country: "Mauritania", lat: 18.0735, lon: -15.9582 },

  // ============================================================
  // MAURITIUS
  // ============================================================
  { name: "Port Louis", country: "Mauritius", lat: -20.1609, lon: 57.5012 },

  // ============================================================
  // MEXICO
  // ============================================================
  { name: "Acapulco", country: "Mexico", lat: 16.8531, lon: -99.8237 },
  { name: "Aguascalientes", country: "Mexico", lat: 21.8853, lon: -102.2916 },
  { name: "Cancun", country: "Mexico", lat: 21.1619, lon: -86.8515 },
  { name: "Chihuahua", country: "Mexico", lat: 28.6353, lon: -106.0889 },
  { name: "Ciudad Juarez", country: "Mexico", lat: 31.6904, lon: -106.4245 },
  { name: "Cuernavaca", country: "Mexico", lat: 18.9242, lon: -99.2216 },
  { name: "Culiacan", country: "Mexico", lat: 24.7994, lon: -107.3897 },
  { name: "Durango", country: "Mexico", lat: 24.0277, lon: -104.6532 },
  { name: "Guadalajara", country: "Mexico", lat: 20.6597, lon: -103.3496 },
  { name: "Hermosillo", country: "Mexico", lat: 29.0729, lon: -110.9559 },
  { name: "Leon", country: "Mexico", lat: 21.1250, lon: -101.6860 },
  { name: "Mazatlan", country: "Mexico", lat: 23.2494, lon: -106.4111 },
  { name: "Merida", country: "Mexico", lat: 20.9674, lon: -89.5926 },
  { name: "Mexicali", country: "Mexico", lat: 32.6245, lon: -115.4523 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "Monterrey", country: "Mexico", lat: 25.6866, lon: -100.3161 },
  { name: "Morelia", country: "Mexico", lat: 19.7060, lon: -101.1950 },
  { name: "Oaxaca", country: "Mexico", lat: 17.0732, lon: -96.7266 },
  { name: "Playa del Carmen", country: "Mexico", lat: 20.6296, lon: -87.0739 },
  { name: "Puebla", country: "Mexico", lat: 19.0414, lon: -98.2063 },
  { name: "Puerto Vallarta", country: "Mexico", lat: 20.6534, lon: -105.2253 },
  { name: "Queretaro", country: "Mexico", lat: 20.5888, lon: -100.3899 },
  { name: "Saltillo", country: "Mexico", lat: 25.4232, lon: -100.9924 },
  { name: "San Luis Potosi", country: "Mexico", lat: 22.1565, lon: -100.9855 },
  { name: "Tampico", country: "Mexico", lat: 22.2331, lon: -97.8613 },
  { name: "Tijuana", country: "Mexico", lat: 32.5149, lon: -117.0382 },
  { name: "Toluca", country: "Mexico", lat: 19.2826, lon: -99.6557 },
  { name: "Torreon", country: "Mexico", lat: 25.5428, lon: -103.4068 },
  { name: "Tuxtla Gutierrez", country: "Mexico", lat: 16.7528, lon: -93.1153 },
  { name: "Veracruz", country: "Mexico", lat: 19.1738, lon: -96.1342 },
  { name: "Villahermosa", country: "Mexico", lat: 17.9894, lon: -92.9475 },
  { name: "Zacatecas", country: "Mexico", lat: 22.7709, lon: -102.5832 },

  // ============================================================
  // MOLDOVA
  // ============================================================
  { name: "Chisinau", country: "Moldova", lat: 47.0105, lon: 28.8638 },

  // ============================================================
  // MONGOLIA
  // ============================================================
  { name: "Ulaanbaatar", country: "Mongolia", lat: 47.8864, lon: 106.9057 },

  // ============================================================
  // MONTENEGRO
  // ============================================================
  { name: "Podgorica", country: "Montenegro", lat: 42.4304, lon: 19.2594 },

  // ============================================================
  // MOROCCO
  // ============================================================
  { name: "Agadir", country: "Morocco", lat: 30.4278, lon: -9.5981 },
  { name: "Casablanca", country: "Morocco", lat: 33.5731, lon: -7.5898 },
  { name: "Fez", country: "Morocco", lat: 34.0181, lon: -5.0078 },
  { name: "Marrakech", country: "Morocco", lat: 31.6295, lon: -7.9811 },
  { name: "Meknes", country: "Morocco", lat: 33.8935, lon: -5.5547 },
  { name: "Rabat", country: "Morocco", lat: 34.0209, lon: -6.8416 },
  { name: "Tangier", country: "Morocco", lat: 35.7595, lon: -5.8340 },

  // ============================================================
  // MOZAMBIQUE
  // ============================================================
  { name: "Beira", country: "Mozambique", lat: -19.8436, lon: 34.8389 },
  { name: "Maputo", country: "Mozambique", lat: -25.9692, lon: 32.5732 },
  { name: "Nampula", country: "Mozambique", lat: -15.1165, lon: 39.2666 },

  // ============================================================
  // MYANMAR
  // ============================================================
  { name: "Mandalay", country: "Myanmar", lat: 21.9588, lon: 96.0891 },
  { name: "Naypyidaw", country: "Myanmar", lat: 19.7633, lon: 96.0785 },
  { name: "Yangon", country: "Myanmar", lat: 16.8661, lon: 96.1951 },

  // ============================================================
  // NAMIBIA
  // ============================================================
  { name: "Windhoek", country: "Namibia", lat: -22.5609, lon: 17.0658 },

  // ============================================================
  // NEPAL
  // ============================================================
  { name: "Kathmandu", country: "Nepal", lat: 27.7172, lon: 85.3240 },
  { name: "Pokhara", country: "Nepal", lat: 28.2096, lon: 83.9856 },

  // ============================================================
  // NETHERLANDS
  // ============================================================
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
  { name: "Eindhoven", country: "Netherlands", lat: 51.4416, lon: 5.4697 },
  { name: "Groningen", country: "Netherlands", lat: 53.2194, lon: 6.5665 },
  { name: "Maastricht", country: "Netherlands", lat: 50.8514, lon: 5.6910 },
  { name: "Rotterdam", country: "Netherlands", lat: 51.9244, lon: 4.4777 },
  { name: "The Hague", country: "Netherlands", lat: 52.0705, lon: 4.3007 },
  { name: "Utrecht", country: "Netherlands", lat: 52.0907, lon: 5.1214 },

  // ============================================================
  // NEW CALEDONIA
  // ============================================================
  { name: "Noumea", country: "New Caledonia", lat: -22.2558, lon: 166.4505 },

  // ============================================================
  // NEW ZEALAND
  // ============================================================
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lon: 174.7633 },
  { name: "Christchurch", country: "New Zealand", lat: -43.5321, lon: 172.6362 },
  { name: "Dunedin", country: "New Zealand", lat: -45.8788, lon: 170.5028 },
  { name: "Hamilton", country: "New Zealand", lat: -37.7870, lon: 175.2793 },
  { name: "Napier", country: "New Zealand", lat: -39.4928, lon: 176.9120 },
  { name: "Queenstown", country: "New Zealand", lat: -45.0312, lon: 168.6626 },
  { name: "Rotorua", country: "New Zealand", lat: -38.1368, lon: 176.2497 },
  { name: "Tauranga", country: "New Zealand", lat: -37.6878, lon: 176.1651 },
  { name: "Wellington", country: "New Zealand", lat: -41.2865, lon: 174.7762 },

  // ============================================================
  // NICARAGUA
  // ============================================================
  { name: "Leon", country: "Nicaragua", lat: 12.4379, lon: -86.8780 },
  { name: "Managua", country: "Nicaragua", lat: 12.1149, lon: -86.2362 },

  // ============================================================
  // NIGER
  // ============================================================
  { name: "Niamey", country: "Niger", lat: 13.5127, lon: 2.1128 },

  // ============================================================
  // NIGERIA
  // ============================================================
  { name: "Abuja", country: "Nigeria", lat: 9.0765, lon: 7.3986 },
  { name: "Benin City", country: "Nigeria", lat: 6.3350, lon: 5.6037 },
  { name: "Calabar", country: "Nigeria", lat: 4.9517, lon: 8.3220 },
  { name: "Enugu", country: "Nigeria", lat: 6.4584, lon: 7.5464 },
  { name: "Ibadan", country: "Nigeria", lat: 7.3775, lon: 3.9470 },
  { name: "Jos", country: "Nigeria", lat: 9.8965, lon: 8.8583 },
  { name: "Kaduna", country: "Nigeria", lat: 10.5105, lon: 7.4165 },
  { name: "Kano", country: "Nigeria", lat: 12.0022, lon: 8.5920 },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
  { name: "Maiduguri", country: "Nigeria", lat: 11.8311, lon: 13.1510 },
  { name: "Ogbomosho", country: "Nigeria", lat: 8.1227, lon: 4.2436 },
  { name: "Onitsha", country: "Nigeria", lat: 6.1667, lon: 6.7833 },
  { name: "Port Harcourt", country: "Nigeria", lat: 4.8156, lon: 7.0498 },
  { name: "Warri", country: "Nigeria", lat: 5.5167, lon: 5.7500 },
  { name: "Zaria", country: "Nigeria", lat: 11.0667, lon: 7.7000 },

  // ============================================================
  // NORTH MACEDONIA
  // ============================================================
  { name: "Skopje", country: "North Macedonia", lat: 41.9981, lon: 21.4254 },

  // ============================================================
  // NORWAY
  // ============================================================
  { name: "Bergen", country: "Norway", lat: 60.3913, lon: 5.3221 },
  { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522 },
  { name: "Stavanger", country: "Norway", lat: 58.9700, lon: 5.7331 },
  { name: "Tromso", country: "Norway", lat: 69.6492, lon: 18.9553 },
  { name: "Trondheim", country: "Norway", lat: 63.4305, lon: 10.3951 },

  // ============================================================
  // OMAN
  // ============================================================
  { name: "Muscat", country: "Oman", lat: 23.5880, lon: 58.3829 },
  { name: "Salalah", country: "Oman", lat: 17.0151, lon: 54.0924 },

  // ============================================================
  // PAKISTAN
  // ============================================================
  { name: "Faisalabad", country: "Pakistan", lat: 31.4504, lon: 73.1350 },
  { name: "Hyderabad", country: "Pakistan", lat: 25.3960, lon: 68.3578 },
  { name: "Islamabad", country: "Pakistan", lat: 33.6844, lon: 73.0479 },
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011 },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587 },
  { name: "Multan", country: "Pakistan", lat: 30.1575, lon: 71.5249 },
  { name: "Peshawar", country: "Pakistan", lat: 34.0151, lon: 71.5249 },
  { name: "Quetta", country: "Pakistan", lat: 30.1798, lon: 66.9750 },
  { name: "Rawalpindi", country: "Pakistan", lat: 33.6007, lon: 73.0679 },

  // ============================================================
  // PANAMA
  // ============================================================
  { name: "Colon", country: "Panama", lat: 9.3590, lon: -79.9012 },
  { name: "David", country: "Panama", lat: 8.4333, lon: -82.4333 },
  { name: "Panama City", country: "Panama", lat: 8.9824, lon: -79.5199 },

  // ============================================================
  // PAPUA NEW GUINEA
  // ============================================================
  { name: "Port Moresby", country: "Papua New Guinea", lat: -6.3149, lon: 143.9556 },

  // ============================================================
  // PARAGUAY
  // ============================================================
  { name: "Asuncion", country: "Paraguay", lat: -25.2637, lon: -57.5759 },
  { name: "Ciudad del Este", country: "Paraguay", lat: -25.5097, lon: -54.6114 },

  // ============================================================
  // PERU
  // ============================================================
  { name: "Arequipa", country: "Peru", lat: -16.4090, lon: -71.5375 },
  { name: "Chiclayo", country: "Peru", lat: -6.7714, lon: -79.8409 },
  { name: "Cusco", country: "Peru", lat: -13.5320, lon: -71.9675 },
  { name: "Huancayo", country: "Peru", lat: -12.0651, lon: -75.2049 },
  { name: "Iquitos", country: "Peru", lat: -3.7491, lon: -73.2538 },
  { name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428 },
  { name: "Piura", country: "Peru", lat: -5.1783, lon: -80.6549 },
  { name: "Trujillo", country: "Peru", lat: -8.1116, lon: -79.0287 },

  // ============================================================
  // PHILIPPINES
  // ============================================================
  { name: "Cebu City", country: "Philippines", lat: 10.3157, lon: 123.8854 },
  { name: "Davao", country: "Philippines", lat: 7.1907, lon: 125.4553 },
  { name: "Iloilo City", country: "Philippines", lat: 10.7202, lon: 122.5621 },
  { name: "Makati", country: "Philippines", lat: 14.5547, lon: 121.0244 },
  { name: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842 },
  { name: "Quezon City", country: "Philippines", lat: 14.6760, lon: 121.0437 },
  { name: "Zamboanga", country: "Philippines", lat: 6.9214, lon: 122.0790 },

  // ============================================================
  // POLAND
  // ============================================================
  { name: "Gdansk", country: "Poland", lat: 54.3520, lon: 18.6466 },
  { name: "Katowice", country: "Poland", lat: 50.2649, lon: 19.0238 },
  { name: "Krakow", country: "Poland", lat: 50.0647, lon: 19.9450 },
  { name: "Lodz", country: "Poland", lat: 51.7592, lon: 19.4560 },
  { name: "Lublin", country: "Poland", lat: 51.2465, lon: 22.5684 },
  { name: "Poznan", country: "Poland", lat: 52.4064, lon: 16.9252 },
  { name: "Szczecin", country: "Poland", lat: 53.4285, lon: 14.5528 },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122 },
  { name: "Wroclaw", country: "Poland", lat: 51.1079, lon: 17.0385 },

  // ============================================================
  // PORTUGAL
  // ============================================================
  { name: "Braga", country: "Portugal", lat: 41.5518, lon: -8.4229 },
  { name: "Coimbra", country: "Portugal", lat: 40.2033, lon: -8.4103 },
  { name: "Faro", country: "Portugal", lat: 37.0194, lon: -7.9322 },
  { name: "Funchal", country: "Portugal", lat: 32.6669, lon: -16.9241 },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393 },
  { name: "Porto", country: "Portugal", lat: 41.1579, lon: -8.6291 },

  // ============================================================
  // PUERTO RICO
  // ============================================================
  { name: "Ponce", country: "Puerto Rico", lat: 18.0111, lon: -66.6141 },
  { name: "San Juan", country: "Puerto Rico", lat: 18.4655, lon: -66.1057 },

  // ============================================================
  // QATAR
  // ============================================================
  { name: "Doha", country: "Qatar", lat: 25.2854, lon: 51.5310 },

  // ============================================================
  // REPUBLIC OF THE CONGO
  // ============================================================
  { name: "Brazzaville", country: "Republic of the Congo", lat: -4.2634, lon: 15.2429 },

  // ============================================================
  // ROMANIA
  // ============================================================
  { name: "Brasov", country: "Romania", lat: 45.6427, lon: 25.5887 },
  { name: "Bucharest", country: "Romania", lat: 44.4268, lon: 26.1025 },
  { name: "Cluj-Napoca", country: "Romania", lat: 46.7712, lon: 23.6236 },
  { name: "Constanta", country: "Romania", lat: 44.1598, lon: 28.6348 },
  { name: "Iasi", country: "Romania", lat: 47.1585, lon: 27.6014 },
  { name: "Timisoara", country: "Romania", lat: 45.7489, lon: 21.2087 },

  // ============================================================
  // RUSSIA
  // ============================================================
  { name: "Chelyabinsk", country: "Russia", lat: 55.1644, lon: 61.4368 },
  { name: "Kaliningrad", country: "Russia", lat: 54.7104, lon: 20.4522 },
  { name: "Kazan", country: "Russia", lat: 55.7887, lon: 49.1221 },
  { name: "Krasnodar", country: "Russia", lat: 45.0355, lon: 38.9753 },
  { name: "Krasnoyarsk", country: "Russia", lat: 56.0153, lon: 92.8932 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
  { name: "Nizhny Novgorod", country: "Russia", lat: 56.2965, lon: 43.9361 },
  { name: "Novosibirsk", country: "Russia", lat: 55.0084, lon: 82.9357 },
  { name: "Omsk", country: "Russia", lat: 54.9885, lon: 73.3242 },
  { name: "Perm", country: "Russia", lat: 58.0105, lon: 56.2502 },
  { name: "Rostov-on-Don", country: "Russia", lat: 47.2357, lon: 39.7015 },
  { name: "Saint Petersburg", country: "Russia", lat: 59.9343, lon: 30.3351 },
  { name: "Samara", country: "Russia", lat: 53.1959, lon: 50.1002 },
  { name: "Sochi", country: "Russia", lat: 43.6028, lon: 39.7342 },
  { name: "Ufa", country: "Russia", lat: 54.7388, lon: 55.9721 },
  { name: "Vladivostok", country: "Russia", lat: 43.1332, lon: 131.9113 },
  { name: "Volgograd", country: "Russia", lat: 48.7080, lon: 44.5133 },
  { name: "Yekaterinburg", country: "Russia", lat: 56.8389, lon: 60.6057 },

  // ============================================================
  // RWANDA
  // ============================================================
  { name: "Kigali", country: "Rwanda", lat: -1.9403, lon: 29.8739 },

  // ============================================================
  // SAMOA
  // ============================================================
  { name: "Apia", country: "Samoa", lat: -13.8333, lon: -171.7500 },

  // ============================================================
  // SAUDI ARABIA
  // ============================================================
  { name: "Dammam", country: "Saudi Arabia", lat: 26.3927, lon: 49.9777 },
  { name: "Jeddah", country: "Saudi Arabia", lat: 21.4858, lon: 39.1925 },
  { name: "Mecca", country: "Saudi Arabia", lat: 21.3891, lon: 39.8579 },
  { name: "Medina", country: "Saudi Arabia", lat: 24.5247, lon: 39.5692 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753 },

  // ============================================================
  // SENEGAL
  // ============================================================
  { name: "Dakar", country: "Senegal", lat: 14.7167, lon: -17.4677 },
  { name: "Saint-Louis", country: "Senegal", lat: 16.0179, lon: -16.4897 },
  { name: "Thies", country: "Senegal", lat: 14.7910, lon: -16.9260 },

  // ============================================================
  // SERBIA
  // ============================================================
  { name: "Belgrade", country: "Serbia", lat: 44.7866, lon: 20.4489 },
  { name: "Nis", country: "Serbia", lat: 43.3209, lon: 21.8954 },
  { name: "Novi Sad", country: "Serbia", lat: 45.2671, lon: 19.8335 },

  // ============================================================
  // SIERRA LEONE
  // ============================================================
  { name: "Freetown", country: "Sierra Leone", lat: 8.4657, lon: -13.2317 },

  // ============================================================
  // SINGAPORE
  // ============================================================
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },

  // ============================================================
  // SLOVAKIA
  // ============================================================
  { name: "Bratislava", country: "Slovakia", lat: 48.1486, lon: 17.1077 },
  { name: "Kosice", country: "Slovakia", lat: 48.7164, lon: 21.2611 },

  // ============================================================
  // SLOVENIA
  // ============================================================
  { name: "Ljubljana", country: "Slovenia", lat: 46.0569, lon: 14.5058 },
  { name: "Maribor", country: "Slovenia", lat: 46.5547, lon: 15.6459 },

  // ============================================================
  // SOLOMON ISLANDS
  // ============================================================
  { name: "Honiara", country: "Solomon Islands", lat: -9.4456, lon: 159.9729 },

  // ============================================================
  // SOMALIA
  // ============================================================
  { name: "Mogadishu", country: "Somalia", lat: 2.0469, lon: 45.3182 },

  // ============================================================
  // SOUTH AFRICA
  // ============================================================
  { name: "Bloemfontein", country: "South Africa", lat: -29.0852, lon: 26.1596 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Durban", country: "South Africa", lat: -29.8587, lon: 31.0218 },
  { name: "East London", country: "South Africa", lat: -33.0292, lon: 27.8546 },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473 },
  { name: "Kimberley", country: "South Africa", lat: -28.7382, lon: 24.7719 },
  { name: "Nelspruit", country: "South Africa", lat: -25.4753, lon: 30.9694 },
  { name: "Pietermaritzburg", country: "South Africa", lat: -29.6006, lon: 30.3794 },
  { name: "Polokwane", country: "South Africa", lat: -23.9045, lon: 29.4689 },
  { name: "Port Elizabeth", country: "South Africa", lat: -33.9608, lon: 25.6022 },
  { name: "Pretoria", country: "South Africa", lat: -25.7479, lon: 28.2293 },
  { name: "Soweto", country: "South Africa", lat: -26.2227, lon: 27.8540 },

  // ============================================================
  // SOUTH KOREA
  // ============================================================
  { name: "Busan", country: "South Korea", lat: 35.1796, lon: 129.0756 },
  { name: "Daegu", country: "South Korea", lat: 35.8714, lon: 128.6014 },
  { name: "Daejeon", country: "South Korea", lat: 36.3504, lon: 127.3845 },
  { name: "Gwangju", country: "South Korea", lat: 35.1595, lon: 126.8526 },
  { name: "Incheon", country: "South Korea", lat: 37.4563, lon: 126.7052 },
  { name: "Jeju", country: "South Korea", lat: 33.4996, lon: 126.5312 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780 },
  { name: "Suwon", country: "South Korea", lat: 37.2636, lon: 127.0286 },
  { name: "Ulsan", country: "South Korea", lat: 35.5384, lon: 129.3114 },

  // ============================================================
  // SPAIN
  // ============================================================
  { name: "Alicante", country: "Spain", lat: 38.3452, lon: -0.4810 },
  { name: "Barcelona", country: "Spain", lat: 41.3874, lon: 2.1686 },
  { name: "Bilbao", country: "Spain", lat: 43.2627, lon: -2.9253 },
  { name: "Cordoba", country: "Spain", lat: 37.8882, lon: -4.7794 },
  { name: "Granada", country: "Spain", lat: 37.1773, lon: -3.5986 },
  { name: "Las Palmas", country: "Spain", lat: 28.1235, lon: -15.4363 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
  { name: "Malaga", country: "Spain", lat: 36.7213, lon: -4.4214 },
  { name: "Murcia", country: "Spain", lat: 37.9922, lon: -1.1307 },
  { name: "Palma de Mallorca", country: "Spain", lat: 39.5696, lon: 2.6502 },
  { name: "San Sebastian", country: "Spain", lat: 43.3183, lon: -1.9812 },
  { name: "Santa Cruz de Tenerife", country: "Spain", lat: 28.4636, lon: -16.2518 },
  { name: "Seville", country: "Spain", lat: 37.3891, lon: -5.9845 },
  { name: "Valencia", country: "Spain", lat: 39.4699, lon: -0.3763 },
  { name: "Zaragoza", country: "Spain", lat: 41.6488, lon: -0.8891 },

  // ============================================================
  // SRI LANKA
  // ============================================================
  { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lon: 79.8612 },
  { name: "Galle", country: "Sri Lanka", lat: 6.0535, lon: 80.2210 },
  { name: "Kandy", country: "Sri Lanka", lat: 7.2906, lon: 80.6337 },

  // ============================================================
  // SUDAN
  // ============================================================
  { name: "Khartoum", country: "Sudan", lat: 15.5007, lon: 32.5599 },
  { name: "Omdurman", country: "Sudan", lat: 15.6866, lon: 32.4752 },

  // ============================================================
  // SURINAME
  // ============================================================
  { name: "Paramaribo", country: "Suriname", lat: 5.8520, lon: -55.2038 },

  // ============================================================
  // SWEDEN
  // ============================================================
  { name: "Gothenburg", country: "Sweden", lat: 57.7089, lon: 11.9746 },
  { name: "Linkoping", country: "Sweden", lat: 58.4108, lon: 15.6214 },
  { name: "Malmo", country: "Sweden", lat: 55.6050, lon: 13.0038 },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686 },
  { name: "Uppsala", country: "Sweden", lat: 59.8586, lon: 17.6389 },

  // ============================================================
  // SWITZERLAND
  // ============================================================
  { name: "Basel", country: "Switzerland", lat: 47.5596, lon: 7.5886 },
  { name: "Bern", country: "Switzerland", lat: 46.9480, lon: 7.4474 },
  { name: "Geneva", country: "Switzerland", lat: 46.2044, lon: 6.1432 },
  { name: "Lausanne", country: "Switzerland", lat: 46.5197, lon: 6.6323 },
  { name: "Lucerne", country: "Switzerland", lat: 47.0502, lon: 8.3093 },
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lon: 8.5417 },

  // ============================================================
  // SYRIA
  // ============================================================
  { name: "Aleppo", country: "Syria", lat: 36.2021, lon: 37.1343 },
  { name: "Damascus", country: "Syria", lat: 33.5138, lon: 36.2765 },

  // ============================================================
  // TAIWAN
  // ============================================================
  { name: "Kaohsiung", country: "Taiwan", lat: 22.6273, lon: 120.3014 },
  { name: "Taichung", country: "Taiwan", lat: 24.1477, lon: 120.6736 },
  { name: "Tainan", country: "Taiwan", lat: 22.9998, lon: 120.2269 },
  { name: "Taipei", country: "Taiwan", lat: 25.0330, lon: 121.5654 },

  // ============================================================
  // TAJIKISTAN
  // ============================================================
  { name: "Dushanbe", country: "Tajikistan", lat: 38.5598, lon: 68.7740 },

  // ============================================================
  // TANZANIA
  // ============================================================
  { name: "Arusha", country: "Tanzania", lat: -3.3869, lon: 36.6830 },
  { name: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lon: 39.2083 },
  { name: "Dodoma", country: "Tanzania", lat: -6.1630, lon: 35.7516 },
  { name: "Mwanza", country: "Tanzania", lat: -2.5164, lon: 32.9175 },
  { name: "Zanzibar City", country: "Tanzania", lat: -6.1659, lon: 39.2026 },

  // ============================================================
  // THAILAND
  // ============================================================
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Chiang Mai", country: "Thailand", lat: 18.7883, lon: 98.9853 },
  { name: "Chiang Rai", country: "Thailand", lat: 19.9105, lon: 99.8406 },
  { name: "Hat Yai", country: "Thailand", lat: 7.0040, lon: 100.4735 },
  { name: "Khon Kaen", country: "Thailand", lat: 16.4322, lon: 102.8236 },
  { name: "Nakhon Ratchasima", country: "Thailand", lat: 14.9799, lon: 102.0978 },
  { name: "Pattaya", country: "Thailand", lat: 12.9236, lon: 100.8825 },
  { name: "Phuket", country: "Thailand", lat: 7.8804, lon: 98.3923 },
  { name: "Udon Thani", country: "Thailand", lat: 17.4138, lon: 102.7874 },

  // ============================================================
  // TOGO
  // ============================================================
  { name: "Lome", country: "Togo", lat: 6.1319, lon: 1.2228 },

  // ============================================================
  // TONGA
  // ============================================================
  { name: "Nuku'alofa", country: "Tonga", lat: -21.2087, lon: -175.1982 },

  // ============================================================
  // TRINIDAD AND TOBAGO
  // ============================================================
  { name: "Port of Spain", country: "Trinidad and Tobago", lat: 10.6596, lon: -61.5086 },
  { name: "San Fernando", country: "Trinidad and Tobago", lat: 10.2803, lon: -61.4681 },

  // ============================================================
  // TUNISIA
  // ============================================================
  { name: "Sfax", country: "Tunisia", lat: 34.7406, lon: 10.7603 },
  { name: "Sousse", country: "Tunisia", lat: 35.8256, lon: 10.6369 },
  { name: "Tunis", country: "Tunisia", lat: 36.8065, lon: 10.1815 },

  // ============================================================
  // TURKEY
  // ============================================================
  { name: "Adana", country: "Turkey", lat: 37.0000, lon: 35.3213 },
  { name: "Ankara", country: "Turkey", lat: 39.9334, lon: 32.8597 },
  { name: "Antalya", country: "Turkey", lat: 36.8969, lon: 30.7133 },
  { name: "Bodrum", country: "Turkey", lat: 37.0344, lon: 27.4305 },
  { name: "Bursa", country: "Turkey", lat: 40.1885, lon: 29.0610 },
  { name: "Eskisehir", country: "Turkey", lat: 39.7767, lon: 30.5206 },
  { name: "Gaziantep", country: "Turkey", lat: 37.0662, lon: 37.3833 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 },
  { name: "Izmir", country: "Turkey", lat: 38.4237, lon: 27.1428 },
  { name: "Kayseri", country: "Turkey", lat: 38.7312, lon: 35.4787 },
  { name: "Konya", country: "Turkey", lat: 37.8714, lon: 32.4846 },
  { name: "Trabzon", country: "Turkey", lat: 41.0027, lon: 39.7168 },

  // ============================================================
  // TURKMENISTAN
  // ============================================================
  { name: "Ashgabat", country: "Turkmenistan", lat: 37.9601, lon: 58.3261 },

  // ============================================================
  // UGANDA
  // ============================================================
  { name: "Entebbe", country: "Uganda", lat: 0.0512, lon: 32.4637 },
  { name: "Gulu", country: "Uganda", lat: 2.7747, lon: 32.2988 },
  { name: "Kampala", country: "Uganda", lat: 0.3476, lon: 32.5825 },

  // ============================================================
  // UKRAINE
  // ============================================================
  { name: "Dnipro", country: "Ukraine", lat: 48.4647, lon: 35.0462 },
  { name: "Kharkiv", country: "Ukraine", lat: 49.9935, lon: 36.2304 },
  { name: "Kyiv", country: "Ukraine", lat: 50.4501, lon: 30.5234 },
  { name: "Lviv", country: "Ukraine", lat: 49.8397, lon: 24.0297 },
  { name: "Odessa", country: "Ukraine", lat: 46.4825, lon: 30.7233 },
  { name: "Zaporizhzhia", country: "Ukraine", lat: 47.8388, lon: 35.1396 },

  // ============================================================
  // UNITED ARAB EMIRATES
  // ============================================================
  { name: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lon: 54.3773 },
  { name: "Ajman", country: "United Arab Emirates", lat: 25.4052, lon: 55.5136 },
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  { name: "Sharjah", country: "United Arab Emirates", lat: 25.3463, lon: 55.4209 },

  // ============================================================
  // UNITED KINGDOM
  // ============================================================
  { name: "Aberdeen", country: "United Kingdom", lat: 57.1497, lon: -2.0943 },
  { name: "Bath", country: "United Kingdom", lat: 51.3758, lon: -2.3599 },
  { name: "Belfast", country: "United Kingdom", lat: 54.5973, lon: -5.9301 },
  { name: "Birmingham", country: "United Kingdom", lat: 52.4862, lon: -1.8904 },
  { name: "Bradford", country: "United Kingdom", lat: 53.7960, lon: -1.7594 },
  { name: "Brighton", country: "United Kingdom", lat: 50.8225, lon: -0.1372 },
  { name: "Bristol", country: "United Kingdom", lat: 51.4545, lon: -2.5879 },
  { name: "Cambridge", country: "United Kingdom", lat: 52.2053, lon: 0.1218 },
  { name: "Canterbury", country: "United Kingdom", lat: 51.2802, lon: 1.0789 },
  { name: "Cardiff", country: "United Kingdom", lat: 51.4816, lon: -3.1791 },
  { name: "Coventry", country: "United Kingdom", lat: 52.4068, lon: -1.5197 },
  { name: "Derby", country: "United Kingdom", lat: 52.9225, lon: -1.4746 },
  { name: "Dundee", country: "United Kingdom", lat: 56.4620, lon: -2.9707 },
  { name: "Durham", country: "United Kingdom", lat: 54.7761, lon: -1.5733 },
  { name: "Edinburgh", country: "United Kingdom", lat: 55.9533, lon: -3.1883 },
  { name: "Exeter", country: "United Kingdom", lat: 50.7184, lon: -3.5339 },
  { name: "Glasgow", country: "United Kingdom", lat: 55.8642, lon: -4.2518 },
  { name: "Hull", country: "United Kingdom", lat: 53.7676, lon: -0.3274 },
  { name: "Inverness", country: "United Kingdom", lat: 57.4778, lon: -4.2247 },
  { name: "Leeds", country: "United Kingdom", lat: 53.8008, lon: -1.5491 },
  { name: "Leicester", country: "United Kingdom", lat: 52.6369, lon: -1.1398 },
  { name: "Liverpool", country: "United Kingdom", lat: 53.4084, lon: -2.9916 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Manchester", country: "United Kingdom", lat: 53.4808, lon: -2.2426 },
  { name: "Newcastle upon Tyne", country: "United Kingdom", lat: 54.9783, lon: -1.6178 },
  { name: "Norwich", country: "United Kingdom", lat: 52.6309, lon: 1.2974 },
  { name: "Nottingham", country: "United Kingdom", lat: 52.9548, lon: -1.1581 },
  { name: "Oxford", country: "United Kingdom", lat: 51.7520, lon: -1.2577 },
  { name: "Plymouth", country: "United Kingdom", lat: 50.3755, lon: -4.1427 },
  { name: "Portsmouth", country: "United Kingdom", lat: 50.8198, lon: -1.0880 },
  { name: "Sheffield", country: "United Kingdom", lat: 53.3811, lon: -1.4701 },
  { name: "Southampton", country: "United Kingdom", lat: 50.9097, lon: -1.4044 },
  { name: "Stoke-on-Trent", country: "United Kingdom", lat: 53.0027, lon: -2.1794 },
  { name: "Swansea", country: "United Kingdom", lat: 51.6214, lon: -3.9436 },
  { name: "York", country: "United Kingdom", lat: 53.9591, lon: -1.0815 },

  // ============================================================
  // UNITED STATES
  // ============================================================
  { name: "Abilene", region: "Texas", country: "United States", lat: 32.4487, lon: -99.7331 },
  { name: "Akron", region: "Ohio", country: "United States", lat: 41.0814, lon: -81.5190 },
  { name: "Albany", region: "New York", country: "United States", lat: 42.6526, lon: -73.7562 },
  { name: "Albuquerque", region: "New Mexico", country: "United States", lat: 35.0844, lon: -106.6504 },
  { name: "Amarillo", region: "Texas", country: "United States", lat: 35.2220, lon: -101.8313 },
  { name: "Anaheim", region: "California", country: "United States", lat: 33.8366, lon: -117.9143 },
  { name: "Anchorage", region: "Alaska", country: "United States", lat: 61.2181, lon: -149.9003 },
  { name: "Ann Arbor", region: "Michigan", country: "United States", lat: 42.2808, lon: -83.7430 },
  { name: "Annapolis", region: "Maryland", country: "United States", lat: 38.9784, lon: -76.4922 },
  { name: "Arlington", region: "Texas", country: "United States", lat: 32.7357, lon: -97.1081 },
  { name: "Atlanta", region: "Georgia", country: "United States", lat: 33.7490, lon: -84.3880 },
  { name: "Augusta", region: "Georgia", country: "United States", lat: 33.4735, lon: -82.0105 },
  { name: "Aurora", region: "Colorado", country: "United States", lat: 39.7294, lon: -104.8319 },
  { name: "Austin", region: "Texas", country: "United States", lat: 30.2672, lon: -97.7431 },
  { name: "Bakersfield", region: "California", country: "United States", lat: 35.3733, lon: -119.0187 },
  { name: "Baltimore", region: "Maryland", country: "United States", lat: 39.2904, lon: -76.6122 },
  { name: "Baton Rouge", region: "Louisiana", country: "United States", lat: 30.4515, lon: -91.1871 },
  { name: "Billings", region: "Montana", country: "United States", lat: 45.7833, lon: -108.5007 },
  { name: "Birmingham", region: "Alabama", country: "United States", lat: 33.5186, lon: -86.8104 },
  { name: "Bismarck", region: "North Dakota", country: "United States", lat: 46.8083, lon: -100.7837 },
  { name: "Boise", region: "Idaho", country: "United States", lat: 43.6150, lon: -116.2023 },
  { name: "Boston", region: "Massachusetts", country: "United States", lat: 42.3601, lon: -71.0589 },
  { name: "Brownsville", region: "Texas", country: "United States", lat: 25.9017, lon: -97.4975 },
  { name: "Buffalo", region: "New York", country: "United States", lat: 42.8864, lon: -78.8784 },
  { name: "Burlington", region: "Vermont", country: "United States", lat: 44.4759, lon: -73.2121 },
  { name: "Carson City", region: "Nevada", country: "United States", lat: 39.1638, lon: -119.7674 },
  { name: "Chandler", region: "Arizona", country: "United States", lat: 33.3062, lon: -111.8413 },
  { name: "Charleston", region: "South Carolina", country: "United States", lat: 32.7765, lon: -79.9311 },
  { name: "Charlotte", region: "North Carolina", country: "United States", lat: 35.2271, lon: -80.8431 },
  { name: "Chattanooga", region: "Tennessee", country: "United States", lat: 35.0456, lon: -85.3097 },
  { name: "Chesapeake", region: "Virginia", country: "United States", lat: 36.7682, lon: -76.2875 },
  { name: "Cheyenne", region: "Wyoming", country: "United States", lat: 41.1400, lon: -104.8202 },
  { name: "Chicago", region: "Illinois", country: "United States", lat: 41.8781, lon: -87.6298 },
  { name: "Cincinnati", region: "Ohio", country: "United States", lat: 39.1031, lon: -84.5120 },
  { name: "Cleveland", region: "Ohio", country: "United States", lat: 41.4993, lon: -81.6944 },
  { name: "Colorado Springs", region: "Colorado", country: "United States", lat: 38.8339, lon: -104.8214 },
  { name: "Columbia", region: "South Carolina", country: "United States", lat: 34.0007, lon: -81.0348 },
  { name: "Columbus", region: "Ohio", country: "United States", lat: 39.9612, lon: -82.9988 },
  { name: "Concord", region: "New Hampshire", country: "United States", lat: 43.2081, lon: -71.5376 },
  { name: "Corpus Christi", region: "Texas", country: "United States", lat: 27.8006, lon: -97.3964 },
  { name: "Dallas", region: "Texas", country: "United States", lat: 32.7767, lon: -96.7970 },
  { name: "Dayton", region: "Ohio", country: "United States", lat: 39.7589, lon: -84.1916 },
  { name: "Denver", region: "Colorado", country: "United States", lat: 39.7392, lon: -104.9903 },
  { name: "Des Moines", region: "Iowa", country: "United States", lat: 41.5868, lon: -93.6250 },
  { name: "Detroit", region: "Michigan", country: "United States", lat: 42.3314, lon: -83.0458 },
  { name: "Dover", region: "Delaware", country: "United States", lat: 39.1582, lon: -75.5244 },
  { name: "Durham", region: "North Carolina", country: "United States", lat: 35.9940, lon: -78.8986 },
  { name: "El Paso", region: "Texas", country: "United States", lat: 31.7619, lon: -106.4850 },
  { name: "Eugene", region: "Oregon", country: "United States", lat: 44.0521, lon: -123.0868 },
  { name: "Fargo", region: "North Dakota", country: "United States", lat: 46.8772, lon: -96.7898 },
  { name: "Fort Collins", region: "Colorado", country: "United States", lat: 40.5853, lon: -105.0844 },
  { name: "Fort Lauderdale", region: "Florida", country: "United States", lat: 26.1224, lon: -80.1373 },
  { name: "Fort Wayne", region: "Indiana", country: "United States", lat: 41.0793, lon: -85.1394 },
  { name: "Fort Worth", region: "Texas", country: "United States", lat: 32.7555, lon: -97.3308 },
  { name: "Frankfort", region: "Kentucky", country: "United States", lat: 38.2009, lon: -84.8733 },
  { name: "Fremont", region: "California", country: "United States", lat: 37.5485, lon: -121.9886 },
  { name: "Fresno", region: "California", country: "United States", lat: 36.7378, lon: -119.7871 },
  { name: "Gilbert", region: "Arizona", country: "United States", lat: 33.3528, lon: -111.7890 },
  { name: "Glendale", region: "Arizona", country: "United States", lat: 33.5387, lon: -112.1860 },
  { name: "Grand Rapids", region: "Michigan", country: "United States", lat: 42.9634, lon: -85.6681 },
  { name: "Greensboro", region: "North Carolina", country: "United States", lat: 36.0726, lon: -79.7920 },
  { name: "Harrisburg", region: "Pennsylvania", country: "United States", lat: 40.2732, lon: -76.8867 },
  { name: "Hartford", region: "Connecticut", country: "United States", lat: 41.7658, lon: -72.6734 },
  { name: "Helena", region: "Montana", country: "United States", lat: 46.5884, lon: -112.0245 },
  { name: "Henderson", region: "Nevada", country: "United States", lat: 36.0395, lon: -114.9817 },
  { name: "Hialeah", region: "Florida", country: "United States", lat: 25.8576, lon: -80.2781 },
  { name: "Honolulu", region: "Hawaii", country: "United States", lat: 21.3069, lon: -157.8583 },
  { name: "Houston", region: "Texas", country: "United States", lat: 29.7604, lon: -95.3698 },
  { name: "Huntsville", region: "Alabama", country: "United States", lat: 34.7304, lon: -86.5861 },
  { name: "Indianapolis", region: "Indiana", country: "United States", lat: 39.7684, lon: -86.1581 },
  { name: "Irvine", region: "California", country: "United States", lat: 33.6846, lon: -117.8265 },
  { name: "Irving", region: "Texas", country: "United States", lat: 32.8140, lon: -96.9489 },
  { name: "Jackson", region: "Mississippi", country: "United States", lat: 32.2988, lon: -90.1848 },
  { name: "Jacksonville", region: "Florida", country: "United States", lat: 30.3322, lon: -81.6557 },
  { name: "Jefferson City", region: "Missouri", country: "United States", lat: 38.5767, lon: -92.1735 },
  { name: "Jersey City", region: "New Jersey", country: "United States", lat: 40.7178, lon: -74.0431 },
  { name: "Juneau", region: "Alaska", country: "United States", lat: 58.3005, lon: -134.4197 },
  { name: "Kansas City", region: "Missouri", country: "United States", lat: 39.0997, lon: -94.5786 },
  { name: "Knoxville", region: "Tennessee", country: "United States", lat: 35.9606, lon: -83.9207 },
  { name: "Lansing", region: "Michigan", country: "United States", lat: 42.7325, lon: -84.5555 },
  { name: "Laredo", region: "Texas", country: "United States", lat: 27.5036, lon: -99.5076 },
  { name: "Las Vegas", region: "Nevada", country: "United States", lat: 36.1699, lon: -115.1398 },
  { name: "Lexington", region: "Kentucky", country: "United States", lat: 38.0406, lon: -84.5037 },
  { name: "Lincoln", region: "Nebraska", country: "United States", lat: 40.8136, lon: -96.7026 },
  { name: "Little Rock", region: "Arkansas", country: "United States", lat: 34.7465, lon: -92.2896 },
  { name: "Long Beach", region: "California", country: "United States", lat: 33.7701, lon: -118.1937 },
  { name: "Los Angeles", region: "California", country: "United States", lat: 34.0522, lon: -118.2437 },
  { name: "Louisville", region: "Kentucky", country: "United States", lat: 38.2527, lon: -85.7585 },
  { name: "Lubbock", region: "Texas", country: "United States", lat: 33.5779, lon: -101.8552 },
  { name: "Madison", region: "Wisconsin", country: "United States", lat: 43.0731, lon: -89.4012 },
  { name: "Memphis", region: "Tennessee", country: "United States", lat: 35.1495, lon: -90.0490 },
  { name: "Mesa", region: "Arizona", country: "United States", lat: 33.4152, lon: -111.8315 },
  { name: "Miami", region: "Florida", country: "United States", lat: 25.7617, lon: -80.1918 },
  { name: "Milwaukee", region: "Wisconsin", country: "United States", lat: 43.0389, lon: -87.9065 },
  { name: "Minneapolis", region: "Minnesota", country: "United States", lat: 44.9778, lon: -93.2650 },
  { name: "Mobile", region: "Alabama", country: "United States", lat: 30.6954, lon: -88.0399 },
  { name: "Montgomery", region: "Alabama", country: "United States", lat: 32.3668, lon: -86.3000 },
  { name: "Montpelier", region: "Vermont", country: "United States", lat: 44.2601, lon: -72.5754 },
  { name: "Nashville", region: "Tennessee", country: "United States", lat: 36.1627, lon: -86.7816 },
  { name: "New Haven", region: "Connecticut", country: "United States", lat: 41.3083, lon: -72.9279 },
  { name: "New Orleans", region: "Louisiana", country: "United States", lat: 29.9511, lon: -90.0715 },
  { name: "New York", region: "New York", country: "United States", lat: 40.7128, lon: -74.0060 },
  { name: "Newark", region: "New Jersey", country: "United States", lat: 40.7357, lon: -74.1724 },
  { name: "Norfolk", region: "Virginia", country: "United States", lat: 36.8508, lon: -76.2859 },
  { name: "North Las Vegas", region: "Nevada", country: "United States", lat: 36.1989, lon: -115.1175 },
  { name: "Oakland", region: "California", country: "United States", lat: 37.8044, lon: -122.2712 },
  { name: "Oklahoma City", region: "Oklahoma", country: "United States", lat: 35.4676, lon: -97.5164 },
  { name: "Olympia", region: "Washington", country: "United States", lat: 47.0379, lon: -122.9007 },
  { name: "Omaha", region: "Nebraska", country: "United States", lat: 41.2565, lon: -95.9345 },
  { name: "Orlando", region: "Florida", country: "United States", lat: 28.5383, lon: -81.3792 },
  { name: "Oxnard", region: "California", country: "United States", lat: 34.1975, lon: -119.1771 },
  { name: "Philadelphia", region: "Pennsylvania", country: "United States", lat: 39.9526, lon: -75.1652 },
  { name: "Phoenix", region: "Arizona", country: "United States", lat: 33.4484, lon: -112.0740 },
  { name: "Pierre", region: "South Dakota", country: "United States", lat: 44.3683, lon: -100.3510 },
  { name: "Pittsburgh", region: "Pennsylvania", country: "United States", lat: 40.4406, lon: -79.9959 },
  { name: "Plano", region: "Texas", country: "United States", lat: 33.0198, lon: -96.6989 },
  { name: "Portland", region: "Oregon", country: "United States", lat: 45.5152, lon: -122.6784 },
  { name: "Providence", region: "Rhode Island", country: "United States", lat: 41.8240, lon: -71.4128 },
  { name: "Raleigh", region: "North Carolina", country: "United States", lat: 35.7796, lon: -78.6382 },
  { name: "Reno", region: "Nevada", country: "United States", lat: 39.5296, lon: -119.8138 },
  { name: "Richmond", region: "Virginia", country: "United States", lat: 37.5407, lon: -77.4360 },
  { name: "Riverside", region: "California", country: "United States", lat: 33.9533, lon: -117.3962 },
  { name: "Rochester", region: "New York", country: "United States", lat: 43.1566, lon: -77.6088 },
  { name: "Sacramento", region: "California", country: "United States", lat: 38.5816, lon: -121.4944 },
  { name: "Saint Paul", region: "Minnesota", country: "United States", lat: 44.9537, lon: -93.0900 },
  { name: "Salem", region: "Oregon", country: "United States", lat: 44.9429, lon: -123.0351 },
  { name: "Salt Lake City", region: "Utah", country: "United States", lat: 40.7608, lon: -111.8910 },
  { name: "San Antonio", region: "Texas", country: "United States", lat: 29.4241, lon: -98.4936 },
  { name: "San Bernardino", region: "California", country: "United States", lat: 34.1083, lon: -117.2898 },
  { name: "San Diego", region: "California", country: "United States", lat: 32.7157, lon: -117.1611 },
  { name: "San Francisco", region: "California", country: "United States", lat: 37.7749, lon: -122.4194 },
  { name: "San Jose", region: "California", country: "United States", lat: 37.3382, lon: -121.8863 },
  { name: "Santa Ana", region: "California", country: "United States", lat: 33.7455, lon: -117.8677 },
  { name: "Santa Fe", region: "New Mexico", country: "United States", lat: 35.6870, lon: -105.9378 },
  { name: "Savannah", region: "Georgia", country: "United States", lat: 32.0809, lon: -81.0912 },
  { name: "Scottsdale", region: "Arizona", country: "United States", lat: 33.4942, lon: -111.9261 },
  { name: "Seattle", region: "Washington", country: "United States", lat: 47.6062, lon: -122.3321 },
  { name: "Shreveport", region: "Louisiana", country: "United States", lat: 32.5252, lon: -93.7502 },
  { name: "Sioux Falls", region: "South Dakota", country: "United States", lat: 43.5460, lon: -96.7313 },
  { name: "Spokane", region: "Washington", country: "United States", lat: 47.6588, lon: -117.4260 },
  { name: "Springfield", region: "Illinois", country: "United States", lat: 39.7817, lon: -89.6501 },
  { name: "St. Louis", region: "Missouri", country: "United States", lat: 38.6270, lon: -90.1994 },
  { name: "St. Petersburg", region: "Florida", country: "United States", lat: 27.7676, lon: -82.6403 },
  { name: "Stockton", region: "California", country: "United States", lat: 37.9577, lon: -121.2908 },
  { name: "Syracuse", region: "New York", country: "United States", lat: 43.0481, lon: -76.1474 },
  { name: "Tacoma", region: "Washington", country: "United States", lat: 47.2529, lon: -122.4443 },
  { name: "Tallahassee", region: "Florida", country: "United States", lat: 30.4383, lon: -84.2807 },
  { name: "Tampa", region: "Florida", country: "United States", lat: 27.9506, lon: -82.4572 },
  { name: "Toledo", region: "Ohio", country: "United States", lat: 41.6528, lon: -83.5379 },
  { name: "Topeka", region: "Kansas", country: "United States", lat: 39.0473, lon: -95.6752 },
  { name: "Trenton", region: "New Jersey", country: "United States", lat: 40.2206, lon: -74.7699 },
  { name: "Tucson", region: "Arizona", country: "United States", lat: 32.2226, lon: -110.9747 },
  { name: "Tulsa", region: "Oklahoma", country: "United States", lat: 36.1540, lon: -95.9928 },
  { name: "Virginia Beach", region: "Virginia", country: "United States", lat: 36.8529, lon: -75.9780 },
  { name: "Washington", region: "District of Columbia", country: "United States", lat: 38.9072, lon: -77.0369 },
  { name: "Wichita", region: "Kansas", country: "United States", lat: 37.6872, lon: -97.3301 },
  { name: "Wilmington", region: "North Carolina", country: "United States", lat: 34.2257, lon: -77.9447 },
  { name: "Winston-Salem", region: "North Carolina", country: "United States", lat: 36.0999, lon: -80.2442 },

  // ============================================================
  // URUGUAY
  // ============================================================
  { name: "Montevideo", country: "Uruguay", lat: -34.9011, lon: -56.1645 },
  { name: "Punta del Este", country: "Uruguay", lat: -34.9667, lon: -54.9500 },
  { name: "Salto", country: "Uruguay", lat: -31.3833, lon: -57.9500 },

  // ============================================================
  // UZBEKISTAN
  // ============================================================
  { name: "Bukhara", country: "Uzbekistan", lat: 39.7681, lon: 64.4556 },
  { name: "Samarkand", country: "Uzbekistan", lat: 39.6542, lon: 66.9597 },
  { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lon: 69.2401 },

  // ============================================================
  // VANUATU
  // ============================================================
  { name: "Port Vila", country: "Vanuatu", lat: -17.7334, lon: 168.3273 },

  // ============================================================
  // VENEZUELA
  // ============================================================
  { name: "Barquisimeto", country: "Venezuela", lat: 10.0678, lon: -69.3474 },
  { name: "Caracas", country: "Venezuela", lat: 10.4806, lon: -66.9036 },
  { name: "Ciudad Guayana", country: "Venezuela", lat: 8.3596, lon: -62.6501 },
  { name: "Maracaibo", country: "Venezuela", lat: 10.6427, lon: -71.6125 },
  { name: "Maracay", country: "Venezuela", lat: 10.2469, lon: -67.5958 },
  { name: "Valencia", country: "Venezuela", lat: 10.1620, lon: -68.0071 },

  // ============================================================
  // VIETNAM
  // ============================================================
  { name: "Can Tho", country: "Vietnam", lat: 10.0452, lon: 105.7469 },
  { name: "Da Nang", country: "Vietnam", lat: 16.0544, lon: 108.2022 },
  { name: "Haiphong", country: "Vietnam", lat: 20.8449, lon: 106.6881 },
  { name: "Hanoi", country: "Vietnam", lat: 21.0278, lon: 105.8342 },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lon: 106.6297 },
  { name: "Hue", country: "Vietnam", lat: 16.4637, lon: 107.5909 },
  { name: "Nha Trang", country: "Vietnam", lat: 12.2388, lon: 109.1967 },

  // ============================================================
  // YEMEN
  // ============================================================
  { name: "Aden", country: "Yemen", lat: 12.7855, lon: 45.0187 },
  { name: "Sana'a", country: "Yemen", lat: 15.3694, lon: 44.1910 },

  // ============================================================
  // ZAMBIA
  // ============================================================
  { name: "Livingstone", country: "Zambia", lat: -17.8419, lon: 25.8544 },
  { name: "Lusaka", country: "Zambia", lat: -15.3875, lon: 28.3228 },
  { name: "Ndola", country: "Zambia", lat: -12.9587, lon: 28.6366 },

  // ============================================================
  // ZIMBABWE
  // ============================================================
  { name: "Bulawayo", country: "Zimbabwe", lat: -20.1325, lon: 28.6265 },
  { name: "Harare", country: "Zimbabwe", lat: -17.8292, lon: 31.0522 },
  { name: "Mutare", country: "Zimbabwe", lat: -18.9707, lon: 32.6709 },
  { name: "Victoria Falls", country: "Zimbabwe", lat: -17.9243, lon: 25.8572 },

  // ============================================================
  // ADDITIONAL UNITED STATES CITIES
  // ============================================================
  // State Capitals not yet included
  { name: "Honolulu", region: "Hawaii", country: "United States", lat: 21.3069, lon: -157.8583 },
  { name: "Santa Fe", region: "New Mexico", country: "United States", lat: 35.6870, lon: -105.9378 },
  { name: "Augusta", region: "Maine", country: "United States", lat: 44.3106, lon: -69.7795 },
  { name: "Montpelier", region: "Vermont", country: "United States", lat: 44.2601, lon: -72.5754 },
  // Additional US cities
  { name: "Provo", region: "Utah", country: "United States", lat: 40.2338, lon: -111.6585 },
  { name: "Tempe", region: "Arizona", country: "United States", lat: 33.4255, lon: -111.9400 },
  { name: "Pasadena", region: "California", country: "United States", lat: 34.1478, lon: -118.1445 },
  { name: "Santa Barbara", region: "California", country: "United States", lat: 34.4208, lon: -119.6982 },
  { name: "Modesto", region: "California", country: "United States", lat: 37.6391, lon: -120.9969 },
  { name: "Fontana", region: "California", country: "United States", lat: 34.0922, lon: -117.4350 },
  { name: "Moreno Valley", region: "California", country: "United States", lat: 33.9425, lon: -117.2297 },
  { name: "Fayetteville", region: "Arkansas", country: "United States", lat: 36.0626, lon: -94.1574 },
  { name: "Cape Coral", region: "Florida", country: "United States", lat: 26.5629, lon: -81.9495 },
  { name: "Frisco", region: "Texas", country: "United States", lat: 33.1507, lon: -96.8236 },
  { name: "McKinney", region: "Texas", country: "United States", lat: 33.1972, lon: -96.6397 },
  { name: "Clarksville", region: "Tennessee", country: "United States", lat: 36.5298, lon: -87.3595 },
  { name: "Santa Clarita", region: "California", country: "United States", lat: 34.3917, lon: -118.5426 },
  { name: "Garden Grove", region: "California", country: "United States", lat: 33.7739, lon: -117.9414 },
  { name: "Overland Park", region: "Kansas", country: "United States", lat: 38.9822, lon: -94.6708 },
  { name: "Oceanside", region: "California", country: "United States", lat: 33.1959, lon: -117.3795 },
  { name: "Pomona", region: "California", country: "United States", lat: 34.0551, lon: -117.7500 },
  { name: "Rancho Cucamonga", region: "California", country: "United States", lat: 34.1064, lon: -117.5931 },
  { name: "Ontario", region: "California", country: "United States", lat: 34.0633, lon: -117.6509 },
  { name: "Santa Rosa", region: "California", country: "United States", lat: 38.4405, lon: -122.7141 },
  { name: "Elk Grove", region: "California", country: "United States", lat: 38.4088, lon: -121.3716 },
  { name: "Salem", region: "Oregon", country: "United States", lat: 44.9429, lon: -123.0351 },
  { name: "Corona", region: "California", country: "United States", lat: 33.8753, lon: -117.5664 },
  { name: "Pembroke Pines", region: "Florida", country: "United States", lat: 26.0031, lon: -80.2241 },
  { name: "Peoria", region: "Illinois", country: "United States", lat: 40.6936, lon: -89.5890 },
  { name: "Cary", region: "North Carolina", country: "United States", lat: 35.7915, lon: -78.7811 },
  { name: "Lancaster", region: "California", country: "United States", lat: 34.6868, lon: -118.1542 },
  { name: "Palmdale", region: "California", country: "United States", lat: 34.5794, lon: -118.1165 },
  { name: "Surprise", region: "Arizona", country: "United States", lat: 33.6292, lon: -112.3680 },
  { name: "Denton", region: "Texas", country: "United States", lat: 33.2148, lon: -97.1331 },
  { name: "Roseville", region: "California", country: "United States", lat: 38.7521, lon: -121.2880 },
  { name: "Miramar", region: "Florida", country: "United States", lat: 25.9860, lon: -80.3036 },
  { name: "Thornton", region: "Colorado", country: "United States", lat: 39.8680, lon: -104.9720 },
  { name: "Midland", region: "Texas", country: "United States", lat: 31.9973, lon: -102.0779 },
  { name: "Murfreesboro", region: "Tennessee", country: "United States", lat: 35.8456, lon: -86.3903 },
  { name: "McAllen", region: "Texas", country: "United States", lat: 26.2034, lon: -98.2300 },
  { name: "Mesquite", region: "Texas", country: "United States", lat: 32.7668, lon: -96.5992 },
  { name: "Pasadena", region: "Texas", country: "United States", lat: 29.6911, lon: -95.2091 },
  { name: "Savannah", region: "Georgia", country: "United States", lat: 32.0809, lon: -81.0912 },
  { name: "Bridgeport", region: "Connecticut", country: "United States", lat: 41.1865, lon: -73.1952 },
  { name: "Lakewood", region: "Colorado", country: "United States", lat: 39.7047, lon: -105.0814 },
  { name: "Hollywood", region: "Florida", country: "United States", lat: 26.0112, lon: -80.1495 },
  { name: "Naperville", region: "Illinois", country: "United States", lat: 41.7508, lon: -88.1535 },
  { name: "Bellevue", region: "Washington", country: "United States", lat: 47.6101, lon: -122.2015 },
  { name: "Joliet", region: "Illinois", country: "United States", lat: 41.5250, lon: -88.0817 },
  { name: "Sunnyvale", region: "California", country: "United States", lat: 37.3688, lon: -122.0363 },
  { name: "Killeen", region: "Texas", country: "United States", lat: 31.1171, lon: -97.7278 },
  { name: "Topeka", region: "Kansas", country: "United States", lat: 39.0473, lon: -95.6752 },
  { name: "Torrance", region: "California", country: "United States", lat: 33.8358, lon: -118.3406 },
  { name: "Rockford", region: "Illinois", country: "United States", lat: 42.2711, lon: -89.0940 },
  { name: "Paterson", region: "New Jersey", country: "United States", lat: 40.9168, lon: -74.1718 },
  { name: "Macon", region: "Georgia", country: "United States", lat: 32.8407, lon: -83.6324 },
  { name: "Waco", region: "Texas", country: "United States", lat: 31.5493, lon: -97.1467 },
  { name: "Beaumont", region: "Texas", country: "United States", lat: 30.0802, lon: -94.1266 },
  { name: "Odessa", region: "Texas", country: "United States", lat: 31.8457, lon: -102.3676 },
  { name: "Columbia", region: "Missouri", country: "United States", lat: 38.9517, lon: -92.3341 },
  { name: "South Bend", region: "Indiana", country: "United States", lat: 41.6764, lon: -86.2520 },
  { name: "West Palm Beach", region: "Florida", country: "United States", lat: 26.7153, lon: -80.0534 },
  { name: "Santa Cruz", region: "California", country: "United States", lat: 36.9741, lon: -122.0308 },
  { name: "Yuma", region: "Arizona", country: "United States", lat: 32.6927, lon: -114.6277 },
  { name: "Flagstaff", region: "Arizona", country: "United States", lat: 35.1983, lon: -111.6513 },
  { name: "Boulder", region: "Colorado", country: "United States", lat: 40.0150, lon: -105.2705 },
  { name: "Pensacola", region: "Florida", country: "United States", lat: 30.4213, lon: -87.2169 },
  { name: "Gainesville", region: "Florida", country: "United States", lat: 29.6516, lon: -82.3248 },
  { name: "Daytona Beach", region: "Florida", country: "United States", lat: 29.2108, lon: -81.0228 },
  { name: "Sarasota", region: "Florida", country: "United States", lat: 27.3364, lon: -82.5307 },
  { name: "Asheville", region: "North Carolina", country: "United States", lat: 35.5951, lon: -82.5515 },
  { name: "Greenville", region: "South Carolina", country: "United States", lat: 34.8526, lon: -82.3940 },
  { name: "Missoula", region: "Montana", country: "United States", lat: 46.8721, lon: -113.9940 },
  { name: "Rapid City", region: "South Dakota", country: "United States", lat: 44.0805, lon: -103.2310 },
  { name: "Duluth", region: "Minnesota", country: "United States", lat: 46.7867, lon: -92.1005 },
  { name: "Green Bay", region: "Wisconsin", country: "United States", lat: 44.5133, lon: -88.0133 },
  { name: "Bozeman", region: "Montana", country: "United States", lat: 45.6770, lon: -111.0429 },
  { name: "Key West", region: "Florida", country: "United States", lat: 24.5551, lon: -81.7800 },
  { name: "Naples", region: "Florida", country: "United States", lat: 26.1420, lon: -81.7948 },
  { name: "Bend", region: "Oregon", country: "United States", lat: 44.0582, lon: -121.3153 },
  { name: "Roanoke", region: "Virginia", country: "United States", lat: 37.2710, lon: -79.9414 },
  { name: "Charlottesville", region: "Virginia", country: "United States", lat: 38.0293, lon: -78.4767 },
  { name: "Bloomington", region: "Indiana", country: "United States", lat: 39.1653, lon: -86.5264 },
  { name: "Ithaca", region: "New York", country: "United States", lat: 42.4440, lon: -76.5019 },
  { name: "Santa Fe", region: "New Mexico", country: "United States", lat: 35.6870, lon: -105.9378 },

  // ============================================================
  // ADDITIONAL CANADA CITIES
  // ============================================================
  { name: "Abbotsford", country: "Canada", lat: 49.0504, lon: -122.3045 },
  { name: "Barrie", country: "Canada", lat: 44.3894, lon: -79.6903 },
  { name: "Guelph", country: "Canada", lat: 43.5448, lon: -80.2482 },
  { name: "Kamloops", country: "Canada", lat: 50.6745, lon: -120.3273 },
  { name: "Lethbridge", country: "Canada", lat: 49.6935, lon: -112.8418 },
  { name: "Nanaimo", country: "Canada", lat: 49.1659, lon: -123.9401 },
  { name: "Oshawa", country: "Canada", lat: 43.8971, lon: -78.8658 },
  { name: "Peterborough", country: "Canada", lat: 44.3091, lon: -78.3197 },
  { name: "Prince George", country: "Canada", lat: 53.9171, lon: -122.7497 },
  { name: "Saint John", country: "Canada", lat: 45.2733, lon: -66.0633 },
  { name: "Sherbrooke", country: "Canada", lat: 45.4042, lon: -71.8929 },
  { name: "Sudbury", country: "Canada", lat: 46.5230, lon: -80.9530 },
  { name: "Trois-Rivieres", country: "Canada", lat: 46.3432, lon: -72.5477 },

  // ============================================================
  // ADDITIONAL MEXICO CITIES
  // ============================================================
  { name: "Campeche", country: "Mexico", lat: 19.8301, lon: -90.5349 },
  { name: "Celaya", country: "Mexico", lat: 20.5236, lon: -100.8156 },
  { name: "Colima", country: "Mexico", lat: 19.2452, lon: -103.7241 },
  { name: "Ensenada", country: "Mexico", lat: 31.8667, lon: -116.5964 },
  { name: "Guanajuato", country: "Mexico", lat: 21.0190, lon: -101.2574 },
  { name: "Irapuato", country: "Mexico", lat: 20.6740, lon: -101.3562 },
  { name: "La Paz", country: "Mexico", lat: 24.1426, lon: -110.3128 },
  { name: "Los Cabos", country: "Mexico", lat: 22.8905, lon: -109.9167 },
  { name: "Los Mochis", country: "Mexico", lat: 25.7922, lon: -108.9939 },
  { name: "Matamoros", country: "Mexico", lat: 25.8690, lon: -97.5028 },
  { name: "Nuevo Laredo", country: "Mexico", lat: 27.4778, lon: -99.5167 },
  { name: "Pachuca", country: "Mexico", lat: 20.1011, lon: -98.7591 },
  { name: "Reynosa", country: "Mexico", lat: 26.0508, lon: -98.2978 },
  { name: "San Cristobal de las Casas", country: "Mexico", lat: 16.7370, lon: -92.6376 },
  { name: "Tepic", country: "Mexico", lat: 21.5083, lon: -104.8950 },

  // ============================================================
  // ADDITIONAL CARIBBEAN
  // ============================================================
  { name: "George Town", country: "Cayman Islands", lat: 19.2866, lon: -81.3674 },
  { name: "Hamilton", country: "Bermuda", lat: 32.2949, lon: -64.7830 },
  { name: "Oranjestad", country: "Aruba", lat: 12.5186, lon: -70.0358 },
  { name: "Philipsburg", country: "Sint Maarten", lat: 18.0260, lon: -63.0470 },
  { name: "Road Town", country: "British Virgin Islands", lat: 18.4286, lon: -64.6185 },
  { name: "Roseau", country: "Dominica", lat: 15.3010, lon: -61.3870 },
  { name: "St. George's", country: "Grenada", lat: 12.0564, lon: -61.7485 },
  { name: "Willemstad", country: "Curacao", lat: 12.1696, lon: -68.9900 },
  { name: "Basseterre", country: "Saint Kitts and Nevis", lat: 17.2948, lon: -62.7261 },
  { name: "Castries", country: "Saint Lucia", lat: 14.0101, lon: -60.9875 },
  { name: "Kingstown", country: "Saint Vincent and the Grenadines", lat: 13.1587, lon: -61.2248 },

  // ============================================================
  // ADDITIONAL SOUTH AMERICA
  // ============================================================
  { name: "Aracaju", country: "Brazil", lat: -10.9091, lon: -37.0677 },
  { name: "Londrina", country: "Brazil", lat: -23.3045, lon: -51.1696 },
  { name: "Maringa", country: "Brazil", lat: -23.4273, lon: -51.9375 },
  { name: "Niteroi", country: "Brazil", lat: -22.8833, lon: -43.1036 },
  { name: "Petropolis", country: "Brazil", lat: -22.5112, lon: -43.1779 },
  { name: "Ribeirao Preto", country: "Brazil", lat: -21.1704, lon: -47.8103 },
  { name: "Sao Jose dos Campos", country: "Brazil", lat: -23.1896, lon: -45.8841 },
  { name: "Sorocaba", country: "Brazil", lat: -23.5015, lon: -47.4526 },
  { name: "Uberlandia", country: "Brazil", lat: -18.9186, lon: -48.2772 },
  { name: "Bariloche", country: "Argentina", lat: -41.1335, lon: -71.3103 },
  { name: "Formosa", country: "Argentina", lat: -26.1775, lon: -58.1781 },
  { name: "Parana", country: "Argentina", lat: -31.7413, lon: -60.5118 },
  { name: "San Luis", country: "Argentina", lat: -33.2950, lon: -66.3356 },
  { name: "Santiago del Estero", country: "Argentina", lat: -27.7951, lon: -64.2615 },
  { name: "Ambato", country: "Ecuador", lat: -1.2491, lon: -78.6168 },
  { name: "Loja", country: "Ecuador", lat: -3.9931, lon: -79.2042 },
  { name: "Manta", country: "Ecuador", lat: -0.9498, lon: -80.7089 },
  { name: "Arequipa", country: "Peru", lat: -16.4090, lon: -71.5375 },
  { name: "Pucallpa", country: "Peru", lat: -8.3791, lon: -74.5539 },
  { name: "Tacna", country: "Peru", lat: -18.0146, lon: -70.2536 },
  { name: "Buenaventura", country: "Colombia", lat: 3.8801, lon: -77.0311 },
  { name: "Neiva", country: "Colombia", lat: 2.9273, lon: -75.2819 },
  { name: "Villavicencio", country: "Colombia", lat: 4.1420, lon: -73.6266 },
  { name: "Ciudad Bolivar", country: "Venezuela", lat: 8.1222, lon: -63.5497 },
  { name: "Merida", country: "Venezuela", lat: 8.5897, lon: -71.1561 },
  { name: "San Cristobal", country: "Venezuela", lat: 7.7669, lon: -72.2250 },
  { name: "Concepcion", country: "Paraguay", lat: -23.4000, lon: -57.4333 },
  { name: "Encarnacion", country: "Paraguay", lat: -27.3375, lon: -55.8666 },
  { name: "Oruro", country: "Bolivia", lat: -17.9647, lon: -67.1064 },
  { name: "Potosi", country: "Bolivia", lat: -19.5836, lon: -65.7531 },
  { name: "Tarija", country: "Bolivia", lat: -21.5355, lon: -64.7296 },
  { name: "Trinidad", country: "Bolivia", lat: -14.8333, lon: -64.9000 },
  { name: "Cayenne", country: "French Guiana", lat: 4.9372, lon: -52.3260 },
  { name: "Rivera", country: "Uruguay", lat: -30.9050, lon: -55.5508 },

  // ============================================================
  // ADDITIONAL EUROPE
  // ============================================================
  { name: "Debrecen", country: "Hungary", lat: 47.5316, lon: 21.6273 },
  { name: "Pecs", country: "Hungary", lat: 46.0727, lon: 18.2323 },
  { name: "Bydgoszcz", country: "Poland", lat: 53.1235, lon: 18.0084 },
  { name: "Rzeszow", country: "Poland", lat: 50.0412, lon: 22.0040 },
  { name: "Torun", country: "Poland", lat: 53.0138, lon: 18.5984 },
  { name: "Sibiu", country: "Romania", lat: 45.7983, lon: 24.1256 },
  { name: "Oradea", country: "Romania", lat: 47.0722, lon: 21.9214 },
  { name: "Craiova", country: "Romania", lat: 44.3302, lon: 23.7949 },
  { name: "Zilina", country: "Slovakia", lat: 49.2231, lon: 18.7394 },
  { name: "Celje", country: "Slovenia", lat: 46.2360, lon: 15.2677 },
  { name: "Porto", country: "Portugal", lat: 41.1579, lon: -8.6291 },
  { name: "Aveiro", country: "Portugal", lat: 40.6443, lon: -8.6455 },
  { name: "Dijon", country: "France", lat: 47.3220, lon: 5.0415 },
  { name: "Le Havre", country: "France", lat: 49.4944, lon: 0.1079 },
  { name: "Reims", country: "France", lat: 49.2583, lon: 4.0317 },
  { name: "Saint-Etienne", country: "France", lat: 45.4397, lon: 4.3872 },
  { name: "Toulon", country: "France", lat: 43.1242, lon: 5.9280 },
  { name: "Tours", country: "France", lat: 47.3941, lon: 0.6848 },
  { name: "Aachen", country: "Germany", lat: 50.7753, lon: 6.0839 },
  { name: "Augsburg", country: "Germany", lat: 48.3705, lon: 10.8978 },
  { name: "Bielefeld", country: "Germany", lat: 52.0302, lon: 8.5325 },
  { name: "Freiburg", country: "Germany", lat: 47.9990, lon: 7.8421 },
  { name: "Karlsruhe", country: "Germany", lat: 49.0069, lon: 8.4037 },
  { name: "Kiel", country: "Germany", lat: 54.3233, lon: 10.1228 },
  { name: "Lubeck", country: "Germany", lat: 53.8655, lon: 10.6866 },
  { name: "Mainz", country: "Germany", lat: 49.9929, lon: 8.2473 },
  { name: "Mannheim", country: "Germany", lat: 49.4875, lon: 8.4660 },
  { name: "Rostock", country: "Germany", lat: 54.0924, lon: 12.0991 },
  { name: "Wiesbaden", country: "Germany", lat: 50.0782, lon: 8.2398 },
  { name: "Wuppertal", country: "Germany", lat: 51.2562, lon: 7.1508 },
  { name: "Ancona", country: "Italy", lat: 43.6158, lon: 13.5184 },
  { name: "Bergamo", country: "Italy", lat: 45.6983, lon: 9.6773 },
  { name: "Brescia", country: "Italy", lat: 45.5416, lon: 10.2118 },
  { name: "Cagliari", country: "Italy", lat: 39.2238, lon: 9.1217 },
  { name: "Messina", country: "Italy", lat: 38.1938, lon: 15.5540 },
  { name: "Padova", country: "Italy", lat: 45.4064, lon: 11.8768 },
  { name: "Perugia", country: "Italy", lat: 43.1107, lon: 12.3908 },
  { name: "Trieste", country: "Italy", lat: 45.6495, lon: 13.7768 },
  { name: "Cadiz", country: "Spain", lat: 36.5271, lon: -6.2886 },
  { name: "Gijon", country: "Spain", lat: 43.5322, lon: -5.6611 },
  { name: "Leon", country: "Spain", lat: 42.5987, lon: -5.5671 },
  { name: "Salamanca", country: "Spain", lat: 40.9688, lon: -5.6631 },
  { name: "Santander", country: "Spain", lat: 43.4623, lon: -3.8100 },
  { name: "Valladolid", country: "Spain", lat: 41.6523, lon: -4.7245 },
  { name: "Vigo", country: "Spain", lat: 42.2406, lon: -8.7207 },
  { name: "Dundalk", country: "Ireland", lat: 54.0027, lon: -6.4024 },
  { name: "Kilkenny", country: "Ireland", lat: 52.6541, lon: -7.2448 },
  { name: "Killarney", country: "Ireland", lat: 52.0599, lon: -9.5045 },
  { name: "Sligo", country: "Ireland", lat: 54.2766, lon: -8.4761 },
  { name: "Paisley", country: "United Kingdom", lat: 55.8466, lon: -4.4236 },
  { name: "Peterborough", country: "United Kingdom", lat: 52.5695, lon: -0.2405 },
  { name: "Sunderland", country: "United Kingdom", lat: 54.9069, lon: -1.3838 },
  { name: "Wolverhampton", country: "United Kingdom", lat: 52.5870, lon: -2.1288 },
  { name: "Chester", country: "United Kingdom", lat: 53.1930, lon: -2.8931 },
  { name: "Gloucester", country: "United Kingdom", lat: 51.8642, lon: -2.2382 },
  { name: "Lincoln", country: "United Kingdom", lat: 53.2307, lon: -0.5407 },
  { name: "Stirling", country: "United Kingdom", lat: 56.1166, lon: -3.9369 },
  { name: "Goteborg", country: "Sweden", lat: 57.7089, lon: 11.9746 },
  { name: "Norrkoping", country: "Sweden", lat: 58.5942, lon: 16.1826 },
  { name: "Vasteras", country: "Sweden", lat: 59.6099, lon: 16.5448 },
  { name: "Drammen", country: "Norway", lat: 59.7440, lon: 10.2045 },
  { name: "Kristiansand", country: "Norway", lat: 58.1599, lon: 8.0182 },
  { name: "Jyvaskyla", country: "Finland", lat: 62.2426, lon: 25.7473 },
  { name: "Kuopio", country: "Finland", lat: 62.8924, lon: 27.6770 },
  { name: "Joensuu", country: "Finland", lat: 62.6010, lon: 29.7636 },
  { name: "Charleroi", country: "Belgium", lat: 50.4108, lon: 4.4446 },
  { name: "Leuven", country: "Belgium", lat: 50.8798, lon: 4.7005 },
  { name: "Namur", country: "Belgium", lat: 50.4669, lon: 4.8675 },
  { name: "Arnhem", country: "Netherlands", lat: 51.9851, lon: 5.8987 },
  { name: "Breda", country: "Netherlands", lat: 51.5719, lon: 4.7683 },
  { name: "Haarlem", country: "Netherlands", lat: 52.3874, lon: 4.6462 },
  { name: "Leiden", country: "Netherlands", lat: 52.1601, lon: 4.4970 },
  { name: "Nijmegen", country: "Netherlands", lat: 51.8126, lon: 5.8372 },
  { name: "Tilburg", country: "Netherlands", lat: 51.5555, lon: 5.0913 },
  { name: "Interlaken", country: "Switzerland", lat: 46.6863, lon: 7.8632 },
  { name: "Lugano", country: "Switzerland", lat: 46.0037, lon: 8.9511 },
  { name: "St. Gallen", country: "Switzerland", lat: 47.4245, lon: 9.3767 },
  { name: "Winterthur", country: "Switzerland", lat: 47.5001, lon: 8.7240 },
  { name: "Ceske Budejovice", country: "Czech Republic", lat: 48.9745, lon: 14.4744 },
  { name: "Olomouc", country: "Czech Republic", lat: 49.5955, lon: 17.2518 },
  { name: "Liberec", country: "Czech Republic", lat: 50.7671, lon: 15.0564 },
  { name: "Karlovy Vary", country: "Czech Republic", lat: 50.2325, lon: 12.8712 },
  { name: "Arkhangelsk", country: "Russia", lat: 64.5399, lon: 40.5152 },
  { name: "Irkutsk", country: "Russia", lat: 52.2970, lon: 104.2964 },
  { name: "Khabarovsk", country: "Russia", lat: 48.4827, lon: 135.0836 },
  { name: "Murmansk", country: "Russia", lat: 68.9585, lon: 33.0827 },
  { name: "Saratov", country: "Russia", lat: 51.5336, lon: 46.0343 },
  { name: "Tomsk", country: "Russia", lat: 56.4884, lon: 84.9480 },
  { name: "Tyumen", country: "Russia", lat: 57.1553, lon: 65.5619 },
  { name: "Voronezh", country: "Russia", lat: 51.6720, lon: 39.1843 },
  { name: "Yakutsk", country: "Russia", lat: 62.0355, lon: 129.6755 },
  { name: "Adana", country: "Turkey", lat: 37.0000, lon: 35.3213 },
  { name: "Denizli", country: "Turkey", lat: 37.7765, lon: 29.0864 },
  { name: "Diyarbakir", country: "Turkey", lat: 37.9158, lon: 40.2189 },
  { name: "Mersin", country: "Turkey", lat: 36.8121, lon: 34.6415 },
  { name: "Samsun", country: "Turkey", lat: 41.2867, lon: 36.3300 },
  { name: "Vinnytsia", country: "Ukraine", lat: 49.2331, lon: 28.4682 },
  { name: "Chernivtsi", country: "Ukraine", lat: 48.2920, lon: 25.9358 },
  { name: "Ivano-Frankivsk", country: "Ukraine", lat: 48.9226, lon: 24.7111 },
  { name: "Ternopil", country: "Ukraine", lat: 49.5535, lon: 25.5948 },

  // ============================================================
  // ADDITIONAL ASIA
  // ============================================================
  { name: "Baotou", country: "China", lat: 40.6571, lon: 109.8400 },
  { name: "Changzhou", country: "China", lat: 31.8106, lon: 119.9741 },
  { name: "Guilin", country: "China", lat: 25.2736, lon: 110.2900 },
  { name: "Huizhou", country: "China", lat: 23.1116, lon: 114.4160 },
  { name: "Jilin", country: "China", lat: 43.8519, lon: 126.5601 },
  { name: "Liuzhou", country: "China", lat: 24.3264, lon: 109.4281 },
  { name: "Luoyang", country: "China", lat: 34.6197, lon: 112.4540 },
  { name: "Nantong", country: "China", lat: 31.9829, lon: 120.8943 },
  { name: "Quanzhou", country: "China", lat: 24.9139, lon: 118.5860 },
  { name: "Sanya", country: "China", lat: 18.2528, lon: 109.5020 },
  { name: "Shaoxing", country: "China", lat: 30.0000, lon: 120.5833 },
  { name: "Tangshan", country: "China", lat: 39.6292, lon: 118.1802 },
  { name: "Weifang", country: "China", lat: 36.7069, lon: 119.1619 },
  { name: "Yantai", country: "China", lat: 37.4638, lon: 121.4479 },
  { name: "Zibo", country: "China", lat: 36.8131, lon: 118.0548 },
  { name: "Zurich", country: "China", lat: 30.5723, lon: 104.0665 },
  { name: "Ajmer", country: "India", lat: 26.4499, lon: 74.6399 },
  { name: "Allahabad", country: "India", lat: 25.4358, lon: 81.8463 },
  { name: "Aurangabad", country: "India", lat: 19.8762, lon: 75.3433 },
  { name: "Bareilly", country: "India", lat: 28.3670, lon: 79.4304 },
  { name: "Belgaum", country: "India", lat: 15.8497, lon: 74.4977 },
  { name: "Calicut", country: "India", lat: 11.2588, lon: 75.7804 },
  { name: "Gwalior", country: "India", lat: 26.2183, lon: 78.1828 },
  { name: "Hubli", country: "India", lat: 15.3647, lon: 75.1240 },
  { name: "Jabalpur", country: "India", lat: 23.1815, lon: 79.9864 },
  { name: "Jamshedpur", country: "India", lat: 22.8046, lon: 86.2029 },
  { name: "Nashik", country: "India", lat: 20.0063, lon: 73.7898 },
  { name: "Rajkot", country: "India", lat: 22.3039, lon: 70.8022 },
  { name: "Raipur", country: "India", lat: 21.2514, lon: 81.6296 },
  { name: "Salem", country: "India", lat: 11.6643, lon: 78.1460 },
  { name: "Warangal", country: "India", lat: 17.9784, lon: 79.5941 },
  { name: "Chitose", country: "Japan", lat: 42.8215, lon: 141.6499 },
  { name: "Hakodate", country: "Japan", lat: 41.7687, lon: 140.7288 },
  { name: "Matsuyama", country: "Japan", lat: 33.8392, lon: 132.7657 },
  { name: "Nara", country: "Japan", lat: 34.6851, lon: 135.8050 },
  { name: "Oita", country: "Japan", lat: 33.2382, lon: 131.6126 },
  { name: "Takamatsu", country: "Japan", lat: 34.3401, lon: 134.0434 },
  { name: "Tokushima", country: "Japan", lat: 34.0658, lon: 134.5593 },
  { name: "Toyama", country: "Japan", lat: 36.6953, lon: 137.2114 },
  { name: "Utsunomiya", country: "Japan", lat: 36.5551, lon: 139.8836 },
  { name: "Changwon", country: "South Korea", lat: 35.2270, lon: 128.6811 },
  { name: "Cheonan", country: "South Korea", lat: 36.8065, lon: 127.1522 },
  { name: "Jeonju", country: "South Korea", lat: 35.8242, lon: 127.1480 },
  { name: "Pohang", country: "South Korea", lat: 36.0190, lon: 129.3435 },
  { name: "Wonju", country: "South Korea", lat: 37.3422, lon: 127.9202 },
  { name: "Yongin", country: "South Korea", lat: 37.2411, lon: 127.1776 },
  { name: "Hsinchu", country: "Taiwan", lat: 24.8138, lon: 120.9675 },
  { name: "Keelung", country: "Taiwan", lat: 25.1283, lon: 121.7419 },
  { name: "Taoyuan", country: "Taiwan", lat: 24.9937, lon: 121.3010 },
  { name: "Ayutthaya", country: "Thailand", lat: 14.3692, lon: 100.5877 },
  { name: "Chon Buri", country: "Thailand", lat: 13.3611, lon: 100.9847 },
  { name: "Krabi", country: "Thailand", lat: 8.0863, lon: 98.9063 },
  { name: "Lampang", country: "Thailand", lat: 18.2888, lon: 99.4987 },
  { name: "Nakhon Si Thammarat", country: "Thailand", lat: 8.4304, lon: 99.9631 },
  { name: "Surat Thani", country: "Thailand", lat: 9.1382, lon: 99.3200 },
  { name: "Battambang", country: "Cambodia", lat: 13.1023, lon: 103.1962 },
  { name: "Banjarmasin", country: "Indonesia", lat: -3.3186, lon: 114.5944 },
  { name: "Manado", country: "Indonesia", lat: 1.4748, lon: 124.8421 },
  { name: "Padang", country: "Indonesia", lat: -0.9471, lon: 100.4172 },
  { name: "Pekanbaru", country: "Indonesia", lat: 0.5071, lon: 101.4478 },
  { name: "Pontianak", country: "Indonesia", lat: -0.0263, lon: 109.3425 },
  { name: "Baguio", country: "Philippines", lat: 16.4023, lon: 120.5960 },
  { name: "Bacolod", country: "Philippines", lat: 10.6840, lon: 122.9740 },
  { name: "Cagayan de Oro", country: "Philippines", lat: 8.4542, lon: 124.6319 },
  { name: "General Santos", country: "Philippines", lat: 6.1164, lon: 125.1716 },
  { name: "Tacloban", country: "Philippines", lat: 11.2543, lon: 124.9600 },
  { name: "Ha Long", country: "Vietnam", lat: 20.9517, lon: 107.0845 },
  { name: "Qui Nhon", country: "Vietnam", lat: 13.7830, lon: 109.2196 },
  { name: "Vung Tau", country: "Vietnam", lat: 10.3460, lon: 107.0843 },
  { name: "Alor Setar", country: "Malaysia", lat: 6.1248, lon: 100.3673 },
  { name: "Miri", country: "Malaysia", lat: 4.3995, lon: 114.0148 },
  { name: "Shah Alam", country: "Malaysia", lat: 3.0738, lon: 101.5183 },
  { name: "Mandalay", country: "Myanmar", lat: 21.9588, lon: 96.0891 },
  { name: "Paro", country: "Bhutan", lat: 27.4305, lon: 89.4120 },
  { name: "Lumbini", country: "Nepal", lat: 27.4833, lon: 83.2667 },
  { name: "Kandy", country: "Sri Lanka", lat: 7.2906, lon: 80.6337 },
  { name: "Jaffna", country: "Sri Lanka", lat: 9.6615, lon: 80.0255 },
  { name: "Trincomalee", country: "Sri Lanka", lat: 8.5874, lon: 81.2152 },

  // Additional Middle East
  { name: "Al Ain", country: "United Arab Emirates", lat: 24.1917, lon: 55.7606 },
  { name: "Fujairah", country: "United Arab Emirates", lat: 25.1288, lon: 56.3265 },
  { name: "Ras Al Khaimah", country: "United Arab Emirates", lat: 25.7895, lon: 55.9432 },
  { name: "Abha", country: "Saudi Arabia", lat: 18.2164, lon: 42.5053 },
  { name: "Tabuk", country: "Saudi Arabia", lat: 28.3838, lon: 36.5550 },
  { name: "Taif", country: "Saudi Arabia", lat: 21.2703, lon: 40.4158 },
  { name: "Hawalli", country: "Kuwait", lat: 29.3375, lon: 48.0287 },
  { name: "Salalah", country: "Oman", lat: 17.0151, lon: 54.0924 },
  { name: "Sohar", country: "Oman", lat: 24.3615, lon: 56.7468 },
  { name: "Karbala", country: "Iraq", lat: 32.6160, lon: 44.0249 },
  { name: "Najaf", country: "Iraq", lat: 32.0003, lon: 44.3354 },
  { name: "Sulaymaniyah", country: "Iraq", lat: 35.5570, lon: 45.4353 },
  { name: "Byblos", country: "Lebanon", lat: 34.1236, lon: 35.6481 },
  { name: "Sidon", country: "Lebanon", lat: 33.5571, lon: 35.3729 },
  { name: "Be'er Sheva", country: "Israel", lat: 31.2518, lon: 34.7913 },
  { name: "Nazareth", country: "Israel", lat: 32.7019, lon: 35.2979 },
  { name: "Kerman", country: "Iran", lat: 30.2839, lon: 57.0834 },
  { name: "Qom", country: "Iran", lat: 34.6416, lon: 50.8746 },
  { name: "Rasht", country: "Iran", lat: 37.2682, lon: 49.5891 },
  { name: "Ahvaz", country: "Iran", lat: 31.3183, lon: 48.6706 },

  // Additional Central Asia
  { name: "Aktau", country: "Kazakhstan", lat: 43.6351, lon: 51.1697 },
  { name: "Atyrau", country: "Kazakhstan", lat: 47.1076, lon: 51.9141 },
  { name: "Kostanay", country: "Kazakhstan", lat: 53.2198, lon: 63.6354 },
  { name: "Osh", country: "Kyrgyzstan", lat: 40.5283, lon: 72.7985 },
  { name: "Bukhara", country: "Uzbekistan", lat: 39.7681, lon: 64.4556 },
  { name: "Fergana", country: "Uzbekistan", lat: 40.3842, lon: 71.7889 },
  { name: "Namangan", country: "Uzbekistan", lat: 40.9983, lon: 71.6726 },
  { name: "Nukus", country: "Uzbekistan", lat: 42.4628, lon: 59.6035 },
  { name: "Khujand", country: "Tajikistan", lat: 40.2826, lon: 69.6291 },
  { name: "Kutaisi", country: "Georgia", lat: 42.2679, lon: 42.6946 },
  { name: "Mary", country: "Turkmenistan", lat: 37.5936, lon: 61.8303 },
  { name: "Turkmenabat", country: "Turkmenistan", lat: 39.0734, lon: 63.5786 },

  // ============================================================
  // ADDITIONAL AFRICA
  // ============================================================
  { name: "Adama", country: "Ethiopia", lat: 8.5400, lon: 39.2700 },
  { name: "Bahir Dar", country: "Ethiopia", lat: 11.5936, lon: 37.3900 },
  { name: "Jimma", country: "Ethiopia", lat: 7.6667, lon: 36.8333 },
  { name: "Eldoret", country: "Kenya", lat: 0.5143, lon: 35.2698 },
  { name: "Malindi", country: "Kenya", lat: -3.2138, lon: 40.1169 },
  { name: "Thika", country: "Kenya", lat: -1.0396, lon: 37.0900 },
  { name: "Morogoro", country: "Tanzania", lat: -6.8235, lon: 37.6615 },
  { name: "Tanga", country: "Tanzania", lat: -5.0689, lon: 39.1002 },
  { name: "Jinja", country: "Uganda", lat: 0.4244, lon: 33.2041 },
  { name: "Mbarara", country: "Uganda", lat: -0.6133, lon: 30.6548 },
  { name: "Butare", country: "Rwanda", lat: -2.5997, lon: 29.7394 },
  { name: "Gisenyi", country: "Rwanda", lat: -1.7000, lon: 29.2564 },
  { name: "Lusaka", country: "Zambia", lat: -15.3875, lon: 28.3228 },
  { name: "Kitwe", country: "Zambia", lat: -12.8024, lon: 28.2132 },
  { name: "Bujumbura", country: "Burundi", lat: -3.3822, lon: 29.3644 },
  { name: "Lubumbashi", country: "Democratic Republic of the Congo", lat: -11.6876, lon: 27.5026 },
  { name: "Kisangani", country: "Democratic Republic of the Congo", lat: 0.5164, lon: 25.1909 },
  { name: "Goma", country: "Democratic Republic of the Congo", lat: -1.6802, lon: 29.2283 },
  { name: "Pointe-Noire", country: "Republic of the Congo", lat: -4.7692, lon: 11.8664 },
  { name: "Libreville", country: "Gabon", lat: 0.4162, lon: 9.4673 },
  { name: "Port-Gentil", country: "Gabon", lat: -0.7193, lon: 8.7815 },
  { name: "Malabo", country: "Equatorial Guinea", lat: 3.7523, lon: 8.7741 },
  { name: "Bangui", country: "Central African Republic", lat: 4.3947, lon: 18.5582 },
  { name: "Windhoek", country: "Namibia", lat: -22.5609, lon: 17.0658 },
  { name: "Walvis Bay", country: "Namibia", lat: -22.9575, lon: 14.5054 },
  { name: "Swakopmund", country: "Namibia", lat: -22.6784, lon: 14.5266 },
  { name: "Gaborone", country: "Botswana", lat: -24.6282, lon: 25.9231 },
  { name: "Maun", country: "Botswana", lat: -19.9833, lon: 23.4167 },
  { name: "Francistown", country: "Botswana", lat: -21.1667, lon: 27.5167 },
  { name: "Antsiranana", country: "Madagascar", lat: -12.2765, lon: 49.2917 },
  { name: "Toamasina", country: "Madagascar", lat: -18.1492, lon: 49.3858 },
  { name: "Fes", country: "Morocco", lat: 34.0181, lon: -5.0078 },
  { name: "Oujda", country: "Morocco", lat: 34.6816, lon: -1.9086 },
  { name: "Tetouan", country: "Morocco", lat: 35.5785, lon: -5.3684 },
  { name: "Sousse", country: "Tunisia", lat: 35.8256, lon: 10.6369 },
  { name: "Sfax", country: "Tunisia", lat: 34.7406, lon: 10.7603 },
  { name: "Kairouan", country: "Tunisia", lat: 35.6781, lon: 10.0963 },
  { name: "Asmara", country: "Eritrea", lat: 15.3229, lon: 38.9251 },
  { name: "Djibouti City", country: "Djibouti", lat: 11.5881, lon: 43.1456 },
  { name: "Hargeisa", country: "Somalia", lat: 9.5600, lon: 44.0650 },
  { name: "Kismayo", country: "Somalia", lat: -0.3522, lon: 42.5422 },
  { name: "Juba", country: "South Sudan", lat: 4.8594, lon: 31.5713 },
  { name: "Niamey", country: "Niger", lat: 13.5127, lon: 2.1128 },
  { name: "N'Djamena", country: "Chad", lat: 12.1348, lon: 15.0557 },
  { name: "Ouagadougou", country: "Burkina Faso", lat: 12.3714, lon: -1.5197 },
  { name: "Bobo-Dioulasso", country: "Burkina Faso", lat: 11.1771, lon: -4.2979 },
  { name: "Cape Coast", country: "Ghana", lat: 5.1036, lon: -1.2825 },
  { name: "Takoradi", country: "Ghana", lat: 4.8845, lon: -1.7554 },
  { name: "Tema", country: "Ghana", lat: 5.6698, lon: -0.0166 },
  { name: "Lome", country: "Togo", lat: 6.1319, lon: 1.2228 },
  { name: "Cotonou", country: "Benin", lat: 6.3703, lon: 2.3912 },
  { name: "Abeokuta", country: "Nigeria", lat: 7.1475, lon: 3.3619 },
  { name: "Akure", country: "Nigeria", lat: 7.2571, lon: 5.2058 },
  { name: "Ilorin", country: "Nigeria", lat: 8.4966, lon: 4.5426 },
  { name: "Owerri", country: "Nigeria", lat: 5.4836, lon: 7.0333 },
  { name: "Uyo", country: "Nigeria", lat: 5.0377, lon: 7.9128 },
  { name: "Zaria", country: "Nigeria", lat: 11.0667, lon: 7.7000 },
  { name: "Bamenda", country: "Cameroon", lat: 5.9631, lon: 10.1591 },
  { name: "Garoua", country: "Cameroon", lat: 9.3000, lon: 13.3940 },
  { name: "Maroua", country: "Cameroon", lat: 10.5957, lon: 14.3263 },
  { name: "Mombasa", country: "Kenya", lat: -4.0435, lon: 39.6682 },
  { name: "Beira", country: "Mozambique", lat: -19.8436, lon: 34.8389 },
  { name: "Pemba", country: "Mozambique", lat: -12.9736, lon: 40.5176 },
  { name: "Quelimane", country: "Mozambique", lat: -17.8784, lon: 36.8882 },
  { name: "Gweru", country: "Zimbabwe", lat: -19.4500, lon: 29.8167 },
  { name: "Masvingo", country: "Zimbabwe", lat: -20.0744, lon: 30.8328 },
  { name: "East London", country: "South Africa", lat: -33.0292, lon: 27.8546 },
  { name: "Rustenburg", country: "South Africa", lat: -25.6715, lon: 27.2428 },
  { name: "George", country: "South Africa", lat: -33.9631, lon: 22.4617 },
  { name: "Stellenbosch", country: "South Africa", lat: -33.9321, lon: 18.8602 },
  { name: "Upington", country: "South Africa", lat: -28.4572, lon: 21.2567 },

  // ============================================================
  // ADDITIONAL OCEANIA
  // ============================================================
  { name: "Bendigo", country: "Australia", lat: -36.7570, lon: 144.2794 },
  { name: "Broome", country: "Australia", lat: -17.9614, lon: 122.2359 },
  { name: "Bundaberg", country: "Australia", lat: -24.8661, lon: 152.3489 },
  { name: "Coffs Harbour", country: "Australia", lat: -30.2963, lon: 153.1157 },
  { name: "Gladstone", country: "Australia", lat: -23.8527, lon: 151.2627 },
  { name: "Kalgoorlie", country: "Australia", lat: -30.7489, lon: 121.4658 },
  { name: "Mackay", country: "Australia", lat: -21.1411, lon: 149.1861 },
  { name: "Mandurah", country: "Australia", lat: -32.5269, lon: 115.7217 },
  { name: "Mildura", country: "Australia", lat: -34.1855, lon: 142.1625 },
  { name: "Orange", country: "Australia", lat: -33.2840, lon: 149.1012 },
  { name: "Port Augusta", country: "Australia", lat: -32.4920, lon: 137.7830 },
  { name: "Rockhampton", country: "Australia", lat: -23.3791, lon: 150.5100 },
  { name: "Shepparton", country: "Australia", lat: -36.3833, lon: 145.3988 },
  { name: "Tamworth", country: "Australia", lat: -31.0833, lon: 150.9167 },
  { name: "Wagga Wagga", country: "Australia", lat: -35.1082, lon: 147.3598 },
  { name: "Invercargill", country: "New Zealand", lat: -46.4132, lon: 168.3538 },
  { name: "Nelson", country: "New Zealand", lat: -41.2706, lon: 173.2840 },
  { name: "New Plymouth", country: "New Zealand", lat: -39.0556, lon: 174.0752 },
  { name: "Palmerston North", country: "New Zealand", lat: -40.3523, lon: 175.6082 },
  { name: "Whangarei", country: "New Zealand", lat: -35.7275, lon: 174.3166 },
  { name: "Labasa", country: "Fiji", lat: -16.4333, lon: 179.3667 },
  { name: "Lautoka", country: "Fiji", lat: -17.6167, lon: 177.4500 },
  { name: "Honiara", country: "Solomon Islands", lat: -9.4456, lon: 159.9729 },
  { name: "Port Moresby", country: "Papua New Guinea", lat: -6.3149, lon: 143.9556 },
  { name: "Lae", country: "Papua New Guinea", lat: -6.7320, lon: 147.0000 },
  { name: "Madang", country: "Papua New Guinea", lat: -5.2269, lon: 145.7960 },
  { name: "Papeete", country: "French Polynesia", lat: -17.5516, lon: -149.5585 },
  { name: "Hagta", country: "Guam", lat: 13.4745, lon: 144.7504 },
  { name: "Tarawa", country: "Kiribati", lat: 1.4518, lon: 173.0183 },
  { name: "Majuro", country: "Marshall Islands", lat: 7.0897, lon: 171.3803 },
  { name: "Palikir", country: "Micronesia", lat: 6.9248, lon: 158.1610 },
  { name: "Yaren", country: "Nauru", lat: -0.5477, lon: 166.9209 },
  { name: "Funafuti", country: "Tuvalu", lat: -8.5211, lon: 179.1983 },

  // ============================================================
  // ADDITIONAL CENTRAL AMERICA
  // ============================================================
  { name: "La Ceiba", country: "Honduras", lat: 15.7631, lon: -86.7919 },
  { name: "Roatan", country: "Honduras", lat: 16.3305, lon: -86.5316 },
  { name: "Bluefields", country: "Nicaragua", lat: 12.0131, lon: -83.7636 },
  { name: "Granada", country: "Nicaragua", lat: 11.9344, lon: -85.9560 },
  { name: "Chitre", country: "Panama", lat: 7.9667, lon: -80.4333 },
  { name: "Liberia", country: "Costa Rica", lat: 10.6332, lon: -85.4378 },
  { name: "San Isidro", country: "Costa Rica", lat: 9.3682, lon: -83.7016 },
  { name: "Coban", country: "Guatemala", lat: 15.4714, lon: -90.3708 },
  { name: "Escuintla", country: "Guatemala", lat: 14.2989, lon: -90.7850 },
  { name: "Flores", country: "Guatemala", lat: 16.9268, lon: -89.8884 },
  { name: "San Miguel", country: "El Salvador", lat: 13.4834, lon: -88.1834 },
  { name: "Santa Ana", country: "El Salvador", lat: 13.9942, lon: -89.5597 },

  // ============================================================
  // ADDITIONAL SMALL NATIONS & TERRITORIES
  // ============================================================
  { name: "Monaco", country: "Monaco", lat: 43.7384, lon: 7.4246 },
  { name: "San Marino", country: "San Marino", lat: 43.9424, lon: 12.4578 },
  { name: "Vaduz", country: "Liechtenstein", lat: 47.1410, lon: 9.5209 },
  { name: "Andorra la Vella", country: "Andorra", lat: 42.5063, lon: 1.5218 },
  { name: "Gibraltar", country: "Gibraltar", lat: 36.1408, lon: -5.3536 },
  { name: "Douglas", country: "Isle of Man", lat: 54.1509, lon: -4.4848 },
  { name: "St. Helier", country: "Jersey", lat: 49.1858, lon: -2.1071 },
  { name: "Torshavn", country: "Faroe Islands", lat: 62.0107, lon: -6.7716 },
  { name: "Nuuk", country: "Greenland", lat: 64.1814, lon: -51.6941 },
  { name: "Podgorica", country: "Montenegro", lat: 42.4304, lon: 19.2594 },
  { name: "Pristina", country: "Kosovo", lat: 42.6629, lon: 21.1655 },
  { name: "Prizren", country: "Kosovo", lat: 42.2139, lon: 20.7397 },
  { name: "Skopje", country: "North Macedonia", lat: 41.9981, lon: 21.4254 },
  { name: "Ohrid", country: "North Macedonia", lat: 41.1231, lon: 20.8016 },
  { name: "Bitola", country: "North Macedonia", lat: 41.0297, lon: 21.3292 },
  { name: "Tivat", country: "Montenegro", lat: 42.4364, lon: 18.6961 },
  { name: "Budva", country: "Montenegro", lat: 42.2911, lon: 18.8403 },
  { name: "Pula", country: "Croatia", lat: 44.8666, lon: 13.8496 },
  { name: "Zadar", country: "Croatia", lat: 44.1194, lon: 15.2314 },
  { name: "Sibenik", country: "Croatia", lat: 43.7272, lon: 15.9058 },
  { name: "Osijek", country: "Croatia", lat: 45.5511, lon: 18.6939 },
  { name: "Shkoder", country: "Albania", lat: 42.0693, lon: 19.5126 },
  { name: "Sarande", country: "Albania", lat: 39.8661, lon: 20.0050 },
  { name: "Korce", country: "Albania", lat: 40.6186, lon: 20.7808 },
  { name: "Limassol", country: "Cyprus", lat: 34.6841, lon: 33.0379 },
  { name: "Paphos", country: "Cyprus", lat: 34.7720, lon: 32.4297 },
  { name: "Famagusta", country: "Cyprus", lat: 35.1250, lon: 33.9500 },
  { name: "Chania", country: "Greece", lat: 35.5138, lon: 24.0180 },
  { name: "Corfu", country: "Greece", lat: 39.6243, lon: 19.9217 },
  { name: "Ioannina", country: "Greece", lat: 39.6650, lon: 20.8537 },
  { name: "Kalamata", country: "Greece", lat: 37.0389, lon: 22.1143 },
  { name: "Larissa", country: "Greece", lat: 39.6371, lon: 22.4208 },
  { name: "Rhodes", country: "Greece", lat: 36.4341, lon: 28.2176 },
  { name: "Volos", country: "Greece", lat: 39.3610, lon: 22.9451 },
  { name: "Suez", country: "Egypt", lat: 29.9668, lon: 32.5498 },
  { name: "Ismailia", country: "Egypt", lat: 30.6043, lon: 32.2723 },
  { name: "Mansoura", country: "Egypt", lat: 31.0409, lon: 31.3785 },
  { name: "Tanta", country: "Egypt", lat: 30.7865, lon: 31.0004 },
  { name: "Zagazig", country: "Egypt", lat: 30.5877, lon: 31.5020 },
  { name: "Sohag", country: "Egypt", lat: 26.5591, lon: 31.6948 },
  { name: "Qena", country: "Egypt", lat: 26.1551, lon: 32.7160 },

  // ============================================================
  // MORE UNITED STATES - Additional major cities & state capitals
  // ============================================================
  { name: "Pueblo", country: "United States", lat: 38.2544, lon: -104.6091 },
  { name: "Ogden", country: "United States", lat: 41.2230, lon: -111.9738 },
  { name: "Sandy", country: "United States", lat: 40.5649, lon: -111.8389 },
  { name: "West Jordan", country: "United States", lat: 40.6097, lon: -111.9391 },
  { name: "Clearwater", country: "United States", lat: 27.9659, lon: -82.8001 },
  { name: "Palm Bay", country: "United States", lat: 28.0345, lon: -80.5887 },
  { name: "Lakeland", country: "United States", lat: 28.0395, lon: -81.9498 },
  { name: "Pompano Beach", country: "United States", lat: 26.2379, lon: -80.1248 },
  { name: "Davie", country: "United States", lat: 26.0765, lon: -80.2521 },
  { name: "Boca Raton", country: "United States", lat: 26.3683, lon: -80.1289 },
  { name: "Sunrise", country: "United States", lat: 26.1367, lon: -80.1131 },
  { name: "Plantation", country: "United States", lat: 26.1276, lon: -80.2331 },
  { name: "Largo", country: "United States", lat: 27.9095, lon: -82.7873 },
  { name: "Deerfield Beach", country: "United States", lat: 26.3184, lon: -80.0998 },
  { name: "Melbourne", country: "United States", lat: 28.0836, lon: -80.6081 },
  { name: "Boynton Beach", country: "United States", lat: 26.5254, lon: -80.0662 },
  { name: "Delray Beach", country: "United States", lat: 26.4615, lon: -80.0729 },
  { name: "Port St. Lucie", country: "United States", lat: 27.2730, lon: -80.3582 },
  { name: "Ocala", country: "United States", lat: 29.1872, lon: -82.1401 },
  { name: "Evansville", country: "United States", lat: 37.9716, lon: -87.5711 },
  { name: "Lafayette", country: "United States", lat: 30.2241, lon: -92.0198 },
  { name: "Lake Charles", country: "United States", lat: 30.2266, lon: -93.2174 },
  { name: "Tyler", country: "United States", lat: 32.3513, lon: -95.3011 },
  { name: "San Angelo", country: "United States", lat: 31.4638, lon: -100.4370 },
  { name: "College Station", country: "United States", lat: 30.6280, lon: -96.3344 },
  { name: "Round Rock", country: "United States", lat: 30.5083, lon: -97.6789 },
  { name: "Pearland", country: "United States", lat: 29.5636, lon: -95.2860 },
  { name: "League City", country: "United States", lat: 29.5075, lon: -95.0950 },
  { name: "Sugar Land", country: "United States", lat: 29.6197, lon: -95.6349 },
  { name: "Conroe", country: "United States", lat: 30.3119, lon: -95.4560 },
  { name: "New Braunfels", country: "United States", lat: 29.7030, lon: -98.1245 },
  { name: "Allen", country: "United States", lat: 33.1032, lon: -96.6706 },
  { name: "Edinburg", country: "United States", lat: 26.3017, lon: -98.1633 },
  { name: "Concord", country: "United States", lat: 37.9780, lon: -122.0311 },
  { name: "Carlsbad", country: "United States", lat: 33.1581, lon: -117.3506 },
  { name: "Temecula", country: "United States", lat: 33.4936, lon: -117.1484 },
  { name: "Murrieta", country: "United States", lat: 33.5539, lon: -117.2139 },
  { name: "Menifee", country: "United States", lat: 33.6971, lon: -117.1851 },
  { name: "Victorville", country: "United States", lat: 34.5362, lon: -117.2928 },
  { name: "Visalia", country: "United States", lat: 36.3302, lon: -119.2921 },
  { name: "Vallejo", country: "United States", lat: 38.1041, lon: -122.2566 },
  { name: "Fairfield", country: "United States", lat: 38.2494, lon: -122.0400 },
  { name: "Berkeley", country: "United States", lat: 37.8716, lon: -122.2727 },
  { name: "San Mateo", country: "United States", lat: 37.5630, lon: -122.3255 },
  { name: "Redding", country: "United States", lat: 40.5865, lon: -122.3917 },
  { name: "Chico", country: "United States", lat: 39.7285, lon: -121.8375 },
  { name: "San Luis Obispo", country: "United States", lat: 35.2828, lon: -120.6596 },
  { name: "Monterey", country: "United States", lat: 36.6002, lon: -121.8947 },
  { name: "Redwood City", country: "United States", lat: 37.4852, lon: -122.2364 },
  { name: "Mountain View", country: "United States", lat: 37.3861, lon: -122.0839 },
  { name: "Palo Alto", country: "United States", lat: 37.4419, lon: -122.1430 },
  { name: "Santa Monica", country: "United States", lat: 34.0195, lon: -118.4912 },
  { name: "Burbank", country: "United States", lat: 34.1808, lon: -118.3090 },
  { name: "West Covina", country: "United States", lat: 34.0686, lon: -117.9390 },
  { name: "Norwalk", country: "United States", lat: 33.9022, lon: -118.0817 },
  { name: "El Monte", country: "United States", lat: 34.0686, lon: -118.0276 },
  { name: "Downey", country: "United States", lat: 33.9401, lon: -118.1332 },
  { name: "Inglewood", country: "United States", lat: 33.9617, lon: -118.3531 },
  { name: "Whittier", country: "United States", lat: 33.9792, lon: -118.0328 },
  { name: "Hawthorne", country: "United States", lat: 33.9164, lon: -118.3526 },
  { name: "Alhambra", country: "United States", lat: 34.0953, lon: -118.1270 },
  { name: "Buena Park", country: "United States", lat: 33.8675, lon: -117.9981 },
  { name: "Compton", country: "United States", lat: 33.8958, lon: -118.2201 },
  { name: "South Gate", country: "United States", lat: 33.9547, lon: -118.2120 },
  { name: "Tuscaloosa", country: "United States", lat: 33.2098, lon: -87.5692 },
  { name: "Dothan", country: "United States", lat: 31.2232, lon: -85.3905 },
  { name: "Decatur", country: "United States", lat: 34.6059, lon: -86.9833 },
  { name: "Athens", country: "United States", lat: 33.9519, lon: -83.3576 },
  { name: "Sandy Springs", country: "United States", lat: 33.9304, lon: -84.3733 },
  { name: "Marietta", country: "United States", lat: 33.9526, lon: -84.5499 },
  { name: "Valdosta", country: "United States", lat: 30.8327, lon: -83.2785 },
  { name: "Warner Robins", country: "United States", lat: 32.6130, lon: -83.6243 },
  { name: "Albany", country: "United States", lat: 31.5785, lon: -84.1557 },
  { name: "Duluth", country: "United States", lat: 34.0029, lon: -84.1446 },
  { name: "North Charleston", country: "United States", lat: 32.8546, lon: -79.9748 },
  { name: "Rock Hill", country: "United States", lat: 34.9249, lon: -81.0251 },
  { name: "Sumter", country: "United States", lat: 33.9204, lon: -80.3415 },
  { name: "Wilmington", country: "United States", lat: 34.2257, lon: -77.9447 },
  { name: "High Point", country: "United States", lat: 35.9557, lon: -80.0053 },
  { name: "Concord", country: "United States", lat: 35.4088, lon: -80.5795 },
  { name: "Gastonia", country: "United States", lat: 35.2621, lon: -81.1873 },
  { name: "Jacksonville", country: "United States", lat: 34.7540, lon: -77.4303 },
  { name: "Apex", country: "United States", lat: 35.7327, lon: -78.8503 },
  { name: "Huntersville", country: "United States", lat: 35.4107, lon: -80.8429 },
  { name: "Harrisonburg", country: "United States", lat: 38.4496, lon: -78.8689 },
  { name: "Lynchburg", country: "United States", lat: 37.4138, lon: -79.1422 },
  { name: "Danville", country: "United States", lat: 36.5860, lon: -79.3950 },
  { name: "Manassas", country: "United States", lat: 38.7509, lon: -77.4753 },
  { name: "Suffolk", country: "United States", lat: 36.7282, lon: -76.5836 },
  { name: "Newport News", country: "United States", lat: 37.0871, lon: -76.4730 },
  { name: "Hampton", country: "United States", lat: 37.0299, lon: -76.3452 },
  { name: "Germantown", country: "United States", lat: 39.1732, lon: -77.2714 },
  { name: "Frederick", country: "United States", lat: 39.4143, lon: -77.4105 },
  { name: "Gaithersburg", country: "United States", lat: 39.1434, lon: -77.2014 },
  { name: "Bowie", country: "United States", lat: 38.9428, lon: -76.7302 },
  { name: "Annapolis", country: "United States", lat: 38.9784, lon: -76.4922 },
  { name: "Cumberland", country: "United States", lat: 39.6528, lon: -78.7625 },
  { name: "Lexington Park", country: "United States", lat: 38.2668, lon: -76.4538 },
  { name: "Hagerstown", country: "United States", lat: 39.6418, lon: -77.7200 },
  { name: "Manchester", country: "United States", lat: 42.9956, lon: -71.4548 },
  { name: "Nashua", country: "United States", lat: 42.7654, lon: -71.4676 },
  { name: "Cranston", country: "United States", lat: 41.7798, lon: -71.4373 },
  { name: "Warwick", country: "United States", lat: 41.7001, lon: -71.4162 },
  { name: "Pawtucket", country: "United States", lat: 41.8787, lon: -71.3826 },
  { name: "Stamford", country: "United States", lat: 41.0534, lon: -73.5387 },
  { name: "Waterbury", country: "United States", lat: 41.5582, lon: -73.0515 },
  { name: "Danbury", country: "United States", lat: 41.3948, lon: -73.4540 },
  { name: "Greenwich", country: "United States", lat: 41.0262, lon: -73.6282 },
  { name: "Schenectady", country: "United States", lat: 42.8142, lon: -73.9396 },
  { name: "Utica", country: "United States", lat: 43.1009, lon: -75.2327 },
  { name: "Binghamton", country: "United States", lat: 42.0987, lon: -75.9180 },
  { name: "Poughkeepsie", country: "United States", lat: 41.7004, lon: -73.9210 },
  { name: "White Plains", country: "United States", lat: 41.0340, lon: -73.7629 },
  { name: "Yonkers", country: "United States", lat: 40.9312, lon: -73.8988 },
  { name: "New Rochelle", country: "United States", lat: 40.9115, lon: -73.7824 },
  { name: "Mount Vernon", country: "United States", lat: 40.9126, lon: -73.8371 },
  { name: "Allentown", country: "United States", lat: 40.6023, lon: -75.4714 },
  { name: "Reading", country: "United States", lat: 40.3357, lon: -75.9269 },
  { name: "Bethlehem", country: "United States", lat: 40.6259, lon: -75.3705 },
  { name: "Scranton", country: "United States", lat: 41.4090, lon: -75.6624 },
  { name: "Wilkes-Barre", country: "United States", lat: 41.2459, lon: -75.8813 },
  { name: "Erie", country: "United States", lat: 42.1292, lon: -80.0851 },
  { name: "York", country: "United States", lat: 39.9626, lon: -76.7277 },
  { name: "State College", country: "United States", lat: 40.7934, lon: -77.8600 },
  { name: "Flint", country: "United States", lat: 43.0125, lon: -83.6875 },
  { name: "Kalamazoo", country: "United States", lat: 42.2917, lon: -85.5872 },
  { name: "Saginaw", country: "United States", lat: 43.4195, lon: -83.9508 },
  { name: "Traverse City", country: "United States", lat: 44.7631, lon: -85.6206 },
  { name: "Muskegon", country: "United States", lat: 43.2342, lon: -86.2484 },
  { name: "Holland", country: "United States", lat: 42.7876, lon: -86.1089 },
  { name: "Battle Creek", country: "United States", lat: 42.3212, lon: -85.1797 },
  { name: "Racine", country: "United States", lat: 42.7261, lon: -87.7829 },
  { name: "Kenosha", country: "United States", lat: 42.5847, lon: -87.8212 },
  { name: "Appleton", country: "United States", lat: 44.2619, lon: -88.4154 },
  { name: "Oshkosh", country: "United States", lat: 44.0247, lon: -88.5426 },
  { name: "Eau Claire", country: "United States", lat: 44.8113, lon: -91.4985 },
  { name: "La Crosse", country: "United States", lat: 43.8014, lon: -91.2396 },
  { name: "Janesville", country: "United States", lat: 42.6828, lon: -89.0187 },
  { name: "Waukesha", country: "United States", lat: 43.0117, lon: -88.2315 },
  { name: "Rochester", country: "United States", lat: 44.0234, lon: -92.4630 },
  { name: "St. Cloud", country: "United States", lat: 45.5579, lon: -94.1636 },
  { name: "Bloomington", country: "United States", lat: 44.8408, lon: -93.2983 },
  { name: "Moorhead", country: "United States", lat: 46.8739, lon: -96.7678 },
  { name: "Mankato", country: "United States", lat: 44.1636, lon: -93.9994 },
  { name: "Cedar Rapids", country: "United States", lat: 41.9779, lon: -91.6656 },
  { name: "Davenport", country: "United States", lat: 41.5236, lon: -90.5776 },
  { name: "Sioux City", country: "United States", lat: 42.4963, lon: -96.4049 },
  { name: "Iowa City", country: "United States", lat: 41.6611, lon: -91.5302 },
  { name: "Waterloo", country: "United States", lat: 42.4928, lon: -92.3426 },
  { name: "Council Bluffs", country: "United States", lat: 41.2619, lon: -95.8608 },
  { name: "Ames", country: "United States", lat: 42.0347, lon: -93.6200 },
  { name: "Overland Park", country: "United States", lat: 38.9822, lon: -94.6708 },
  { name: "Olathe", country: "United States", lat: 38.8814, lon: -94.8191 },
  { name: "Lawrence", country: "United States", lat: 38.9717, lon: -95.2353 },
  { name: "Manhattan", country: "United States", lat: 39.1836, lon: -96.5717 },
  { name: "Springfield", country: "United States", lat: 37.2090, lon: -93.2923 },
  { name: "Independence", country: "United States", lat: 39.0911, lon: -94.4155 },
  { name: "Lee's Summit", country: "United States", lat: 38.9108, lon: -94.3822 },
  { name: "St. Joseph", country: "United States", lat: 39.7686, lon: -94.8466 },
  { name: "Joplin", country: "United States", lat: 37.0842, lon: -94.5133 },
  { name: "Columbia", country: "United States", lat: 38.9517, lon: -92.3341 },
  { name: "Norman", country: "United States", lat: 35.2226, lon: -97.4395 },
  { name: "Broken Arrow", country: "United States", lat: 36.0609, lon: -95.7975 },
  { name: "Edmond", country: "United States", lat: 35.6528, lon: -97.4781 },
  { name: "Lawton", country: "United States", lat: 34.6036, lon: -98.3959 },
  { name: "Moore", country: "United States", lat: 35.3395, lon: -97.4867 },
  { name: "Stillwater", country: "United States", lat: 36.1156, lon: -97.0584 },
  { name: "Muskogee", country: "United States", lat: 35.7479, lon: -95.3697 },
  { name: "Enid", country: "United States", lat: 36.3956, lon: -97.8784 },

  // ============================================================
  // MORE ADDITIONAL INTERNATIONAL
  // ============================================================
  { name: "Kota Bahru", country: "Malaysia", lat: 6.1254, lon: 102.2381 },
  { name: "Sandakan", country: "Malaysia", lat: 5.8394, lon: 118.1171 },
  { name: "Seremban", country: "Malaysia", lat: 2.7258, lon: 101.9424 },
  { name: "Banda Aceh", country: "Indonesia", lat: 5.5483, lon: 95.3238 },
  { name: "Jayapura", country: "Indonesia", lat: -2.5916, lon: 140.6690 },
  { name: "Kupang", country: "Indonesia", lat: -10.1772, lon: 123.5895 },
  { name: "Mataram", country: "Indonesia", lat: -8.5833, lon: 116.1167 },
  { name: "Samarinda", country: "Indonesia", lat: -0.4948, lon: 117.1436 },
  { name: "Agra", country: "India", lat: 27.1767, lon: 78.0081 },
  { name: "Bhilai", country: "India", lat: 21.2094, lon: 81.3784 },
  { name: "Dhanbad", country: "India", lat: 23.7957, lon: 86.4304 },
  { name: "Faridabad", country: "India", lat: 28.4089, lon: 77.3178 },
  { name: "Ghaziabad", country: "India", lat: 28.6692, lon: 77.4538 },
  { name: "Guntur", country: "India", lat: 16.3067, lon: 80.4365 },
  { name: "Howrah", country: "India", lat: 22.5958, lon: 88.2636 },
  { name: "Meerut", country: "India", lat: 28.9845, lon: 77.7064 },
  { name: "Nellore", country: "India", lat: 14.4426, lon: 79.9865 },
  { name: "Noida", country: "India", lat: 28.5355, lon: 77.3910 },
  { name: "Solapur", country: "India", lat: 17.6599, lon: 75.9064 },
  { name: "Thane", country: "India", lat: 19.2183, lon: 72.9781 },
  { name: "Gaya", country: "India", lat: 24.7955, lon: 84.9994 },
  { name: "Muzaffarpur", country: "India", lat: 26.1225, lon: 85.3906 },
  { name: "Darbhanga", country: "India", lat: 26.1542, lon: 85.8918 },
  { name: "Cuttack", country: "India", lat: 20.4625, lon: 85.8830 },
  { name: "Datong", country: "China", lat: 40.0905, lon: 113.2920 },
  { name: "Hohhot", country: "China", lat: 40.8424, lon: 111.7490 },
  { name: "Yinchuan", country: "China", lat: 38.4872, lon: 106.2309 },
  { name: "Xining", country: "China", lat: 36.6171, lon: 101.7782 },
  { name: "Kashgar", country: "China", lat: 39.4707, lon: 75.9893 },
  { name: "Lijiang", country: "China", lat: 26.8721, lon: 100.2299 },
  { name: "Dali", country: "China", lat: 25.6065, lon: 100.2676 },
  { name: "Zhangjiajie", country: "China", lat: 29.1170, lon: 110.4793 },
  { name: "Wuhu", country: "China", lat: 31.3340, lon: 118.3622 },
  { name: "Zhenjiang", country: "China", lat: 32.1894, lon: 119.4249 },
  { name: "Yangzhou", country: "China", lat: 32.3936, lon: 119.4126 },
  { name: "Huzhou", country: "China", lat: 30.8720, lon: 120.0934 },
  { name: "Jiaxing", country: "China", lat: 30.7461, lon: 120.7550 },
  { name: "Taizhou", country: "China", lat: 28.6583, lon: 121.4221 },
  { name: "Linyi", country: "China", lat: 35.1047, lon: 118.3564 },
  { name: "Jining", country: "China", lat: 35.4145, lon: 116.5871 },
  { name: "Kaifeng", country: "China", lat: 34.7976, lon: 114.3076 },
  { name: "Anyang", country: "China", lat: 36.0975, lon: 114.3939 },
  { name: "Xinxiang", country: "China", lat: 35.3026, lon: 113.9268 },
  { name: "Yichang", country: "China", lat: 30.7087, lon: 111.2847 },
  { name: "Xiangyang", country: "China", lat: 32.0090, lon: 112.1223 },

  // Additional Africa
  { name: "Touba", country: "Senegal", lat: 14.8658, lon: -15.8828 },
  { name: "Ziguinchor", country: "Senegal", lat: 12.5681, lon: -16.2719 },
  { name: "Conakry", country: "Guinea", lat: 9.6412, lon: -13.5784 },
  { name: "Kankan", country: "Guinea", lat: 10.3856, lon: -9.3057 },
  { name: "Freetown", country: "Sierra Leone", lat: 8.4657, lon: -13.2317 },
  { name: "Monrovia", country: "Liberia", lat: 6.3156, lon: -10.8074 },
  { name: "Bissau", country: "Guinea-Bissau", lat: 11.8636, lon: -15.5977 },
  { name: "Nouakchott", country: "Mauritania", lat: 18.0735, lon: -15.9582 },
  { name: "Praia", country: "Cape Verde", lat: 14.9331, lon: -23.5133 },
  { name: "Sao Tome", country: "Sao Tome and Principe", lat: 0.1864, lon: 6.6131 },
  { name: "Moroni", country: "Comoros", lat: -11.7172, lon: 43.2551 },
  { name: "Victoria", country: "Seychelles", lat: -4.6191, lon: 55.4513 },
  { name: "Stone Town", country: "Tanzania", lat: -6.1622, lon: 39.1921 },
  { name: "Nungwi", country: "Tanzania", lat: -5.7268, lon: 39.2965 },
  { name: "Lilongwe", country: "Malawi", lat: -13.9626, lon: 33.7741 },
  { name: "Mzuzu", country: "Malawi", lat: -11.4655, lon: 34.0184 },
  { name: "Zomba", country: "Malawi", lat: -15.3833, lon: 35.3188 },
  { name: "Quelimane", country: "Mozambique", lat: -17.8784, lon: 36.8882 },
  { name: "Tete", country: "Mozambique", lat: -16.1564, lon: 33.5867 },
  { name: "Nacala", country: "Mozambique", lat: -14.5361, lon: 40.6853 },

  // Additional Europe
  { name: "Goteborg", country: "Sweden", lat: 57.7089, lon: 11.9746 },
  { name: "Helsingborg", country: "Sweden", lat: 56.0465, lon: 12.6945 },
  { name: "Boras", country: "Sweden", lat: 57.7210, lon: 12.9401 },
  { name: "Sundsvall", country: "Sweden", lat: 62.3908, lon: 17.3069 },
  { name: "Umea", country: "Sweden", lat: 63.8258, lon: 20.2630 },
  { name: "Lulea", country: "Sweden", lat: 65.5848, lon: 22.1547 },
  { name: "Kiruna", country: "Sweden", lat: 67.8558, lon: 20.2253 },
  { name: "Lillehammer", country: "Norway", lat: 61.1153, lon: 10.4662 },
  { name: "Alesund", country: "Norway", lat: 62.4722, lon: 6.1549 },
  { name: "Bodo", country: "Norway", lat: 67.2804, lon: 14.4049 },
  { name: "Hammerfest", country: "Norway", lat: 70.6634, lon: 23.6821 },
  { name: "Lahti", country: "Finland", lat: 60.9827, lon: 25.6612 },
  { name: "Pori", country: "Finland", lat: 61.4847, lon: 21.7972 },
  { name: "Vaasa", country: "Finland", lat: 63.0961, lon: 21.6158 },
  { name: "Lappeenranta", country: "Finland", lat: 61.0587, lon: 28.1887 },
  { name: "Seinajoki", country: "Finland", lat: 62.7945, lon: 22.8282 },

  // Additional South America
  { name: "Boa Vista", country: "Brazil", lat: 2.8195, lon: -60.6735 },
  { name: "Palmas", country: "Brazil", lat: -10.1689, lon: -48.3317 },
  { name: "Macae", country: "Brazil", lat: -22.3768, lon: -41.7869 },
  { name: "Itajai", country: "Brazil", lat: -26.9078, lon: -48.6616 },
  { name: "Joinville", country: "Brazil", lat: -26.3045, lon: -48.8487 },
  { name: "Blumenau", country: "Brazil", lat: -26.9194, lon: -49.0661 },
  { name: "Caxias do Sul", country: "Brazil", lat: -29.1681, lon: -51.1794 },
  { name: "Pelotas", country: "Brazil", lat: -31.7654, lon: -52.3376 },
  { name: "Santa Maria", country: "Brazil", lat: -29.6842, lon: -53.8069 },
  { name: "Maraba", country: "Brazil", lat: -5.3685, lon: -49.1178 },
  { name: "Santarem", country: "Brazil", lat: -2.4387, lon: -54.6996 },
  { name: "Piracicaba", country: "Brazil", lat: -22.7253, lon: -47.6492 },
  { name: "Jundiai", country: "Brazil", lat: -23.1857, lon: -46.8978 },
  { name: "Bauru", country: "Brazil", lat: -22.3246, lon: -49.0871 },
  { name: "Presidente Prudente", country: "Brazil", lat: -22.1256, lon: -51.3889 },
  { name: "Volta Redonda", country: "Brazil", lat: -22.5232, lon: -44.1042 },
  { name: "Juiz de Fora", country: "Brazil", lat: -21.7642, lon: -43.3503 },
  { name: "Montes Claros", country: "Brazil", lat: -16.7350, lon: -43.8614 },
  { name: "Governador Valadares", country: "Brazil", lat: -18.8509, lon: -41.9494 },
  { name: "Uberaba", country: "Brazil", lat: -19.7478, lon: -47.9319 },
  { name: "Passo Fundo", country: "Brazil", lat: -28.2623, lon: -52.4067 },
  { name: "Chapeco", country: "Brazil", lat: -27.0964, lon: -52.6152 },
  { name: "Imperatriz", country: "Brazil", lat: -5.5189, lon: -47.4768 },
  { name: "Feira de Santana", country: "Brazil", lat: -12.2669, lon: -38.9666 },
  { name: "Caruaru", country: "Brazil", lat: -8.2833, lon: -35.9761 },
  { name: "Petrolina", country: "Brazil", lat: -9.3891, lon: -40.5027 },
  { name: "Campina Grande", country: "Brazil", lat: -7.2306, lon: -35.8811 },
  { name: "Mossoró", country: "Brazil", lat: -5.1878, lon: -37.3444 },
  { name: "Caucaia", country: "Brazil", lat: -3.7374, lon: -38.6531 },
  { name: "Sobral", country: "Brazil", lat: -3.6861, lon: -40.3507 },

  // ============================================================
  // FINAL BATCH - Various regions to reach 2000+
  // ============================================================
  // More US cities
  { name: "Meridian", country: "United States", lat: 43.6121, lon: -116.3915 },
  { name: "Twin Falls", country: "United States", lat: 42.5558, lon: -114.4701 },
  { name: "Nampa", country: "United States", lat: 43.5407, lon: -116.5635 },
  { name: "Pocatello", country: "United States", lat: 42.8713, lon: -112.4455 },
  { name: "Idaho Falls", country: "United States", lat: 43.4917, lon: -112.0339 },
  { name: "Great Falls", country: "United States", lat: 47.5053, lon: -111.3008 },
  { name: "Helena", country: "United States", lat: 46.5884, lon: -112.0245 },
  { name: "Casper", country: "United States", lat: 42.8666, lon: -106.3131 },
  { name: "Laramie", country: "United States", lat: 41.3114, lon: -105.5911 },
  { name: "Grand Junction", country: "United States", lat: 39.0639, lon: -108.5506 },
  { name: "Durango", country: "United States", lat: 37.2753, lon: -107.8801 },
  { name: "Prescott", country: "United States", lat: 34.5400, lon: -112.4685 },
  { name: "Lake Havasu City", country: "United States", lat: 34.4839, lon: -114.3225 },
  { name: "Sierra Vista", country: "United States", lat: 31.5455, lon: -110.2641 },
  { name: "Las Cruces", country: "United States", lat: 32.3199, lon: -106.7637 },
  { name: "Roswell", country: "United States", lat: 33.3943, lon: -104.5230 },
  { name: "Clovis", country: "United States", lat: 34.4048, lon: -103.2052 },
  { name: "Farmington", country: "United States", lat: 36.7281, lon: -108.2187 },
  { name: "Carlsbad", country: "United States", lat: 32.4207, lon: -104.2288 },
  { name: "Elko", country: "United States", lat: 40.8324, lon: -115.7631 },
  { name: "St. George", country: "United States", lat: 37.0965, lon: -113.5684 },
  { name: "Logan", country: "United States", lat: 41.7370, lon: -111.8338 },
  { name: "Medford", country: "United States", lat: 42.3265, lon: -122.8756 },
  { name: "Corvallis", country: "United States", lat: 44.5646, lon: -123.2620 },
  { name: "Albany", country: "United States", lat: 44.6366, lon: -123.1059 },
  { name: "Olympia", country: "United States", lat: 47.0379, lon: -122.9007 },
  { name: "Kennewick", country: "United States", lat: 46.2087, lon: -119.1373 },
  { name: "Yakima", country: "United States", lat: 46.6021, lon: -120.5059 },
  { name: "Bellingham", country: "United States", lat: 48.7519, lon: -122.4787 },
  { name: "Everett", country: "United States", lat: 47.9790, lon: -122.2021 },
  { name: "Redmond", country: "United States", lat: 47.6740, lon: -122.1215 },
  { name: "Kirkland", country: "United States", lat: 47.6769, lon: -122.2060 },
  { name: "Renton", country: "United States", lat: 47.4829, lon: -122.2171 },
  { name: "Federal Way", country: "United States", lat: 47.3223, lon: -122.3126 },
  { name: "Kent", country: "United States", lat: 47.3809, lon: -122.2348 },
  { name: "Auburn", country: "United States", lat: 47.3073, lon: -122.2285 },
  { name: "Marysville", country: "United States", lat: 48.0518, lon: -122.1771 },
  { name: "Lacey", country: "United States", lat: 47.0343, lon: -122.8231 },
  { name: "Pasco", country: "United States", lat: 46.2396, lon: -119.1006 },
  { name: "Walla Walla", country: "United States", lat: 46.0646, lon: -118.3430 },

  // More Asia
  { name: "Pali", country: "India", lat: 25.7711, lon: 73.3234 },
  { name: "Bikaner", country: "India", lat: 28.0229, lon: 73.3119 },
  { name: "Ajmer", country: "India", lat: 26.4499, lon: 74.6399 },
  { name: "Kota", country: "India", lat: 25.2138, lon: 75.8648 },
  { name: "Gorakhpur", country: "India", lat: 26.7606, lon: 83.3732 },
  { name: "Aligarh", country: "India", lat: 27.8974, lon: 78.0880 },
  { name: "Moradabad", country: "India", lat: 28.8386, lon: 78.7733 },
  { name: "Saharanpur", country: "India", lat: 29.9680, lon: 77.5551 },
  { name: "Bhavnagar", country: "India", lat: 21.7645, lon: 72.1519 },
  { name: "Jamnagar", country: "India", lat: 22.4707, lon: 70.0577 },
  { name: "Junagadh", country: "India", lat: 21.5222, lon: 70.4579 },
  { name: "Tiruvallur", country: "India", lat: 13.1430, lon: 79.9085 },
  { name: "Tirunelveli", country: "India", lat: 8.7139, lon: 77.7567 },
  { name: "Nanded", country: "India", lat: 19.1383, lon: 77.3210 },
  { name: "Kolhapur", country: "India", lat: 16.7050, lon: 74.2433 },
  { name: "Sangli", country: "India", lat: 16.8524, lon: 74.5815 },
  { name: "Amravati", country: "India", lat: 20.9320, lon: 77.7523 },
  { name: "Malegaon", country: "India", lat: 20.5548, lon: 74.5247 },
  { name: "Akola", country: "India", lat: 20.7059, lon: 77.0049 },
  { name: "Latur", country: "India", lat: 18.3968, lon: 76.5604 },
  { name: "Incheon", country: "South Korea", lat: 37.4563, lon: 126.7052 },
  { name: "Seongnam", country: "South Korea", lat: 37.4449, lon: 127.1389 },
  { name: "Goyang", country: "South Korea", lat: 37.6584, lon: 126.8320 },
  { name: "Bucheon", country: "South Korea", lat: 37.4989, lon: 126.7831 },
  { name: "Ansan", country: "South Korea", lat: 37.3219, lon: 126.8309 },
  { name: "Anyang", country: "South Korea", lat: 37.3943, lon: 126.9568 },
  { name: "Gimhae", country: "South Korea", lat: 35.2286, lon: 128.8892 },
  { name: "Chuncheon", country: "South Korea", lat: 37.8747, lon: 127.7342 },
  { name: "Gangneung", country: "South Korea", lat: 37.7519, lon: 128.8761 },
  { name: "Gyeongju", country: "South Korea", lat: 35.8562, lon: 129.2247 },
  { name: "Saga", country: "Japan", lat: 33.2636, lon: 130.3006 },
  { name: "Akita", country: "Japan", lat: 39.7186, lon: 140.1024 },
  { name: "Aomori", country: "Japan", lat: 40.8244, lon: 140.7400 },
  { name: "Fukui", country: "Japan", lat: 36.0652, lon: 136.2219 },
  { name: "Gifu", country: "Japan", lat: 35.4233, lon: 136.7606 },
  { name: "Kochi", country: "Japan", lat: 33.5590, lon: 133.5311 },
  { name: "Mito", country: "Japan", lat: 36.3655, lon: 140.4712 },
  { name: "Miyazaki", country: "Japan", lat: 31.9111, lon: 131.4239 },
  { name: "Morioka", country: "Japan", lat: 39.7036, lon: 141.1527 },
  { name: "Nagano", country: "Japan", lat: 36.6485, lon: 138.1950 },
  { name: "Otaru", country: "Japan", lat: 43.1907, lon: 140.9947 },
  { name: "Shizuoka", country: "Japan", lat: 34.9756, lon: 138.3828 },
  { name: "Tottori", country: "Japan", lat: 35.5011, lon: 134.2351 },
  { name: "Yamagata", country: "Japan", lat: 38.2527, lon: 140.3389 },

  // More Middle East
  { name: "Homs", country: "Syria", lat: 34.7324, lon: 36.7137 },
  { name: "Latakia", country: "Syria", lat: 35.5317, lon: 35.7918 },
  { name: "Salt", country: "Jordan", lat: 32.0392, lon: 35.7272 },
  { name: "Zarqa", country: "Jordan", lat: 32.0728, lon: 36.0880 },
  { name: "Yanbu", country: "Saudi Arabia", lat: 24.0895, lon: 38.0618 },
  { name: "Khamis Mushait", country: "Saudi Arabia", lat: 18.3067, lon: 42.7290 },
  { name: "Jubail", country: "Saudi Arabia", lat: 27.0046, lon: 49.6601 },
  { name: "Buraydah", country: "Saudi Arabia", lat: 26.3260, lon: 43.9750 },
  { name: "Najran", country: "Saudi Arabia", lat: 17.5416, lon: 44.2195 },
  { name: "Hail", country: "Saudi Arabia", lat: 27.5114, lon: 41.6903 },

  // More Oceania
  { name: "Ballarat", country: "Australia", lat: -37.5622, lon: 143.8503 },
  { name: "Albury", country: "Australia", lat: -36.0737, lon: 146.9135 },
  { name: "Bathurst", country: "Australia", lat: -33.4193, lon: 149.5783 },
  { name: "Dubbo", country: "Australia", lat: -32.2569, lon: 148.6011 },
  { name: "Geraldton", country: "Australia", lat: -28.7744, lon: 114.6150 },
  { name: "Lismore", country: "Australia", lat: -28.8133, lon: 153.2750 },
  { name: "Port Macquarie", country: "Australia", lat: -31.4333, lon: 152.9000 },
  { name: "Armidale", country: "Australia", lat: -30.5127, lon: 151.6694 },

  // More Central Asia
  { name: "Pavlodar", country: "Kazakhstan", lat: 52.2852, lon: 76.9674 },
  { name: "Semey", country: "Kazakhstan", lat: 50.4269, lon: 80.2557 },
  { name: "Oral", country: "Kazakhstan", lat: 51.2269, lon: 51.3769 },
  { name: "Turkistan", country: "Kazakhstan", lat: 43.3017, lon: 68.2556 },
  { name: "Taraz", country: "Kazakhstan", lat: 42.9000, lon: 71.3667 },

  // More Europe
  { name: "Lecce", country: "Italy", lat: 40.3516, lon: 18.1750 },
  { name: "Sassari", country: "Italy", lat: 40.7268, lon: 8.5592 },
  { name: "Taranto", country: "Italy", lat: 40.4764, lon: 17.2290 },
  { name: "Reggio Calabria", country: "Italy", lat: 38.1107, lon: 15.6613 },
  { name: "Ravenna", country: "Italy", lat: 44.4184, lon: 12.2035 },
  { name: "Modena", country: "Italy", lat: 44.6471, lon: 10.9252 },
  { name: "Parma", country: "Italy", lat: 44.8015, lon: 10.3279 },
  { name: "Siena", country: "Italy", lat: 43.3188, lon: 11.3308 },
  { name: "Angers", country: "France", lat: 47.4712, lon: -0.5518 },
  { name: "Brest", country: "France", lat: 48.3904, lon: -4.4861 },
  { name: "Clermont-Ferrand", country: "France", lat: 45.7772, lon: 3.0870 },
  { name: "Limoges", country: "France", lat: 45.8336, lon: 1.2611 },
  { name: "Metz", country: "France", lat: 49.1193, lon: 6.1757 },
  { name: "Nancy", country: "France", lat: 48.6921, lon: 6.1844 },
  { name: "Orleans", country: "France", lat: 47.9029, lon: 1.9039 },
  { name: "Perpignan", country: "France", lat: 42.6988, lon: 2.8959 },
  { name: "Rouen", country: "France", lat: 49.4432, lon: 1.0999 },
  { name: "Caen", country: "France", lat: 49.1829, lon: -0.3707 },
  { name: "Avignon", country: "France", lat: 43.9493, lon: 4.8055 },
  { name: "Aix-en-Provence", country: "France", lat: 43.5297, lon: 5.4474 },
  { name: "Pau", country: "France", lat: 43.2951, lon: -0.3708 },
  { name: "Bayonne", country: "France", lat: 43.4833, lon: -1.4833 },

  // Final additions to exceed 2000
  { name: "Wuerzburg", country: "Germany", lat: 49.7913, lon: 9.9534 },
  { name: "Regensburg", country: "Germany", lat: 49.0134, lon: 12.1016 },
  { name: "Wolfsburg", country: "Germany", lat: 52.4227, lon: 10.7865 },
  { name: "Kassel", country: "Germany", lat: 51.3127, lon: 9.4797 },
  { name: "Potsdam", country: "Germany", lat: 52.3906, lon: 13.0645 },
  { name: "Erfurt", country: "Germany", lat: 50.9848, lon: 11.0299 },
  { name: "Schwerin", country: "Germany", lat: 53.6355, lon: 11.4012 },
  { name: "Magdeburg", country: "Germany", lat: 52.1205, lon: 11.6276 },
  { name: "Saarbrucken", country: "Germany", lat: 49.2354, lon: 6.9603 },
  { name: "Oldenburg", country: "Germany", lat: 53.1435, lon: 8.2146 },
  { name: "Osnabrueck", country: "Germany", lat: 52.2799, lon: 8.0472 },
  { name: "Solingen", country: "Germany", lat: 51.1652, lon: 7.0671 },
  { name: "Leverkusen", country: "Germany", lat: 51.0459, lon: 6.9844 },
  { name: "Muelheim", country: "Germany", lat: 51.4323, lon: 6.8825 },
  { name: "Chemnitz", country: "Germany", lat: 50.8278, lon: 12.9214 },
  { name: "Halle", country: "Germany", lat: 51.4828, lon: 11.9700 },
  { name: "Jena", country: "Germany", lat: 50.9272, lon: 11.5892 },
  { name: "Weimar", country: "Germany", lat: 50.9795, lon: 11.3235 },
  { name: "Trier", country: "Germany", lat: 49.7596, lon: 6.6439 },
  { name: "Konstanz", country: "Germany", lat: 47.6779, lon: 9.1732 },
  { name: "Oviedo", country: "Spain", lat: 43.3614, lon: -5.8493 },
  { name: "Pamplona", country: "Spain", lat: 42.8125, lon: -1.6458 },
  { name: "Vitoria-Gasteiz", country: "Spain", lat: 42.8469, lon: -2.6716 },
  { name: "A Coruna", country: "Spain", lat: 43.3623, lon: -8.4115 },
  { name: "Burgos", country: "Spain", lat: 42.3439, lon: -3.6969 },
  { name: "Logrono", country: "Spain", lat: 42.4627, lon: -2.4445 },
  { name: "Toledo", country: "Spain", lat: 39.8628, lon: -4.0273 },
  { name: "Tarragona", country: "Spain", lat: 41.1189, lon: 1.2445 },
  { name: "Girona", country: "Spain", lat: 41.9794, lon: 2.8214 },
  { name: "Cartagena", country: "Spain", lat: 37.6000, lon: -0.9819 },
  { name: "Elche", country: "Spain", lat: 38.2669, lon: -0.6983 },
  { name: "Terrassa", country: "Spain", lat: 41.5630, lon: 2.0089 },
  { name: "Sabadell", country: "Spain", lat: 41.5463, lon: 2.1057 },
  { name: "Jerez de la Frontera", country: "Spain", lat: 36.6850, lon: -6.1260 },
  { name: "Novi Pazar", country: "Serbia", lat: 43.1369, lon: 20.5122 },
  { name: "Subotica", country: "Serbia", lat: 46.1003, lon: 19.6658 },
  { name: "Kragujevac", country: "Serbia", lat: 44.0145, lon: 20.9116 },
  { name: "Stara Zagora", country: "Bulgaria", lat: 42.4258, lon: 25.6345 },
  { name: "Ruse", country: "Bulgaria", lat: 43.8356, lon: 25.9657 },
  { name: "Pleven", country: "Bulgaria", lat: 43.4170, lon: 24.6067 },
  { name: "Tuzla", country: "Bosnia and Herzegovina", lat: 44.5384, lon: 18.6766 },
  { name: "Zenica", country: "Bosnia and Herzegovina", lat: 44.2036, lon: 17.9076 },
  { name: "Bihac", country: "Bosnia and Herzegovina", lat: 44.8169, lon: 15.8697 },
  { name: "Vlora", country: "Albania", lat: 40.4660, lon: 19.4908 },
  { name: "Berat", country: "Albania", lat: 40.7058, lon: 19.9522 },
  { name: "Elbasan", country: "Albania", lat: 41.1125, lon: 20.0822 },
  { name: "Daugavpils", country: "Latvia", lat: 55.8826, lon: 26.5360 },
  { name: "Liepaja", country: "Latvia", lat: 56.5108, lon: 21.0109 },
  { name: "Klaipeda", country: "Lithuania", lat: 55.7033, lon: 21.1443 },
  { name: "Siauliai", country: "Lithuania", lat: 55.9349, lon: 23.3137 },
  { name: "Panevezys", country: "Lithuania", lat: 55.7348, lon: 24.3575 },
  { name: "Parnu", country: "Estonia", lat: 58.3859, lon: 24.4971 },
  { name: "Narva", country: "Estonia", lat: 59.3797, lon: 28.1791 },
  { name: "Vitebsk", country: "Belarus", lat: 55.1904, lon: 30.2049 },
  { name: "Mogilev", country: "Belarus", lat: 53.8945, lon: 30.3307 },
  { name: "Simferopol", country: "Ukraine", lat: 44.9521, lon: 34.1024 },
  { name: "Poltava", country: "Ukraine", lat: 49.5883, lon: 34.5514 },
  { name: "Sumy", country: "Ukraine", lat: 50.9077, lon: 34.7981 },
  { name: "Zhytomyr", country: "Ukraine", lat: 50.2547, lon: 28.6587 },
  { name: "Rivne", country: "Ukraine", lat: 50.6199, lon: 26.2516 },
  { name: "Lutsk", country: "Ukraine", lat: 50.7593, lon: 25.3424 },
  { name: "Uzhhorod", country: "Ukraine", lat: 48.6208, lon: 22.2879 },
  { name: "Kropyvnytskyi", country: "Ukraine", lat: 48.5132, lon: 32.2597 },
  { name: "Mykolaiv", country: "Ukraine", lat: 46.9750, lon: 31.9946 },
  { name: "Kherson", country: "Ukraine", lat: 46.6354, lon: 32.6169 },
  { name: "Cherkasy", country: "Ukraine", lat: 49.4444, lon: 32.0598 },
  { name: "Mariupol", country: "Ukraine", lat: 47.0958, lon: 37.5483 },
  { name: "Kramatorsk", country: "Ukraine", lat: 48.7236, lon: 37.5561 },
];

