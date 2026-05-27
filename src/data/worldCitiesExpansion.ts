import { CityData } from './worldCities';

/**
 * 3000 additional world cities for natal chart location selection.
 * Excludes US cities (covered by usCities.ts).
 * Organized alphabetically by country.
 */
export const WORLD_CITIES_EXPANSION: CityData[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // AFGHANISTAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ghazni', country: 'Afghanistan', lat: 33.5539, lon: 68.4208 },
  { name: 'Jalalabad', country: 'Afghanistan', lat: 34.4305, lon: 70.4531 },
  { name: 'Kunduz', country: 'Afghanistan', lat: 36.7280, lon: 68.8680 },
  { name: 'Lashkar Gah', country: 'Afghanistan', lat: 31.5930, lon: 64.3700 },
  { name: 'Pul-e Khumri', country: 'Afghanistan', lat: 35.9487, lon: 68.7132 },
  { name: 'Taloqan', country: 'Afghanistan', lat: 36.7361, lon: 69.5345 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ALBANIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Berat', country: 'Albania', lat: 40.7058, lon: 19.9522 },
  { name: 'Elbasan', country: 'Albania', lat: 41.1125, lon: 20.0831 },
  { name: 'Fier', country: 'Albania', lat: 40.7239, lon: 19.5567 },
  { name: 'Korce', country: 'Albania', lat: 40.6186, lon: 20.7808 },
  { name: 'Shkoder', country: 'Albania', lat: 42.0693, lon: 19.5126 },
  { name: 'Vlore', country: 'Albania', lat: 40.4667, lon: 19.4914 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ALGERIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Algiers', country: 'Algeria', lat: 36.7538, lon: 3.0588 },
  { name: 'Annaba', country: 'Algeria', lat: 36.8972, lon: 7.7578 },
  { name: 'Batna', country: 'Algeria', lat: 35.5569, lon: 6.1742 },
  { name: 'Bejaia', country: 'Algeria', lat: 36.7509, lon: 5.0567 },
  { name: 'Biskra', country: 'Algeria', lat: 34.8449, lon: 5.7283 },
  { name: 'Blida', country: 'Algeria', lat: 36.4700, lon: 2.8300 },
  { name: 'Chlef', country: 'Algeria', lat: 36.1647, lon: 1.3317 },
  { name: 'Djelfa', country: 'Algeria', lat: 34.6704, lon: 3.2504 },
  { name: 'Ghardaia', country: 'Algeria', lat: 32.4900, lon: 3.6700 },
  { name: 'Medea', country: 'Algeria', lat: 36.2675, lon: 2.7500 },
  { name: 'Mostaganem', country: 'Algeria', lat: 35.9333, lon: 0.0833 },
  { name: 'Msila', country: 'Algeria', lat: 35.7000, lon: 4.5422 },
  { name: 'Ouargla', country: 'Algeria', lat: 31.9497, lon: 5.3253 },
  { name: 'Relizane', country: 'Algeria', lat: 35.7367, lon: 0.5567 },
  { name: 'Saida', country: 'Algeria', lat: 34.8303, lon: 0.1517 },
  { name: 'Setif', country: 'Algeria', lat: 36.1898, lon: 5.4108 },
  { name: 'Sidi Bel Abbes', country: 'Algeria', lat: 35.1897, lon: -0.6308 },
  { name: 'Skikda', country: 'Algeria', lat: 36.8667, lon: 6.9000 },
  { name: 'Tebessa', country: 'Algeria', lat: 35.4000, lon: 8.1200 },
  { name: 'Tiaret', country: 'Algeria', lat: 35.3711, lon: 1.3178 },
  { name: 'Tizi Ouzou', country: 'Algeria', lat: 36.7169, lon: 4.0497 },
  { name: 'Tlemcen', country: 'Algeria', lat: 34.8828, lon: -1.3167 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANGOLA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Benguela', country: 'Angola', lat: -12.5763, lon: 13.4055 },
  { name: 'Cabinda', country: 'Angola', lat: -5.5500, lon: 12.2000 },
  { name: 'Huambo', country: 'Angola', lat: -12.7761, lon: 15.7392 },
  { name: 'Lobito', country: 'Angola', lat: -12.3478, lon: 13.5456 },
  { name: 'Luanda', country: 'Angola', lat: -8.8390, lon: 13.2894 },
  { name: 'Lubango', country: 'Angola', lat: -14.9167, lon: 13.5000 },
  { name: 'Malanje', country: 'Angola', lat: -9.5402, lon: 16.3412 },
  { name: 'Namibe', country: 'Angola', lat: -15.1961, lon: 12.1522 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ARMENIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Kapan', country: 'Armenia', lat: 39.2075, lon: 46.4064 },
  { name: 'Vanadzor', country: 'Armenia', lat: 40.8128, lon: 44.4883 },
  { name: 'Yerevan', country: 'Armenia', lat: 40.1792, lon: 44.4991 },

  // ═══════════════════════════════════════════════════════════════════════════
  // AZERBAIJAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Baku', country: 'Azerbaijan', lat: 40.4093, lon: 49.8671 },
  { name: 'Ganja', country: 'Azerbaijan', lat: 40.6828, lon: 46.3606 },
  { name: 'Lankaran', country: 'Azerbaijan', lat: 38.7536, lon: 48.8511 },
  { name: 'Mingachevir', country: 'Azerbaijan', lat: 40.7703, lon: 47.0489 },
  { name: 'Nakhchivan', country: 'Azerbaijan', lat: 39.2089, lon: 45.4122 },
  { name: 'Sumqayit', country: 'Azerbaijan', lat: 40.5855, lon: 49.6317 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BAHRAIN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Muharraq', country: 'Bahrain', lat: 26.2572, lon: 50.6119 },
  { name: 'Riffa', country: 'Bahrain', lat: 26.1300, lon: 50.5550 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BANGLADESH
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Barisal', country: 'Bangladesh', lat: 22.7010, lon: 90.3535 },
  { name: 'Bogra', country: 'Bangladesh', lat: 24.8466, lon: 89.3773 },
  { name: 'Brahmanbaria', country: 'Bangladesh', lat: 23.9571, lon: 91.1115 },
  { name: 'Chandpur', country: 'Bangladesh', lat: 23.2333, lon: 90.6500 },
  { name: 'Chittagong', country: 'Bangladesh', lat: 22.3569, lon: 91.7832 },
  { name: 'Comilla', country: 'Bangladesh', lat: 23.4607, lon: 91.1809 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125 },
  { name: 'Dinajpur', country: 'Bangladesh', lat: 25.6279, lon: 88.6332 },
  { name: 'Gazipur', country: 'Bangladesh', lat: 24.0023, lon: 90.4203 },
  { name: 'Jessore', country: 'Bangladesh', lat: 23.1667, lon: 89.2167 },
  { name: 'Khulna', country: 'Bangladesh', lat: 22.8456, lon: 89.5403 },
  { name: 'Mymensingh', country: 'Bangladesh', lat: 24.7471, lon: 90.4203 },
  { name: 'Narayanganj', country: 'Bangladesh', lat: 23.6238, lon: 90.4996 },
  { name: 'Nawabganj', country: 'Bangladesh', lat: 24.5903, lon: 88.2775 },
  { name: 'Rangpur', country: 'Bangladesh', lat: 25.7439, lon: 89.2752 },
  { name: 'Savar', country: 'Bangladesh', lat: 23.8583, lon: 90.2667 },
  { name: 'Tangail', country: 'Bangladesh', lat: 24.2513, lon: 89.9163 },
  { name: 'Tongi', country: 'Bangladesh', lat: 23.8792, lon: 90.4078 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BELARUS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Brest', country: 'Belarus', lat: 52.0976, lon: 23.6877 },
  { name: 'Gomel', country: 'Belarus', lat: 52.4345, lon: 30.9754 },
  { name: 'Grodno', country: 'Belarus', lat: 53.6884, lon: 23.8258 },
  { name: 'Minsk', country: 'Belarus', lat: 53.9006, lon: 27.5590 },
  { name: 'Mogilev', country: 'Belarus', lat: 53.8998, lon: 30.3449 },
  { name: 'Vitebsk', country: 'Belarus', lat: 55.1904, lon: 30.2049 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BELGIUM
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Antwerp', country: 'Belgium', lat: 51.2194, lon: 4.4025 },
  { name: 'Charleroi', country: 'Belgium', lat: 50.4108, lon: 4.4446 },
  { name: 'Ghent', country: 'Belgium', lat: 51.0543, lon: 3.7174 },
  { name: 'Hasselt', country: 'Belgium', lat: 50.9307, lon: 5.3375 },
  { name: 'Kortrijk', country: 'Belgium', lat: 50.8279, lon: 3.2649 },
  { name: 'Mechelen', country: 'Belgium', lat: 51.0259, lon: 4.4776 },
  { name: 'Mons', country: 'Belgium', lat: 50.4541, lon: 3.9568 },
  { name: 'Ostend', country: 'Belgium', lat: 51.2254, lon: 2.9263 },
  { name: 'Tournai', country: 'Belgium', lat: 50.6058, lon: 3.3880 },
  { name: 'Verviers', country: 'Belgium', lat: 50.5886, lon: 5.8635 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BENIN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Abomey', country: 'Benin', lat: 7.1853, lon: 1.9914 },
  { name: 'Bohicon', country: 'Benin', lat: 7.1778, lon: 2.0667 },
  { name: 'Djougou', country: 'Benin', lat: 9.7083, lon: 1.6658 },
  { name: 'Kandi', country: 'Benin', lat: 11.1314, lon: 2.9383 },
  { name: 'Natitingou', country: 'Benin', lat: 10.3042, lon: 1.3795 },
  { name: 'Parakou', country: 'Benin', lat: 9.3372, lon: 2.6303 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOLIVIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'El Alto', country: 'Bolivia', lat: -16.5100, lon: -68.1592 },
  { name: 'La Paz', country: 'Bolivia', lat: -16.4897, lon: -68.1193 },
  { name: 'Oruro', country: 'Bolivia', lat: -17.9647, lon: -67.1147 },
  { name: 'Potosi', country: 'Bolivia', lat: -19.5836, lon: -65.7531 },
  { name: 'Tarija', country: 'Bolivia', lat: -21.5355, lon: -64.7296 },
  { name: 'Trinidad', country: 'Bolivia', lat: -14.8333, lon: -64.9000 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOSNIA AND HERZEGOVINA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Banja Luka', country: 'Bosnia and Herzegovina', lat: 44.7722, lon: 17.1910 },
  { name: 'Bihac', country: 'Bosnia and Herzegovina', lat: 44.8169, lon: 15.8708 },
  { name: 'Sarajevo', country: 'Bosnia and Herzegovina', lat: 43.8563, lon: 18.4131 },
  { name: 'Tuzla', country: 'Bosnia and Herzegovina', lat: 44.5384, lon: 18.6735 },
  { name: 'Zenica', country: 'Bosnia and Herzegovina', lat: 44.2017, lon: 17.9078 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOTSWANA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Jwaneng', country: 'Botswana', lat: -24.6017, lon: 24.7275 },
  { name: 'Lobatse', country: 'Botswana', lat: -25.2244, lon: 25.6831 },
  { name: 'Molepolole', country: 'Botswana', lat: -24.4067, lon: 25.4950 },
  { name: 'Palapye', country: 'Botswana', lat: -22.4036, lon: 27.1281 },
  { name: 'Selibe Phikwe', country: 'Botswana', lat: -21.9786, lon: 27.8428 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BURKINA FASO
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Banfora', country: 'Burkina Faso', lat: 10.6333, lon: -4.7667 },
  { name: 'Dedougou', country: 'Burkina Faso', lat: 12.4667, lon: -3.4667 },
  { name: 'Kaya', country: 'Burkina Faso', lat: 13.0833, lon: -1.0833 },
  { name: 'Koudougou', country: 'Burkina Faso', lat: 12.2500, lon: -2.3628 },
  { name: 'Ouahigouya', country: 'Burkina Faso', lat: 13.5828, lon: -2.4214 },
  { name: 'Tenkodogo', country: 'Burkina Faso', lat: 11.7833, lon: -0.3667 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BURUNDI
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bujumbura', country: 'Burundi', lat: -3.3614, lon: 29.3599 },
  { name: 'Gitega', country: 'Burundi', lat: -3.4264, lon: 29.9246 },
  { name: 'Muyinga', country: 'Burundi', lat: -2.8500, lon: 30.3500 },
  { name: 'Ngozi', country: 'Burundi', lat: -2.9075, lon: 29.8306 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CAMEROON
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bamenda', country: 'Cameroon', lat: 5.9631, lon: 10.1591 },
  { name: 'Bafoussam', country: 'Cameroon', lat: 5.4737, lon: 10.4176 },
  { name: 'Bertoua', country: 'Cameroon', lat: 4.5833, lon: 13.6833 },
  { name: 'Buea', country: 'Cameroon', lat: 4.1527, lon: 9.2414 },
  { name: 'Douala', country: 'Cameroon', lat: 4.0511, lon: 9.7679 },
  { name: 'Ebolowa', country: 'Cameroon', lat: 2.9000, lon: 11.1500 },
  { name: 'Garoua', country: 'Cameroon', lat: 9.3000, lon: 13.3833 },
  { name: 'Kribi', country: 'Cameroon', lat: 2.9500, lon: 9.9167 },
  { name: 'Kumba', country: 'Cameroon', lat: 4.6363, lon: 9.4469 },
  { name: 'Limbe', country: 'Cameroon', lat: 4.0244, lon: 9.2147 },
  { name: 'Maroua', country: 'Cameroon', lat: 10.5906, lon: 14.3158 },
  { name: 'Ngaoundere', country: 'Cameroon', lat: 7.3167, lon: 13.5833 },
  { name: 'Nkongsamba', country: 'Cameroon', lat: 4.9547, lon: 9.9404 },
  { name: 'Yaounde', country: 'Cameroon', lat: 3.8480, lon: 11.5021 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CAPE VERDE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Mindelo', country: 'Cape Verde', lat: 16.8900, lon: -24.9800 },
  { name: 'Praia', country: 'Cape Verde', lat: 14.9315, lon: -23.5125 },
  { name: 'Santa Maria', country: 'Cape Verde', lat: 16.5986, lon: -22.9050 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAD
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Abeche', country: 'Chad', lat: 13.8292, lon: 20.8322 },
  { name: 'Moundou', country: 'Chad', lat: 8.5667, lon: 16.0833 },
  { name: 'Sarh', country: 'Chad', lat: 9.1500, lon: 18.3833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMOROS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Mutsamudu', country: 'Comoros', lat: -12.1667, lon: 44.3833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONGO (DRC)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bukavu', country: 'Congo (DRC)', lat: -2.5083, lon: 28.8608 },
  { name: 'Goma', country: 'Congo (DRC)', lat: -1.6585, lon: 29.2200 },
  { name: 'Kananga', country: 'Congo (DRC)', lat: -5.8962, lon: 22.4166 },
  { name: 'Kinshasa', country: 'Congo (DRC)', lat: -4.4419, lon: 15.2663 },
  { name: 'Kisangani', country: 'Congo (DRC)', lat: 0.5153, lon: 25.1910 },
  { name: 'Kolwezi', country: 'Congo (DRC)', lat: -10.7167, lon: 25.4667 },
  { name: 'Likasi', country: 'Congo (DRC)', lat: -10.9833, lon: 26.7333 },
  { name: 'Lubumbashi', country: 'Congo (DRC)', lat: -11.6647, lon: 27.4794 },
  { name: 'Matadi', country: 'Congo (DRC)', lat: -5.8167, lon: 13.4500 },
  { name: 'Mbuji-Mayi', country: 'Congo (DRC)', lat: -6.1500, lon: 23.6000 },
  { name: 'Tshikapa', country: 'Congo (DRC)', lat: -5.4000, lon: 20.8000 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONGO (REPUBLIC)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Brazzaville', country: 'Congo (Republic)', lat: -4.2634, lon: 15.2429 },
  { name: 'Dolisie', country: 'Congo (Republic)', lat: -4.2000, lon: 12.6667 },
  { name: 'Pointe-Noire', country: 'Congo (Republic)', lat: -4.7692, lon: 11.8664 },

  // ═══════════════════════════════════════════════════════════════════════════
  // COTE D'IVOIRE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Abidjan', country: "Cote d'Ivoire", lat: 5.3600, lon: -4.0083 },
  { name: 'Bouake', country: "Cote d'Ivoire", lat: 7.6939, lon: -5.0303 },
  { name: 'Daloa', country: "Cote d'Ivoire", lat: 6.8774, lon: -6.4502 },
  { name: 'Korhogo', country: "Cote d'Ivoire", lat: 9.4500, lon: -5.6333 },
  { name: 'Man', country: "Cote d'Ivoire", lat: 7.4125, lon: -7.5536 },
  { name: 'San Pedro', country: "Cote d'Ivoire", lat: 4.7485, lon: -6.6363 },
  { name: 'Yamoussoukro', country: "Cote d'Ivoire", lat: 6.8276, lon: -5.2893 },

  // ═══════════════════════════════════════════════════════════════════════════
  // DJIBOUTI
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ali Sabieh', country: 'Djibouti', lat: 11.1558, lon: 42.7125 },
  { name: 'Tadjoura', country: 'Djibouti', lat: 11.7833, lon: 42.8833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // EGYPT
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Alexandria', country: 'Egypt', lat: 31.2001, lon: 29.9187 },
  { name: 'Assiut', country: 'Egypt', lat: 27.1809, lon: 31.1837 },
  { name: 'Aswan', country: 'Egypt', lat: 24.0889, lon: 32.8998 },
  { name: 'Beni Suef', country: 'Egypt', lat: 29.0661, lon: 31.0994 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Damietta', country: 'Egypt', lat: 31.4175, lon: 31.8144 },
  { name: 'Faiyum', country: 'Egypt', lat: 29.3084, lon: 30.8441 },
  { name: 'Giza', country: 'Egypt', lat: 30.0131, lon: 31.2089 },
  { name: 'Ismailia', country: 'Egypt', lat: 30.6043, lon: 32.2723 },
  { name: 'Kafr el-Sheikh', country: 'Egypt', lat: 31.1107, lon: 30.9388 },
  { name: 'Mansoura', country: 'Egypt', lat: 31.0409, lon: 31.3785 },
  { name: 'Minya', country: 'Egypt', lat: 28.1099, lon: 30.7503 },
  { name: 'Port Said', country: 'Egypt', lat: 31.2653, lon: 32.3019 },
  { name: 'Qena', country: 'Egypt', lat: 26.1625, lon: 32.7267 },
  { name: 'Sohag', country: 'Egypt', lat: 26.5591, lon: 31.6948 },
  { name: 'Suez', country: 'Egypt', lat: 29.9668, lon: 32.5498 },
  { name: 'Tanta', country: 'Egypt', lat: 30.7865, lon: 31.0004 },
  { name: 'Zagazig', country: 'Egypt', lat: 30.5877, lon: 31.5020 },

  // ═══════════════════════════════════════════════════════════════════════════
  // EQUATORIAL GUINEA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bata', country: 'Equatorial Guinea', lat: 1.8633, lon: 9.7658 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ERITREA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Keren', country: 'Eritrea', lat: 15.7781, lon: 38.4511 },
  { name: 'Massawa', country: 'Eritrea', lat: 15.6069, lon: 39.4500 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ESWATINI
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Manzini', country: 'Eswatini', lat: -26.4833, lon: 31.3667 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ETHIOPIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Addis Ababa', country: 'Ethiopia', lat: 9.0250, lon: 38.7469 },
  { name: 'Adama', country: 'Ethiopia', lat: 8.5400, lon: 39.2700 },
  { name: 'Arba Minch', country: 'Ethiopia', lat: 6.0333, lon: 37.5500 },
  { name: 'Debre Berhan', country: 'Ethiopia', lat: 9.6800, lon: 39.5300 },
  { name: 'Debre Markos', country: 'Ethiopia', lat: 10.3500, lon: 37.7333 },
  { name: 'Dessie', country: 'Ethiopia', lat: 11.1333, lon: 39.6333 },
  { name: 'Hawassa', country: 'Ethiopia', lat: 7.0622, lon: 38.4769 },
  { name: 'Jimma', country: 'Ethiopia', lat: 7.6667, lon: 36.8333 },
  { name: 'Mekelle', country: 'Ethiopia', lat: 13.4967, lon: 39.4753 },
  { name: 'Nekemte', country: 'Ethiopia', lat: 9.0833, lon: 36.5500 },
  { name: 'Shashamane', country: 'Ethiopia', lat: 7.2000, lon: 38.6000 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GABON
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Franceville', country: 'Gabon', lat: -1.6333, lon: 13.5833 },
  { name: 'Port-Gentil', country: 'Gabon', lat: -0.7193, lon: 8.7815 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GAMBIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Brikama', country: 'Gambia', lat: 13.2714, lon: -16.6508 },
  { name: 'Serrekunda', country: 'Gambia', lat: 13.4397, lon: -16.6781 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GHANA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Accra', country: 'Ghana', lat: 5.6037, lon: -0.1870 },
  { name: 'Ho', country: 'Ghana', lat: 6.6000, lon: 0.4667 },
  { name: 'Koforidua', country: 'Ghana', lat: 6.0941, lon: -0.2600 },
  { name: 'Kumasi', country: 'Ghana', lat: 6.6885, lon: -1.6244 },
  { name: 'Obuasi', country: 'Ghana', lat: 6.2000, lon: -1.6667 },
  { name: 'Sunyani', country: 'Ghana', lat: 7.3394, lon: -2.3281 },
  { name: 'Techiman', country: 'Ghana', lat: 7.5833, lon: -1.9333 },
  { name: 'Tema', country: 'Ghana', lat: 5.6699, lon: -0.0166 },
  { name: 'Wa', country: 'Ghana', lat: 10.0601, lon: -2.5099 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GUINEA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Kankan', country: 'Guinea', lat: 10.3833, lon: -9.3000 },
  { name: 'Kindia', country: 'Guinea', lat: 10.0500, lon: -12.8667 },
  { name: 'Labe', country: 'Guinea', lat: 11.3167, lon: -12.2833 },
  { name: 'Nzerekore', country: 'Guinea', lat: 7.7500, lon: -8.8167 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GUINEA-BISSAU
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bissau', country: 'Guinea-Bissau', lat: 11.8636, lon: -15.5977 },

  // ═══════════════════════════════════════════════════════════════════════════
  // KENYA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Eldoret', country: 'Kenya', lat: 0.5143, lon: 35.2698 },
  { name: 'Embu', country: 'Kenya', lat: -0.5388, lon: 37.4596 },
  { name: 'Garissa', country: 'Kenya', lat: -0.4532, lon: 39.6461 },
  { name: 'Kakamega', country: 'Kenya', lat: 0.2827, lon: 34.7519 },
  { name: 'Kericho', country: 'Kenya', lat: -0.3692, lon: 35.2863 },
  { name: 'Kilifi', country: 'Kenya', lat: -3.6305, lon: 39.8499 },
  { name: 'Kisii', country: 'Kenya', lat: -0.6817, lon: 34.7668 },
  { name: 'Kisumu', country: 'Kenya', lat: -0.1022, lon: 34.7617 },
  { name: 'Kitale', country: 'Kenya', lat: 1.0169, lon: 35.0020 },
  { name: 'Lamu', country: 'Kenya', lat: -2.2717, lon: 40.9020 },
  { name: 'Machakos', country: 'Kenya', lat: -1.5177, lon: 37.2634 },
  { name: 'Malindi', country: 'Kenya', lat: -3.2138, lon: 40.1169 },
  { name: 'Meru', country: 'Kenya', lat: 0.0480, lon: 37.6559 },
  { name: 'Mombasa', country: 'Kenya', lat: -4.0435, lon: 39.6682 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219 },
  { name: 'Naivasha', country: 'Kenya', lat: -0.7171, lon: 36.4310 },
  { name: 'Nakuru', country: 'Kenya', lat: -0.3031, lon: 36.0800 },
  { name: 'Nanyuki', country: 'Kenya', lat: 0.0067, lon: 37.0722 },
  { name: 'Nyahururu', country: 'Kenya', lat: 0.0380, lon: 36.3627 },
  { name: 'Nyeri', country: 'Kenya', lat: -0.4197, lon: 36.9511 },
  { name: 'Thika', country: 'Kenya', lat: -1.0396, lon: 37.0900 },

  // ═══════════════════════════════════════════════════════════════════════════
  // LESOTHO
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Maseru', country: 'Lesotho', lat: -29.3167, lon: 27.4833 },
  { name: 'Teyateyaneng', country: 'Lesotho', lat: -29.1500, lon: 27.7333 },

  // ═══════════════════════════════════════════════════════════════════════════
  // LIBERIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Buchanan', country: 'Liberia', lat: 5.8808, lon: -10.0467 },
  { name: 'Gbarnga', country: 'Liberia', lat: 7.0000, lon: -9.4833 },
  { name: 'Monrovia', country: 'Liberia', lat: 6.3106, lon: -10.8047 },

  // ═══════════════════════════════════════════════════════════════════════════
  // LIBYA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Benghazi', country: 'Libya', lat: 32.1194, lon: 20.0868 },
  { name: 'Misrata', country: 'Libya', lat: 32.3754, lon: 15.0925 },
  { name: 'Sabha', country: 'Libya', lat: 27.0377, lon: 14.4283 },
  { name: 'Tripoli', country: 'Libya', lat: 32.9022, lon: 13.1800 },
  { name: 'Zliten', country: 'Libya', lat: 32.4674, lon: 14.5667 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MADAGASCAR
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Antsirabe', country: 'Madagascar', lat: -19.8659, lon: 47.0333 },
  { name: 'Antananarivo', country: 'Madagascar', lat: -18.8792, lon: 47.5079 },
  { name: 'Fianarantsoa', country: 'Madagascar', lat: -21.4417, lon: 47.0833 },
  { name: 'Mahajanga', country: 'Madagascar', lat: -15.7167, lon: 46.3167 },
  { name: 'Toamasina', country: 'Madagascar', lat: -18.1492, lon: 49.4023 },
  { name: 'Toliara', country: 'Madagascar', lat: -23.3500, lon: 43.6667 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MALAWI
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Blantyre', country: 'Malawi', lat: -15.7667, lon: 35.0168 },
  { name: 'Lilongwe', country: 'Malawi', lat: -13.9626, lon: 33.7741 },
  { name: 'Mzuzu', country: 'Malawi', lat: -11.4658, lon: 34.0215 },
  { name: 'Zomba', country: 'Malawi', lat: -15.3833, lon: 35.3188 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MALI
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bamako', country: 'Mali', lat: 12.6392, lon: -8.0029 },
  { name: 'Gao', country: 'Mali', lat: 16.2667, lon: -0.0500 },
  { name: 'Kayes', country: 'Mali', lat: 14.4500, lon: -11.4333 },
  { name: 'Mopti', country: 'Mali', lat: 14.4843, lon: -4.1870 },
  { name: 'Segou', country: 'Mali', lat: 13.4317, lon: -5.6844 },
  { name: 'Sikasso', country: 'Mali', lat: 11.3167, lon: -5.6667 },
  { name: 'Timbuktu', country: 'Mali', lat: 16.7735, lon: -3.0074 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAURITANIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Nouadhibou', country: 'Mauritania', lat: 20.9333, lon: -17.0333 },
  { name: 'Nouakchott', country: 'Mauritania', lat: 18.0858, lon: -15.9785 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAURITIUS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Curepipe', country: 'Mauritius', lat: -20.3162, lon: 57.5166 },
  { name: 'Port Louis', country: 'Mauritius', lat: -20.1609, lon: 57.5012 },
  { name: 'Quatre Bornes', country: 'Mauritius', lat: -20.2648, lon: 57.4761 },
  { name: 'Vacoas', country: 'Mauritius', lat: -20.2983, lon: 57.4783 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOROCCO
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Agadir', country: 'Morocco', lat: 30.4278, lon: -9.5981 },
  { name: 'Beni Mellal', country: 'Morocco', lat: 32.3394, lon: -6.3498 },
  { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lon: -7.5898 },
  { name: 'Chefchaouen', country: 'Morocco', lat: 35.1688, lon: -5.2636 },
  { name: 'El Jadida', country: 'Morocco', lat: 33.2316, lon: -8.5007 },
  { name: 'Essaouira', country: 'Morocco', lat: 31.5125, lon: -9.7700 },
  { name: 'Fes', country: 'Morocco', lat: 34.0181, lon: -5.0078 },
  { name: 'Ifrane', country: 'Morocco', lat: 33.5228, lon: -5.1108 },
  { name: 'Kenitra', country: 'Morocco', lat: 34.2610, lon: -6.5802 },
  { name: 'Khouribga', country: 'Morocco', lat: 32.8811, lon: -6.9063 },
  { name: 'Marrakech', country: 'Morocco', lat: 31.6295, lon: -7.9811 },
  { name: 'Meknes', country: 'Morocco', lat: 33.8935, lon: -5.5473 },
  { name: 'Nador', country: 'Morocco', lat: 35.1744, lon: -2.9287 },
  { name: 'Ouarzazate', country: 'Morocco', lat: 30.9336, lon: -6.9000 },
  { name: 'Oujda', country: 'Morocco', lat: 34.6814, lon: -1.9086 },
  { name: 'Rabat', country: 'Morocco', lat: 34.0209, lon: -6.8417 },
  { name: 'Safi', country: 'Morocco', lat: 32.2994, lon: -9.2372 },
  { name: 'Sale', country: 'Morocco', lat: 34.0531, lon: -6.7985 },
  { name: 'Tangier', country: 'Morocco', lat: 35.7595, lon: -5.8340 },
  { name: 'Tetouan', country: 'Morocco', lat: 35.5889, lon: -5.3626 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOZAMBIQUE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Beira', country: 'Mozambique', lat: -19.8436, lon: 34.8389 },
  { name: 'Chimoio', country: 'Mozambique', lat: -19.1164, lon: 33.4833 },
  { name: 'Inhambane', country: 'Mozambique', lat: -23.8650, lon: 35.3833 },
  { name: 'Lichinga', country: 'Mozambique', lat: -13.3131, lon: 35.2406 },
  { name: 'Maputo', country: 'Mozambique', lat: -25.9692, lon: 32.5732 },
  { name: 'Matola', country: 'Mozambique', lat: -25.9622, lon: 32.4589 },
  { name: 'Nacala', country: 'Mozambique', lat: -14.5422, lon: 40.6728 },
  { name: 'Nampula', country: 'Mozambique', lat: -15.1167, lon: 39.2667 },
  { name: 'Pemba', country: 'Mozambique', lat: -12.9736, lon: 40.5183 },
  { name: 'Quelimane', country: 'Mozambique', lat: -17.8786, lon: 36.8883 },
  { name: 'Tete', country: 'Mozambique', lat: -16.1564, lon: 33.5867 },
  { name: 'Xai-Xai', country: 'Mozambique', lat: -25.0519, lon: 33.6442 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NAMIBIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Keetmanshoop', country: 'Namibia', lat: -26.5833, lon: 18.1333 },
  { name: 'Luderitz', country: 'Namibia', lat: -26.6481, lon: 15.1589 },
  { name: 'Oshakati', country: 'Namibia', lat: -17.7833, lon: 15.6833 },
  { name: 'Otjiwarongo', country: 'Namibia', lat: -20.4636, lon: 16.6528 },
  { name: 'Rundu', country: 'Namibia', lat: -17.9333, lon: 19.7667 },
  { name: 'Swakopmund', country: 'Namibia', lat: -22.6784, lon: 14.5326 },
  { name: 'Walvis Bay', country: 'Namibia', lat: -22.9575, lon: 14.5053 },
  { name: 'Windhoek', country: 'Namibia', lat: -22.5609, lon: 17.0658 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIGER
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Agadez', country: 'Niger', lat: 16.9736, lon: 7.9908 },
  { name: 'Maradi', country: 'Niger', lat: 13.5000, lon: 7.1000 },
  { name: 'Niamey', country: 'Niger', lat: 13.5137, lon: 2.1098 },
  { name: 'Tahoua', country: 'Niger', lat: 14.8888, lon: 5.2692 },
  { name: 'Zinder', country: 'Niger', lat: 13.8000, lon: 8.9833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIGERIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Aba', country: 'Nigeria', region: 'Abia', lat: 5.1066, lon: 7.3667 },
  { name: 'Abakaliki', country: 'Nigeria', region: 'Ebonyi', lat: 6.3249, lon: 8.1137 },
  { name: 'Abeokuta', country: 'Nigeria', region: 'Ogun', lat: 7.1475, lon: 3.3619 },
  { name: 'Abuja', country: 'Nigeria', region: 'FCT', lat: 9.0579, lon: 7.4951 },
  { name: 'Ado Ekiti', country: 'Nigeria', region: 'Ekiti', lat: 7.6174, lon: 5.2215 },
  { name: 'Akure', country: 'Nigeria', region: 'Ondo', lat: 7.2526, lon: 5.1931 },
  { name: 'Asaba', country: 'Nigeria', region: 'Delta', lat: 6.1984, lon: 6.7334 },
  { name: 'Awka', country: 'Nigeria', region: 'Anambra', lat: 6.2209, lon: 7.0700 },
  { name: 'Bauchi', country: 'Nigeria', region: 'Bauchi', lat: 10.3158, lon: 9.8442 },
  { name: 'Benin City', country: 'Nigeria', region: 'Edo', lat: 6.3350, lon: 5.6037 },
  { name: 'Calabar', country: 'Nigeria', region: 'Cross River', lat: 4.9517, lon: 8.3220 },
  { name: 'Damaturu', country: 'Nigeria', region: 'Yobe', lat: 11.7470, lon: 11.9608 },
  { name: 'Dutse', country: 'Nigeria', region: 'Jigawa', lat: 11.7560, lon: 9.3380 },
  { name: 'Enugu', country: 'Nigeria', region: 'Enugu', lat: 6.4584, lon: 7.5464 },
  { name: 'Gombe', country: 'Nigeria', region: 'Gombe', lat: 10.2897, lon: 11.1711 },
  { name: 'Gusau', country: 'Nigeria', region: 'Zamfara', lat: 12.1627, lon: 6.6611 },
  { name: 'Ibadan', country: 'Nigeria', region: 'Oyo', lat: 7.3775, lon: 3.9470 },
  { name: 'Ikeja', country: 'Nigeria', region: 'Lagos', lat: 6.6018, lon: 3.3515 },
  { name: 'Ikorodu', country: 'Nigeria', region: 'Lagos', lat: 6.6194, lon: 3.5105 },
  { name: 'Ilorin', country: 'Nigeria', region: 'Kwara', lat: 8.4966, lon: 4.5426 },
  { name: 'Jalingo', country: 'Nigeria', region: 'Taraba', lat: 8.9000, lon: 11.3667 },
  { name: 'Jos', country: 'Nigeria', region: 'Plateau', lat: 9.8965, lon: 8.8583 },
  { name: 'Kaduna', country: 'Nigeria', region: 'Kaduna', lat: 10.5105, lon: 7.4165 },
  { name: 'Kano', country: 'Nigeria', region: 'Kano', lat: 12.0022, lon: 8.5920 },
  { name: 'Katsina', country: 'Nigeria', region: 'Katsina', lat: 13.0059, lon: 7.6019 },
  { name: 'Lafia', country: 'Nigeria', region: 'Nasarawa', lat: 8.4939, lon: 8.5158 },
  { name: 'Lagos', country: 'Nigeria', region: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { name: 'Lokoja', country: 'Nigeria', region: 'Kogi', lat: 7.7969, lon: 6.7408 },
  { name: 'Maiduguri', country: 'Nigeria', region: 'Borno', lat: 11.8311, lon: 13.1510 },
  { name: 'Makurdi', country: 'Nigeria', region: 'Benue', lat: 7.7337, lon: 8.5215 },
  { name: 'Minna', country: 'Nigeria', region: 'Niger', lat: 9.6139, lon: 6.5569 },
  { name: 'Nsukka', country: 'Nigeria', region: 'Enugu', lat: 6.8578, lon: 7.3958 },
  { name: 'Ogbomoso', country: 'Nigeria', region: 'Oyo', lat: 8.1227, lon: 4.2436 },
  { name: 'Onitsha', country: 'Nigeria', region: 'Anambra', lat: 6.1667, lon: 6.7833 },
  { name: 'Oshogbo', country: 'Nigeria', region: 'Osun', lat: 7.7827, lon: 4.5418 },
  { name: 'Owerri', country: 'Nigeria', region: 'Imo', lat: 5.4836, lon: 7.0333 },
  { name: 'Port Harcourt', country: 'Nigeria', region: 'Rivers', lat: 4.7774, lon: 7.0134 },
  { name: 'Sokoto', country: 'Nigeria', region: 'Sokoto', lat: 13.0622, lon: 5.2339 },
  { name: 'Suleja', country: 'Nigeria', region: 'Niger', lat: 9.1833, lon: 7.1833 },
  { name: 'Umuahia', country: 'Nigeria', region: 'Abia', lat: 5.5240, lon: 7.4943 },
  { name: 'Uyo', country: 'Nigeria', region: 'Akwa Ibom', lat: 5.0377, lon: 7.9128 },
  { name: 'Warri', country: 'Nigeria', region: 'Delta', lat: 5.5167, lon: 5.7500 },
  { name: 'Yola', country: 'Nigeria', region: 'Adamawa', lat: 9.2035, lon: 12.4954 },
  { name: 'Zaria', country: 'Nigeria', region: 'Kaduna', lat: 11.0855, lon: 7.7199 },

  // ═══════════════════════════════════════════════════════════════════════════
  // RWANDA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Butare', country: 'Rwanda', lat: -2.5967, lon: 29.7389 },
  { name: 'Gisenyi', country: 'Rwanda', lat: -1.7028, lon: 29.2564 },
  { name: 'Kigali', country: 'Rwanda', lat: -1.9403, lon: 29.8739 },
  { name: 'Musanze', country: 'Rwanda', lat: -1.4975, lon: 29.6344 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAO TOME AND PRINCIPE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Sao Tome', country: 'Sao Tome and Principe', lat: 0.3365, lon: 6.7273 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SENEGAL
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Dakar', country: 'Senegal', lat: 14.7167, lon: -17.4677 },
  { name: 'Diourbel', country: 'Senegal', lat: 14.6500, lon: -16.2333 },
  { name: 'Kaolack', country: 'Senegal', lat: 14.1500, lon: -16.0667 },
  { name: 'Kolda', country: 'Senegal', lat: 12.8833, lon: -14.9500 },
  { name: 'Louga', country: 'Senegal', lat: 15.6167, lon: -16.2333 },
  { name: 'Matam', country: 'Senegal', lat: 15.6500, lon: -13.2500 },
  { name: 'Mbour', country: 'Senegal', lat: 14.4167, lon: -16.9667 },
  { name: 'Saint-Louis', country: 'Senegal', lat: 16.0179, lon: -16.4897 },
  { name: 'Tambacounda', country: 'Senegal', lat: 13.7667, lon: -13.6667 },
  { name: 'Thies', country: 'Senegal', lat: 14.7833, lon: -16.9167 },
  { name: 'Ziguinchor', country: 'Senegal', lat: 12.5833, lon: -16.2719 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SIERRA LEONE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bo', country: 'Sierra Leone', lat: 7.9647, lon: -11.7389 },
  { name: 'Freetown', country: 'Sierra Leone', lat: 8.4657, lon: -13.2317 },
  { name: 'Kenema', country: 'Sierra Leone', lat: 7.8767, lon: -11.1900 },
  { name: 'Makeni', country: 'Sierra Leone', lat: 8.8833, lon: -12.0500 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOMALIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bosaso', country: 'Somalia', lat: 11.2784, lon: 49.1817 },
  { name: 'Hargeisa', country: 'Somalia', lat: 9.5600, lon: 44.0650 },
  { name: 'Kismayo', country: 'Somalia', lat: -0.3562, lon: 42.5425 },
  { name: 'Mogadishu', country: 'Somalia', lat: 2.0469, lon: 45.3182 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUTH AFRICA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Benoni', country: 'South Africa', region: 'Gauteng', lat: -26.1886, lon: 28.3206 },
  { name: 'Bloemfontein', country: 'South Africa', region: 'Free State', lat: -29.0852, lon: 26.1596 },
  { name: 'Boksburg', country: 'South Africa', region: 'Gauteng', lat: -26.2125, lon: 28.2600 },
  { name: 'Centurion', country: 'South Africa', region: 'Gauteng', lat: -25.8603, lon: 28.1894 },
  { name: 'Durban', country: 'South Africa', region: 'KwaZulu-Natal', lat: -29.8587, lon: 31.0218 },
  { name: 'East London', country: 'South Africa', region: 'Eastern Cape', lat: -33.0292, lon: 27.8546 },
  { name: 'George', country: 'South Africa', region: 'Western Cape', lat: -33.9631, lon: 22.4617 },
  { name: 'Germiston', country: 'South Africa', region: 'Gauteng', lat: -26.2197, lon: 28.1694 },
  { name: 'Johannesburg', country: 'South Africa', region: 'Gauteng', lat: -26.2041, lon: 28.0473 },
  { name: 'Kimberley', country: 'South Africa', region: 'Northern Cape', lat: -28.7282, lon: 24.7499 },
  { name: 'Klerksdorp', country: 'South Africa', region: 'North West', lat: -26.8667, lon: 26.6667 },
  { name: 'Krugersdorp', country: 'South Africa', region: 'Gauteng', lat: -26.0857, lon: 27.7750 },
  { name: 'Middelburg', country: 'South Africa', region: 'Mpumalanga', lat: -25.7744, lon: 29.4631 },
  { name: 'Nelspruit', country: 'South Africa', region: 'Mpumalanga', lat: -25.4753, lon: 30.9694 },
  { name: 'Newcastle', country: 'South Africa', region: 'KwaZulu-Natal', lat: -27.7576, lon: 29.9318 },
  { name: 'Paarl', country: 'South Africa', region: 'Western Cape', lat: -33.7342, lon: 18.9722 },
  { name: 'Pietermaritzburg', country: 'South Africa', region: 'KwaZulu-Natal', lat: -29.6006, lon: 30.3794 },
  { name: 'Polokwane', country: 'South Africa', region: 'Limpopo', lat: -23.9045, lon: 29.4689 },
  { name: 'Port Elizabeth', country: 'South Africa', region: 'Eastern Cape', lat: -33.9608, lon: 25.6022 },
  { name: 'Potchefstroom', country: 'South Africa', region: 'North West', lat: -26.7145, lon: 27.0986 },
  { name: 'Pretoria', country: 'South Africa', region: 'Gauteng', lat: -25.7479, lon: 28.2293 },
  { name: 'Randburg', country: 'South Africa', region: 'Gauteng', lat: -26.0936, lon: 28.0064 },
  { name: 'Rustenburg', country: 'South Africa', region: 'North West', lat: -25.6715, lon: 27.2420 },
  { name: 'Sandton', country: 'South Africa', region: 'Gauteng', lat: -26.1076, lon: 28.0567 },
  { name: 'Soweto', country: 'South Africa', region: 'Gauteng', lat: -26.2678, lon: 27.8585 },
  { name: 'Stellenbosch', country: 'South Africa', region: 'Western Cape', lat: -33.9321, lon: 18.8602 },
  { name: 'Tembisa', country: 'South Africa', region: 'Gauteng', lat: -25.9964, lon: 28.2269 },
  { name: 'Umtata', country: 'South Africa', region: 'Eastern Cape', lat: -31.5889, lon: 28.7844 },
  { name: 'Upington', country: 'South Africa', region: 'Northern Cape', lat: -28.4572, lon: 21.2567 },
  { name: 'Vereeniging', country: 'South Africa', region: 'Gauteng', lat: -26.6736, lon: 27.9264 },
  { name: 'Welkom', country: 'South Africa', region: 'Free State', lat: -27.9767, lon: 26.7350 },
  { name: 'Witbank', country: 'South Africa', region: 'Mpumalanga', lat: -25.8800, lon: 29.2347 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUTH SUDAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Juba', country: 'South Sudan', lat: 4.8594, lon: 31.5713 },
  { name: 'Malakal', country: 'South Sudan', lat: 9.5334, lon: 31.6605 },
  { name: 'Wau', country: 'South Sudan', lat: 7.7000, lon: 28.0000 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SUDAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'El Obeid', country: 'Sudan', lat: 13.1833, lon: 30.2167 },
  { name: 'Kassala', country: 'Sudan', lat: 15.4500, lon: 36.4000 },
  { name: 'Khartoum', country: 'Sudan', lat: 15.5007, lon: 32.5599 },
  { name: 'Nyala', country: 'Sudan', lat: 12.0489, lon: 24.8796 },
  { name: 'Omdurman', country: 'Sudan', lat: 15.6445, lon: 32.4777 },
  { name: 'Port Sudan', country: 'Sudan', lat: 19.6158, lon: 37.2164 },
  { name: 'Wad Madani', country: 'Sudan', lat: 14.4000, lon: 33.5167 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TANZANIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Arusha', country: 'Tanzania', lat: -3.3869, lon: 36.6830 },
  { name: 'Bukoba', country: 'Tanzania', lat: -1.3317, lon: 31.8122 },
  { name: 'Dar es Salaam', country: 'Tanzania', lat: -6.7924, lon: 39.2083 },
  { name: 'Dodoma', country: 'Tanzania', lat: -6.1630, lon: 35.7516 },
  { name: 'Iringa', country: 'Tanzania', lat: -7.7833, lon: 35.6833 },
  { name: 'Kigoma', country: 'Tanzania', lat: -4.8833, lon: 29.6333 },
  { name: 'Mbeya', country: 'Tanzania', lat: -8.9000, lon: 33.4500 },
  { name: 'Morogoro', country: 'Tanzania', lat: -6.8210, lon: 37.6614 },
  { name: 'Moshi', country: 'Tanzania', lat: -3.3500, lon: 37.3333 },
  { name: 'Musoma', country: 'Tanzania', lat: -1.5000, lon: 33.8000 },
  { name: 'Mwanza', country: 'Tanzania', lat: -2.5167, lon: 32.9000 },
  { name: 'Songea', country: 'Tanzania', lat: -10.6833, lon: 35.6500 },
  { name: 'Tabora', country: 'Tanzania', lat: -5.0167, lon: 32.8000 },
  { name: 'Tanga', country: 'Tanzania', lat: -5.0688, lon: 39.0988 },
  { name: 'Zanzibar City', country: 'Tanzania', lat: -6.1659, lon: 39.2026 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOGO
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Kara', country: 'Togo', lat: 9.5511, lon: 1.1861 },
  { name: 'Lome', country: 'Togo', lat: 6.1375, lon: 1.2123 },
  { name: 'Sokode', country: 'Togo', lat: 8.9833, lon: 1.1333 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TUNISIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bizerte', country: 'Tunisia', lat: 37.2744, lon: 9.8739 },
  { name: 'Gabes', country: 'Tunisia', lat: 33.8833, lon: 10.1167 },
  { name: 'Kairouan', country: 'Tunisia', lat: 35.6781, lon: 10.0963 },
  { name: 'Monastir', country: 'Tunisia', lat: 35.7643, lon: 10.8113 },
  { name: 'Sfax', country: 'Tunisia', lat: 34.7406, lon: 10.7603 },
  { name: 'Sousse', country: 'Tunisia', lat: 35.8288, lon: 10.6405 },
  { name: 'Tunis', country: 'Tunisia', lat: 36.8065, lon: 10.1815 },

  // ═══════════════════════════════════════════════════════════════════════════
  // UGANDA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Entebbe', country: 'Uganda', lat: 0.0511, lon: 32.4631 },
  { name: 'Fort Portal', country: 'Uganda', lat: 0.6710, lon: 30.2750 },
  { name: 'Gulu', country: 'Uganda', lat: 2.7747, lon: 32.2990 },
  { name: 'Jinja', country: 'Uganda', lat: 0.4244, lon: 33.2041 },
  { name: 'Kabale', country: 'Uganda', lat: -1.2508, lon: 29.9894 },
  { name: 'Kampala', country: 'Uganda', lat: 0.3476, lon: 32.5825 },
  { name: 'Lira', country: 'Uganda', lat: 2.2500, lon: 32.5333 },
  { name: 'Masaka', country: 'Uganda', lat: -0.3413, lon: 31.7341 },
  { name: 'Mbale', country: 'Uganda', lat: 1.0644, lon: 34.1747 },
  { name: 'Mbarara', country: 'Uganda', lat: -0.6133, lon: 30.6585 },
  { name: 'Soroti', country: 'Uganda', lat: 1.7150, lon: 33.6111 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ZAMBIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Chipata', country: 'Zambia', lat: -13.6333, lon: 32.6500 },
  { name: 'Kabwe', country: 'Zambia', lat: -14.4381, lon: 28.4514 },
  { name: 'Kasama', country: 'Zambia', lat: -10.2167, lon: 31.1833 },
  { name: 'Kitwe', country: 'Zambia', lat: -12.8022, lon: 28.2130 },
  { name: 'Livingstone', country: 'Zambia', lat: -17.8419, lon: 25.8544 },
  { name: 'Lusaka', country: 'Zambia', lat: -15.3875, lon: 28.3228 },
  { name: 'Ndola', country: 'Zambia', lat: -12.9587, lon: 28.6366 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ZIMBABWE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bulawayo', country: 'Zimbabwe', lat: -20.1325, lon: 28.6265 },
  { name: 'Chitungwiza', country: 'Zimbabwe', lat: -18.0128, lon: 31.0756 },
  { name: 'Gweru', country: 'Zimbabwe', lat: -19.4500, lon: 29.8167 },
  { name: 'Harare', country: 'Zimbabwe', lat: -17.8292, lon: 31.0522 },
  { name: 'Kadoma', country: 'Zimbabwe', lat: -18.3333, lon: 29.9167 },
  { name: 'Kwekwe', country: 'Zimbabwe', lat: -18.9281, lon: 29.8149 },
  { name: 'Masvingo', country: 'Zimbabwe', lat: -20.0722, lon: 30.8339 },
  { name: 'Mutare', country: 'Zimbabwe', lat: -18.9707, lon: 32.6709 },
  { name: 'Victoria Falls', country: 'Zimbabwe', lat: -17.9318, lon: 25.8300 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  //                              A S I A
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // BRUNEI
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bandar Seri Begawan', country: 'Brunei', lat: 4.9031, lon: 114.9398 },
  { name: 'Seria', country: 'Brunei', lat: 4.6137, lon: 114.3230 },
  { name: 'Tutong', country: 'Brunei', lat: 4.8029, lon: 114.6486 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CAMBODIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Kep', country: 'Cambodia', lat: 10.4833, lon: 104.3167 },
  { name: 'Phnom Penh', country: 'Cambodia', lat: 11.5564, lon: 104.9282 },
  { name: 'Prey Veng', country: 'Cambodia', lat: 11.4847, lon: 105.3245 },
  { name: 'Pursat', country: 'Cambodia', lat: 12.5387, lon: 103.9192 },
  { name: 'Siem Reap', country: 'Cambodia', lat: 13.3633, lon: 103.8564 },
  { name: 'Svay Rieng', country: 'Cambodia', lat: 11.0833, lon: 105.7833 },
  { name: 'Takeo', country: 'Cambodia', lat: 10.9908, lon: 104.7850 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHINA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Anshan', country: 'China', region: 'Liaoning', lat: 41.1066, lon: 122.9950 },
  { name: 'Baoding', country: 'China', region: 'Hebei', lat: 38.8671, lon: 115.4845 },
  { name: 'Baotou', country: 'China', region: 'Inner Mongolia', lat: 40.6571, lon: 109.8400 },
  { name: 'Beijing', country: 'China', region: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Changzhou', country: 'China', region: 'Jiangsu', lat: 31.8112, lon: 119.9741 },
  { name: 'Chengdu', country: 'China', region: 'Sichuan', lat: 30.5728, lon: 104.0668 },
  { name: 'Chongqing', country: 'China', region: 'Chongqing', lat: 29.4316, lon: 106.9123 },
  { name: 'Datong', country: 'China', region: 'Shanxi', lat: 40.0900, lon: 113.2933 },
  { name: 'Dongguan', country: 'China', region: 'Guangdong', lat: 23.0489, lon: 113.7447 },
  { name: 'Foshan', country: 'China', region: 'Guangdong', lat: 23.0218, lon: 113.1219 },
  { name: 'Guangzhou', country: 'China', region: 'Guangdong', lat: 23.1291, lon: 113.2644 },
  { name: 'Guiyang', country: 'China', region: 'Guizhou', lat: 26.6470, lon: 106.6302 },
  { name: 'Hangzhou', country: 'China', region: 'Zhejiang', lat: 30.2741, lon: 120.1551 },
  { name: 'Hefei', country: 'China', region: 'Anhui', lat: 31.8206, lon: 117.2272 },
  { name: 'Huizhou', country: 'China', region: 'Guangdong', lat: 23.1115, lon: 114.4152 },
  { name: 'Jilin', country: 'China', region: 'Jilin', lat: 43.8507, lon: 126.5601 },
  { name: 'Jining', country: 'China', region: 'Shandong', lat: 35.4145, lon: 116.5873 },
  { name: 'Kaifeng', country: 'China', region: 'Henan', lat: 34.7972, lon: 114.3076 },
  { name: 'Luoyang', country: 'China', region: 'Henan', lat: 34.6836, lon: 112.4536 },
  { name: 'Nanchang', country: 'China', region: 'Jiangxi', lat: 28.6820, lon: 115.8579 },
  { name: 'Nanjing', country: 'China', region: 'Jiangsu', lat: 32.0603, lon: 118.7969 },
  { name: 'Nanning', country: 'China', region: 'Guangxi', lat: 22.8170, lon: 108.3665 },
  { name: 'Nantong', country: 'China', region: 'Jiangsu', lat: 32.0617, lon: 120.8946 },
  { name: 'Ningbo', country: 'China', region: 'Zhejiang', lat: 29.8683, lon: 121.5440 },
  { name: 'Shanghai', country: 'China', region: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  { name: 'Shantou', country: 'China', region: 'Guangdong', lat: 23.3535, lon: 116.6822 },
  { name: 'Shaoxing', country: 'China', region: 'Zhejiang', lat: 30.0021, lon: 120.5802 },
  { name: 'Shenzhen', country: 'China', region: 'Guangdong', lat: 22.5431, lon: 114.0579 },
  { name: 'Shijiazhuang', country: 'China', region: 'Hebei', lat: 38.0428, lon: 114.5149 },
  { name: 'Taiyuan', country: 'China', region: 'Shanxi', lat: 37.8706, lon: 112.5489 },
  { name: 'Tangshan', country: 'China', region: 'Hebei', lat: 39.6309, lon: 118.1802 },
  { name: 'Tianjin', country: 'China', region: 'Tianjin', lat: 39.3434, lon: 117.3616 },
  { name: 'Weifang', country: 'China', region: 'Shandong', lat: 36.7068, lon: 119.1619 },
  { name: 'Wenzhou', country: 'China', region: 'Zhejiang', lat: 28.0006, lon: 120.6722 },
  { name: 'Wuhan', country: 'China', region: 'Hubei', lat: 30.5928, lon: 114.3055 },
  { name: 'Wuxi', country: 'China', region: 'Jiangsu', lat: 31.4912, lon: 120.3119 },
  { name: 'Xian', country: 'China', region: 'Shaanxi', lat: 34.3416, lon: 108.9398 },
  { name: 'Xining', country: 'China', region: 'Qinghai', lat: 36.6171, lon: 101.7782 },
  { name: 'Xuzhou', country: 'China', region: 'Jiangsu', lat: 34.2044, lon: 117.2859 },
  { name: 'Yantai', country: 'China', region: 'Shandong', lat: 37.4639, lon: 121.4479 },
  { name: 'Yinchuan', country: 'China', region: 'Ningxia', lat: 38.4872, lon: 106.2309 },
  { name: 'Zhuhai', country: 'China', region: 'Guangdong', lat: 22.2710, lon: 113.5767 },

  // ═══════════════════════════════════════════════════════════════════════════
  // INDIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Agartala', country: 'India', region: 'Tripura', lat: 23.8315, lon: 91.2868 },
  { name: 'Ahmedabad', country: 'India', region: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Ajmer', country: 'India', region: 'Rajasthan', lat: 26.4499, lon: 74.6399 },
  { name: 'Aligarh', country: 'India', region: 'Uttar Pradesh', lat: 27.8974, lon: 78.0880 },
  { name: 'Allahabad', country: 'India', region: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463 },
  { name: 'Amravati', country: 'India', region: 'Maharashtra', lat: 20.9374, lon: 77.7796 },
  { name: 'Asansol', country: 'India', region: 'West Bengal', lat: 23.6889, lon: 86.9661 },
  { name: 'Aurangabad', country: 'India', region: 'Maharashtra', lat: 19.8762, lon: 75.3433 },
  { name: 'Bangalore', country: 'India', region: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Bareilly', country: 'India', region: 'Uttar Pradesh', lat: 28.3670, lon: 79.4304 },
  { name: 'Belgaum', country: 'India', region: 'Karnataka', lat: 15.8497, lon: 74.4977 },
  { name: 'Bhilai', country: 'India', region: 'Chhattisgarh', lat: 21.2167, lon: 81.4333 },
  { name: 'Bhiwandi', country: 'India', region: 'Maharashtra', lat: 19.2967, lon: 73.0631 },
  { name: 'Bikaner', country: 'India', region: 'Rajasthan', lat: 28.0229, lon: 73.3119 },
  { name: 'Chandigarh', country: 'India', region: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { name: 'Chennai', country: 'India', region: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Coimbatore', country: 'India', region: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { name: 'Cuttack', country: 'India', region: 'Odisha', lat: 20.4625, lon: 85.8830 },
  { name: 'Dehradun', country: 'India', region: 'Uttarakhand', lat: 30.3165, lon: 78.0322 },
  { name: 'Delhi', country: 'India', region: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { name: 'Dhanbad', country: 'India', region: 'Jharkhand', lat: 23.7957, lon: 86.4304 },
  { name: 'Durgapur', country: 'India', region: 'West Bengal', lat: 23.5204, lon: 87.3119 },
  { name: 'Faridabad', country: 'India', region: 'Haryana', lat: 28.4089, lon: 77.3178 },
  { name: 'Ghaziabad', country: 'India', region: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538 },
  { name: 'Gorakhpur', country: 'India', region: 'Uttar Pradesh', lat: 26.7606, lon: 83.3732 },
  { name: 'Guntur', country: 'India', region: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { name: 'Gurgaon', country: 'India', region: 'Haryana', lat: 28.4595, lon: 77.0266 },
  { name: 'Guwahati', country: 'India', region: 'Assam', lat: 26.1445, lon: 91.7362 },
  { name: 'Hubli', country: 'India', region: 'Karnataka', lat: 15.3647, lon: 75.1240 },
  { name: 'Hyderabad', country: 'India', region: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Imphal', country: 'India', region: 'Manipur', lat: 24.8170, lon: 93.9368 },
  { name: 'Jabalpur', country: 'India', region: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },
  { name: 'Jaipur', country: 'India', region: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Jalandhar', country: 'India', region: 'Punjab', lat: 31.3260, lon: 75.5762 },
  { name: 'Jamnagar', country: 'India', region: 'Gujarat', lat: 22.4707, lon: 70.0577 },
  { name: 'Jamshedpur', country: 'India', region: 'Jharkhand', lat: 22.8046, lon: 86.2029 },
  { name: 'Jhansi', country: 'India', region: 'Uttar Pradesh', lat: 25.4484, lon: 78.5685 },
  { name: 'Kanpur', country: 'India', region: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { name: 'Kolhapur', country: 'India', region: 'Maharashtra', lat: 16.7050, lon: 74.2433 },
  { name: 'Kolkata', country: 'India', region: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { name: 'Kota', country: 'India', region: 'Rajasthan', lat: 25.2138, lon: 75.8648 },
  { name: 'Kozhikode', country: 'India', region: 'Kerala', lat: 11.2588, lon: 75.7804 },
  { name: 'Lucknow', country: 'India', region: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Ludhiana', country: 'India', region: 'Punjab', lat: 30.9010, lon: 75.8573 },
  { name: 'Mangalore', country: 'India', region: 'Karnataka', lat: 12.9141, lon: 74.8560 },
  { name: 'Meerut', country: 'India', region: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064 },
  { name: 'Moradabad', country: 'India', region: 'Uttar Pradesh', lat: 28.8386, lon: 78.7733 },
  { name: 'Mumbai', country: 'India', region: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { name: 'Nashik', country: 'India', region: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { name: 'Nellore', country: 'India', region: 'Andhra Pradesh', lat: 14.4426, lon: 79.9865 },
  { name: 'Noida', country: 'India', region: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910 },
  { name: 'Patna', country: 'India', region: 'Bihar', lat: 25.6093, lon: 85.1376 },
  { name: 'Pune', country: 'India', region: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Raipur', country: 'India', region: 'Chhattisgarh', lat: 21.2514, lon: 81.6296 },
  { name: 'Ranchi', country: 'India', region: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
  { name: 'Salem', country: 'India', region: 'Tamil Nadu', lat: 11.6643, lon: 78.1460 },
  { name: 'Siliguri', country: 'India', region: 'West Bengal', lat: 26.7271, lon: 88.3953 },
  { name: 'Solapur', country: 'India', region: 'Maharashtra', lat: 17.6599, lon: 75.9064 },
  { name: 'Tiruchirappalli', country: 'India', region: 'Tamil Nadu', lat: 10.7905, lon: 78.7047 },
  { name: 'Tirupati', country: 'India', region: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
  { name: 'Vijayawada', country: 'India', region: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { name: 'Warangal', country: 'India', region: 'Telangana', lat: 17.9784, lon: 79.5941 },

  // ═══════════════════════════════════════════════════════════════════════════
  // INDONESIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ambon', country: 'Indonesia', lat: -3.6954, lon: 128.1814 },
  { name: 'Balikpapan', country: 'Indonesia', lat: -1.2654, lon: 116.8310 },
  { name: 'Banjarmasin', country: 'Indonesia', lat: -3.3194, lon: 114.5908 },
  { name: 'Batam', country: 'Indonesia', lat: 1.0456, lon: 104.0305 },
  { name: 'Bekasi', country: 'Indonesia', lat: -6.2383, lon: 106.9756 },
  { name: 'Bogor', country: 'Indonesia', lat: -6.5971, lon: 106.8060 },
  { name: 'Cirebon', country: 'Indonesia', lat: -6.7320, lon: 108.5523 },
  { name: 'Denpasar', country: 'Indonesia', lat: -8.6500, lon: 115.2167 },
  { name: 'Depok', country: 'Indonesia', lat: -6.4025, lon: 106.7942 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456 },
  { name: 'Jambi', country: 'Indonesia', lat: -1.6101, lon: 103.6131 },
  { name: 'Jayapura', country: 'Indonesia', lat: -2.5337, lon: 140.7181 },
  { name: 'Kendari', country: 'Indonesia', lat: -3.9985, lon: 122.5130 },
  { name: 'Kupang', country: 'Indonesia', lat: -10.1772, lon: 123.6070 },
  { name: 'Lampung', country: 'Indonesia', lat: -5.4500, lon: 105.2667 },
  { name: 'Manado', country: 'Indonesia', lat: 1.4748, lon: 124.8421 },
  { name: 'Padang', country: 'Indonesia', lat: -0.9471, lon: 100.4172 },
  { name: 'Palembang', country: 'Indonesia', lat: -2.9761, lon: 104.7754 },
  { name: 'Palu', country: 'Indonesia', lat: -0.9003, lon: 119.8780 },
  { name: 'Pekanbaru', country: 'Indonesia', lat: 0.5071, lon: 101.4478 },
  { name: 'Pontianak', country: 'Indonesia', lat: -0.0263, lon: 109.3425 },
  { name: 'Samarinda', country: 'Indonesia', lat: -0.4948, lon: 117.1436 },
  { name: 'Solo', country: 'Indonesia', lat: -7.5755, lon: 110.8243 },
  { name: 'Tangerang', country: 'Indonesia', lat: -6.1783, lon: 106.6319 },
  { name: 'Tasikmalaya', country: 'Indonesia', lat: -7.3274, lon: 108.2207 },
  { name: 'Ternate', country: 'Indonesia', lat: 0.7833, lon: 127.3667 },

  // ═══════════════════════════════════════════════════════════════════════════
  // IRAQ
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Baghdad', country: 'Iraq', lat: 33.3152, lon: 44.3661 },
  { name: 'Basra', country: 'Iraq', lat: 30.5085, lon: 47.7804 },
  { name: 'Duhok', country: 'Iraq', lat: 36.8667, lon: 42.9500 },
  { name: 'Erbil', country: 'Iraq', lat: 36.1912, lon: 44.0094 },
  { name: 'Fallujah', country: 'Iraq', lat: 33.3500, lon: 43.7833 },
  { name: 'Hillah', country: 'Iraq', lat: 32.4861, lon: 44.4200 },
  { name: 'Karbala', country: 'Iraq', lat: 32.6160, lon: 44.0249 },
  { name: 'Kirkuk', country: 'Iraq', lat: 35.4681, lon: 44.3922 },
  { name: 'Kut', country: 'Iraq', lat: 32.5151, lon: 45.8173 },
  { name: 'Mosul', country: 'Iraq', lat: 36.3350, lon: 43.1189 },
  { name: 'Najaf', country: 'Iraq', lat: 32.0003, lon: 44.3362 },
  { name: 'Nasiriyah', country: 'Iraq', lat: 31.0425, lon: 46.2575 },
  { name: 'Ramadi', country: 'Iraq', lat: 33.4271, lon: 43.3068 },
  { name: 'Samarra', country: 'Iraq', lat: 34.1973, lon: 43.8744 },
  { name: 'Sulaymaniyah', country: 'Iraq', lat: 35.5564, lon: 45.4351 },
  { name: 'Tikrit', country: 'Iraq', lat: 34.6135, lon: 43.6793 },

  // ═══════════════════════════════════════════════════════════════════════════
  // IRAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ahvaz', country: 'Iran', lat: 31.3183, lon: 48.6706 },
  { name: 'Arak', country: 'Iran', lat: 34.0917, lon: 49.6892 },
  { name: 'Ardabil', country: 'Iran', lat: 38.2498, lon: 48.2933 },
  { name: 'Bandar Abbas', country: 'Iran', lat: 27.1832, lon: 56.2666 },
  { name: 'Birjand', country: 'Iran', lat: 32.8663, lon: 59.2211 },
  { name: 'Bushehr', country: 'Iran', lat: 28.9684, lon: 50.8385 },
  { name: 'Gorgan', country: 'Iran', lat: 36.8427, lon: 54.4439 },
  { name: 'Hamadan', country: 'Iran', lat: 34.7983, lon: 48.5146 },
  { name: 'Ilam', country: 'Iran', lat: 33.6374, lon: 46.4227 },
  { name: 'Karaj', country: 'Iran', lat: 35.8400, lon: 50.9391 },
  { name: 'Kermanshah', country: 'Iran', lat: 34.3142, lon: 47.0650 },
  { name: 'Khorramabad', country: 'Iran', lat: 33.4878, lon: 48.3558 },
  { name: 'Qom', country: 'Iran', lat: 34.6401, lon: 50.8764 },
  { name: 'Rasht', country: 'Iran', lat: 37.2808, lon: 49.5832 },
  { name: 'Sanandaj', country: 'Iran', lat: 35.3119, lon: 46.9988 },
  { name: 'Sari', country: 'Iran', lat: 36.5633, lon: 53.0601 },
  { name: 'Semnan', country: 'Iran', lat: 35.5729, lon: 53.3971 },
  { name: 'Urmia', country: 'Iran', lat: 37.5527, lon: 45.0761 },
  { name: 'Zahedan', country: 'Iran', lat: 29.4963, lon: 60.8629 },
  { name: 'Zanjan', country: 'Iran', lat: 36.6736, lon: 48.4787 },

  // ═══════════════════════════════════════════════════════════════════════════
  // JAPAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Akita', country: 'Japan', lat: 39.7200, lon: 140.1025 },
  { name: 'Aomori', country: 'Japan', lat: 40.8244, lon: 140.7400 },
  { name: 'Asahikawa', country: 'Japan', lat: 43.7706, lon: 142.3650 },
  { name: 'Chiba', country: 'Japan', lat: 35.6073, lon: 140.1063 },
  { name: 'Fukuoka', country: 'Japan', lat: 33.5904, lon: 130.4017 },
  { name: 'Fukushima', country: 'Japan', lat: 37.7500, lon: 140.4678 },
  { name: 'Gifu', country: 'Japan', lat: 35.4233, lon: 136.7607 },
  { name: 'Hakodate', country: 'Japan', lat: 41.7687, lon: 140.7289 },
  { name: 'Hamamatsu', country: 'Japan', lat: 34.7108, lon: 137.7261 },
  { name: 'Hiroshima', country: 'Japan', lat: 34.3853, lon: 132.4553 },
  { name: 'Kagoshima', country: 'Japan', lat: 31.5966, lon: 130.5571 },
  { name: 'Kanazawa', country: 'Japan', lat: 36.5613, lon: 136.6562 },
  { name: 'Kawasaki', country: 'Japan', lat: 35.5309, lon: 139.7030 },
  { name: 'Kobe', country: 'Japan', lat: 34.6901, lon: 135.1956 },
  { name: 'Kumamoto', country: 'Japan', lat: 32.8031, lon: 130.7079 },
  { name: 'Matsuyama', country: 'Japan', lat: 33.8392, lon: 132.7658 },
  { name: 'Nagano', country: 'Japan', lat: 36.6485, lon: 138.1810 },
  { name: 'Nagasaki', country: 'Japan', lat: 32.7503, lon: 129.8779 },
  { name: 'Nagoya', country: 'Japan', lat: 35.1815, lon: 136.9066 },
  { name: 'Naha', country: 'Japan', lat: 26.2124, lon: 127.6809 },
  { name: 'Niigata', country: 'Japan', lat: 37.9162, lon: 139.0364 },
  { name: 'Okayama', country: 'Japan', lat: 34.6551, lon: 133.9195 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023 },
  { name: 'Saitama', country: 'Japan', lat: 35.8617, lon: 139.6455 },
  { name: 'Sapporo', country: 'Japan', lat: 43.0618, lon: 141.3545 },
  { name: 'Sendai', country: 'Japan', lat: 38.2682, lon: 140.8694 },
  { name: 'Shizuoka', country: 'Japan', lat: 34.9756, lon: 138.3828 },
  { name: 'Takamatsu', country: 'Japan', lat: 34.3401, lon: 134.0434 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Toyama', country: 'Japan', lat: 36.6953, lon: 137.2114 },
  { name: 'Yokohama', country: 'Japan', lat: 35.4437, lon: 139.6380 },

  // ═══════════════════════════════════════════════════════════════════════════
  // KAZAKHSTAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Aktau', country: 'Kazakhstan', lat: 43.6500, lon: 51.1500 },
  { name: 'Aktobe', country: 'Kazakhstan', lat: 50.2839, lon: 57.1670 },
  { name: 'Almaty', country: 'Kazakhstan', lat: 43.2220, lon: 76.8512 },
  { name: 'Astana', country: 'Kazakhstan', lat: 51.1694, lon: 71.4491 },
  { name: 'Atyrau', country: 'Kazakhstan', lat: 47.1167, lon: 51.9000 },
  { name: 'Karaganda', country: 'Kazakhstan', lat: 49.8047, lon: 73.1094 },
  { name: 'Kostanay', country: 'Kazakhstan', lat: 53.2144, lon: 63.6246 },
  { name: 'Pavlodar', country: 'Kazakhstan', lat: 52.2873, lon: 76.9674 },
  { name: 'Semey', country: 'Kazakhstan', lat: 50.4111, lon: 80.2275 },
  { name: 'Shymkent', country: 'Kazakhstan', lat: 42.3167, lon: 69.5969 },
  { name: 'Taraz', country: 'Kazakhstan', lat: 42.9000, lon: 71.3667 },
  { name: 'Turkestan', country: 'Kazakhstan', lat: 43.3017, lon: 68.2514 },

  // ═══════════════════════════════════════════════════════════════════════════
  // KYRGYZSTAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bishkek', country: 'Kyrgyzstan', lat: 42.8746, lon: 74.5698 },
  { name: 'Jalal-Abad', country: 'Kyrgyzstan', lat: 40.9333, lon: 73.0000 },
  { name: 'Karakol', country: 'Kyrgyzstan', lat: 42.4907, lon: 78.3936 },
  { name: 'Osh', country: 'Kyrgyzstan', lat: 40.5283, lon: 72.7985 },

  // ═══════════════════════════════════════════════════════════════════════════
  // LAOS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Luang Prabang', country: 'Laos', lat: 19.8853, lon: 102.1347 },
  { name: 'Pakse', country: 'Laos', lat: 15.1203, lon: 105.7990 },
  { name: 'Savannakhet', country: 'Laos', lat: 16.5417, lon: 104.7500 },
  { name: 'Vang Vieng', country: 'Laos', lat: 18.9222, lon: 102.4500 },
  { name: 'Vientiane', country: 'Laos', lat: 17.9757, lon: 102.6331 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MALAYSIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Alor Setar', country: 'Malaysia', lat: 6.1248, lon: 100.3677 },
  { name: 'George Town', country: 'Malaysia', lat: 5.4141, lon: 100.3288 },
  { name: 'Ipoh', country: 'Malaysia', lat: 4.5975, lon: 101.0901 },
  { name: 'Johor Bahru', country: 'Malaysia', lat: 1.4927, lon: 103.7414 },
  { name: 'Kota Bharu', country: 'Malaysia', lat: 6.1254, lon: 102.2381 },
  { name: 'Kota Kinabalu', country: 'Malaysia', lat: 5.9804, lon: 116.0735 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869 },
  { name: 'Kuala Terengganu', country: 'Malaysia', lat: 5.3117, lon: 103.1324 },
  { name: 'Kuantan', country: 'Malaysia', lat: 3.8077, lon: 103.3260 },
  { name: 'Kuching', country: 'Malaysia', lat: 1.5497, lon: 110.3414 },
  { name: 'Langkawi', country: 'Malaysia', lat: 6.3500, lon: 99.8000 },
  { name: 'Malacca', country: 'Malaysia', lat: 2.1896, lon: 102.2501 },
  { name: 'Miri', country: 'Malaysia', lat: 4.3995, lon: 114.0089 },
  { name: 'Petaling Jaya', country: 'Malaysia', lat: 3.1073, lon: 101.6067 },
  { name: 'Sandakan', country: 'Malaysia', lat: 5.8394, lon: 118.1174 },
  { name: 'Seremban', country: 'Malaysia', lat: 2.7258, lon: 101.9424 },
  { name: 'Shah Alam', country: 'Malaysia', lat: 3.0733, lon: 101.5185 },
  { name: 'Sibu', country: 'Malaysia', lat: 2.3000, lon: 111.8500 },
  { name: 'Subang Jaya', country: 'Malaysia', lat: 3.0565, lon: 101.5851 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MALDIVES
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Male', country: 'Maldives', lat: 4.1755, lon: 73.5093 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MONGOLIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Darkhan', country: 'Mongolia', lat: 49.4686, lon: 105.9745 },
  { name: 'Erdenet', country: 'Mongolia', lat: 49.0500, lon: 104.1500 },
  { name: 'Ulaanbaatar', country: 'Mongolia', lat: 47.8864, lon: 106.9057 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MYANMAR
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bago', country: 'Myanmar', lat: 17.3367, lon: 96.4811 },
  { name: 'Mandalay', country: 'Myanmar', lat: 21.9588, lon: 96.0891 },
  { name: 'Mawlamyine', country: 'Myanmar', lat: 16.4905, lon: 97.6255 },
  { name: 'Meiktila', country: 'Myanmar', lat: 20.8833, lon: 95.8667 },
  { name: 'Monywa', country: 'Myanmar', lat: 21.9114, lon: 95.1333 },
  { name: 'Myitkyina', country: 'Myanmar', lat: 25.3867, lon: 97.3958 },
  { name: 'Naypyidaw', country: 'Myanmar', lat: 19.7633, lon: 96.0785 },
  { name: 'Pathein', country: 'Myanmar', lat: 16.7833, lon: 94.7333 },
  { name: 'Pyay', country: 'Myanmar', lat: 18.8231, lon: 95.2194 },
  { name: 'Sittwe', country: 'Myanmar', lat: 20.1500, lon: 92.9000 },
  { name: 'Taunggyi', country: 'Myanmar', lat: 20.7833, lon: 97.0333 },
  { name: 'Yangon', country: 'Myanmar', lat: 16.8661, lon: 96.1951 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEPAL
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bharatpur', country: 'Nepal', lat: 27.6833, lon: 84.4333 },
  { name: 'Biratnagar', country: 'Nepal', lat: 26.4525, lon: 87.2718 },
  { name: 'Birgunj', country: 'Nepal', lat: 27.0000, lon: 84.8667 },
  { name: 'Dharan', country: 'Nepal', lat: 26.8122, lon: 87.2833 },
  { name: 'Janakpur', country: 'Nepal', lat: 26.7288, lon: 85.9240 },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.3240 },
  { name: 'Lalitpur', country: 'Nepal', lat: 27.6588, lon: 85.3247 },
  { name: 'Nepalgunj', country: 'Nepal', lat: 28.0500, lon: 81.6167 },
  { name: 'Pokhara', country: 'Nepal', lat: 28.2096, lon: 83.9856 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NORTH KOREA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Chongjin', country: 'North Korea', lat: 41.7953, lon: 129.7757 },
  { name: 'Hamhung', country: 'North Korea', lat: 39.9181, lon: 127.5353 },
  { name: 'Kaesong', country: 'North Korea', lat: 37.9711, lon: 126.5547 },
  { name: 'Nampo', country: 'North Korea', lat: 38.7375, lon: 125.4078 },
  { name: 'Pyongyang', country: 'North Korea', lat: 39.0392, lon: 125.7625 },
  { name: 'Wonsan', country: 'North Korea', lat: 39.1536, lon: 127.4433 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAKISTAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Abbottabad', country: 'Pakistan', region: 'Khyber Pakhtunkhwa', lat: 34.1463, lon: 73.2117 },
  { name: 'Bahawalpur', country: 'Pakistan', region: 'Punjab', lat: 29.3956, lon: 71.6722 },
  { name: 'Faisalabad', country: 'Pakistan', region: 'Punjab', lat: 31.4504, lon: 73.1350 },
  { name: 'Gujranwala', country: 'Pakistan', region: 'Punjab', lat: 32.1877, lon: 74.1945 },
  { name: 'Gujrat', country: 'Pakistan', region: 'Punjab', lat: 32.5742, lon: 74.0789 },
  { name: 'Hyderabad', country: 'Pakistan', region: 'Sindh', lat: 25.3960, lon: 68.3578 },
  { name: 'Islamabad', country: 'Pakistan', region: 'Islamabad', lat: 33.6844, lon: 73.0479 },
  { name: 'Jhang', country: 'Pakistan', region: 'Punjab', lat: 31.2694, lon: 72.3267 },
  { name: 'Karachi', country: 'Pakistan', region: 'Sindh', lat: 24.8607, lon: 67.0011 },
  { name: 'Kasur', country: 'Pakistan', region: 'Punjab', lat: 31.1167, lon: 74.4500 },
  { name: 'Lahore', country: 'Pakistan', region: 'Punjab', lat: 31.5204, lon: 74.3587 },
  { name: 'Larkana', country: 'Pakistan', region: 'Sindh', lat: 27.5600, lon: 68.2100 },
  { name: 'Mardan', country: 'Pakistan', region: 'Khyber Pakhtunkhwa', lat: 34.1988, lon: 72.0404 },
  { name: 'Mingora', country: 'Pakistan', region: 'Khyber Pakhtunkhwa', lat: 34.7717, lon: 72.3600 },
  { name: 'Mirpur Khas', country: 'Pakistan', region: 'Sindh', lat: 25.5256, lon: 69.0161 },
  { name: 'Multan', country: 'Pakistan', region: 'Punjab', lat: 30.1575, lon: 71.5249 },
  { name: 'Nawabshah', country: 'Pakistan', region: 'Sindh', lat: 26.2483, lon: 68.4100 },
  { name: 'Okara', country: 'Pakistan', region: 'Punjab', lat: 30.8081, lon: 73.4533 },
  { name: 'Peshawar', country: 'Pakistan', region: 'Khyber Pakhtunkhwa', lat: 34.0151, lon: 71.5249 },
  { name: 'Quetta', country: 'Pakistan', region: 'Balochistan', lat: 30.1798, lon: 66.9750 },
  { name: 'Rahim Yar Khan', country: 'Pakistan', region: 'Punjab', lat: 28.4202, lon: 70.2952 },
  { name: 'Rawalpindi', country: 'Pakistan', region: 'Punjab', lat: 33.5651, lon: 73.0169 },
  { name: 'Sahiwal', country: 'Pakistan', region: 'Punjab', lat: 30.6682, lon: 73.1114 },
  { name: 'Sargodha', country: 'Pakistan', region: 'Punjab', lat: 32.0836, lon: 72.6711 },
  { name: 'Sheikhupura', country: 'Pakistan', region: 'Punjab', lat: 31.7131, lon: 73.9850 },
  { name: 'Sialkot', country: 'Pakistan', region: 'Punjab', lat: 32.4945, lon: 74.5229 },
  { name: 'Sukkur', country: 'Pakistan', region: 'Sindh', lat: 27.7056, lon: 68.8578 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHILIPPINES
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Angeles City', country: 'Philippines', lat: 15.1450, lon: 120.5887 },
  { name: 'Antipolo', country: 'Philippines', lat: 14.5861, lon: 121.1761 },
  { name: 'Bacolod', country: 'Philippines', lat: 10.6840, lon: 122.9540 },
  { name: 'Baguio', country: 'Philippines', lat: 16.4023, lon: 120.5960 },
  { name: 'Butuan', country: 'Philippines', lat: 8.9475, lon: 125.5406 },
  { name: 'Cagayan de Oro', country: 'Philippines', lat: 8.4542, lon: 124.6319 },
  { name: 'Caloocan', country: 'Philippines', lat: 14.6488, lon: 120.9840 },
  { name: 'Cebu City', country: 'Philippines', lat: 10.3157, lon: 123.8854 },
  { name: 'Cotabato City', country: 'Philippines', lat: 7.2167, lon: 124.2500 },
  { name: 'Dagupan', country: 'Philippines', lat: 16.0433, lon: 120.3365 },
  { name: 'Davao City', country: 'Philippines', lat: 7.1907, lon: 125.4553 },
  { name: 'Dumaguete', country: 'Philippines', lat: 9.3068, lon: 123.3054 },
  { name: 'General Santos', country: 'Philippines', lat: 6.1164, lon: 125.1716 },
  { name: 'Iligan', country: 'Philippines', lat: 8.2295, lon: 124.2453 },
  { name: 'Iloilo City', country: 'Philippines', lat: 10.7202, lon: 122.5621 },
  { name: 'Laoag', country: 'Philippines', lat: 18.1978, lon: 120.5936 },
  { name: 'Lapu-Lapu', country: 'Philippines', lat: 10.3103, lon: 123.9494 },
  { name: 'Las Pinas', country: 'Philippines', lat: 14.4507, lon: 120.9830 },
  { name: 'Legazpi', country: 'Philippines', lat: 13.1391, lon: 123.7438 },
  { name: 'Lucena', country: 'Philippines', lat: 13.9373, lon: 121.6170 },
  { name: 'Makati', country: 'Philippines', lat: 14.5547, lon: 121.0244 },
  { name: 'Mandaue', country: 'Philippines', lat: 10.3236, lon: 123.9223 },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842 },
  { name: 'Naga', country: 'Philippines', lat: 13.6218, lon: 123.1948 },
  { name: 'Olongapo', country: 'Philippines', lat: 14.8292, lon: 120.2824 },
  { name: 'Ormoc', country: 'Philippines', lat: 11.0439, lon: 124.6075 },
  { name: 'Paranaque', country: 'Philippines', lat: 14.4793, lon: 121.0198 },
  { name: 'Pasig', country: 'Philippines', lat: 14.5764, lon: 121.0851 },
  { name: 'Puerto Princesa', country: 'Philippines', lat: 9.7392, lon: 118.7353 },
  { name: 'Quezon City', country: 'Philippines', lat: 14.6760, lon: 121.0437 },
  { name: 'Roxas', country: 'Philippines', lat: 11.5853, lon: 122.7511 },
  { name: 'San Fernando', country: 'Philippines', lat: 16.6159, lon: 120.3209 },
  { name: 'Tacloban', country: 'Philippines', lat: 11.2500, lon: 125.0000 },
  { name: 'Tagbilaran', country: 'Philippines', lat: 9.6500, lon: 123.8500 },
  { name: 'Taguig', country: 'Philippines', lat: 14.5176, lon: 121.0509 },
  { name: 'Valenzuela', country: 'Philippines', lat: 14.6943, lon: 120.9842 },
  { name: 'Zamboanga City', country: 'Philippines', lat: 6.9214, lon: 122.0790 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUTH KOREA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Busan', country: 'South Korea', lat: 35.1796, lon: 129.0756 },
  { name: 'Changwon', country: 'South Korea', lat: 35.2280, lon: 128.6811 },
  { name: 'Cheongju', country: 'South Korea', lat: 36.6372, lon: 127.4898 },
  { name: 'Cheonan', country: 'South Korea', lat: 36.8065, lon: 127.1522 },
  { name: 'Chuncheon', country: 'South Korea', lat: 37.8747, lon: 127.7342 },
  { name: 'Daegu', country: 'South Korea', lat: 35.8714, lon: 128.6014 },
  { name: 'Daejeon', country: 'South Korea', lat: 36.3504, lon: 127.3845 },
  { name: 'Gangneung', country: 'South Korea', lat: 37.7519, lon: 128.8761 },
  { name: 'Gimhae', country: 'South Korea', lat: 35.2341, lon: 128.8812 },
  { name: 'Goyang', country: 'South Korea', lat: 37.6584, lon: 126.8320 },
  { name: 'Gwangju', country: 'South Korea', lat: 35.1595, lon: 126.8526 },
  { name: 'Hwaseong', country: 'South Korea', lat: 37.1997, lon: 126.8312 },
  { name: 'Iksan', country: 'South Korea', lat: 35.9484, lon: 126.9548 },
  { name: 'Incheon', country: 'South Korea', lat: 37.4563, lon: 126.7052 },
  { name: 'Jeju', country: 'South Korea', lat: 33.4996, lon: 126.5312 },
  { name: 'Jeonju', country: 'South Korea', lat: 35.8242, lon: 127.1480 },
  { name: 'Mokpo', country: 'South Korea', lat: 34.8118, lon: 126.3922 },
  { name: 'Pohang', country: 'South Korea', lat: 36.0190, lon: 129.3435 },
  { name: 'Sejong', country: 'South Korea', lat: 36.4800, lon: 127.0000 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780 },
  { name: 'Suwon', country: 'South Korea', lat: 37.2636, lon: 127.0286 },
  { name: 'Ulsan', country: 'South Korea', lat: 35.5384, lon: 129.3114 },
  { name: 'Wonju', country: 'South Korea', lat: 37.3422, lon: 127.9202 },
  { name: 'Yeosu', country: 'South Korea', lat: 34.7604, lon: 127.6622 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SRI LANKA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Anuradhapura', country: 'Sri Lanka', lat: 8.3114, lon: 80.4037 },
  { name: 'Batticaloa', country: 'Sri Lanka', lat: 7.7310, lon: 81.6927 },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612 },
  { name: 'Galle', country: 'Sri Lanka', lat: 6.0535, lon: 80.2210 },
  { name: 'Jaffna', country: 'Sri Lanka', lat: 9.6615, lon: 80.0255 },
  { name: 'Kandy', country: 'Sri Lanka', lat: 7.2906, lon: 80.6337 },
  { name: 'Kurunegala', country: 'Sri Lanka', lat: 7.4863, lon: 80.3648 },
  { name: 'Matara', country: 'Sri Lanka', lat: 5.9485, lon: 80.5353 },
  { name: 'Negombo', country: 'Sri Lanka', lat: 7.2083, lon: 79.8358 },
  { name: 'Nuwara Eliya', country: 'Sri Lanka', lat: 6.9497, lon: 80.7891 },
  { name: 'Ratnapura', country: 'Sri Lanka', lat: 6.6828, lon: 80.4000 },
  { name: 'Trincomalee', country: 'Sri Lanka', lat: 8.5874, lon: 81.2152 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAJIKISTAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Dushanbe', country: 'Tajikistan', lat: 38.5598, lon: 68.7740 },
  { name: 'Khujand', country: 'Tajikistan', lat: 40.2828, lon: 69.6220 },
  { name: 'Kulob', country: 'Tajikistan', lat: 37.9139, lon: 69.7806 },

  // ═══════════════════════════════════════════════════════════════════════════
  // THAILAND
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Chiang Mai', country: 'Thailand', lat: 18.7883, lon: 98.9853 },
  { name: 'Chiang Rai', country: 'Thailand', lat: 19.9105, lon: 99.8406 },
  { name: 'Hat Yai', country: 'Thailand', lat: 7.0041, lon: 100.4747 },
  { name: 'Hua Hin', country: 'Thailand', lat: 12.5684, lon: 99.9577 },
  { name: 'Khon Kaen', country: 'Thailand', lat: 16.4322, lon: 102.8236 },
  { name: 'Korat', country: 'Thailand', lat: 14.9799, lon: 102.0978 },
  { name: 'Krabi', country: 'Thailand', lat: 8.0863, lon: 98.9063 },
  { name: 'Lampang', country: 'Thailand', lat: 18.2888, lon: 99.4987 },
  { name: 'Nakhon Ratchasima', country: 'Thailand', lat: 14.9799, lon: 102.0978 },
  { name: 'Nonthaburi', country: 'Thailand', lat: 13.8622, lon: 100.5143 },
  { name: 'Pattaya', country: 'Thailand', lat: 12.9236, lon: 100.8825 },
  { name: 'Phitsanulok', country: 'Thailand', lat: 16.8211, lon: 100.2659 },
  { name: 'Phuket', country: 'Thailand', lat: 7.8804, lon: 98.3923 },
  { name: 'Rayong', country: 'Thailand', lat: 12.6814, lon: 101.2814 },
  { name: 'Songkhla', country: 'Thailand', lat: 7.1897, lon: 100.5955 },
  { name: 'Surat Thani', country: 'Thailand', lat: 9.1382, lon: 99.3214 },
  { name: 'Ubon Ratchathani', country: 'Thailand', lat: 15.2448, lon: 104.8473 },
  { name: 'Udon Thani', country: 'Thailand', lat: 17.4156, lon: 102.7872 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMOR-LESTE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Dili', country: 'Timor-Leste', lat: -8.5569, lon: 125.5603 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TURKMENISTAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ashgabat', country: 'Turkmenistan', lat: 37.9601, lon: 58.3261 },
  { name: 'Mary', country: 'Turkmenistan', lat: 37.5936, lon: 61.8303 },
  { name: 'Turkmenabat', country: 'Turkmenistan', lat: 39.0733, lon: 63.5786 },

  // ═══════════════════════════════════════════════════════════════════════════
  // UZBEKISTAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Andijan', country: 'Uzbekistan', lat: 40.7829, lon: 72.3442 },
  { name: 'Bukhara', country: 'Uzbekistan', lat: 39.7681, lon: 64.4556 },
  { name: 'Fergana', country: 'Uzbekistan', lat: 40.3834, lon: 71.7870 },
  { name: 'Namangan', country: 'Uzbekistan', lat: 40.9983, lon: 71.6726 },
  { name: 'Nukus', country: 'Uzbekistan', lat: 42.4631, lon: 59.6044 },
  { name: 'Samarkand', country: 'Uzbekistan', lat: 39.6542, lon: 66.9597 },
  { name: 'Tashkent', country: 'Uzbekistan', lat: 41.2995, lon: 69.2401 },

  // ═══════════════════════════════════════════════════════════════════════════
  // VIETNAM
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bien Hoa', country: 'Vietnam', lat: 10.9500, lon: 106.8167 },
  { name: 'Buon Ma Thuot', country: 'Vietnam', lat: 12.6667, lon: 108.0500 },
  { name: 'Can Tho', country: 'Vietnam', lat: 10.0452, lon: 105.7469 },
  { name: 'Da Lat', country: 'Vietnam', lat: 11.9404, lon: 108.4583 },
  { name: 'Da Nang', country: 'Vietnam', lat: 16.0544, lon: 108.2022 },
  { name: 'Hai Phong', country: 'Vietnam', lat: 20.8449, lon: 106.6881 },
  { name: 'Hanoi', country: 'Vietnam', lat: 21.0278, lon: 105.8342 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lon: 106.6297 },
  { name: 'Hoi An', country: 'Vietnam', lat: 15.8801, lon: 108.3380 },
  { name: 'Hue', country: 'Vietnam', lat: 16.4637, lon: 107.5909 },
  { name: 'My Tho', country: 'Vietnam', lat: 10.3600, lon: 106.3600 },
  { name: 'Nam Dinh', country: 'Vietnam', lat: 20.4333, lon: 106.1667 },
  { name: 'Nha Trang', country: 'Vietnam', lat: 12.2388, lon: 109.1967 },
  { name: 'Phan Thiet', country: 'Vietnam', lat: 10.9333, lon: 108.1000 },
  { name: 'Quy Nhon', country: 'Vietnam', lat: 13.7733, lon: 109.2167 },
  { name: 'Rach Gia', country: 'Vietnam', lat: 10.0125, lon: 105.0809 },
  { name: 'Thai Nguyen', country: 'Vietnam', lat: 21.5928, lon: 105.8442 },
  { name: 'Thanh Hoa', country: 'Vietnam', lat: 19.8000, lon: 105.7833 },
  { name: 'Vinh', country: 'Vietnam', lat: 18.6796, lon: 105.6813 },
  { name: 'Vung Tau', country: 'Vietnam', lat: 10.3460, lon: 107.0843 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  //                           E U R O P E
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // AUSTRIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Graz', country: 'Austria', lat: 47.0707, lon: 15.4395 },
  { name: 'Innsbruck', country: 'Austria', lat: 47.2692, lon: 11.4041 },
  { name: 'Salzburg', country: 'Austria', lat: 47.8095, lon: 13.0550 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  { name: 'Villach', country: 'Austria', lat: 46.6111, lon: 13.8558 },
  { name: 'Wels', country: 'Austria', lat: 48.1575, lon: 14.0289 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BULGARIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Blagoevgrad', country: 'Bulgaria', lat: 42.0116, lon: 23.0942 },
  { name: 'Dobrich', country: 'Bulgaria', lat: 43.5667, lon: 27.8333 },
  { name: 'Haskovo', country: 'Bulgaria', lat: 41.9344, lon: 25.5556 },
  { name: 'Pazardzhik', country: 'Bulgaria', lat: 42.2000, lon: 24.3333 },
  { name: 'Pernik', country: 'Bulgaria', lat: 42.6000, lon: 23.0333 },
  { name: 'Pleven', country: 'Bulgaria', lat: 43.4170, lon: 24.6067 },
  { name: 'Ruse', country: 'Bulgaria', lat: 43.8486, lon: 25.9533 },
  { name: 'Shumen', country: 'Bulgaria', lat: 43.2833, lon: 26.9333 },
  { name: 'Sliven', country: 'Bulgaria', lat: 42.6833, lon: 26.3333 },
  { name: 'Sofia', country: 'Bulgaria', lat: 42.6977, lon: 23.3219 },
  { name: 'Stara Zagora', country: 'Bulgaria', lat: 42.4258, lon: 25.6256 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CROATIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Dubrovnik', country: 'Croatia', lat: 42.6507, lon: 18.0944 },
  { name: 'Osijek', country: 'Croatia', lat: 45.5511, lon: 18.6939 },
  { name: 'Slavonski Brod', country: 'Croatia', lat: 45.1603, lon: 18.0156 },
  { name: 'Split', country: 'Croatia', lat: 43.5081, lon: 16.4402 },
  { name: 'Varazdin', country: 'Croatia', lat: 46.3057, lon: 16.3366 },
  { name: 'Zagreb', country: 'Croatia', lat: 45.8150, lon: 15.9819 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CZECH REPUBLIC
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ceske Budejovice', country: 'Czech Republic', lat: 48.9746, lon: 14.4743 },
  { name: 'Havirov', country: 'Czech Republic', lat: 49.7792, lon: 18.4381 },
  { name: 'Hradec Kralove', country: 'Czech Republic', lat: 50.2092, lon: 15.8328 },
  { name: 'Jihlava', country: 'Czech Republic', lat: 49.3961, lon: 15.5913 },
  { name: 'Liberec', country: 'Czech Republic', lat: 50.7671, lon: 15.0562 },
  { name: 'Most', country: 'Czech Republic', lat: 50.5031, lon: 13.6367 },
  { name: 'Opava', country: 'Czech Republic', lat: 49.9381, lon: 17.9047 },
  { name: 'Ostrava', country: 'Czech Republic', lat: 49.8209, lon: 18.2625 },
  { name: 'Pardubice', country: 'Czech Republic', lat: 50.0343, lon: 15.7812 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378 },
  { name: 'Usti nad Labem', country: 'Czech Republic', lat: 50.6607, lon: 14.0324 },
  { name: 'Zlin', country: 'Czech Republic', lat: 49.2261, lon: 17.6674 },

  // ═══════════════════════════════════════════════════════════════════════════
  // DENMARK
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683 },
  { name: 'Esbjerg', country: 'Denmark', lat: 55.4764, lon: 8.4594 },
  { name: 'Fredericia', country: 'Denmark', lat: 55.5653, lon: 9.7528 },
  { name: 'Herning', country: 'Denmark', lat: 56.1394, lon: 8.9764 },
  { name: 'Horsens', country: 'Denmark', lat: 55.8614, lon: 9.8503 },
  { name: 'Kolding', country: 'Denmark', lat: 55.4904, lon: 9.4722 },
  { name: 'Vejle', country: 'Denmark', lat: 55.7113, lon: 9.5364 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTONIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Narva', country: 'Estonia', lat: 59.3797, lon: 28.1791 },
  { name: 'Parnu', country: 'Estonia', lat: 58.3859, lon: 24.4971 },
  { name: 'Tallinn', country: 'Estonia', lat: 59.4370, lon: 24.7536 },
  { name: 'Tartu', country: 'Estonia', lat: 58.3780, lon: 26.7290 },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINLAND
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Espoo', country: 'Finland', lat: 60.2055, lon: 24.6559 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384 },
  { name: 'Jyvaskyla', country: 'Finland', lat: 62.2415, lon: 25.7209 },
  { name: 'Kuopio', country: 'Finland', lat: 62.8924, lon: 27.6782 },
  { name: 'Lahti', country: 'Finland', lat: 60.9827, lon: 25.6612 },
  { name: 'Vantaa', country: 'Finland', lat: 60.2934, lon: 25.0378 },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRANCE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Amiens', country: 'France', region: 'Hauts-de-France', lat: 49.8941, lon: 2.2958 },
  { name: 'Angers', country: 'France', region: 'Pays de la Loire', lat: 47.4784, lon: -0.5632 },
  { name: 'Besancon', country: 'France', region: 'Bourgogne-Franche-Comte', lat: 47.2378, lon: 6.0241 },
  { name: 'Bordeaux', country: 'France', region: 'Nouvelle-Aquitaine', lat: 44.8378, lon: -0.5792 },
  { name: 'Brest', country: 'France', region: 'Bretagne', lat: 48.3904, lon: -4.4861 },
  { name: 'Dunkirk', country: 'France', region: 'Hauts-de-France', lat: 51.0343, lon: 2.3768 },
  { name: 'Le Havre', country: 'France', region: 'Normandie', lat: 49.4944, lon: 0.1079 },
  { name: 'Le Mans', country: 'France', region: 'Pays de la Loire', lat: 48.0061, lon: 0.1996 },
  { name: 'Lille', country: 'France', region: 'Hauts-de-France', lat: 50.6292, lon: 3.0573 },
  { name: 'Lyon', country: 'France', region: 'Auvergne-Rhone-Alpes', lat: 45.7640, lon: 4.8357 },
  { name: 'Metz', country: 'France', region: 'Grand Est', lat: 49.1193, lon: 6.1757 },
  { name: 'Mulhouse', country: 'France', region: 'Grand Est', lat: 47.7508, lon: 7.3359 },
  { name: 'Nancy', country: 'France', region: 'Grand Est', lat: 48.6921, lon: 6.1844 },
  { name: 'Nice', country: 'France', region: 'Provence-Alpes-Cote dAzur', lat: 43.7102, lon: 7.2620 },
  { name: 'Nimes', country: 'France', region: 'Occitanie', lat: 43.8367, lon: 4.3601 },
  { name: 'Orleans', country: 'France', region: 'Centre-Val de Loire', lat: 47.9029, lon: 1.9093 },
  { name: 'Paris', country: 'France', region: 'Ile-de-France', lat: 48.8566, lon: 2.3522 },
  { name: 'Pau', country: 'France', region: 'Nouvelle-Aquitaine', lat: 43.2951, lon: -0.3708 },
  { name: 'Saint-Etienne', country: 'France', region: 'Auvergne-Rhone-Alpes', lat: 45.4397, lon: 4.3872 },
  { name: 'Toulon', country: 'France', region: 'Provence-Alpes-Cote dAzur', lat: 43.1242, lon: 5.9280 },
  { name: 'Valence', country: 'France', region: 'Auvergne-Rhone-Alpes', lat: 44.9334, lon: 4.8924 },
  { name: 'Versailles', country: 'France', region: 'Ile-de-France', lat: 48.8014, lon: 2.1301 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GERMANY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Berlin', country: 'Germany', region: 'Berlin', lat: 52.5200, lon: 13.4050 },
  { name: 'Bielefeld', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 52.0302, lon: 8.5325 },
  { name: 'Bochum', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.4818, lon: 7.2162 },
  { name: 'Braunschweig', country: 'Germany', region: 'Niedersachsen', lat: 52.2689, lon: 10.5268 },
  { name: 'Chemnitz', country: 'Germany', region: 'Sachsen', lat: 50.8278, lon: 12.9214 },
  { name: 'Darmstadt', country: 'Germany', region: 'Hessen', lat: 49.8728, lon: 8.6512 },
  { name: 'Dortmund', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.5136, lon: 7.4653 },
  { name: 'Duisburg', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.4344, lon: 6.7623 },
  { name: 'Erfurt', country: 'Germany', region: 'Thuringen', lat: 50.9787, lon: 11.0328 },
  { name: 'Essen', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.4556, lon: 7.0116 },
  { name: 'Gelsenkirchen', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.5177, lon: 7.0857 },
  { name: 'Gottingen', country: 'Germany', region: 'Niedersachsen', lat: 51.5413, lon: 9.9158 },
  { name: 'Halle', country: 'Germany', region: 'Sachsen-Anhalt', lat: 51.4969, lon: 11.9688 },
  { name: 'Hamburg', country: 'Germany', region: 'Hamburg', lat: 53.5511, lon: 9.9937 },
  { name: 'Hanover', country: 'Germany', region: 'Niedersachsen', lat: 52.3759, lon: 9.7320 },
  { name: 'Ingolstadt', country: 'Germany', region: 'Bayern', lat: 48.7665, lon: 11.4258 },
  { name: 'Jena', country: 'Germany', region: 'Thuringen', lat: 50.9271, lon: 11.5892 },
  { name: 'Karlsruhe', country: 'Germany', region: 'Baden-Wurttemberg', lat: 49.0069, lon: 8.4037 },
  { name: 'Kassel', country: 'Germany', region: 'Hessen', lat: 51.3127, lon: 9.4797 },
  { name: 'Krefeld', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.3388, lon: 6.5853 },
  { name: 'Magdeburg', country: 'Germany', region: 'Sachsen-Anhalt', lat: 52.1205, lon: 11.6276 },
  { name: 'Mannheim', country: 'Germany', region: 'Baden-Wurttemberg', lat: 49.4875, lon: 8.4660 },
  { name: 'Monchengladbach', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.1805, lon: 6.4428 },
  { name: 'Munich', country: 'Germany', region: 'Bayern', lat: 48.1351, lon: 11.5820 },
  { name: 'Munster', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.9607, lon: 7.6261 },
  { name: 'Oberhausen', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.4700, lon: 6.8517 },
  { name: 'Oldenburg', country: 'Germany', region: 'Niedersachsen', lat: 53.1435, lon: 8.2146 },
  { name: 'Osnabruck', country: 'Germany', region: 'Niedersachsen', lat: 52.2799, lon: 8.0472 },
  { name: 'Paderborn', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.7189, lon: 8.7575 },
  { name: 'Schwerin', country: 'Germany', region: 'Mecklenburg-Vorpommern', lat: 53.6355, lon: 11.4012 },
  { name: 'Ulm', country: 'Germany', region: 'Baden-Wurttemberg', lat: 48.4011, lon: 9.9876 },
  { name: 'Wolfsburg', country: 'Germany', region: 'Niedersachsen', lat: 52.4227, lon: 10.7865 },
  { name: 'Wuppertal', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.2562, lon: 7.1508 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GREECE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Alexandroupoli', country: 'Greece', lat: 40.8477, lon: 25.8736 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275 },
  { name: 'Heraklion', country: 'Greece', lat: 35.3387, lon: 25.1442 },
  { name: 'Kalamata', country: 'Greece', lat: 37.0389, lon: 22.1142 },
  { name: 'Katerini', country: 'Greece', lat: 40.2722, lon: 22.5022 },
  { name: 'Komotini', country: 'Greece', lat: 41.1222, lon: 25.4069 },
  { name: 'Kozani', country: 'Greece', lat: 40.3006, lon: 21.7892 },
  { name: 'Lamia', country: 'Greece', lat: 38.8999, lon: 22.4341 },
  { name: 'Larissa', country: 'Greece', lat: 39.6371, lon: 22.4209 },
  { name: 'Piraeus', country: 'Greece', lat: 37.9414, lon: 23.6467 },
  { name: 'Serres', country: 'Greece', lat: 41.0862, lon: 23.5497 },
  { name: 'Trikala', country: 'Greece', lat: 39.5556, lon: 21.7679 },
  { name: 'Veria', country: 'Greece', lat: 40.5218, lon: 22.2045 },
  { name: 'Xanthi', country: 'Greece', lat: 41.1344, lon: 24.8881 },

  // ═══════════════════════════════════════════════════════════════════════════
  // HUNGARY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402 },
  { name: 'Kecskemet', country: 'Hungary', lat: 46.9067, lon: 19.6897 },
  { name: 'Miskolc', country: 'Hungary', lat: 48.1035, lon: 20.7784 },
  { name: 'Nyiregyhaza', country: 'Hungary', lat: 47.9555, lon: 21.7177 },
  { name: 'Szekesfehervar', country: 'Hungary', lat: 47.1860, lon: 18.4221 },
  { name: 'Szolnok', country: 'Hungary', lat: 47.1621, lon: 20.1825 },
  { name: 'Szombathely', country: 'Hungary', lat: 47.2306, lon: 16.6218 },
  { name: 'Veszprem', country: 'Hungary', lat: 47.0933, lon: 17.9113 },

  // ═══════════════════════════════════════════════════════════════════════════
  // IRELAND
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Athlone', country: 'Ireland', lat: 53.4239, lon: -7.9407 },
  { name: 'Carlow', country: 'Ireland', lat: 52.8408, lon: -6.9261 },
  { name: 'Drogheda', country: 'Ireland', lat: 53.7189, lon: -6.3472 },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603 },
  { name: 'Dundalk', country: 'Ireland', lat: 54.0037, lon: -6.4003 },
  { name: 'Ennis', country: 'Ireland', lat: 52.8463, lon: -8.9808 },
  { name: 'Letterkenny', country: 'Ireland', lat: 54.9558, lon: -7.7342 },
  { name: 'Tralee', country: 'Ireland', lat: 52.2693, lon: -9.7023 },
  { name: 'Wexford', country: 'Ireland', lat: 52.3369, lon: -6.4633 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ITALY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ancona', country: 'Italy', lat: 43.6158, lon: 13.5189 },
  { name: 'Brescia', country: 'Italy', lat: 45.5416, lon: 10.2118 },
  { name: 'Florence', country: 'Italy', lat: 43.7696, lon: 11.2558 },
  { name: 'Foggia', country: 'Italy', lat: 41.4622, lon: 15.5446 },
  { name: 'Livorno', country: 'Italy', lat: 43.5485, lon: 10.3106 },
  { name: 'Messina', country: 'Italy', lat: 38.1938, lon: 15.5540 },
  { name: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.1900 },
  { name: 'Modena', country: 'Italy', lat: 44.6471, lon: 10.9252 },
  { name: 'Naples', country: 'Italy', lat: 40.8518, lon: 14.2681 },
  { name: 'Padua', country: 'Italy', lat: 45.4064, lon: 11.8768 },
  { name: 'Palermo', country: 'Italy', lat: 38.1157, lon: 13.3615 },
  { name: 'Parma', country: 'Italy', lat: 44.8015, lon: 10.3279 },
  { name: 'Perugia', country: 'Italy', lat: 43.1107, lon: 12.3908 },
  { name: 'Pescara', country: 'Italy', lat: 42.4618, lon: 14.2139 },
  { name: 'Pisa', country: 'Italy', lat: 43.7228, lon: 10.4017 },
  { name: 'Reggio Calabria', country: 'Italy', lat: 38.1147, lon: 15.6501 },
  { name: 'Reggio Emilia', country: 'Italy', lat: 44.6989, lon: 10.6297 },
  { name: 'Rimini', country: 'Italy', lat: 44.0678, lon: 12.5695 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Salerno', country: 'Italy', lat: 40.6824, lon: 14.7681 },
  { name: 'Sassari', country: 'Italy', lat: 40.7259, lon: 8.5592 },
  { name: 'Siena', country: 'Italy', lat: 43.3188, lon: 11.3308 },
  { name: 'Syracuse', country: 'Italy', lat: 37.0755, lon: 15.2866 },
  { name: 'Taranto', country: 'Italy', lat: 40.4647, lon: 17.2470 },
  { name: 'Trieste', country: 'Italy', lat: 45.6495, lon: 13.7768 },
  { name: 'Turin', country: 'Italy', lat: 45.0703, lon: 7.6869 },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lon: 12.3155 },
  { name: 'Verona', country: 'Italy', lat: 45.4384, lon: 10.9917 },
  { name: 'Vicenza', country: 'Italy', lat: 45.5455, lon: 11.5354 },

  // ═══════════════════════════════════════════════════════════════════════════
  // LATVIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Daugavpils', country: 'Latvia', lat: 55.8747, lon: 26.5361 },
  { name: 'Jelgava', country: 'Latvia', lat: 56.6511, lon: 23.7214 },
  { name: 'Jurmala', country: 'Latvia', lat: 56.9680, lon: 23.7703 },
  { name: 'Liepaja', country: 'Latvia', lat: 56.5047, lon: 21.0108 },
  { name: 'Riga', country: 'Latvia', lat: 56.9496, lon: 24.1052 },

  // ═══════════════════════════════════════════════════════════════════════════
  // LITHUANIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Kaunas', country: 'Lithuania', lat: 54.8985, lon: 23.9036 },
  { name: 'Klaipeda', country: 'Lithuania', lat: 55.7033, lon: 21.1443 },
  { name: 'Panevezys', country: 'Lithuania', lat: 55.7333, lon: 24.3500 },
  { name: 'Siauliai', country: 'Lithuania', lat: 55.9333, lon: 23.3167 },
  { name: 'Vilnius', country: 'Lithuania', lat: 54.6872, lon: 25.2797 },

  // ═══════════════════════════════════════════════════════════════════════════
  // LUXEMBOURG
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Esch-sur-Alzette', country: 'Luxembourg', lat: 49.4958, lon: 5.9806 },
  { name: 'Luxembourg City', country: 'Luxembourg', lat: 49.6116, lon: 6.1319 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MALTA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Birkirkara', country: 'Malta', lat: 35.8972, lon: 14.4614 },
  { name: 'Sliema', country: 'Malta', lat: 35.9122, lon: 14.5031 },
  { name: 'Valletta', country: 'Malta', lat: 35.8989, lon: 14.5146 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOLDOVA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Balti', country: 'Moldova', lat: 47.7617, lon: 27.9289 },
  { name: 'Chisinau', country: 'Moldova', lat: 47.0105, lon: 28.8638 },
  { name: 'Tiraspol', country: 'Moldova', lat: 46.8403, lon: 29.6433 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MONTENEGRO
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Budva', country: 'Montenegro', lat: 42.2914, lon: 18.8400 },
  { name: 'Kotor', country: 'Montenegro', lat: 42.4247, lon: 18.7712 },
  { name: 'Niksic', country: 'Montenegro', lat: 42.7731, lon: 18.9444 },
  { name: 'Podgorica', country: 'Montenegro', lat: 42.4304, lon: 19.2594 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NETHERLANDS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Almere', country: 'Netherlands', lat: 52.3508, lon: 5.2647 },
  { name: 'Amersfoort', country: 'Netherlands', lat: 52.1561, lon: 5.3878 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  { name: 'Arnhem', country: 'Netherlands', lat: 51.9851, lon: 5.8987 },
  { name: 'Breda', country: 'Netherlands', lat: 51.5719, lon: 4.7683 },
  { name: 'Delft', country: 'Netherlands', lat: 52.0116, lon: 4.3571 },
  { name: 'Den Haag', country: 'Netherlands', lat: 52.0705, lon: 4.3007 },
  { name: 'Eindhoven', country: 'Netherlands', lat: 51.4416, lon: 5.4697 },
  { name: 'Enschede', country: 'Netherlands', lat: 52.2215, lon: 6.8937 },
  { name: 'Groningen', country: 'Netherlands', lat: 53.2194, lon: 6.5665 },
  { name: 'Haarlem', country: 'Netherlands', lat: 52.3874, lon: 4.6462 },
  { name: 'Leiden', country: 'Netherlands', lat: 52.1601, lon: 4.4970 },
  { name: 'Maastricht', country: 'Netherlands', lat: 50.8514, lon: 5.6910 },
  { name: 'Nijmegen', country: 'Netherlands', lat: 51.8426, lon: 5.8527 },
  { name: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lon: 4.4777 },
  { name: 'Tilburg', country: 'Netherlands', lat: 51.5555, lon: 5.0913 },
  { name: 'Utrecht', country: 'Netherlands', lat: 52.0907, lon: 5.1214 },
  { name: 'Zwolle', country: 'Netherlands', lat: 52.5168, lon: 6.0830 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NORTH MACEDONIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bitola', country: 'North Macedonia', lat: 41.0297, lon: 21.3292 },
  { name: 'Kumanovo', country: 'North Macedonia', lat: 42.1322, lon: 21.7144 },
  { name: 'Ohrid', country: 'North Macedonia', lat: 41.1231, lon: 20.8016 },
  { name: 'Skopje', country: 'North Macedonia', lat: 41.9973, lon: 21.4280 },
  { name: 'Tetovo', country: 'North Macedonia', lat: 42.0097, lon: 20.9714 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NORWAY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bergen', country: 'Norway', lat: 60.3913, lon: 5.3221 },
  { name: 'Bodo', country: 'Norway', lat: 67.2804, lon: 14.4049 },
  { name: 'Drammen', country: 'Norway', lat: 59.7441, lon: 10.2045 },
  { name: 'Fredrikstad', country: 'Norway', lat: 59.2181, lon: 10.9298 },
  { name: 'Kristiansand', country: 'Norway', lat: 58.1599, lon: 8.0182 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 },
  { name: 'Stavanger', country: 'Norway', lat: 58.9700, lon: 5.7331 },
  { name: 'Tromso', country: 'Norway', lat: 69.6492, lon: 18.9553 },
  { name: 'Trondheim', country: 'Norway', lat: 63.4305, lon: 10.3951 },

  // ═══════════════════════════════════════════════════════════════════════════
  // POLAND
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bialystok', country: 'Poland', lat: 53.1325, lon: 23.1688 },
  { name: 'Bydgoszcz', country: 'Poland', lat: 53.1235, lon: 18.0084 },
  { name: 'Czestochowa', country: 'Poland', lat: 50.8118, lon: 19.1203 },
  { name: 'Gdansk', country: 'Poland', lat: 54.3520, lon: 18.6466 },
  { name: 'Gdynia', country: 'Poland', lat: 54.5189, lon: 18.5305 },
  { name: 'Gliwice', country: 'Poland', lat: 50.2945, lon: 18.6714 },
  { name: 'Katowice', country: 'Poland', lat: 50.2649, lon: 19.0238 },
  { name: 'Kielce', country: 'Poland', lat: 50.8661, lon: 20.6286 },
  { name: 'Krakow', country: 'Poland', lat: 50.0647, lon: 19.9450 },
  { name: 'Lodz', country: 'Poland', lat: 51.7592, lon: 19.4560 },
  { name: 'Lublin', country: 'Poland', lat: 51.2465, lon: 22.5684 },
  { name: 'Olsztyn', country: 'Poland', lat: 53.7784, lon: 20.4801 },
  { name: 'Opole', country: 'Poland', lat: 50.6751, lon: 17.9213 },
  { name: 'Poznan', country: 'Poland', lat: 52.4064, lon: 16.9252 },
  { name: 'Radom', country: 'Poland', lat: 51.4027, lon: 21.1471 },
  { name: 'Rzeszow', country: 'Poland', lat: 50.0412, lon: 21.9991 },
  { name: 'Sosnowiec', country: 'Poland', lat: 50.2863, lon: 19.1042 },
  { name: 'Szczecin', country: 'Poland', lat: 53.4285, lon: 14.5528 },
  { name: 'Torun', country: 'Poland', lat: 53.0138, lon: 18.5984 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122 },
  { name: 'Wroclaw', country: 'Poland', lat: 51.1079, lon: 17.0385 },
  { name: 'Zabrze', country: 'Poland', lat: 50.3249, lon: 18.7857 },
  { name: 'Zielona Gora', country: 'Poland', lat: 51.9356, lon: 15.5062 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PORTUGAL
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Aveiro', country: 'Portugal', lat: 40.6405, lon: -8.6538 },
  { name: 'Braga', country: 'Portugal', lat: 41.5518, lon: -8.4229 },
  { name: 'Coimbra', country: 'Portugal', lat: 40.2033, lon: -8.4103 },
  { name: 'Evora', country: 'Portugal', lat: 38.5667, lon: -7.9000 },
  { name: 'Faro', country: 'Portugal', lat: 37.0194, lon: -7.9322 },
  { name: 'Funchal', country: 'Portugal', lat: 32.6669, lon: -16.9241 },
  { name: 'Guimaraes', country: 'Portugal', lat: 41.4425, lon: -8.2918 },
  { name: 'Leiria', country: 'Portugal', lat: 39.7437, lon: -8.8071 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393 },
  { name: 'Ponta Delgada', country: 'Portugal', lat: 37.7483, lon: -25.6666 },
  { name: 'Porto', country: 'Portugal', lat: 41.1579, lon: -8.6291 },
  { name: 'Setubal', country: 'Portugal', lat: 38.5244, lon: -8.8882 },
  { name: 'Viseu', country: 'Portugal', lat: 40.6566, lon: -7.9125 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ROMANIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Arad', country: 'Romania', lat: 46.1866, lon: 21.3123 },
  { name: 'Bacau', country: 'Romania', lat: 46.5672, lon: 26.9146 },
  { name: 'Braila', country: 'Romania', lat: 45.2692, lon: 27.9575 },
  { name: 'Brasov', country: 'Romania', lat: 45.6427, lon: 25.5887 },
  { name: 'Bucharest', country: 'Romania', lat: 44.4268, lon: 26.1025 },
  { name: 'Buzau', country: 'Romania', lat: 45.1500, lon: 26.8167 },
  { name: 'Cluj-Napoca', country: 'Romania', lat: 46.7712, lon: 23.6236 },
  { name: 'Constanta', country: 'Romania', lat: 44.1598, lon: 28.6348 },
  { name: 'Craiova', country: 'Romania', lat: 44.3302, lon: 23.7949 },
  { name: 'Galati', country: 'Romania', lat: 45.4353, lon: 28.0080 },
  { name: 'Iasi', country: 'Romania', lat: 47.1585, lon: 27.6014 },
  { name: 'Oradea', country: 'Romania', lat: 47.0458, lon: 21.9183 },
  { name: 'Pitesti', country: 'Romania', lat: 44.8565, lon: 24.8692 },
  { name: 'Ploiesti', country: 'Romania', lat: 44.9462, lon: 26.0254 },
  { name: 'Sibiu', country: 'Romania', lat: 45.7983, lon: 24.1256 },
  { name: 'Suceava', country: 'Romania', lat: 47.6514, lon: 26.2553 },
  { name: 'Targu Mures', country: 'Romania', lat: 46.5456, lon: 24.5625 },
  { name: 'Timisoara', country: 'Romania', lat: 45.7489, lon: 21.2087 },

  // ═══════════════════════════════════════════════════════════════════════════
  // RUSSIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Astrakhan', country: 'Russia', lat: 46.3497, lon: 48.0408 },
  { name: 'Barnaul', country: 'Russia', lat: 53.3548, lon: 83.7698 },
  { name: 'Chelyabinsk', country: 'Russia', lat: 55.1644, lon: 61.4368 },
  { name: 'Irkutsk', country: 'Russia', lat: 52.2978, lon: 104.2964 },
  { name: 'Izhevsk', country: 'Russia', lat: 56.8519, lon: 53.2114 },
  { name: 'Kaliningrad', country: 'Russia', lat: 54.7104, lon: 20.4522 },
  { name: 'Kazan', country: 'Russia', lat: 55.8304, lon: 49.0661 },
  { name: 'Kemerovo', country: 'Russia', lat: 55.3333, lon: 86.0833 },
  { name: 'Khabarovsk', country: 'Russia', lat: 48.4827, lon: 135.0846 },
  { name: 'Kirov', country: 'Russia', lat: 58.5966, lon: 49.6601 },
  { name: 'Krasnoyarsk', country: 'Russia', lat: 56.0097, lon: 92.8524 },
  { name: 'Krasnodar', country: 'Russia', lat: 45.0355, lon: 38.9753 },
  { name: 'Lipetsk', country: 'Russia', lat: 52.6031, lon: 39.5708 },
  { name: 'Makhachkala', country: 'Russia', lat: 42.9849, lon: 47.5047 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173 },
  { name: 'Murmansk', country: 'Russia', lat: 68.9585, lon: 33.0827 },
  { name: 'Nizhny Novgorod', country: 'Russia', lat: 56.2965, lon: 43.9361 },
  { name: 'Novosibirsk', country: 'Russia', lat: 55.0084, lon: 82.9357 },
  { name: 'Omsk', country: 'Russia', lat: 54.9885, lon: 73.3242 },
  { name: 'Orenburg', country: 'Russia', lat: 51.7727, lon: 55.0988 },
  { name: 'Penza', country: 'Russia', lat: 53.1959, lon: 45.0183 },
  { name: 'Perm', country: 'Russia', lat: 58.0105, lon: 56.2502 },
  { name: 'Rostov-on-Don', country: 'Russia', lat: 47.2357, lon: 39.7015 },
  { name: 'Ryazan', country: 'Russia', lat: 54.6269, lon: 39.6916 },
  { name: 'Saint Petersburg', country: 'Russia', lat: 59.9343, lon: 30.3351 },
  { name: 'Samara', country: 'Russia', lat: 53.1959, lon: 50.1003 },
  { name: 'Saratov', country: 'Russia', lat: 51.5336, lon: 46.0344 },
  { name: 'Sochi', country: 'Russia', lat: 43.6028, lon: 39.7342 },
  { name: 'Tomsk', country: 'Russia', lat: 56.4977, lon: 84.9744 },
  { name: 'Tula', country: 'Russia', lat: 54.1961, lon: 37.6182 },
  { name: 'Tyumen', country: 'Russia', lat: 57.1522, lon: 65.5272 },
  { name: 'Ufa', country: 'Russia', lat: 54.7388, lon: 55.9721 },
  { name: 'Ulyanovsk', country: 'Russia', lat: 54.3142, lon: 48.4031 },
  { name: 'Vladivostok', country: 'Russia', lat: 43.1332, lon: 131.9113 },
  { name: 'Volgograd', country: 'Russia', lat: 48.7080, lon: 44.5133 },
  { name: 'Voronezh', country: 'Russia', lat: 51.6720, lon: 39.1843 },
  { name: 'Yakutsk', country: 'Russia', lat: 62.0355, lon: 129.6755 },
  { name: 'Yaroslavl', country: 'Russia', lat: 57.6261, lon: 39.8845 },
  { name: 'Yekaterinburg', country: 'Russia', lat: 56.8389, lon: 60.6057 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SERBIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Belgrade', country: 'Serbia', lat: 44.7866, lon: 20.4489 },
  { name: 'Kragujevac', country: 'Serbia', lat: 44.0128, lon: 20.9114 },
  { name: 'Nis', country: 'Serbia', lat: 43.3209, lon: 21.8958 },
  { name: 'Novi Sad', country: 'Serbia', lat: 45.2671, lon: 19.8335 },
  { name: 'Subotica', country: 'Serbia', lat: 46.1003, lon: 19.6644 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SLOVAKIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Banska Bystrica', country: 'Slovakia', lat: 48.7395, lon: 19.1533 },
  { name: 'Bratislava', country: 'Slovakia', lat: 48.1486, lon: 17.1077 },
  { name: 'Kosice', country: 'Slovakia', lat: 48.7164, lon: 21.2611 },
  { name: 'Nitra', country: 'Slovakia', lat: 48.3069, lon: 18.0864 },
  { name: 'Presov', country: 'Slovakia', lat: 48.9978, lon: 21.2394 },
  { name: 'Zilina', country: 'Slovakia', lat: 49.2231, lon: 18.7394 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SLOVENIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Celje', country: 'Slovenia', lat: 46.2361, lon: 15.2677 },
  { name: 'Koper', country: 'Slovenia', lat: 45.5481, lon: 13.7294 },
  { name: 'Ljubljana', country: 'Slovenia', lat: 46.0569, lon: 14.5058 },
  { name: 'Maribor', country: 'Slovenia', lat: 46.5547, lon: 15.6459 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPAIN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Alicante', country: 'Spain', lat: 38.3452, lon: -0.4810 },
  { name: 'Badajoz', country: 'Spain', lat: 38.8794, lon: -6.9707 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3874, lon: 2.1686 },
  { name: 'Bilbao', country: 'Spain', lat: 43.2630, lon: -2.9350 },
  { name: 'Cadiz', country: 'Spain', lat: 36.5271, lon: -6.2886 },
  { name: 'Cartagena', country: 'Spain', lat: 37.6000, lon: -0.9819 },
  { name: 'Cordoba', country: 'Spain', lat: 37.8882, lon: -4.7794 },
  { name: 'Elche', country: 'Spain', lat: 38.2669, lon: -0.6983 },
  { name: 'Gijon', country: 'Spain', lat: 43.5322, lon: -5.6611 },
  { name: 'Granada', country: 'Spain', lat: 37.1773, lon: -3.5986 },
  { name: 'Jerez de la Frontera', country: 'Spain', lat: 36.6817, lon: -6.1378 },
  { name: 'La Coruna', country: 'Spain', lat: 43.3623, lon: -8.4115 },
  { name: 'Las Palmas', country: 'Spain', lat: 28.1235, lon: -15.4363 },
  { name: 'Leon', country: 'Spain', lat: 42.5987, lon: -5.5671 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
  { name: 'Malaga', country: 'Spain', lat: 36.7213, lon: -4.4214 },
  { name: 'Murcia', country: 'Spain', lat: 37.9922, lon: -1.1307 },
  { name: 'Oviedo', country: 'Spain', lat: 43.3614, lon: -5.8493 },
  { name: 'Palma de Mallorca', country: 'Spain', lat: 39.5696, lon: 2.6502 },
  { name: 'Pamplona', country: 'Spain', lat: 42.8125, lon: -1.6458 },
  { name: 'Salamanca', country: 'Spain', lat: 40.9701, lon: -5.6635 },
  { name: 'San Sebastian', country: 'Spain', lat: 43.3183, lon: -1.9812 },
  { name: 'Santa Cruz de Tenerife', country: 'Spain', lat: 28.4636, lon: -16.2518 },
  { name: 'Santander', country: 'Spain', lat: 43.4623, lon: -3.8100 },
  { name: 'Seville', country: 'Spain', lat: 37.3891, lon: -5.9845 },
  { name: 'Tarragona', country: 'Spain', lat: 41.1189, lon: 1.2445 },
  { name: 'Valencia', country: 'Spain', lat: 39.4699, lon: -0.3763 },
  { name: 'Valladolid', country: 'Spain', lat: 41.6523, lon: -4.7245 },
  { name: 'Vigo', country: 'Spain', lat: 42.2406, lon: -8.7207 },
  { name: 'Vitoria-Gasteiz', country: 'Spain', lat: 42.8469, lon: -2.6729 },
  { name: 'Zaragoza', country: 'Spain', lat: 41.6488, lon: -0.8891 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SWEDEN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Boras', country: 'Sweden', lat: 57.7210, lon: 12.9401 },
  { name: 'Gavle', country: 'Sweden', lat: 60.6749, lon: 17.1413 },
  { name: 'Gothenburg', country: 'Sweden', lat: 57.7089, lon: 11.9746 },
  { name: 'Halmstad', country: 'Sweden', lat: 56.6745, lon: 12.8578 },
  { name: 'Helsingborg', country: 'Sweden', lat: 56.0465, lon: 12.6945 },
  { name: 'Jonkoping', country: 'Sweden', lat: 57.7826, lon: 14.1618 },
  { name: 'Karlstad', country: 'Sweden', lat: 59.3793, lon: 13.5036 },
  { name: 'Kiruna', country: 'Sweden', lat: 67.8558, lon: 20.2253 },
  { name: 'Linkoping', country: 'Sweden', lat: 58.4108, lon: 15.6214 },
  { name: 'Lulea', country: 'Sweden', lat: 65.5848, lon: 22.1547 },
  { name: 'Lund', country: 'Sweden', lat: 55.7047, lon: 13.1910 },
  { name: 'Malmo', country: 'Sweden', lat: 55.6050, lon: 13.0038 },
  { name: 'Norrkoping', country: 'Sweden', lat: 58.5942, lon: 16.1826 },
  { name: 'Orebro', country: 'Sweden', lat: 59.2753, lon: 15.2134 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686 },
  { name: 'Sundsvall', country: 'Sweden', lat: 62.3908, lon: 17.3069 },
  { name: 'Umea', country: 'Sweden', lat: 63.8258, lon: 20.2630 },
  { name: 'Uppsala', country: 'Sweden', lat: 59.8586, lon: 17.6389 },
  { name: 'Vasteras', country: 'Sweden', lat: 59.6162, lon: 16.5528 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SWITZERLAND
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Basel', country: 'Switzerland', lat: 47.5596, lon: 7.5886 },
  { name: 'Bern', country: 'Switzerland', lat: 46.9480, lon: 7.4474 },
  { name: 'Geneva', country: 'Switzerland', lat: 46.2044, lon: 6.1432 },
  { name: 'Lausanne', country: 'Switzerland', lat: 46.5197, lon: 6.6323 },
  { name: 'Lucerne', country: 'Switzerland', lat: 47.0502, lon: 8.3093 },
  { name: 'Lugano', country: 'Switzerland', lat: 46.0037, lon: 8.9511 },
  { name: 'St. Gallen', country: 'Switzerland', lat: 47.4245, lon: 9.3767 },
  { name: 'Winterthur', country: 'Switzerland', lat: 47.5001, lon: 8.7240 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417 },

  // ═══════════════════════════════════════════════════════════════════════════
  // UKRAINE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Cherkasy', country: 'Ukraine', lat: 49.4285, lon: 32.0621 },
  { name: 'Chernihiv', country: 'Ukraine', lat: 51.4982, lon: 31.2893 },
  { name: 'Chernivtsi', country: 'Ukraine', lat: 48.2920, lon: 25.9358 },
  { name: 'Dnipro', country: 'Ukraine', lat: 48.4647, lon: 35.0462 },
  { name: 'Ivano-Frankivsk', country: 'Ukraine', lat: 48.9226, lon: 24.7111 },
  { name: 'Kharkiv', country: 'Ukraine', lat: 49.9935, lon: 36.2304 },
  { name: 'Kherson', country: 'Ukraine', lat: 46.6354, lon: 32.6169 },
  { name: 'Khmelnytskyi', country: 'Ukraine', lat: 49.4230, lon: 26.9871 },
  { name: 'Kryvyi Rih', country: 'Ukraine', lat: 47.9106, lon: 33.3916 },
  { name: 'Kyiv', country: 'Ukraine', lat: 50.4501, lon: 30.5234 },
  { name: 'Lutsk', country: 'Ukraine', lat: 50.7593, lon: 25.3424 },
  { name: 'Lviv', country: 'Ukraine', lat: 49.8397, lon: 24.0297 },
  { name: 'Mykolaiv', country: 'Ukraine', lat: 46.9750, lon: 31.9946 },
  { name: 'Odessa', country: 'Ukraine', lat: 46.4825, lon: 30.7233 },
  { name: 'Poltava', country: 'Ukraine', lat: 49.5883, lon: 34.5514 },
  { name: 'Rivne', country: 'Ukraine', lat: 50.6199, lon: 26.2516 },
  { name: 'Sumy', country: 'Ukraine', lat: 50.9077, lon: 34.7981 },
  { name: 'Ternopil', country: 'Ukraine', lat: 49.5535, lon: 25.5948 },
  { name: 'Uzhhorod', country: 'Ukraine', lat: 48.6208, lon: 22.2879 },
  { name: 'Vinnytsia', country: 'Ukraine', lat: 49.2331, lon: 28.4682 },
  { name: 'Zaporizhzhia', country: 'Ukraine', lat: 47.8388, lon: 35.1396 },
  { name: 'Zhytomyr', country: 'Ukraine', lat: 50.2547, lon: 28.6587 },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNITED KINGDOM
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Aberdeen', country: 'United Kingdom', region: 'Scotland', lat: 57.1497, lon: -2.0943 },
  { name: 'Bath', country: 'United Kingdom', region: 'England', lat: 51.3811, lon: -2.3590 },
  { name: 'Belfast', country: 'United Kingdom', region: 'Northern Ireland', lat: 54.5973, lon: -5.9301 },
  { name: 'Birmingham', country: 'United Kingdom', region: 'England', lat: 52.4862, lon: -1.8904 },
  { name: 'Blackpool', country: 'United Kingdom', region: 'England', lat: 53.8175, lon: -3.0357 },
  { name: 'Bolton', country: 'United Kingdom', region: 'England', lat: 53.5782, lon: -2.4299 },
  { name: 'Bournemouth', country: 'United Kingdom', region: 'England', lat: 50.7192, lon: -1.8808 },
  { name: 'Bradford', country: 'United Kingdom', region: 'England', lat: 53.7960, lon: -1.7594 },
  { name: 'Brighton', country: 'United Kingdom', region: 'England', lat: 50.8225, lon: -0.1372 },
  { name: 'Bristol', country: 'United Kingdom', region: 'England', lat: 51.4545, lon: -2.5879 },
  { name: 'Cambridge', country: 'United Kingdom', region: 'England', lat: 52.2053, lon: 0.1218 },
  { name: 'Canterbury', country: 'United Kingdom', region: 'England', lat: 51.2802, lon: 1.0789 },
  { name: 'Cardiff', country: 'United Kingdom', region: 'Wales', lat: 51.4816, lon: -3.1791 },
  { name: 'Cheltenham', country: 'United Kingdom', region: 'England', lat: 51.8994, lon: -2.0783 },
  { name: 'Chester', country: 'United Kingdom', region: 'England', lat: 53.1930, lon: -2.8931 },
  { name: 'Coventry', country: 'United Kingdom', region: 'England', lat: 52.4068, lon: -1.5197 },
  { name: 'Derby', country: 'United Kingdom', region: 'England', lat: 52.9225, lon: -1.4746 },
  { name: 'Derry', country: 'United Kingdom', region: 'Northern Ireland', lat: 54.9966, lon: -7.3086 },
  { name: 'Dundee', country: 'United Kingdom', region: 'Scotland', lat: 56.4620, lon: -2.9707 },
  { name: 'Durham', country: 'United Kingdom', region: 'England', lat: 54.7761, lon: -1.5733 },
  { name: 'Edinburgh', country: 'United Kingdom', region: 'Scotland', lat: 55.9533, lon: -3.1883 },
  { name: 'Exeter', country: 'United Kingdom', region: 'England', lat: 50.7184, lon: -3.5339 },
  { name: 'Glasgow', country: 'United Kingdom', region: 'Scotland', lat: 55.8642, lon: -4.2518 },
  { name: 'Gloucester', country: 'United Kingdom', region: 'England', lat: 51.8642, lon: -2.2382 },
  { name: 'Huddersfield', country: 'United Kingdom', region: 'England', lat: 53.6458, lon: -1.7850 },
  { name: 'Hull', country: 'United Kingdom', region: 'England', lat: 53.7457, lon: -0.3367 },
  { name: 'Inverness', country: 'United Kingdom', region: 'Scotland', lat: 57.4778, lon: -4.2247 },
  { name: 'Ipswich', country: 'United Kingdom', region: 'England', lat: 52.0567, lon: 1.1482 },
  { name: 'Leeds', country: 'United Kingdom', region: 'England', lat: 53.8008, lon: -1.5491 },
  { name: 'Leicester', country: 'United Kingdom', region: 'England', lat: 52.6369, lon: -1.1398 },
  { name: 'Lincoln', country: 'United Kingdom', region: 'England', lat: 53.2307, lon: -0.5406 },
  { name: 'Liverpool', country: 'United Kingdom', region: 'England', lat: 53.4084, lon: -2.9916 },
  { name: 'London', country: 'United Kingdom', region: 'England', lat: 51.5074, lon: -0.1278 },
  { name: 'Luton', country: 'United Kingdom', region: 'England', lat: 51.8787, lon: -0.4200 },
  { name: 'Manchester', country: 'United Kingdom', region: 'England', lat: 53.4808, lon: -2.2426 },
  { name: 'Middlesbrough', country: 'United Kingdom', region: 'England', lat: 54.5742, lon: -1.2350 },
  { name: 'Milton Keynes', country: 'United Kingdom', region: 'England', lat: 52.0406, lon: -0.7594 },
  { name: 'Newcastle', country: 'United Kingdom', region: 'England', lat: 54.9783, lon: -1.6178 },
  { name: 'Newport', country: 'United Kingdom', region: 'Wales', lat: 51.5842, lon: -2.9977 },
  { name: 'Northampton', country: 'United Kingdom', region: 'England', lat: 52.2405, lon: -0.9027 },
  { name: 'Norwich', country: 'United Kingdom', region: 'England', lat: 52.6309, lon: 1.2974 },
  { name: 'Nottingham', country: 'United Kingdom', region: 'England', lat: 52.9548, lon: -1.1581 },
  { name: 'Oxford', country: 'United Kingdom', region: 'England', lat: 51.7520, lon: -1.2577 },
  { name: 'Perth', country: 'United Kingdom', region: 'Scotland', lat: 56.3953, lon: -3.4372 },
  { name: 'Plymouth', country: 'United Kingdom', region: 'England', lat: 50.3755, lon: -4.1427 },
  { name: 'Portsmouth', country: 'United Kingdom', region: 'England', lat: 50.8198, lon: -1.0880 },
  { name: 'Preston', country: 'United Kingdom', region: 'England', lat: 53.7632, lon: -2.7031 },
  { name: 'Reading', country: 'United Kingdom', region: 'England', lat: 51.4543, lon: -0.9781 },
  { name: 'Sheffield', country: 'United Kingdom', region: 'England', lat: 53.3811, lon: -1.4701 },
  { name: 'Southampton', country: 'United Kingdom', region: 'England', lat: 50.9097, lon: -1.4044 },
  { name: 'Stoke-on-Trent', country: 'United Kingdom', region: 'England', lat: 53.0027, lon: -2.1794 },
  { name: 'Sunderland', country: 'United Kingdom', region: 'England', lat: 54.9069, lon: -1.3838 },
  { name: 'Swansea', country: 'United Kingdom', region: 'Wales', lat: 51.6214, lon: -3.9436 },
  { name: 'Swindon', country: 'United Kingdom', region: 'England', lat: 51.5558, lon: -1.7797 },
  { name: 'Wolverhampton', country: 'United Kingdom', region: 'England', lat: 52.5865, lon: -2.1289 },
  { name: 'Worcester', country: 'United Kingdom', region: 'England', lat: 52.1920, lon: -2.2216 },
  { name: 'York', country: 'United Kingdom', region: 'England', lat: 53.9591, lon: -1.0815 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  //                    L A T I N   A M E R I C A
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // ARGENTINA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bahia Blanca', country: 'Argentina', region: 'Buenos Aires', lat: -38.7196, lon: -62.2724 },
  { name: 'Buenos Aires', country: 'Argentina', region: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { name: 'Catamarca', country: 'Argentina', region: 'Catamarca', lat: -28.4696, lon: -65.7852 },
  { name: 'Cordoba', country: 'Argentina', region: 'Cordoba', lat: -31.4201, lon: -64.1888 },
  { name: 'Corrientes', country: 'Argentina', region: 'Corrientes', lat: -27.4806, lon: -58.8341 },
  { name: 'Formosa', country: 'Argentina', region: 'Formosa', lat: -26.1775, lon: -58.1781 },
  { name: 'La Rioja', country: 'Argentina', region: 'La Rioja', lat: -29.4131, lon: -66.8560 },
  { name: 'Mendoza', country: 'Argentina', region: 'Mendoza', lat: -32.8895, lon: -68.8458 },
  { name: 'Merlo', country: 'Argentina', region: 'Buenos Aires', lat: -34.6606, lon: -58.7275 },
  { name: 'Parana', country: 'Argentina', region: 'Entre Rios', lat: -31.7413, lon: -60.5115 },
  { name: 'Posadas', country: 'Argentina', region: 'Misiones', lat: -27.3621, lon: -55.8969 },
  { name: 'Quilmes', country: 'Argentina', region: 'Buenos Aires', lat: -34.7203, lon: -58.2635 },
  { name: 'Rawson', country: 'Argentina', region: 'Chubut', lat: -43.3002, lon: -65.1023 },
  { name: 'Resistencia', country: 'Argentina', region: 'Chaco', lat: -27.4513, lon: -58.9868 },
  { name: 'Rio Cuarto', country: 'Argentina', region: 'Cordoba', lat: -33.1232, lon: -64.3493 },
  { name: 'Rio Gallegos', country: 'Argentina', region: 'Santa Cruz', lat: -51.6226, lon: -69.2181 },
  { name: 'Rosario', country: 'Argentina', region: 'Santa Fe', lat: -32.9468, lon: -60.6393 },
  { name: 'San Juan', country: 'Argentina', region: 'San Juan', lat: -31.5375, lon: -68.5364 },
  { name: 'San Luis', country: 'Argentina', region: 'San Luis', lat: -33.2950, lon: -66.3356 },
  { name: 'San Rafael', country: 'Argentina', region: 'Mendoza', lat: -34.6176, lon: -68.3301 },
  { name: 'Santa Fe', country: 'Argentina', region: 'Santa Fe', lat: -31.6107, lon: -60.6973 },
  { name: 'Santiago del Estero', country: 'Argentina', region: 'Santiago del Estero', lat: -27.7834, lon: -64.2642 },
  { name: 'Tandil', country: 'Argentina', region: 'Buenos Aires', lat: -37.3217, lon: -59.1332 },
  { name: 'Viedma', country: 'Argentina', region: 'Rio Negro', lat: -40.8135, lon: -62.9967 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BRAZIL
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ananindeua', country: 'Brazil', region: 'Para', lat: -1.3659, lon: -48.3886 },
  { name: 'Aparecida de Goiania', country: 'Brazil', region: 'Goias', lat: -16.8198, lon: -49.2469 },
  { name: 'Bauru', country: 'Brazil', region: 'Sao Paulo', lat: -22.3246, lon: -49.0871 },
  { name: 'Belo Horizonte', country: 'Brazil', region: 'Minas Gerais', lat: -19.9191, lon: -43.9386 },
  { name: 'Betim', country: 'Brazil', region: 'Minas Gerais', lat: -19.9678, lon: -44.1983 },
  { name: 'Blumenau', country: 'Brazil', region: 'Santa Catarina', lat: -26.9194, lon: -49.0661 },
  { name: 'Brasilia', country: 'Brazil', region: 'Distrito Federal', lat: -15.8267, lon: -47.9218 },
  { name: 'Camaçari', country: 'Brazil', region: 'Bahia', lat: -12.6996, lon: -38.3263 },
  { name: 'Canoas', country: 'Brazil', region: 'Rio Grande do Sul', lat: -29.9178, lon: -51.1836 },
  { name: 'Cariacica', country: 'Brazil', region: 'Espirito Santo', lat: -20.2636, lon: -40.4164 },
  { name: 'Caruaru', country: 'Brazil', region: 'Pernambuco', lat: -8.2833, lon: -35.9753 },
  { name: 'Cascavel', country: 'Brazil', region: 'Parana', lat: -24.9578, lon: -53.4596 },
  { name: 'Caxias do Sul', country: 'Brazil', region: 'Rio Grande do Sul', lat: -29.1681, lon: -51.1794 },
  { name: 'Contagem', country: 'Brazil', region: 'Minas Gerais', lat: -19.9320, lon: -44.0539 },
  { name: 'Curitiba', country: 'Brazil', region: 'Parana', lat: -25.4284, lon: -49.2733 },
  { name: 'Diadema', country: 'Brazil', region: 'Sao Paulo', lat: -23.6861, lon: -46.6228 },
  { name: 'Duque de Caxias', country: 'Brazil', region: 'Rio de Janeiro', lat: -22.7856, lon: -43.3117 },
  { name: 'Feira de Santana', country: 'Brazil', region: 'Bahia', lat: -12.2669, lon: -38.9664 },
  { name: 'Fortaleza', country: 'Brazil', region: 'Ceara', lat: -3.7172, lon: -38.5433 },
  { name: 'Franca', country: 'Brazil', region: 'Sao Paulo', lat: -20.5392, lon: -47.4014 },
  { name: 'Guarulhos', country: 'Brazil', region: 'Sao Paulo', lat: -23.4538, lon: -46.5333 },
  { name: 'Imperatriz', country: 'Brazil', region: 'Maranhao', lat: -5.5264, lon: -47.4919 },
  { name: 'Jaboatao dos Guararapes', country: 'Brazil', region: 'Pernambuco', lat: -8.1128, lon: -35.0158 },
  { name: 'Joinville', country: 'Brazil', region: 'Santa Catarina', lat: -26.3045, lon: -48.8487 },
  { name: 'Juiz de Fora', country: 'Brazil', region: 'Minas Gerais', lat: -21.7642, lon: -43.3503 },
  { name: 'Jundiai', country: 'Brazil', region: 'Sao Paulo', lat: -23.1857, lon: -46.8978 },
  { name: 'Londrina', country: 'Brazil', region: 'Parana', lat: -23.3045, lon: -51.1696 },
  { name: 'Manaus', country: 'Brazil', region: 'Amazonas', lat: -3.1190, lon: -60.0217 },
  { name: 'Maringa', country: 'Brazil', region: 'Parana', lat: -23.4205, lon: -51.9333 },
  { name: 'Montes Claros', country: 'Brazil', region: 'Minas Gerais', lat: -16.7350, lon: -43.8617 },
  { name: 'Niteroi', country: 'Brazil', region: 'Rio de Janeiro', lat: -22.8833, lon: -43.1036 },
  { name: 'Nova Iguacu', country: 'Brazil', region: 'Rio de Janeiro', lat: -22.7592, lon: -43.4510 },
  { name: 'Olinda', country: 'Brazil', region: 'Pernambuco', lat: -8.0089, lon: -34.8553 },
  { name: 'Osasco', country: 'Brazil', region: 'Sao Paulo', lat: -23.5325, lon: -46.7917 },
  { name: 'Pelotas', country: 'Brazil', region: 'Rio Grande do Sul', lat: -31.7654, lon: -52.3376 },
  { name: 'Petropolis', country: 'Brazil', region: 'Rio de Janeiro', lat: -22.5112, lon: -43.1779 },
  { name: 'Piracicaba', country: 'Brazil', region: 'Sao Paulo', lat: -22.7338, lon: -47.6476 },
  { name: 'Porto Alegre', country: 'Brazil', region: 'Rio Grande do Sul', lat: -30.0346, lon: -51.2177 },
  { name: 'Recife', country: 'Brazil', region: 'Pernambuco', lat: -8.0476, lon: -34.8770 },
  { name: 'Ribeirao Preto', country: 'Brazil', region: 'Sao Paulo', lat: -21.1704, lon: -47.8103 },
  { name: 'Rio de Janeiro', country: 'Brazil', region: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { name: 'Salvador', country: 'Brazil', region: 'Bahia', lat: -12.9714, lon: -38.5124 },
  { name: 'Santa Maria', country: 'Brazil', region: 'Rio Grande do Sul', lat: -29.6842, lon: -53.8069 },
  { name: 'Santo Andre', country: 'Brazil', region: 'Sao Paulo', lat: -23.6737, lon: -46.5432 },
  { name: 'Sao Bernardo do Campo', country: 'Brazil', region: 'Sao Paulo', lat: -23.6914, lon: -46.5646 },
  { name: 'Sao Goncalo', country: 'Brazil', region: 'Rio de Janeiro', lat: -22.8269, lon: -43.0634 },
  { name: 'Sao Jose do Rio Preto', country: 'Brazil', region: 'Sao Paulo', lat: -20.8113, lon: -49.3758 },
  { name: 'Sao Jose dos Campos', country: 'Brazil', region: 'Sao Paulo', lat: -23.1896, lon: -45.8841 },
  { name: 'Sao Jose dos Pinhais', country: 'Brazil', region: 'Parana', lat: -25.5350, lon: -49.2058 },
  { name: 'Sao Paulo', country: 'Brazil', region: 'Sao Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Serra', country: 'Brazil', region: 'Espirito Santo', lat: -20.1209, lon: -40.3075 },
  { name: 'Sorocaba', country: 'Brazil', region: 'Sao Paulo', lat: -23.5015, lon: -47.4526 },
  { name: 'Uberlandia', country: 'Brazil', region: 'Minas Gerais', lat: -18.9186, lon: -48.2772 },
  { name: 'Vila Velha', country: 'Brazil', region: 'Espirito Santo', lat: -20.3297, lon: -40.2925 },
  { name: 'Volta Redonda', country: 'Brazil', region: 'Rio de Janeiro', lat: -22.5202, lon: -44.1044 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHILE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Calama', country: 'Chile', lat: -22.4533, lon: -68.9294 },
  { name: 'Chillan', country: 'Chile', lat: -36.6066, lon: -72.1034 },
  { name: 'Concepcion', country: 'Chile', lat: -36.8201, lon: -73.0444 },
  { name: 'Copiapo', country: 'Chile', lat: -27.3668, lon: -70.3323 },
  { name: 'Coquimbo', country: 'Chile', lat: -29.9533, lon: -71.3436 },
  { name: 'Los Angeles', country: 'Chile', lat: -37.4693, lon: -72.3527 },
  { name: 'Osorno', country: 'Chile', lat: -40.5724, lon: -73.1353 },
  { name: 'Rancagua', country: 'Chile', lat: -34.1708, lon: -70.7444 },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693 },
  { name: 'Talca', country: 'Chile', lat: -35.4264, lon: -71.6554 },
  { name: 'Temuco', country: 'Chile', lat: -38.7359, lon: -72.5904 },
  { name: 'Valdivia', country: 'Chile', lat: -39.8142, lon: -73.2459 },
  { name: 'Valparaiso', country: 'Chile', lat: -33.0472, lon: -71.6127 },

  // ═══════════════════════════════════════════════════════════════════════════
  // COLOMBIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Armenia', country: 'Colombia', lat: 4.5339, lon: -75.6811 },
  { name: 'Barranquilla', country: 'Colombia', lat: 10.9685, lon: -74.7813 },
  { name: 'Bello', country: 'Colombia', lat: 6.3380, lon: -75.5567 },
  { name: 'Bogota', country: 'Colombia', lat: 4.7110, lon: -74.0721 },
  { name: 'Cali', country: 'Colombia', lat: 3.4516, lon: -76.5320 },
  { name: 'Cartagena', country: 'Colombia', lat: 10.3910, lon: -75.5144 },
  { name: 'Cucuta', country: 'Colombia', lat: 7.8939, lon: -72.5078 },
  { name: 'Envigado', country: 'Colombia', lat: 6.1711, lon: -75.5903 },
  { name: 'Florencia', country: 'Colombia', lat: 1.6144, lon: -75.6062 },
  { name: 'Ibague', country: 'Colombia', lat: 4.4389, lon: -75.2322 },
  { name: 'Itagui', country: 'Colombia', lat: 6.1845, lon: -75.5994 },
  { name: 'Medellin', country: 'Colombia', lat: 6.2476, lon: -75.5658 },
  { name: 'Monteria', country: 'Colombia', lat: 8.7479, lon: -75.8814 },
  { name: 'Neiva', country: 'Colombia', lat: 2.9273, lon: -75.2819 },
  { name: 'Pasto', country: 'Colombia', lat: 1.2136, lon: -77.2811 },
  { name: 'Popayan', country: 'Colombia', lat: 2.4419, lon: -76.6064 },
  { name: 'Sincelejo', country: 'Colombia', lat: 9.3047, lon: -75.3978 },
  { name: 'Soledad', country: 'Colombia', lat: 10.9181, lon: -74.7647 },
  { name: 'Tunja', country: 'Colombia', lat: 5.5353, lon: -73.3678 },
  { name: 'Valledupar', country: 'Colombia', lat: 10.4769, lon: -73.2532 },
  { name: 'Villavicencio', country: 'Colombia', lat: 4.1420, lon: -73.6266 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CUBA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Camaguey', country: 'Cuba', lat: 21.3808, lon: -77.9167 },
  { name: 'Cienfuegos', country: 'Cuba', lat: 22.1456, lon: -80.4353 },
  { name: 'Guantanamo', country: 'Cuba', lat: 20.1442, lon: -75.2069 },
  { name: 'Havana', country: 'Cuba', lat: 23.1136, lon: -82.3666 },
  { name: 'Holguin', country: 'Cuba', lat: 20.7194, lon: -76.2633 },
  { name: 'Matanzas', country: 'Cuba', lat: 23.0511, lon: -81.5775 },
  { name: 'Pinar del Rio', country: 'Cuba', lat: 22.4175, lon: -83.6978 },
  { name: 'Santa Clara', country: 'Cuba', lat: 22.4069, lon: -79.9553 },
  { name: 'Santiago de Cuba', country: 'Cuba', lat: 20.0247, lon: -75.8219 },
  { name: 'Trinidad', country: 'Cuba', lat: 21.8022, lon: -79.9847 },
  { name: 'Varadero', country: 'Cuba', lat: 23.1567, lon: -81.2444 },
  { name: 'Vinales', country: 'Cuba', lat: 22.6167, lon: -83.7167 },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMINICAN REPUBLIC
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Higuey', country: 'Dominican Republic', lat: 18.6153, lon: -68.7078 },
  { name: 'La Vega', country: 'Dominican Republic', lat: 19.2210, lon: -70.5298 },
  { name: 'Puerto Plata', country: 'Dominican Republic', lat: 19.7934, lon: -70.6884 },
  { name: 'Samana', country: 'Dominican Republic', lat: 19.2056, lon: -69.3361 },
  { name: 'San Cristobal', country: 'Dominican Republic', lat: 18.4167, lon: -70.1000 },
  { name: 'San Francisco de Macoris', country: 'Dominican Republic', lat: 19.2998, lon: -70.2567 },
  { name: 'San Pedro de Macoris', country: 'Dominican Republic', lat: 18.4611, lon: -69.3086 },
  { name: 'Santiago', country: 'Dominican Republic', lat: 19.4517, lon: -70.6970 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ECUADOR
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ambato', country: 'Ecuador', lat: -1.2491, lon: -78.6167 },
  { name: 'Esmeraldas', country: 'Ecuador', lat: 0.9592, lon: -79.6539 },
  { name: 'Guayaquil', country: 'Ecuador', lat: -2.1894, lon: -79.8891 },
  { name: 'Ibarra', country: 'Ecuador', lat: 0.3392, lon: -78.1222 },
  { name: 'Loja', country: 'Ecuador', lat: -3.9931, lon: -79.2042 },
  { name: 'Machala', country: 'Ecuador', lat: -3.2581, lon: -79.9554 },
  { name: 'Manta', country: 'Ecuador', lat: -0.9500, lon: -80.7333 },
  { name: 'Portoviejo', country: 'Ecuador', lat: -1.0547, lon: -80.4545 },
  { name: 'Quito', country: 'Ecuador', lat: -0.1807, lon: -78.4678 },
  { name: 'Riobamba', country: 'Ecuador', lat: -1.6635, lon: -78.6544 },
  { name: 'Santo Domingo', country: 'Ecuador', lat: -0.2532, lon: -79.1719 },

  // ═══════════════════════════════════════════════════════════════════════════
  // EL SALVADOR
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ahuachapan', country: 'El Salvador', lat: 13.9214, lon: -89.8458 },
  { name: 'La Union', country: 'El Salvador', lat: 13.3368, lon: -87.8439 },
  { name: 'San Miguel', country: 'El Salvador', lat: 13.4833, lon: -88.1833 },
  { name: 'San Salvador', country: 'El Salvador', lat: 13.6929, lon: -89.2182 },
  { name: 'Santa Ana', country: 'El Salvador', lat: 13.9942, lon: -89.5597 },
  { name: 'Santa Tecla', country: 'El Salvador', lat: 13.6769, lon: -89.2797 },
  { name: 'Sonsonate', country: 'El Salvador', lat: 13.7189, lon: -89.7244 },
  { name: 'Soyapango', country: 'El Salvador', lat: 13.7167, lon: -89.1500 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GUATEMALA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Chimaltenango', country: 'Guatemala', lat: 14.6611, lon: -90.8194 },
  { name: 'Coban', country: 'Guatemala', lat: 15.4706, lon: -90.3711 },
  { name: 'Escuintla', country: 'Guatemala', lat: 14.2989, lon: -90.7875 },
  { name: 'Guatemala City', country: 'Guatemala', lat: 14.6349, lon: -90.5069 },
  { name: 'Huehuetenango', country: 'Guatemala', lat: 15.3194, lon: -91.4736 },
  { name: 'Mazatenango', country: 'Guatemala', lat: 14.5333, lon: -91.5028 },
  { name: 'Mixco', country: 'Guatemala', lat: 14.6333, lon: -90.6000 },
  { name: 'Panajachel', country: 'Guatemala', lat: 14.7389, lon: -91.1597 },
  { name: 'Puerto Barrios', country: 'Guatemala', lat: 15.7167, lon: -88.5833 },
  { name: 'San Marcos', country: 'Guatemala', lat: 14.9639, lon: -91.7964 },
  { name: 'Villa Nueva', country: 'Guatemala', lat: 14.5260, lon: -90.5872 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GUYANA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Georgetown', country: 'Guyana', lat: 6.8013, lon: -58.1551 },
  { name: 'Linden', country: 'Guyana', lat: 5.9667, lon: -58.3000 },
  { name: 'New Amsterdam', country: 'Guyana', lat: 6.2489, lon: -57.5175 },

  // ═══════════════════════════════════════════════════════════════════════════
  // HAITI
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Cap-Haitien', country: 'Haiti', lat: 19.7578, lon: -72.2044 },
  { name: 'Delmas', country: 'Haiti', lat: 18.5472, lon: -72.3028 },
  { name: 'Gonaives', country: 'Haiti', lat: 19.4500, lon: -72.6889 },
  { name: 'Jacmel', country: 'Haiti', lat: 18.2340, lon: -72.5352 },
  { name: 'Jeremie', country: 'Haiti', lat: 18.6500, lon: -74.1167 },
  { name: 'Les Cayes', country: 'Haiti', lat: 18.1940, lon: -73.7504 },
  { name: 'Petion-Ville', country: 'Haiti', lat: 18.5125, lon: -72.2854 },
  { name: 'Port-au-Prince', country: 'Haiti', lat: 18.5944, lon: -72.3074 },
  { name: 'Port-de-Paix', country: 'Haiti', lat: 19.9403, lon: -72.8303 },
  { name: 'Saint-Marc', country: 'Haiti', lat: 19.1081, lon: -72.6961 },

  // ═══════════════════════════════════════════════════════════════════════════
  // HONDURAS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Choloma', country: 'Honduras', lat: 15.6122, lon: -87.9547 },
  { name: 'Comayagua', country: 'Honduras', lat: 14.4511, lon: -87.6386 },
  { name: 'Danli', country: 'Honduras', lat: 14.0333, lon: -86.5667 },
  { name: 'El Progreso', country: 'Honduras', lat: 15.4000, lon: -87.8000 },
  { name: 'La Ceiba', country: 'Honduras', lat: 15.7631, lon: -86.7919 },
  { name: 'La Lima', country: 'Honduras', lat: 15.4333, lon: -87.9167 },
  { name: 'Puerto Cortes', country: 'Honduras', lat: 15.8500, lon: -87.9500 },
  { name: 'Roatan', country: 'Honduras', lat: 16.3167, lon: -86.5333 },
  { name: 'San Pedro Sula', country: 'Honduras', lat: 15.5000, lon: -88.0333 },
  { name: 'Tegucigalpa', country: 'Honduras', lat: 14.0723, lon: -87.1921 },

  // ═══════════════════════════════════════════════════════════════════════════
  // JAMAICA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Kingston', country: 'Jamaica', lat: 18.0179, lon: -76.8099 },
  { name: 'Mandeville', country: 'Jamaica', lat: 18.0431, lon: -77.5025 },
  { name: 'May Pen', country: 'Jamaica', lat: 17.9649, lon: -77.2472 },
  { name: 'Montego Bay', country: 'Jamaica', lat: 18.4762, lon: -77.8939 },
  { name: 'Negril', country: 'Jamaica', lat: 18.2683, lon: -78.3490 },
  { name: 'Ocho Rios', country: 'Jamaica', lat: 18.4075, lon: -77.1014 },
  { name: 'Port Antonio', country: 'Jamaica', lat: 18.1750, lon: -76.4514 },
  { name: 'Portmore', country: 'Jamaica', lat: 17.9519, lon: -76.8793 },
  { name: 'Spanish Town', country: 'Jamaica', lat: 18.0130, lon: -76.9569 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEXICO
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Acapulco', country: 'Mexico', region: 'Guerrero', lat: 16.8531, lon: -99.8237 },
  { name: 'Aguascalientes', country: 'Mexico', region: 'Aguascalientes', lat: 21.8853, lon: -102.2916 },
  { name: 'Campeche', country: 'Mexico', region: 'Campeche', lat: 19.8301, lon: -90.5349 },
  { name: 'Cancun', country: 'Mexico', region: 'Quintana Roo', lat: 21.1619, lon: -86.8515 },
  { name: 'Celaya', country: 'Mexico', region: 'Guanajuato', lat: 20.5188, lon: -100.8163 },
  { name: 'Chetumal', country: 'Mexico', region: 'Quintana Roo', lat: 18.5001, lon: -88.2963 },
  { name: 'Chihuahua', country: 'Mexico', region: 'Chihuahua', lat: 28.6353, lon: -106.0889 },
  { name: 'Ciudad del Carmen', country: 'Mexico', region: 'Campeche', lat: 18.6500, lon: -91.8167 },
  { name: 'Ciudad Juarez', country: 'Mexico', region: 'Chihuahua', lat: 31.6904, lon: -106.4245 },
  { name: 'Ciudad Obregon', country: 'Mexico', region: 'Sonora', lat: 27.4828, lon: -109.9334 },
  { name: 'Ciudad Victoria', country: 'Mexico', region: 'Tamaulipas', lat: 23.7369, lon: -99.1461 },
  { name: 'Colima', country: 'Mexico', region: 'Colima', lat: 19.2433, lon: -103.7247 },
  { name: 'Cuernavaca', country: 'Mexico', region: 'Morelos', lat: 18.9242, lon: -99.2216 },
  { name: 'Culiacan', country: 'Mexico', region: 'Sinaloa', lat: 24.7994, lon: -107.3878 },
  { name: 'Durango', country: 'Mexico', region: 'Durango', lat: 24.0277, lon: -104.6532 },
  { name: 'Ensenada', country: 'Mexico', region: 'Baja California', lat: 31.8667, lon: -116.5964 },
  { name: 'Guadalajara', country: 'Mexico', region: 'Jalisco', lat: 20.6597, lon: -103.3496 },
  { name: 'Guanajuato', country: 'Mexico', region: 'Guanajuato', lat: 21.0190, lon: -101.2574 },
  { name: 'Hermosillo', country: 'Mexico', region: 'Sonora', lat: 29.0729, lon: -110.9559 },
  { name: 'Irapuato', country: 'Mexico', region: 'Guanajuato', lat: 20.6767, lon: -101.3464 },
  { name: 'La Paz', country: 'Mexico', region: 'Baja California Sur', lat: 24.1426, lon: -110.3128 },
  { name: 'Leon', country: 'Mexico', region: 'Guanajuato', lat: 21.1250, lon: -101.6860 },
  { name: 'Los Cabos', country: 'Mexico', region: 'Baja California Sur', lat: 22.8905, lon: -109.9167 },
  { name: 'Los Mochis', country: 'Mexico', region: 'Sinaloa', lat: 25.7903, lon: -108.9860 },
  { name: 'Matamoros', country: 'Mexico', region: 'Tamaulipas', lat: 25.8690, lon: -97.5028 },
  { name: 'Mazatlan', country: 'Mexico', region: 'Sinaloa', lat: 23.2494, lon: -106.4111 },
  { name: 'Merida', country: 'Mexico', region: 'Yucatan', lat: 20.9674, lon: -89.5926 },
  { name: 'Mexicali', country: 'Mexico', region: 'Baja California', lat: 32.6633, lon: -115.4678 },
  { name: 'Mexico City', country: 'Mexico', region: 'Ciudad de Mexico', lat: 19.4326, lon: -99.1332 },
  { name: 'Monterrey', country: 'Mexico', region: 'Nuevo Leon', lat: 25.6866, lon: -100.3161 },
  { name: 'Morelia', country: 'Mexico', region: 'Michoacan', lat: 19.7060, lon: -101.1950 },
  { name: 'Nogales', country: 'Mexico', region: 'Sonora', lat: 31.3100, lon: -110.9464 },
  { name: 'Nuevo Laredo', country: 'Mexico', region: 'Tamaulipas', lat: 27.4761, lon: -99.5105 },
  { name: 'Oaxaca', country: 'Mexico', region: 'Oaxaca', lat: 17.0732, lon: -96.7266 },
  { name: 'Pachuca', country: 'Mexico', region: 'Hidalgo', lat: 20.1011, lon: -98.7591 },
  { name: 'Playa del Carmen', country: 'Mexico', region: 'Quintana Roo', lat: 20.6296, lon: -87.0739 },
  { name: 'Puebla', country: 'Mexico', region: 'Puebla', lat: 19.0414, lon: -98.2063 },
  { name: 'Puerto Vallarta', country: 'Mexico', region: 'Jalisco', lat: 20.6534, lon: -105.2253 },
  { name: 'Queretaro', country: 'Mexico', region: 'Queretaro', lat: 20.5888, lon: -100.3899 },
  { name: 'Reynosa', country: 'Mexico', region: 'Tamaulipas', lat: 26.0508, lon: -98.2975 },
  { name: 'Saltillo', country: 'Mexico', region: 'Coahuila', lat: 25.4232, lon: -100.9924 },
  { name: 'San Cristobal de las Casas', country: 'Mexico', region: 'Chiapas', lat: 16.7370, lon: -92.6376 },
  { name: 'San Luis Potosi', country: 'Mexico', region: 'San Luis Potosi', lat: 22.1565, lon: -100.9855 },
  { name: 'Tampico', country: 'Mexico', region: 'Tamaulipas', lat: 22.2331, lon: -97.8611 },
  { name: 'Tapachula', country: 'Mexico', region: 'Chiapas', lat: 14.9000, lon: -92.2667 },
  { name: 'Tepic', country: 'Mexico', region: 'Nayarit', lat: 21.5042, lon: -104.8953 },
  { name: 'Tijuana', country: 'Mexico', region: 'Baja California', lat: 32.5149, lon: -117.0382 },
  { name: 'Tlaxcala', country: 'Mexico', region: 'Tlaxcala', lat: 19.3182, lon: -98.2375 },
  { name: 'Toluca', country: 'Mexico', region: 'Estado de Mexico', lat: 19.2826, lon: -99.6557 },
  { name: 'Torreon', country: 'Mexico', region: 'Coahuila', lat: 25.5428, lon: -103.4068 },
  { name: 'Tuxtla Gutierrez', country: 'Mexico', region: 'Chiapas', lat: 16.7528, lon: -93.1152 },
  { name: 'Uruapan', country: 'Mexico', region: 'Michoacan', lat: 19.4208, lon: -102.0528 },
  { name: 'Veracruz', country: 'Mexico', region: 'Veracruz', lat: 19.1738, lon: -96.1342 },
  { name: 'Villahermosa', country: 'Mexico', region: 'Tabasco', lat: 17.9892, lon: -92.9475 },
  { name: 'Xalapa', country: 'Mexico', region: 'Veracruz', lat: 19.5438, lon: -96.9102 },
  { name: 'Zacatecas', country: 'Mexico', region: 'Zacatecas', lat: 22.7709, lon: -102.5833 },
  { name: 'Zamora', country: 'Mexico', region: 'Michoacan', lat: 19.9833, lon: -102.2833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NICARAGUA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bluefields', country: 'Nicaragua', lat: 12.0136, lon: -83.7636 },
  { name: 'Chinandega', country: 'Nicaragua', lat: 12.6294, lon: -87.1311 },
  { name: 'Esteli', country: 'Nicaragua', lat: 13.0833, lon: -86.3500 },
  { name: 'Granada', country: 'Nicaragua', lat: 11.9289, lon: -85.9561 },
  { name: 'Jinotega', country: 'Nicaragua', lat: 13.0906, lon: -85.9997 },
  { name: 'Leon', country: 'Nicaragua', lat: 12.4350, lon: -86.8780 },
  { name: 'Managua', country: 'Nicaragua', lat: 12.1150, lon: -86.2362 },
  { name: 'Masaya', country: 'Nicaragua', lat: 11.9744, lon: -86.0942 },
  { name: 'Matagalpa', country: 'Nicaragua', lat: 12.9256, lon: -85.9175 },
  { name: 'San Juan del Sur', country: 'Nicaragua', lat: 11.2531, lon: -85.8700 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PANAMA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bocas del Toro', country: 'Panama', lat: 9.3405, lon: -82.2420 },
  { name: 'Chitre', country: 'Panama', lat: 7.9619, lon: -80.4281 },
  { name: 'Colon', country: 'Panama', lat: 9.3547, lon: -79.9017 },
  { name: 'David', country: 'Panama', lat: 8.4333, lon: -82.4333 },
  { name: 'La Chorrera', country: 'Panama', lat: 8.8789, lon: -79.7831 },
  { name: 'Panama City', country: 'Panama', lat: 8.9824, lon: -79.5199 },
  { name: 'Santiago', country: 'Panama', lat: 8.1000, lon: -80.9833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PARAGUAY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Asuncion', country: 'Paraguay', lat: -25.2637, lon: -57.5759 },
  { name: 'Ciudad del Este', country: 'Paraguay', lat: -25.5167, lon: -54.6167 },
  { name: 'Encarnacion', country: 'Paraguay', lat: -27.3306, lon: -55.8667 },
  { name: 'Fernando de la Mora', country: 'Paraguay', lat: -25.3386, lon: -57.5228 },
  { name: 'Lambare', country: 'Paraguay', lat: -25.3461, lon: -57.6064 },
  { name: 'Luque', country: 'Paraguay', lat: -25.2667, lon: -57.4833 },
  { name: 'Pedro Juan Caballero', country: 'Paraguay', lat: -22.5476, lon: -55.7336 },
  { name: 'San Lorenzo', country: 'Paraguay', lat: -25.3333, lon: -57.5333 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERU
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Arequipa', country: 'Peru', lat: -16.4090, lon: -71.5375 },
  { name: 'Ayacucho', country: 'Peru', lat: -13.1588, lon: -74.2240 },
  { name: 'Cajamarca', country: 'Peru', lat: -7.1638, lon: -78.5003 },
  { name: 'Callao', country: 'Peru', lat: -12.0564, lon: -77.1185 },
  { name: 'Chimbote', country: 'Peru', lat: -9.0746, lon: -78.5937 },
  { name: 'Chiclayo', country: 'Peru', lat: -6.7714, lon: -79.8409 },
  { name: 'Cusco', country: 'Peru', lat: -13.5319, lon: -71.9675 },
  { name: 'Huancayo', country: 'Peru', lat: -12.0651, lon: -75.2049 },
  { name: 'Huaraz', country: 'Peru', lat: -9.5274, lon: -77.5280 },
  { name: 'Ica', country: 'Peru', lat: -14.0755, lon: -75.7342 },
  { name: 'Iquitos', country: 'Peru', lat: -3.7491, lon: -73.2538 },
  { name: 'Juliaca', country: 'Peru', lat: -15.5000, lon: -70.1333 },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428 },
  { name: 'Piura', country: 'Peru', lat: -5.1945, lon: -80.6328 },
  { name: 'Pucallpa', country: 'Peru', lat: -8.3791, lon: -74.5539 },
  { name: 'Puno', country: 'Peru', lat: -15.8402, lon: -70.0219 },
  { name: 'Sullana', country: 'Peru', lat: -4.9031, lon: -80.6853 },
  { name: 'Tacna', country: 'Peru', lat: -18.0066, lon: -70.2463 },
  { name: 'Trujillo', country: 'Peru', lat: -8.1116, lon: -79.0288 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SURINAME
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Paramaribo', country: 'Suriname', lat: 5.8520, lon: -55.2038 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRINIDAD AND TOBAGO
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Arima', country: 'Trinidad and Tobago', lat: 10.6373, lon: -61.2831 },
  { name: 'Chaguanas', country: 'Trinidad and Tobago', lat: 10.5168, lon: -61.4114 },
  { name: 'Point Fortin', country: 'Trinidad and Tobago', lat: 10.1700, lon: -61.6800 },
  { name: 'Port of Spain', country: 'Trinidad and Tobago', lat: 10.6596, lon: -61.5086 },
  { name: 'San Fernando', country: 'Trinidad and Tobago', lat: 10.2803, lon: -61.4681 },
  { name: 'Scarborough', country: 'Trinidad and Tobago', lat: 11.1833, lon: -60.7333 },
  { name: 'Tunapuna', country: 'Trinidad and Tobago', lat: 10.6500, lon: -61.3833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // URUGUAY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Colonia del Sacramento', country: 'Uruguay', lat: -34.4626, lon: -57.8400 },
  { name: 'Las Piedras', country: 'Uruguay', lat: -34.7278, lon: -56.2203 },
  { name: 'Maldonado', country: 'Uruguay', lat: -34.9000, lon: -54.9500 },
  { name: 'Melo', country: 'Uruguay', lat: -32.3667, lon: -54.1667 },
  { name: 'Mercedes', country: 'Uruguay', lat: -33.2500, lon: -58.0333 },
  { name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lon: -56.1645 },
  { name: 'Paysandu', country: 'Uruguay', lat: -32.3214, lon: -58.0756 },
  { name: 'Punta del Este', country: 'Uruguay', lat: -34.9667, lon: -54.9500 },
  { name: 'Rivera', country: 'Uruguay', lat: -30.9025, lon: -55.5506 },
  { name: 'Salto', country: 'Uruguay', lat: -31.3833, lon: -57.9667 },

  // ═══════════════════════════════════════════════════════════════════════════
  // VENEZUELA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Barcelona', country: 'Venezuela', lat: 10.1333, lon: -64.7000 },
  { name: 'Barinas', country: 'Venezuela', lat: 8.6226, lon: -70.2071 },
  { name: 'Barquisimeto', country: 'Venezuela', lat: 10.0647, lon: -69.3570 },
  { name: 'Cabimas', country: 'Venezuela', lat: 10.3958, lon: -71.4500 },
  { name: 'Caracas', country: 'Venezuela', lat: 10.4806, lon: -66.9036 },
  { name: 'Ciudad Bolivar', country: 'Venezuela', lat: 8.1286, lon: -63.5417 },
  { name: 'Ciudad Guayana', country: 'Venezuela', lat: 8.3596, lon: -62.6500 },
  { name: 'Cumana', country: 'Venezuela', lat: 10.4636, lon: -64.1675 },
  { name: 'Maracaibo', country: 'Venezuela', lat: 10.6427, lon: -71.6125 },
  { name: 'Maracay', country: 'Venezuela', lat: 10.2469, lon: -67.5958 },
  { name: 'Maturin', country: 'Venezuela', lat: 9.7500, lon: -63.1833 },
  { name: 'Merida', country: 'Venezuela', lat: 8.5897, lon: -71.1561 },
  { name: 'Puerto La Cruz', country: 'Venezuela', lat: 10.2167, lon: -64.6333 },
  { name: 'San Cristobal', country: 'Venezuela', lat: 7.7667, lon: -72.2250 },
  { name: 'Valencia', country: 'Venezuela', lat: 10.1620, lon: -68.0077 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  //              M I D D L E   E A S T   &   C E N T R A L   A S I A
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // GEORGIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Rustavi', country: 'Georgia', lat: 41.5489, lon: 44.9939 },
  { name: 'Tbilisi', country: 'Georgia', lat: 41.7151, lon: 44.8271 },
  { name: 'Zugdidi', country: 'Georgia', lat: 42.5088, lon: 41.8709 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ISRAEL
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ashdod', country: 'Israel', lat: 31.8040, lon: 34.6553 },
  { name: 'Ashkelon', country: 'Israel', lat: 31.6688, lon: 34.5743 },
  { name: 'Bat Yam', country: 'Israel', lat: 32.0231, lon: 34.7503 },
  { name: 'Beersheba', country: 'Israel', lat: 31.2518, lon: 34.7913 },
  { name: 'Bnei Brak', country: 'Israel', lat: 32.0833, lon: 34.8333 },
  { name: 'Herzliya', country: 'Israel', lat: 32.1667, lon: 34.8333 },
  { name: 'Holon', country: 'Israel', lat: 32.0114, lon: 34.7748 },
  { name: 'Kfar Saba', country: 'Israel', lat: 32.1780, lon: 34.9070 },
  { name: 'Netanya', country: 'Israel', lat: 32.3286, lon: 34.8575 },
  { name: 'Petah Tikva', country: 'Israel', lat: 32.0889, lon: 34.8854 },
  { name: 'Ramat Gan', country: 'Israel', lat: 32.0700, lon: 34.8247 },
  { name: 'Rehovot', country: 'Israel', lat: 31.8928, lon: 34.8113 },
  { name: 'Rishon LeZion', country: 'Israel', lat: 31.9642, lon: 34.8044 },
  { name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lon: 34.7818 },

  // ═══════════════════════════════════════════════════════════════════════════
  // JORDAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Amman', country: 'Jordan', lat: 31.9566, lon: 35.9457 },
  { name: 'Aqaba', country: 'Jordan', lat: 29.5267, lon: 35.0078 },
  { name: 'Irbid', country: 'Jordan', lat: 32.5556, lon: 35.8497 },
  { name: 'Jerash', country: 'Jordan', lat: 32.2747, lon: 35.8961 },
  { name: 'Karak', country: 'Jordan', lat: 31.1852, lon: 35.7000 },
  { name: 'Madaba', country: 'Jordan', lat: 31.7167, lon: 35.8000 },
  { name: 'Mafraq', country: 'Jordan', lat: 32.3422, lon: 36.2081 },
  { name: 'Salt', country: 'Jordan', lat: 32.0392, lon: 35.7272 },
  { name: 'Zarqa', country: 'Jordan', lat: 32.0728, lon: 36.0880 },

  // ═══════════════════════════════════════════════════════════════════════════
  // KUWAIT
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Al Ahmadi', country: 'Kuwait', lat: 29.0769, lon: 48.0839 },
  { name: 'Hawalli', country: 'Kuwait', lat: 29.3328, lon: 48.0286 },
  { name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lon: 47.9774 },
  { name: 'Salmiya', country: 'Kuwait', lat: 29.3389, lon: 48.0767 },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEBANON
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Baalbek', country: 'Lebanon', lat: 34.0058, lon: 36.2181 },
  { name: 'Beirut', country: 'Lebanon', lat: 33.8938, lon: 35.5018 },
  { name: 'Byblos', country: 'Lebanon', lat: 34.1208, lon: 35.6517 },
  { name: 'Jounieh', country: 'Lebanon', lat: 33.9808, lon: 35.6178 },
  { name: 'Saida', country: 'Lebanon', lat: 33.5633, lon: 35.3756 },
  { name: 'Tripoli', country: 'Lebanon', lat: 34.4333, lon: 35.8333 },
  { name: 'Tyre', country: 'Lebanon', lat: 33.2705, lon: 35.1958 },
  { name: 'Zahle', country: 'Lebanon', lat: 33.8500, lon: 35.9000 },

  // ═══════════════════════════════════════════════════════════════════════════
  // OMAN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Muscat', country: 'Oman', lat: 23.5880, lon: 58.3829 },
  { name: 'Nizwa', country: 'Oman', lat: 22.9333, lon: 57.5333 },
  { name: 'Salalah', country: 'Oman', lat: 17.0151, lon: 54.0924 },
  { name: 'Sohar', country: 'Oman', lat: 24.3461, lon: 56.7494 },
  { name: 'Sur', country: 'Oman', lat: 22.5667, lon: 59.5289 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PALESTINE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bethlehem', country: 'Palestine', lat: 31.7054, lon: 35.2024 },
  { name: 'Gaza City', country: 'Palestine', lat: 31.5000, lon: 34.4667 },
  { name: 'Hebron', country: 'Palestine', lat: 31.5326, lon: 35.0998 },
  { name: 'Jenin', country: 'Palestine', lat: 32.4607, lon: 35.2936 },
  { name: 'Nablus', country: 'Palestine', lat: 32.2211, lon: 35.2544 },
  { name: 'Ramallah', country: 'Palestine', lat: 31.9038, lon: 35.2034 },

  // ═══════════════════════════════════════════════════════════════════════════
  // QATAR
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Al Khor', country: 'Qatar', lat: 25.6804, lon: 51.4969 },
  { name: 'Al Rayyan', country: 'Qatar', lat: 25.2919, lon: 51.4244 },
  { name: 'Al Wakrah', country: 'Qatar', lat: 25.1659, lon: 51.6067 },
  { name: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.5310 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAUDI ARABIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Abha', country: 'Saudi Arabia', lat: 18.2164, lon: 42.5053 },
  { name: 'Al Khobar', country: 'Saudi Arabia', lat: 26.2172, lon: 50.1971 },
  { name: 'Buraydah', country: 'Saudi Arabia', lat: 26.3260, lon: 43.9750 },
  { name: 'Dammam', country: 'Saudi Arabia', lat: 26.4207, lon: 50.0888 },
  { name: 'Dhahran', country: 'Saudi Arabia', lat: 26.2361, lon: 50.0393 },
  { name: 'Hail', country: 'Saudi Arabia', lat: 27.5236, lon: 41.6900 },
  { name: 'Hofuf', country: 'Saudi Arabia', lat: 25.3648, lon: 49.5870 },
  { name: 'Jeddah', country: 'Saudi Arabia', lat: 21.4858, lon: 39.1925 },
  { name: 'Jizan', country: 'Saudi Arabia', lat: 16.8892, lon: 42.5511 },
  { name: 'Jubail', country: 'Saudi Arabia', lat: 27.0046, lon: 49.6622 },
  { name: 'Khamis Mushait', country: 'Saudi Arabia', lat: 18.3000, lon: 42.7333 },
  { name: 'Madinah', country: 'Saudi Arabia', lat: 24.4539, lon: 39.6142 },
  { name: 'Makkah', country: 'Saudi Arabia', lat: 21.3891, lon: 39.8579 },
  { name: 'Najran', country: 'Saudi Arabia', lat: 17.4924, lon: 44.1277 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753 },
  { name: 'Tabuk', country: 'Saudi Arabia', lat: 28.3835, lon: 36.5662 },
  { name: 'Taif', country: 'Saudi Arabia', lat: 21.2703, lon: 40.4158 },
  { name: 'Yanbu', country: 'Saudi Arabia', lat: 24.0870, lon: 38.0618 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYRIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Aleppo', country: 'Syria', lat: 36.2021, lon: 37.1343 },
  { name: 'Damascus', country: 'Syria', lat: 33.5138, lon: 36.2765 },
  { name: 'Deir ez-Zor', country: 'Syria', lat: 35.3356, lon: 40.1408 },
  { name: 'Hama', country: 'Syria', lat: 35.1318, lon: 36.7515 },
  { name: 'Homs', country: 'Syria', lat: 34.7324, lon: 36.7137 },
  { name: 'Idlib', country: 'Syria', lat: 35.9306, lon: 36.6339 },
  { name: 'Latakia', country: 'Syria', lat: 35.5317, lon: 35.7918 },
  { name: 'Qamishli', country: 'Syria', lat: 37.0556, lon: 41.2235 },
  { name: 'Raqqa', country: 'Syria', lat: 35.9528, lon: 39.0086 },
  { name: 'Tartus', country: 'Syria', lat: 34.8889, lon: 35.8806 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TURKEY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Adana', country: 'Turkey', lat: 37.0000, lon: 35.3213 },
  { name: 'Ankara', country: 'Turkey', lat: 39.9334, lon: 32.8597 },
  { name: 'Antalya', country: 'Turkey', lat: 36.8969, lon: 30.7133 },
  { name: 'Balikesir', country: 'Turkey', lat: 39.6484, lon: 27.8826 },
  { name: 'Batman', country: 'Turkey', lat: 37.8812, lon: 41.1351 },
  { name: 'Bodrum', country: 'Turkey', lat: 37.0344, lon: 27.4305 },
  { name: 'Bursa', country: 'Turkey', lat: 40.1828, lon: 29.0665 },
  { name: 'Canakkale', country: 'Turkey', lat: 40.1553, lon: 26.4142 },
  { name: 'Denizli', country: 'Turkey', lat: 37.7765, lon: 29.0864 },
  { name: 'Diyarbakir', country: 'Turkey', lat: 37.9144, lon: 40.2306 },
  { name: 'Edirne', country: 'Turkey', lat: 41.6818, lon: 26.5623 },
  { name: 'Elazig', country: 'Turkey', lat: 38.6747, lon: 39.2231 },
  { name: 'Erzurum', country: 'Turkey', lat: 39.9000, lon: 41.2700 },
  { name: 'Eskisehir', country: 'Turkey', lat: 39.7767, lon: 30.5206 },
  { name: 'Gaziantep', country: 'Turkey', lat: 37.0662, lon: 37.3833 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  { name: 'Izmir', country: 'Turkey', lat: 38.4192, lon: 27.1287 },
  { name: 'Kahramanmaras', country: 'Turkey', lat: 37.5858, lon: 36.9371 },
  { name: 'Kayseri', country: 'Turkey', lat: 38.7312, lon: 35.4787 },
  { name: 'Konya', country: 'Turkey', lat: 37.8714, lon: 32.4846 },
  { name: 'Malatya', country: 'Turkey', lat: 38.3552, lon: 38.3095 },
  { name: 'Manisa', country: 'Turkey', lat: 38.6191, lon: 27.4289 },
  { name: 'Mardin', country: 'Turkey', lat: 37.3212, lon: 40.7245 },
  { name: 'Mersin', country: 'Turkey', lat: 36.8121, lon: 34.6415 },
  { name: 'Mugla', country: 'Turkey', lat: 37.2153, lon: 28.3636 },
  { name: 'Ordu', country: 'Turkey', lat: 40.9839, lon: 37.8764 },
  { name: 'Sakarya', country: 'Turkey', lat: 40.6940, lon: 30.4358 },
  { name: 'Samsun', country: 'Turkey', lat: 41.2867, lon: 36.3300 },
  { name: 'Sanliurfa', country: 'Turkey', lat: 37.1591, lon: 38.7969 },
  { name: 'Sivas', country: 'Turkey', lat: 39.7477, lon: 37.0179 },
  { name: 'Trabzon', country: 'Turkey', lat: 41.0027, lon: 39.7168 },
  { name: 'Van', country: 'Turkey', lat: 38.4891, lon: 43.3831 },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNITED ARAB EMIRATES
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.4539, lon: 54.3773 },
  { name: 'Ajman', country: 'United Arab Emirates', lat: 25.4052, lon: 55.5136 },
  { name: 'Al Ain', country: 'United Arab Emirates', lat: 24.1916, lon: 55.7606 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Fujairah', country: 'United Arab Emirates', lat: 25.1164, lon: 56.3414 },
  { name: 'Ras Al Khaimah', country: 'United Arab Emirates', lat: 25.7895, lon: 55.9432 },
  { name: 'Sharjah', country: 'United Arab Emirates', lat: 25.3463, lon: 55.4209 },
  { name: 'Umm Al Quwain', country: 'United Arab Emirates', lat: 25.5647, lon: 55.5533 },

  // ═══════════════════════════════════════════════════════════════════════════
  // YEMEN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Aden', country: 'Yemen', lat: 12.7855, lon: 45.0187 },
  { name: 'Al Hudaydah', country: 'Yemen', lat: 14.7979, lon: 42.9540 },
  { name: 'Al Mukalla', country: 'Yemen', lat: 14.5425, lon: 49.1256 },
  { name: 'Dhamar', country: 'Yemen', lat: 14.5428, lon: 44.4050 },
  { name: 'Ibb', country: 'Yemen', lat: 13.9667, lon: 44.1833 },
  { name: 'Sanaa', country: 'Yemen', lat: 15.3694, lon: 44.1910 },
  { name: 'Taiz', country: 'Yemen', lat: 13.5789, lon: 44.0219 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  //                         O C E A N I A
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // AUSTRALIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Adelaide', country: 'Australia', region: 'South Australia', lat: -34.9285, lon: 138.6007 },
  { name: 'Armidale', country: 'Australia', region: 'New South Wales', lat: -30.5150, lon: 151.6710 },
  { name: 'Bathurst', country: 'Australia', region: 'New South Wales', lat: -33.4194, lon: 149.5788 },
  { name: 'Brisbane', country: 'Australia', region: 'Queensland', lat: -27.4698, lon: 153.0251 },
  { name: 'Caboolture', country: 'Australia', region: 'Queensland', lat: -27.0847, lon: 152.9511 },
  { name: 'Caloundra', country: 'Australia', region: 'Queensland', lat: -26.7980, lon: 153.1256 },
  { name: 'Canberra', country: 'Australia', region: 'ACT', lat: -35.2809, lon: 149.1300 },
  { name: 'Cessnock', country: 'Australia', region: 'New South Wales', lat: -32.8322, lon: 151.3561 },
  { name: 'Cranbourne', country: 'Australia', region: 'Victoria', lat: -38.0996, lon: 145.2833 },
  { name: 'Darwin', country: 'Australia', region: 'Northern Territory', lat: -12.4634, lon: 130.8456 },
  { name: 'Frankston', country: 'Australia', region: 'Victoria', lat: -38.1433, lon: 145.1228 },
  { name: 'Gold Coast', country: 'Australia', region: 'Queensland', lat: -28.0167, lon: 153.4000 },
  { name: 'Gosford', country: 'Australia', region: 'New South Wales', lat: -33.4252, lon: 151.3412 },
  { name: 'Hobart', country: 'Australia', region: 'Tasmania', lat: -42.8821, lon: 147.3272 },
  { name: 'Ipswich', country: 'Australia', region: 'Queensland', lat: -27.6167, lon: 152.7667 },
  { name: 'Lismore', country: 'Australia', region: 'New South Wales', lat: -28.8132, lon: 153.2758 },
  { name: 'Maitland', country: 'Australia', region: 'New South Wales', lat: -32.7330, lon: 151.5600 },
  { name: 'Melbourne', country: 'Australia', region: 'Victoria', lat: -37.8136, lon: 144.9631 },
  { name: 'Mildura', country: 'Australia', region: 'Victoria', lat: -34.1853, lon: 142.1625 },
  { name: 'Noosa', country: 'Australia', region: 'Queensland', lat: -26.3690, lon: 153.0886 },
  { name: 'Orange', country: 'Australia', region: 'New South Wales', lat: -33.2836, lon: 149.1013 },
  { name: 'Penrith', country: 'Australia', region: 'New South Wales', lat: -33.7507, lon: 150.6942 },
  { name: 'Perth', country: 'Australia', region: 'Western Australia', lat: -31.9505, lon: 115.8605 },
  { name: 'Springwood', country: 'Australia', region: 'Queensland', lat: -27.6047, lon: 153.1285 },
  { name: 'Sunbury', country: 'Australia', region: 'Victoria', lat: -37.5776, lon: 144.7261 },
  { name: 'Sydney', country: 'Australia', region: 'New South Wales', lat: -33.8688, lon: 151.2093 },
  { name: 'Traralgon', country: 'Australia', region: 'Victoria', lat: -38.1953, lon: 146.5413 },
  { name: 'Warrnambool', country: 'Australia', region: 'Victoria', lat: -38.3816, lon: 142.4875 },

  // ═══════════════════════════════════════════════════════════════════════════
  // FIJI
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ba', country: 'Fiji', lat: -17.5333, lon: 177.6833 },
  { name: 'Labasa', country: 'Fiji', lat: -16.4333, lon: 179.3667 },
  { name: 'Lautoka', country: 'Fiji', lat: -17.6167, lon: 177.4500 },
  { name: 'Sigatoka', country: 'Fiji', lat: -18.1500, lon: 177.5167 },
  { name: 'Suva', country: 'Fiji', lat: -18.1416, lon: 178.4419 },

  // ═══════════════════════════════════════════════════════════════════════════
  // KIRIBATI
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Tarawa', country: 'Kiribati', lat: 1.4518, lon: 173.0145 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARSHALL ISLANDS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Majuro', country: 'Marshall Islands', lat: 7.0897, lon: 171.3803 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MICRONESIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Palikir', country: 'Micronesia', lat: 6.9147, lon: 158.1611 },
  { name: 'Weno', country: 'Micronesia', lat: 7.4467, lon: 151.8400 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NAURU
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Yaren', country: 'Nauru', lat: -0.5477, lon: 166.9209 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW CALEDONIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Noumea', country: 'New Caledonia', lat: -22.2558, lon: 166.4505 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW ZEALAND
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633 },
  { name: 'Christchurch', country: 'New Zealand', lat: -43.5321, lon: 172.6362 },
  { name: 'Dunedin', country: 'New Zealand', lat: -45.8788, lon: 170.5028 },
  { name: 'Gisborne', country: 'New Zealand', lat: -38.6623, lon: 178.0176 },
  { name: 'Hamilton', country: 'New Zealand', lat: -37.7870, lon: 175.2793 },
  { name: 'Hastings', country: 'New Zealand', lat: -39.6381, lon: 176.8493 },
  { name: 'Invercargill', country: 'New Zealand', lat: -46.4132, lon: 168.3538 },
  { name: 'Lower Hutt', country: 'New Zealand', lat: -41.2127, lon: 174.8997 },
  { name: 'Napier', country: 'New Zealand', lat: -39.4929, lon: 176.9120 },
  { name: 'Nelson', country: 'New Zealand', lat: -41.2706, lon: 173.2840 },
  { name: 'New Plymouth', country: 'New Zealand', lat: -39.0556, lon: 174.0752 },
  { name: 'Palmerston North', country: 'New Zealand', lat: -40.3523, lon: 175.6082 },
  { name: 'Queenstown', country: 'New Zealand', lat: -45.0312, lon: 168.6626 },
  { name: 'Rotorua', country: 'New Zealand', lat: -38.1368, lon: 176.2497 },
  { name: 'Tauranga', country: 'New Zealand', lat: -37.6878, lon: 176.1651 },
  { name: 'Timaru', country: 'New Zealand', lat: -44.3960, lon: 171.2547 },
  { name: 'Upper Hutt', country: 'New Zealand', lat: -41.1244, lon: 175.0706 },
  { name: 'Wanganui', country: 'New Zealand', lat: -39.9333, lon: 175.0500 },
  { name: 'Wellington', country: 'New Zealand', lat: -41.2865, lon: 174.7762 },
  { name: 'Whangarei', country: 'New Zealand', lat: -35.7251, lon: 174.3237 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PALAU
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ngerulmud', country: 'Palau', lat: 7.5006, lon: 134.6244 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAPUA NEW GUINEA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Goroka', country: 'Papua New Guinea', lat: -6.0836, lon: 145.3869 },
  { name: 'Lae', country: 'Papua New Guinea', lat: -6.7333, lon: 147.0000 },
  { name: 'Madang', country: 'Papua New Guinea', lat: -5.2167, lon: 145.7833 },
  { name: 'Mount Hagen', country: 'Papua New Guinea', lat: -5.8569, lon: 144.2148 },
  { name: 'Port Moresby', country: 'Papua New Guinea', lat: -9.4438, lon: 147.1803 },
  { name: 'Rabaul', country: 'Papua New Guinea', lat: -4.2000, lon: 152.1833 },
  { name: 'Wewak', country: 'Papua New Guinea', lat: -3.7333, lon: 143.8333 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAMOA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Apia', country: 'Samoa', lat: -13.8333, lon: -171.7500 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOLOMON ISLANDS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Honiara', country: 'Solomon Islands', lat: -9.4456, lon: 159.9729 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TONGA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Nukualofa', country: 'Tonga', lat: -21.2114, lon: -175.1494 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TUVALU
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Funafuti', country: 'Tuvalu', lat: -8.5211, lon: 179.1983 },

  // ═══════════════════════════════════════════════════════════════════════════
  // VANUATU
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Luganville', country: 'Vanuatu', lat: -15.5167, lon: 167.1667 },
  { name: 'Port Vila', country: 'Vanuatu', lat: -17.7334, lon: 168.3273 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  //     C A R I B B E A N   &   O T H E R   I S L A N D   N A T I O N S
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // BAHAMAS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Nassau', country: 'Bahamas', lat: 25.0343, lon: -77.3963 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BARBADOS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Holetown', country: 'Barbados', lat: 13.1856, lon: -59.6378 },
  { name: 'Oistins', country: 'Barbados', lat: 13.0667, lon: -59.5333 },
  { name: 'Speightstown', country: 'Barbados', lat: 13.2500, lon: -59.6500 },

  // ═══════════════════════════════════════════════════════════════════════════
  // COSTA RICA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Alajuela', country: 'Costa Rica', lat: 10.0163, lon: -84.2116 },
  { name: 'Cartago', country: 'Costa Rica', lat: 9.8641, lon: -83.9196 },
  { name: 'Heredia', country: 'Costa Rica', lat: 10.0024, lon: -84.1165 },
  { name: 'Limon', country: 'Costa Rica', lat: 9.9907, lon: -83.0360 },
  { name: 'Puntarenas', country: 'Costa Rica', lat: 9.9762, lon: -84.8384 },
  { name: 'San Jose', country: 'Costa Rica', lat: 9.9281, lon: -84.0907 },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMINICA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Portsmouth', country: 'Dominica', lat: 15.5833, lon: -61.4500 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRENADA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Gouyave', country: 'Grenada', lat: 12.1647, lon: -61.7303 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ICELAND
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426 },
  { name: 'Kopavogur', country: 'Iceland', lat: 64.1105, lon: -21.9131 },
  { name: 'Hafnarfjordur', country: 'Iceland', lat: 64.0671, lon: -21.9543 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAINT KITTS AND NEVIS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Basseterre', country: 'Saint Kitts and Nevis', lat: 17.2948, lon: -62.7261 },
  { name: 'Charlestown', country: 'Saint Kitts and Nevis', lat: 17.1361, lon: -62.6200 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAINT LUCIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Castries', country: 'Saint Lucia', lat: 14.0101, lon: -60.9875 },
  { name: 'Soufriere', country: 'Saint Lucia', lat: 13.8564, lon: -61.0564 },
  { name: 'Vieux Fort', country: 'Saint Lucia', lat: 13.7167, lon: -60.9500 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAINT VINCENT AND THE GRENADINES
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Kingstown', country: 'Saint Vincent and the Grenadines', lat: 13.1600, lon: -61.2248 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SEYCHELLES
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Victoria', country: 'Seychelles', lat: -4.6191, lon: 55.4513 },

  // ═══════════════════════════════════════════════════════════════════════════
  // REUNION
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Saint-Denis', country: 'Reunion', lat: -20.8823, lon: 55.4504 },
  { name: 'Saint-Pierre', country: 'Reunion', lat: -21.3393, lon: 55.4781 },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRENCH POLYNESIA
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Papeete', country: 'French Polynesia', lat: -17.5516, lon: -149.5585 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GUADELOUPE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Basse-Terre', country: 'Guadeloupe', lat: 15.9979, lon: -61.7253 },
  { name: 'Pointe-a-Pitre', country: 'Guadeloupe', lat: 16.2411, lon: -61.5331 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARTINIQUE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Fort-de-France', country: 'Martinique', lat: 14.6161, lon: -61.0588 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CAYMAN ISLANDS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'West Bay', country: 'Cayman Islands', lat: 19.3715, lon: -81.4029 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TURKS AND CAICOS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Cockburn Town', country: 'Turks and Caicos', lat: 21.4612, lon: -71.1419 },
  { name: 'Providenciales', country: 'Turks and Caicos', lat: 21.7736, lon: -72.2683 },

  // ═══════════════════════════════════════════════════════════════════════════
  // US VIRGIN ISLANDS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Charlotte Amalie', country: 'US Virgin Islands', lat: 18.3358, lon: -64.9307 },
  { name: 'Christiansted', country: 'US Virgin Islands', lat: 17.7469, lon: -64.7030 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  //   A D D I T I O N A L   C I T I E S   (filling gaps)
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // INDIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Alappuzha', country: 'India', region: 'Kerala', lat: 9.4981, lon: 76.3388 },
  { name: 'Anand', country: 'India', region: 'Gujarat', lat: 22.5645, lon: 72.9289 },
  { name: 'Bathinda', country: 'India', region: 'Punjab', lat: 30.2110, lon: 74.9455 },
  { name: 'Bellary', country: 'India', region: 'Karnataka', lat: 15.1394, lon: 76.9214 },
  { name: 'Bhagalpur', country: 'India', region: 'Bihar', lat: 25.2425, lon: 86.9842 },
  { name: 'Bhubaneswar', country: 'India', region: 'Odisha', lat: 20.2961, lon: 85.8245 },
  { name: 'Bilaspur', country: 'India', region: 'Chhattisgarh', lat: 22.0796, lon: 82.1391 },
  { name: 'Bokaro', country: 'India', region: 'Jharkhand', lat: 23.6693, lon: 86.1511 },
  { name: 'Davangere', country: 'India', region: 'Karnataka', lat: 14.4644, lon: 75.9218 },
  { name: 'Erode', country: 'India', region: 'Tamil Nadu', lat: 11.3410, lon: 77.7172 },
  { name: 'Gaya', country: 'India', region: 'Bihar', lat: 24.7955, lon: 84.9994 },
  { name: 'Gulbarga', country: 'India', region: 'Karnataka', lat: 17.3297, lon: 76.8343 },
  { name: 'Haridwar', country: 'India', region: 'Uttarakhand', lat: 29.9457, lon: 78.1642 },
  { name: 'Hisar', country: 'India', region: 'Haryana', lat: 29.1492, lon: 75.7217 },
  { name: 'Hooghly', country: 'India', region: 'West Bengal', lat: 22.9088, lon: 88.3970 },
  { name: 'Howrah', country: 'India', region: 'West Bengal', lat: 22.5958, lon: 88.2636 },
  { name: 'Jammu', country: 'India', region: 'Jammu and Kashmir', lat: 32.7266, lon: 74.8570 },
  { name: 'Junagadh', country: 'India', region: 'Gujarat', lat: 21.5222, lon: 70.4579 },
  { name: 'Kakinada', country: 'India', region: 'Andhra Pradesh', lat: 16.9891, lon: 82.2475 },
  { name: 'Karnal', country: 'India', region: 'Haryana', lat: 29.6857, lon: 76.9905 },
  { name: 'Kurnool', country: 'India', region: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
  { name: 'Latur', country: 'India', region: 'Maharashtra', lat: 18.3968, lon: 76.5773 },
  { name: 'Mathura', country: 'India', region: 'Uttar Pradesh', lat: 27.4924, lon: 77.6737 },
  { name: 'Muzaffarpur', country: 'India', region: 'Bihar', lat: 26.1209, lon: 85.3647 },
  { name: 'Nanded', country: 'India', region: 'Maharashtra', lat: 19.1383, lon: 77.3210 },
  { name: 'Panipat', country: 'India', region: 'Haryana', lat: 29.3909, lon: 76.9635 },
  { name: 'Patiala', country: 'India', region: 'Punjab', lat: 30.3340, lon: 76.3869 },
  { name: 'Rajahmundry', country: 'India', region: 'Andhra Pradesh', lat: 17.0005, lon: 81.8040 },
  { name: 'Rohtak', country: 'India', region: 'Haryana', lat: 28.8955, lon: 76.5796 },
  { name: 'Rourkela', country: 'India', region: 'Odisha', lat: 22.2604, lon: 84.8536 },
  { name: 'Saharanpur', country: 'India', region: 'Uttar Pradesh', lat: 29.9680, lon: 77.5460 },
  { name: 'Sangli', country: 'India', region: 'Maharashtra', lat: 16.8524, lon: 74.5815 },
  { name: 'Thanjavur', country: 'India', region: 'Tamil Nadu', lat: 10.7870, lon: 79.1378 },
  { name: 'Thrissur', country: 'India', region: 'Kerala', lat: 10.5276, lon: 76.2144 },
  { name: 'Tirunelveli', country: 'India', region: 'Tamil Nadu', lat: 8.7139, lon: 77.7567 },
  { name: 'Tumkur', country: 'India', region: 'Karnataka', lat: 13.3392, lon: 77.1017 },
  { name: 'Ujjain', country: 'India', region: 'Madhya Pradesh', lat: 23.1765, lon: 75.7885 },
  { name: 'Vellore', country: 'India', region: 'Tamil Nadu', lat: 12.9165, lon: 79.1325 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHINA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bengbu', country: 'China', region: 'Anhui', lat: 32.9406, lon: 117.3833 },
  { name: 'Dandong', country: 'China', region: 'Liaoning', lat: 40.1290, lon: 124.3947 },
  { name: 'Daqing', country: 'China', region: 'Heilongjiang', lat: 46.5880, lon: 125.1033 },
  { name: 'Handan', country: 'China', region: 'Hebei', lat: 36.6258, lon: 114.5391 },
  { name: 'Huzhou', country: 'China', region: 'Zhejiang', lat: 30.8721, lon: 120.0935 },
  { name: 'Jiaxing', country: 'China', region: 'Zhejiang', lat: 30.7522, lon: 120.7597 },
  { name: 'Langfang', country: 'China', region: 'Hebei', lat: 39.5380, lon: 116.6834 },
  { name: 'Lianyungang', country: 'China', region: 'Jiangsu', lat: 34.5970, lon: 119.2216 },
  { name: 'Linyi', country: 'China', region: 'Shandong', lat: 35.1041, lon: 118.3560 },
  { name: 'Mudanjiang', country: 'China', region: 'Heilongjiang', lat: 44.5833, lon: 129.5833 },
  { name: 'Quanzhou', country: 'China', region: 'Fujian', lat: 24.8740, lon: 118.6757 },
  { name: 'Taizhou', country: 'China', region: 'Zhejiang', lat: 28.6583, lon: 121.4221 },
  { name: 'Wuhu', country: 'China', region: 'Anhui', lat: 31.3340, lon: 118.3622 },
  { name: 'Yangzhou', country: 'China', region: 'Jiangsu', lat: 32.3912, lon: 119.4363 },
  { name: 'Yancheng', country: 'China', region: 'Jiangsu', lat: 33.3474, lon: 120.1634 },
  { name: 'Yichang', country: 'China', region: 'Hubei', lat: 30.6917, lon: 111.2864 },
  { name: 'Zhanjiang', country: 'China', region: 'Guangdong', lat: 21.2707, lon: 110.3594 },
  { name: 'Zhongshan', country: 'China', region: 'Guangdong', lat: 22.5176, lon: 113.3926 },
  { name: 'Zibo', country: 'China', region: 'Shandong', lat: 36.8131, lon: 118.0548 },
  { name: 'Zunyi', country: 'China', region: 'Guizhou', lat: 27.7254, lon: 106.9273 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIGERIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Agege', country: 'Nigeria', region: 'Lagos', lat: 6.6200, lon: 3.3280 },
  { name: 'Badagry', country: 'Nigeria', region: 'Lagos', lat: 6.4181, lon: 2.8814 },
  { name: 'Birnin Kebbi', country: 'Nigeria', region: 'Kebbi', lat: 12.4539, lon: 4.1975 },
  { name: 'Ede', country: 'Nigeria', region: 'Osun', lat: 7.7386, lon: 4.4369 },
  { name: 'Effon-Alaiye', country: 'Nigeria', region: 'Osun', lat: 7.6500, lon: 4.9167 },
  { name: 'Ejigbo', country: 'Nigeria', region: 'Osun', lat: 7.9000, lon: 4.3167 },
  { name: 'Epe', country: 'Nigeria', region: 'Lagos', lat: 6.5833, lon: 3.9833 },
  { name: 'Ilesa', country: 'Nigeria', region: 'Osun', lat: 7.6167, lon: 4.7333 },
  { name: 'Ilobu', country: 'Nigeria', region: 'Osun', lat: 7.8333, lon: 4.4833 },
  { name: 'Ife', country: 'Nigeria', region: 'Osun', lat: 7.4667, lon: 4.5667 },
  { name: 'Mubi', country: 'Nigeria', region: 'Adamawa', lat: 10.2683, lon: 13.2667 },
  { name: 'Offa', country: 'Nigeria', region: 'Kwara', lat: 8.1500, lon: 4.7167 },
  { name: 'Ondo', country: 'Nigeria', region: 'Ondo', lat: 7.0933, lon: 4.8358 },
  { name: 'Osogbo', country: 'Nigeria', region: 'Osun', lat: 7.7827, lon: 4.5418 },
  { name: 'Ota', country: 'Nigeria', region: 'Ogun', lat: 6.6833, lon: 3.2333 },
  { name: 'Sagamu', country: 'Nigeria', region: 'Ogun', lat: 6.8333, lon: 3.6500 },
  { name: 'Saki', country: 'Nigeria', region: 'Oyo', lat: 8.6667, lon: 3.3833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUTH AFRICA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Cape Town', country: 'South Africa', region: 'Western Cape', lat: -33.9249, lon: 18.4241 },
  { name: 'Ladysmith', country: 'South Africa', region: 'KwaZulu-Natal', lat: -28.5572, lon: 29.7772 },
  { name: 'Lichtenburg', country: 'South Africa', region: 'North West', lat: -26.1500, lon: 26.1500 },
  { name: 'Mahikeng', country: 'South Africa', region: 'North West', lat: -25.8652, lon: 25.6417 },
  { name: 'Mokopane', country: 'South Africa', region: 'Limpopo', lat: -24.1955, lon: 29.0107 },
  { name: 'Musina', country: 'South Africa', region: 'Limpopo', lat: -22.3384, lon: 30.0442 },
  { name: 'Phalaborwa', country: 'South Africa', region: 'Limpopo', lat: -23.9431, lon: 31.1414 },
  { name: 'Richards Bay', country: 'South Africa', region: 'KwaZulu-Natal', lat: -28.7808, lon: 32.0383 },
  { name: 'Springbok', country: 'South Africa', region: 'Northern Cape', lat: -29.6714, lon: 17.8828 },
  { name: 'Thohoyandou', country: 'South Africa', region: 'Limpopo', lat: -22.9500, lon: 30.4833 },
  { name: 'Tzaneen', country: 'South Africa', region: 'Limpopo', lat: -23.8337, lon: 30.1632 },
  { name: 'Uitenhage', country: 'South Africa', region: 'Eastern Cape', lat: -33.7675, lon: 25.3950 },

  // ═══════════════════════════════════════════════════════════════════════════
  // INDONESIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bengkulu', country: 'Indonesia', lat: -3.8008, lon: 102.2655 },
  { name: 'Cilegon', country: 'Indonesia', lat: -6.0167, lon: 106.0500 },
  { name: 'Gorontalo', country: 'Indonesia', lat: 0.5333, lon: 123.0667 },
  { name: 'Kediri', country: 'Indonesia', lat: -7.8167, lon: 112.0167 },
  { name: 'Madiun', country: 'Indonesia', lat: -7.6298, lon: 111.5230 },
  { name: 'Pangkal Pinang', country: 'Indonesia', lat: -2.1333, lon: 106.1167 },
  { name: 'Probolinggo', country: 'Indonesia', lat: -7.7543, lon: 113.2159 },
  { name: 'Serang', country: 'Indonesia', lat: -6.1200, lon: 106.1503 },
  { name: 'Sukabumi', country: 'Indonesia', lat: -6.9204, lon: 106.9269 },
  { name: 'Tegal', country: 'Indonesia', lat: -6.8797, lon: 109.1426 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHILIPPINES (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Batangas City', country: 'Philippines', lat: 13.7567, lon: 121.0584 },
  { name: 'Cabanatuan', country: 'Philippines', lat: 15.4883, lon: 120.9697 },
  { name: 'Calamba', country: 'Philippines', lat: 14.2117, lon: 121.1653 },
  { name: 'Lipa', country: 'Philippines', lat: 13.9411, lon: 121.1625 },
  { name: 'Malolos', country: 'Philippines', lat: 14.8433, lon: 120.8114 },
  { name: 'Marikina', country: 'Philippines', lat: 14.6507, lon: 121.1029 },
  { name: 'Muntinlupa', country: 'Philippines', lat: 14.4081, lon: 121.0415 },
  { name: 'San Jose del Monte', country: 'Philippines', lat: 14.8139, lon: 121.0453 },
  { name: 'San Pablo', country: 'Philippines', lat: 14.0685, lon: 121.3254 },
  { name: 'Santa Rosa', country: 'Philippines', lat: 14.3128, lon: 121.1113 },
  { name: 'Tarlac City', country: 'Philippines', lat: 15.4405, lon: 120.5930 },
  { name: 'Tuguegarao', country: 'Philippines', lat: 17.6132, lon: 121.7270 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BRAZIL (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Araraquara', country: 'Brazil', region: 'Sao Paulo', lat: -21.7946, lon: -48.1756 },
  { name: 'Chapeco', country: 'Brazil', region: 'Santa Catarina', lat: -27.1006, lon: -52.6156 },
  { name: 'Divinopolis', country: 'Brazil', region: 'Minas Gerais', lat: -20.1389, lon: -44.8842 },
  { name: 'Dourados', country: 'Brazil', region: 'Mato Grosso do Sul', lat: -22.2211, lon: -54.8056 },
  { name: 'Governador Valadares', country: 'Brazil', region: 'Minas Gerais', lat: -18.8509, lon: -41.9489 },
  { name: 'Ilheus', country: 'Brazil', region: 'Bahia', lat: -14.7889, lon: -39.0494 },
  { name: 'Itabuna', country: 'Brazil', region: 'Bahia', lat: -14.7856, lon: -39.2803 },
  { name: 'Limeira', country: 'Brazil', region: 'Sao Paulo', lat: -22.5642, lon: -47.4017 },
  { name: 'Maraba', country: 'Brazil', region: 'Para', lat: -5.3686, lon: -49.1178 },
  { name: 'Mossoro', country: 'Brazil', region: 'Rio Grande do Norte', lat: -5.1878, lon: -37.3444 },
  { name: 'Passo Fundo', country: 'Brazil', region: 'Rio Grande do Sul', lat: -28.2626, lon: -52.4066 },
  { name: 'Petrolina', country: 'Brazil', region: 'Pernambuco', lat: -9.3891, lon: -40.5028 },
  { name: 'Ponta Grossa', country: 'Brazil', region: 'Parana', lat: -25.0994, lon: -50.1583 },
  { name: 'Presidente Prudente', country: 'Brazil', region: 'Sao Paulo', lat: -22.1256, lon: -51.3889 },
  { name: 'Rio Claro', country: 'Brazil', region: 'Sao Paulo', lat: -22.4149, lon: -47.5614 },
  { name: 'Rondonopolis', country: 'Brazil', region: 'Mato Grosso', lat: -16.4703, lon: -54.6353 },
  { name: 'Santarem', country: 'Brazil', region: 'Para', lat: -2.4426, lon: -54.7081 },
  { name: 'Sinop', country: 'Brazil', region: 'Mato Grosso', lat: -11.8644, lon: -55.5058 },
  { name: 'Sete Lagoas', country: 'Brazil', region: 'Minas Gerais', lat: -19.4616, lon: -44.2477 },
  { name: 'Taubate', country: 'Brazil', region: 'Sao Paulo', lat: -23.0226, lon: -45.5559 },
  { name: 'Uberaba', country: 'Brazil', region: 'Minas Gerais', lat: -19.7472, lon: -47.9319 },
  { name: 'Valinhos', country: 'Brazil', region: 'Sao Paulo', lat: -22.9706, lon: -46.9958 },
  { name: 'Vitoria da Conquista', country: 'Brazil', region: 'Bahia', lat: -14.8619, lon: -40.8444 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEXICO (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Cabo San Lucas', country: 'Mexico', region: 'Baja California Sur', lat: 22.8905, lon: -109.9167 },
  { name: 'Coatzacoalcos', country: 'Mexico', region: 'Veracruz', lat: 18.1500, lon: -94.4333 },
  { name: 'Delicias', country: 'Mexico', region: 'Chihuahua', lat: 28.1917, lon: -105.4694 },
  { name: 'Ecatepec', country: 'Mexico', region: 'Estado de Mexico', lat: 19.6017, lon: -99.0500 },
  { name: 'Gomez Palacio', country: 'Mexico', region: 'Durango', lat: 25.5667, lon: -103.5000 },
  { name: 'Monclova', country: 'Mexico', region: 'Coahuila', lat: 26.9000, lon: -101.4167 },
  { name: 'Naucalpan', country: 'Mexico', region: 'Estado de Mexico', lat: 19.4786, lon: -99.2394 },
  { name: 'Nezahualcoyotl', country: 'Mexico', region: 'Estado de Mexico', lat: 19.4000, lon: -99.0167 },
  { name: 'Poza Rica', country: 'Mexico', region: 'Veracruz', lat: 20.5333, lon: -97.4500 },
  { name: 'San Juan del Rio', country: 'Mexico', region: 'Queretaro', lat: 20.3833, lon: -99.9833 },
  { name: 'Tlalnepantla', country: 'Mexico', region: 'Estado de Mexico', lat: 19.5369, lon: -99.1964 },
  { name: 'Tlaquepaque', country: 'Mexico', region: 'Jalisco', lat: 20.6389, lon: -103.3125 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TURKEY (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Afyon', country: 'Turkey', lat: 38.7507, lon: 30.5567 },
  { name: 'Aksaray', country: 'Turkey', lat: 38.3688, lon: 34.0310 },
  { name: 'Bingol', country: 'Turkey', lat: 38.8854, lon: 40.4981 },
  { name: 'Bolu', country: 'Turkey', lat: 40.7306, lon: 31.6081 },
  { name: 'Corum', country: 'Turkey', lat: 40.5489, lon: 34.9533 },
  { name: 'Hatay', country: 'Turkey', lat: 36.2028, lon: 36.1604 },
  { name: 'Isparta', country: 'Turkey', lat: 37.7648, lon: 30.5566 },
  { name: 'Kastamonu', country: 'Turkey', lat: 41.3887, lon: 33.7827 },
  { name: 'Kirikkale', country: 'Turkey', lat: 39.8468, lon: 33.5153 },
  { name: 'Kirklareli', country: 'Turkey', lat: 41.7347, lon: 27.2253 },
  { name: 'Kocaeli', country: 'Turkey', lat: 40.7654, lon: 29.9408 },
  { name: 'Kutahya', country: 'Turkey', lat: 39.4167, lon: 29.9833 },
  { name: 'Nevsehir', country: 'Turkey', lat: 38.6250, lon: 34.7122 },
  { name: 'Nigde', country: 'Turkey', lat: 37.9667, lon: 34.6833 },
  { name: 'Rize', country: 'Turkey', lat: 41.0201, lon: 40.5234 },
  { name: 'Siirt', country: 'Turkey', lat: 37.9333, lon: 41.9500 },
  { name: 'Sinop', country: 'Turkey', lat: 42.0231, lon: 35.1531 },
  { name: 'Tokat', country: 'Turkey', lat: 40.3167, lon: 36.5500 },
  { name: 'Yozgat', country: 'Turkey', lat: 39.8181, lon: 34.8147 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAKISTAN (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bannu', country: 'Pakistan', region: 'Khyber Pakhtunkhwa', lat: 32.9889, lon: 70.6042 },
  { name: 'Chiniot', country: 'Pakistan', region: 'Punjab', lat: 31.7167, lon: 72.9833 },
  { name: 'Dera Ghazi Khan', country: 'Pakistan', region: 'Punjab', lat: 30.0489, lon: 70.6406 },
  { name: 'Dera Ismail Khan', country: 'Pakistan', region: 'Khyber Pakhtunkhwa', lat: 31.8333, lon: 70.9167 },
  { name: 'Hafizabad', country: 'Pakistan', region: 'Punjab', lat: 32.0711, lon: 73.6883 },
  { name: 'Jhelum', country: 'Pakistan', region: 'Punjab', lat: 32.9333, lon: 73.7333 },
  { name: 'Khairpur', country: 'Pakistan', region: 'Sindh', lat: 27.5295, lon: 68.7592 },
  { name: 'Kohat', country: 'Pakistan', region: 'Khyber Pakhtunkhwa', lat: 33.5869, lon: 71.4414 },
  { name: 'Mandi Bahauddin', country: 'Pakistan', region: 'Punjab', lat: 32.5861, lon: 73.4917 },
  { name: 'Swabi', country: 'Pakistan', region: 'Khyber Pakhtunkhwa', lat: 34.1200, lon: 72.4700 },
  { name: 'Turbat', country: 'Pakistan', region: 'Balochistan', lat: 26.0028, lon: 63.0419 },
  { name: 'Wah Cantt', country: 'Pakistan', region: 'Punjab', lat: 33.7700, lon: 72.7300 },

  // ═══════════════════════════════════════════════════════════════════════════
  // KENYA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bungoma', country: 'Kenya', lat: 0.5635, lon: 34.5607 },
  { name: 'Isiolo', country: 'Kenya', lat: 0.3556, lon: 37.5833 },
  { name: 'Kapenguria', country: 'Kenya', lat: 1.2389, lon: 35.1111 },
  { name: 'Lodwar', country: 'Kenya', lat: 3.1167, lon: 35.6000 },
  { name: 'Migori', country: 'Kenya', lat: -1.0634, lon: 34.4731 },
  { name: 'Narok', country: 'Kenya', lat: -1.0833, lon: 35.8667 },
  { name: 'Voi', country: 'Kenya', lat: -3.3936, lon: 38.5561 },
  { name: 'Wajir', country: 'Kenya', lat: 1.7471, lon: 40.0573 },

  // ═══════════════════════════════════════════════════════════════════════════
  // IRAN (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Babol', country: 'Iran', lat: 36.5514, lon: 52.6794 },
  { name: 'Bojnurd', country: 'Iran', lat: 37.4747, lon: 57.3317 },
  { name: 'Eslamshahr', country: 'Iran', lat: 35.5517, lon: 51.2350 },
  { name: 'Kashan', country: 'Iran', lat: 33.9850, lon: 51.4431 },
  { name: 'Khoy', country: 'Iran', lat: 38.5500, lon: 44.9500 },
  { name: 'Qazvin', country: 'Iran', lat: 36.2688, lon: 50.0041 },
  { name: 'Sabzevar', country: 'Iran', lat: 36.2126, lon: 57.6819 },
  { name: 'Shahroud', country: 'Iran', lat: 36.4181, lon: 54.9764 },
  { name: 'Yasuj', country: 'Iran', lat: 30.6680, lon: 51.5880 },

  // ═══════════════════════════════════════════════════════════════════════════
  // COLOMBIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Apartado', country: 'Colombia', lat: 7.8833, lon: -76.6333 },
  { name: 'Barrancabermeja', country: 'Colombia', lat: 7.0653, lon: -73.8547 },
  { name: 'Dosquebradas', country: 'Colombia', lat: 4.8389, lon: -75.6722 },
  { name: 'Duitama', country: 'Colombia', lat: 5.8267, lon: -73.0333 },
  { name: 'Girardot', country: 'Colombia', lat: 4.3000, lon: -74.8000 },
  { name: 'Palmira', country: 'Colombia', lat: 3.5394, lon: -76.3036 },
  { name: 'Rionegro', country: 'Colombia', lat: 6.1500, lon: -75.3833 },
  { name: 'Sogamoso', country: 'Colombia', lat: 5.7167, lon: -72.9333 },
  { name: 'Tulua', country: 'Colombia', lat: 4.0833, lon: -76.2000 },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERU (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Cerro de Pasco', country: 'Peru', lat: -10.6868, lon: -76.2625 },
  { name: 'Chincha Alta', country: 'Peru', lat: -13.4608, lon: -76.1319 },
  { name: 'Huanuco', country: 'Peru', lat: -9.9306, lon: -76.2422 },
  { name: 'Moyobamba', country: 'Peru', lat: -6.0333, lon: -76.9667 },
  { name: 'Tarapoto', country: 'Peru', lat: -6.4833, lon: -76.3667 },
  { name: 'Tingo Maria', country: 'Peru', lat: -9.2958, lon: -75.9975 },
  { name: 'Tumbes', country: 'Peru', lat: -3.5669, lon: -80.4515 },

  // ═══════════════════════════════════════════════════════════════════════════
  // UK (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Basingstoke', country: 'United Kingdom', region: 'England', lat: 51.2667, lon: -1.0875 },
  { name: 'Colchester', country: 'United Kingdom', region: 'England', lat: 51.8959, lon: 0.8919 },
  { name: 'Crawley', country: 'United Kingdom', region: 'England', lat: 51.1092, lon: -0.1872 },
  { name: 'Eastbourne', country: 'United Kingdom', region: 'England', lat: 50.7687, lon: 0.2906 },
  { name: 'Guildford', country: 'United Kingdom', region: 'England', lat: 51.2362, lon: -0.5704 },
  { name: 'Harrogate', country: 'United Kingdom', region: 'England', lat: 53.9921, lon: -1.5418 },
  { name: 'Maidstone', country: 'United Kingdom', region: 'England', lat: 51.2724, lon: 0.5220 },
  { name: 'Slough', country: 'United Kingdom', region: 'England', lat: 51.5105, lon: -0.5950 },
  { name: 'Stafford', country: 'United Kingdom', region: 'England', lat: 52.8062, lon: -2.1171 },
  { name: 'Stirling', country: 'United Kingdom', region: 'Scotland', lat: 56.1166, lon: -3.9369 },
  { name: 'Telford', country: 'United Kingdom', region: 'England', lat: 52.6766, lon: -2.4469 },
  { name: 'Warrington', country: 'United Kingdom', region: 'England', lat: 53.3900, lon: -2.5970 },
  { name: 'Wigan', country: 'United Kingdom', region: 'England', lat: 53.5448, lon: -2.6318 },

  // ═══════════════════════════════════════════════════════════════════════════
  // GERMANY (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Cottbus', country: 'Germany', region: 'Brandenburg', lat: 51.7563, lon: 14.3329 },
  { name: 'Flensburg', country: 'Germany', region: 'Schleswig-Holstein', lat: 54.7937, lon: 9.4469 },
  { name: 'Giessen', country: 'Germany', region: 'Hessen', lat: 50.5840, lon: 8.6784 },
  { name: 'Hildesheim', country: 'Germany', region: 'Niedersachsen', lat: 52.1508, lon: 9.9508 },
  { name: 'Ludwigshafen', country: 'Germany', region: 'Rheinland-Pfalz', lat: 49.4741, lon: 8.4333 },
  { name: 'Pforzheim', country: 'Germany', region: 'Baden-Wurttemberg', lat: 48.8922, lon: 8.6947 },
  { name: 'Recklinghausen', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.6141, lon: 7.1981 },
  { name: 'Remscheid', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.1789, lon: 7.1897 },
  { name: 'Siegen', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 50.8748, lon: 8.0243 },
  { name: 'Solingen', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.1652, lon: 7.0671 },
  { name: 'Tübingen', country: 'Germany', region: 'Baden-Wurttemberg', lat: 48.5216, lon: 9.0576 },
  { name: 'Witten', country: 'Germany', region: 'Nordrhein-Westfalen', lat: 51.4435, lon: 7.3450 },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRANCE (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Argenteuil', country: 'France', region: 'Ile-de-France', lat: 48.9472, lon: 2.2467 },
  { name: 'Calais', country: 'France', region: 'Hauts-de-France', lat: 50.9513, lon: 1.8587 },
  { name: 'Limoges', country: 'France', region: 'Nouvelle-Aquitaine', lat: 45.8315, lon: 1.2578 },
  { name: 'Montreuil', country: 'France', region: 'Ile-de-France', lat: 48.8635, lon: 2.4486 },
  { name: 'Saint-Denis', country: 'France', region: 'Ile-de-France', lat: 48.9362, lon: 2.3574 },
  { name: 'Tourcoing', country: 'France', region: 'Hauts-de-France', lat: 50.7233, lon: 3.1592 },
  { name: 'Villeurbanne', country: 'France', region: 'Auvergne-Rhone-Alpes', lat: 45.7667, lon: 4.8792 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ITALY (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ferrara', country: 'Italy', lat: 44.8381, lon: 11.6197 },
  { name: 'Forli', country: 'Italy', lat: 44.2227, lon: 12.0407 },
  { name: 'Latina', country: 'Italy', lat: 41.4676, lon: 12.9037 },
  { name: 'Monza', country: 'Italy', lat: 45.5845, lon: 9.2744 },
  { name: 'Novara', country: 'Italy', lat: 45.4469, lon: 8.6217 },
  { name: 'Prato', country: 'Italy', lat: 43.8777, lon: 11.1024 },
  { name: 'Ravenna', country: 'Italy', lat: 44.4184, lon: 12.2035 },
  { name: 'Terni', country: 'Italy', lat: 42.5636, lon: 12.6426 },
  { name: 'Trento', country: 'Italy', lat: 46.0748, lon: 11.1217 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPAIN (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Albacete', country: 'Spain', lat: 38.9943, lon: -1.8564 },
  { name: 'Almeria', country: 'Spain', lat: 36.8340, lon: -2.4637 },
  { name: 'Burgos', country: 'Spain', lat: 42.3439, lon: -3.6969 },
  { name: 'Castellon', country: 'Spain', lat: 39.9864, lon: -0.0513 },
  { name: 'Ciudad Real', country: 'Spain', lat: 38.9848, lon: -3.9274 },
  { name: 'Huelva', country: 'Spain', lat: 37.2614, lon: -6.9447 },
  { name: 'Jaen', country: 'Spain', lat: 37.7796, lon: -3.7849 },
  { name: 'Lleida', country: 'Spain', lat: 41.6176, lon: 0.6200 },
  { name: 'Logrono', country: 'Spain', lat: 42.4650, lon: -2.4456 },
  { name: 'Sabadell', country: 'Spain', lat: 41.5463, lon: 2.1086 },
  { name: 'Terrassa', country: 'Spain', lat: 41.5631, lon: 2.0089 },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUSTRALIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Albury', country: 'Australia', region: 'New South Wales', lat: -36.0737, lon: 146.9135 },
  { name: 'Gladstone', country: 'Australia', region: 'Queensland', lat: -23.8490, lon: 151.2644 },
  { name: 'Kalgoorlie', country: 'Australia', region: 'Western Australia', lat: -30.7489, lon: 121.4660 },
  { name: 'Launceston', country: 'Australia', region: 'Tasmania', lat: -41.4332, lon: 147.1441 },
  { name: 'Mount Gambier', country: 'Australia', region: 'South Australia', lat: -37.8293, lon: 140.7797 },
  { name: 'Murray Bridge', country: 'Australia', region: 'South Australia', lat: -35.1197, lon: 139.2755 },
  { name: 'Port Augusta', country: 'Australia', region: 'South Australia', lat: -32.4910, lon: 137.7834 },
  { name: 'Whyalla', country: 'Australia', region: 'South Australia', lat: -33.0258, lon: 137.5247 },

  // ═══════════════════════════════════════════════════════════════════════════
  // RUSSIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Belgorod', country: 'Russia', lat: 50.5997, lon: 36.5882 },
  { name: 'Bryansk', country: 'Russia', lat: 53.2521, lon: 34.3717 },
  { name: 'Cheboksary', country: 'Russia', lat: 56.1322, lon: 47.2519 },
  { name: 'Grozny', country: 'Russia', lat: 43.3175, lon: 45.6986 },
  { name: 'Kursk', country: 'Russia', lat: 51.7373, lon: 36.1874 },
  { name: 'Naberezhnye Chelny', country: 'Russia', lat: 55.6944, lon: 52.3253 },
  { name: 'Novokuznetsk', country: 'Russia', lat: 53.7596, lon: 87.1216 },
  { name: 'Orsk', country: 'Russia', lat: 51.2264, lon: 58.4747 },
  { name: 'Smolensk', country: 'Russia', lat: 54.7818, lon: 32.0401 },
  { name: 'Tambov', country: 'Russia', lat: 52.7212, lon: 41.4523 },
  { name: 'Vladikavkaz', country: 'Russia', lat: 43.0367, lon: 44.6678 },

  // ═══════════════════════════════════════════════════════════════════════════
  // POLAND (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bielsko-Biala', country: 'Poland', lat: 49.8225, lon: 19.0444 },
  { name: 'Elblag', country: 'Poland', lat: 54.1522, lon: 19.4086 },
  { name: 'Gorzow Wielkopolski', country: 'Poland', lat: 52.7325, lon: 15.2489 },
  { name: 'Grudziadz', country: 'Poland', lat: 53.4886, lon: 18.7481 },
  { name: 'Kalisz', country: 'Poland', lat: 51.7500, lon: 18.0833 },
  { name: 'Legnica', country: 'Poland', lat: 51.2070, lon: 16.1619 },
  { name: 'Plock', country: 'Poland', lat: 52.5464, lon: 19.7064 },
  { name: 'Slupsk', country: 'Poland', lat: 54.4641, lon: 17.0286 },
  { name: 'Tarnow', country: 'Poland', lat: 50.0125, lon: 20.9861 },
  { name: 'Walbrzych', country: 'Poland', lat: 50.7714, lon: 16.2843 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CANADA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Abbotsford', country: 'Canada', region: 'British Columbia', lat: 49.0504, lon: -122.3045 },
  { name: 'Ajax', country: 'Canada', region: 'Ontario', lat: 43.8509, lon: -79.0204 },
  { name: 'Calgary', country: 'Canada', region: 'Alberta', lat: 51.0447, lon: -114.0719 },
  { name: 'Coquitlam', country: 'Canada', region: 'British Columbia', lat: 49.2838, lon: -122.7932 },
  { name: 'Edmonton', country: 'Canada', region: 'Alberta', lat: 53.5461, lon: -113.4938 },
  { name: 'Hamilton', country: 'Canada', region: 'Ontario', lat: 43.2557, lon: -79.8711 },
  { name: 'Montreal', country: 'Canada', region: 'Quebec', lat: 45.5017, lon: -73.5673 },
  { name: 'North Bay', country: 'Canada', region: 'Ontario', lat: 46.3091, lon: -79.4608 },
  { name: 'Ottawa', country: 'Canada', region: 'Ontario', lat: 45.4215, lon: -75.6972 },
  { name: 'Sault Ste. Marie', country: 'Canada', region: 'Ontario', lat: 46.5219, lon: -84.3461 },
  { name: 'Sherbrooke', country: 'Canada', region: 'Quebec', lat: 45.4042, lon: -71.8929 },
  { name: 'Surrey', country: 'Canada', region: 'British Columbia', lat: 49.1913, lon: -122.8490 },
  { name: 'Toronto', country: 'Canada', region: 'Ontario', lat: 43.6532, lon: -79.3832 },
  { name: 'Trois-Rivieres', country: 'Canada', region: 'Quebec', lat: 46.3432, lon: -72.5419 },
  { name: 'Vancouver', country: 'Canada', region: 'British Columbia', lat: 49.2827, lon: -123.1207 },
  { name: 'Winnipeg', country: 'Canada', region: 'Manitoba', lat: 49.8951, lon: -97.1384 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BANGLADESH (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Faridpur', country: 'Bangladesh', lat: 23.6000, lon: 89.8333 },
  { name: 'Habiganj', country: 'Bangladesh', lat: 24.3833, lon: 91.4167 },
  { name: 'Jamalpur', country: 'Bangladesh', lat: 24.9375, lon: 89.9372 },
  { name: 'Kushtia', country: 'Bangladesh', lat: 23.9000, lon: 89.1167 },
  { name: 'Madaripur', country: 'Bangladesh', lat: 23.1667, lon: 90.1833 },
  { name: 'Manikganj', country: 'Bangladesh', lat: 23.8667, lon: 90.0167 },
  { name: 'Narsingdi', country: 'Bangladesh', lat: 23.9167, lon: 90.7167 },
  { name: 'Netrokona', country: 'Bangladesh', lat: 24.8833, lon: 90.7333 },
  { name: 'Noakhali', country: 'Bangladesh', lat: 22.8708, lon: 91.1003 },
  { name: 'Pabna', country: 'Bangladesh', lat: 24.0064, lon: 89.2372 },
  { name: 'Patuakhali', country: 'Bangladesh', lat: 22.3500, lon: 90.3333 },
  { name: 'Sirajganj', country: 'Bangladesh', lat: 24.4500, lon: 89.7000 },

  // ═══════════════════════════════════════════════════════════════════════════
  // EGYPT (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Asyut', country: 'Egypt', lat: 27.1809, lon: 31.1837 },
  { name: 'Banha', country: 'Egypt', lat: 30.4667, lon: 31.1833 },
  { name: 'Damanhur', country: 'Egypt', lat: 31.0333, lon: 30.4667 },
  { name: 'El Arish', country: 'Egypt', lat: 31.1253, lon: 33.7989 },
  { name: 'El Mahalla el Kubra', country: 'Egypt', lat: 30.9667, lon: 31.1667 },
  { name: 'Mallawi', country: 'Egypt', lat: 27.7309, lon: 30.8417 },
  { name: 'Mersa Matruh', country: 'Egypt', lat: 31.3543, lon: 27.2373 },
  { name: 'Shebin el Kom', country: 'Egypt', lat: 30.5500, lon: 31.0167 },
  { name: 'Shibin El Qanater', country: 'Egypt', lat: 30.3156, lon: 31.3119 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOROCCO (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Berrechid', country: 'Morocco', lat: 33.2653, lon: -7.5878 },
  { name: 'Errachidia', country: 'Morocco', lat: 31.9314, lon: -4.4267 },
  { name: 'Guelmim', country: 'Morocco', lat: 28.9833, lon: -10.0500 },
  { name: 'Guercif', country: 'Morocco', lat: 34.2264, lon: -3.3536 },
  { name: 'Inezgane', country: 'Morocco', lat: 30.3558, lon: -9.5378 },
  { name: 'Khemisset', country: 'Morocco', lat: 33.8167, lon: -6.0667 },
  { name: 'Larache', country: 'Morocco', lat: 35.1933, lon: -6.1558 },
  { name: 'Mohammedia', country: 'Morocco', lat: 33.6861, lon: -7.3828 },
  { name: 'Settat', country: 'Morocco', lat: 32.9942, lon: -7.6167 },
  { name: 'Taza', country: 'Morocco', lat: 34.2133, lon: -4.0100 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUTH KOREA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ansan', country: 'South Korea', lat: 37.3219, lon: 126.8309 },
  { name: 'Anyang', country: 'South Korea', lat: 37.3943, lon: 126.9568 },
  { name: 'Bucheon', country: 'South Korea', lat: 37.4989, lon: 126.7831 },
  { name: 'Chungju', country: 'South Korea', lat: 36.9910, lon: 127.9259 },
  { name: 'Gimpo', country: 'South Korea', lat: 37.6153, lon: 126.7156 },
  { name: 'Gumi', country: 'South Korea', lat: 36.1195, lon: 128.3443 },
  { name: 'Gwangmyeong', country: 'South Korea', lat: 37.4386, lon: 126.8642 },
  { name: 'Gunsan', country: 'South Korea', lat: 35.9674, lon: 126.7369 },
  { name: 'Gyeongju', country: 'South Korea', lat: 35.8562, lon: 129.2247 },
  { name: 'Hanam', country: 'South Korea', lat: 37.5391, lon: 127.2147 },
  { name: 'Jinju', country: 'South Korea', lat: 35.1798, lon: 128.1076 },
  { name: 'Namyangju', country: 'South Korea', lat: 37.6359, lon: 127.2165 },
  { name: 'Pyeongtaek', country: 'South Korea', lat: 36.9923, lon: 127.1128 },
  { name: 'Seongnam', country: 'South Korea', lat: 37.4449, lon: 127.1389 },
  { name: 'Siheung', country: 'South Korea', lat: 37.3800, lon: 126.8033 },
  { name: 'Uijeongbu', country: 'South Korea', lat: 37.7386, lon: 127.0339 },
  { name: 'Yangju', country: 'South Korea', lat: 37.7856, lon: 127.0461 },
  { name: 'Yongin', country: 'South Korea', lat: 37.2411, lon: 127.1776 },

  // ═══════════════════════════════════════════════════════════════════════════
  // JAPAN (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Amagasaki', country: 'Japan', lat: 34.7333, lon: 135.4000 },
  { name: 'Fujisawa', country: 'Japan', lat: 35.3394, lon: 139.4900 },
  { name: 'Funabashi', country: 'Japan', lat: 35.6947, lon: 139.9828 },
  { name: 'Ichikawa', country: 'Japan', lat: 35.7281, lon: 139.9306 },
  { name: 'Iwaki', country: 'Japan', lat: 37.0504, lon: 140.8877 },
  { name: 'Kashiwa', country: 'Japan', lat: 35.8676, lon: 139.9717 },
  { name: 'Kochi', country: 'Japan', lat: 33.5597, lon: 133.5311 },
  { name: 'Maebashi', country: 'Japan', lat: 36.3912, lon: 139.0608 },
  { name: 'Matsumoto', country: 'Japan', lat: 36.2380, lon: 137.9720 },
  { name: 'Morioka', country: 'Japan', lat: 39.7036, lon: 141.1527 },
  { name: 'Nara', country: 'Japan', lat: 34.6851, lon: 135.8048 },
  { name: 'Oita', country: 'Japan', lat: 33.2382, lon: 131.6126 },
  { name: 'Otsu', country: 'Japan', lat: 35.0044, lon: 135.8685 },
  { name: 'Sagamihara', country: 'Japan', lat: 35.5714, lon: 139.3728 },
  { name: 'Sakai', country: 'Japan', lat: 34.5733, lon: 135.4833 },
  { name: 'Takasaki', country: 'Japan', lat: 36.3219, lon: 139.0032 },
  { name: 'Tokushima', country: 'Japan', lat: 34.0658, lon: 134.5593 },
  { name: 'Utsunomiya', country: 'Japan', lat: 36.5551, lon: 139.8828 },
  { name: 'Wakayama', country: 'Japan', lat: 34.2260, lon: 135.1675 },

  // ═══════════════════════════════════════════════════════════════════════════
  // VIETNAM (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bac Giang', country: 'Vietnam', lat: 21.2731, lon: 106.1944 },
  { name: 'Bac Ninh', country: 'Vietnam', lat: 21.1861, lon: 106.0763 },
  { name: 'Ben Tre', country: 'Vietnam', lat: 10.2333, lon: 106.3833 },
  { name: 'Ca Mau', country: 'Vietnam', lat: 9.1769, lon: 105.1500 },
  { name: 'Cam Ranh', country: 'Vietnam', lat: 11.9214, lon: 109.1590 },
  { name: 'Ha Long', country: 'Vietnam', lat: 20.9592, lon: 107.0448 },
  { name: 'Long Xuyen', country: 'Vietnam', lat: 10.3833, lon: 105.4167 },
  { name: 'Phu Quoc', country: 'Vietnam', lat: 10.2289, lon: 103.9572 },
  { name: 'Pleiku', country: 'Vietnam', lat: 13.9833, lon: 108.0000 },
  { name: 'Soc Trang', country: 'Vietnam', lat: 9.6000, lon: 105.9833 },
  { name: 'Tuy Hoa', country: 'Vietnam', lat: 13.0833, lon: 109.3167 },

  // ═══════════════════════════════════════════════════════════════════════════
  // THAILAND (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ayutthaya', country: 'Thailand', lat: 14.3692, lon: 100.5877 },
  { name: 'Buriram', country: 'Thailand', lat: 14.9936, lon: 103.1020 },
  { name: 'Chon Buri', country: 'Thailand', lat: 13.3611, lon: 100.9847 },
  { name: 'Kanchanaburi', country: 'Thailand', lat: 14.0042, lon: 99.5486 },
  { name: 'Nakhon Pathom', country: 'Thailand', lat: 13.8200, lon: 100.0600 },
  { name: 'Nakhon Sawan', country: 'Thailand', lat: 15.6930, lon: 100.1222 },
  { name: 'Nakhon Si Thammarat', country: 'Thailand', lat: 8.4119, lon: 99.9586 },
  { name: 'Narathiwat', country: 'Thailand', lat: 6.4314, lon: 101.8214 },
  { name: 'Pak Kret', country: 'Thailand', lat: 13.9119, lon: 100.5000 },
  { name: 'Pathum Thani', country: 'Thailand', lat: 14.0167, lon: 100.5333 },
  { name: 'Roi Et', country: 'Thailand', lat: 16.0500, lon: 103.6531 },
  { name: 'Sakon Nakhon', country: 'Thailand', lat: 17.1564, lon: 104.1486 },
  { name: 'Samut Prakan', country: 'Thailand', lat: 13.5992, lon: 100.5964 },
  { name: 'Si Racha', country: 'Thailand', lat: 13.1744, lon: 100.9289 },
  { name: 'Yala', country: 'Thailand', lat: 6.5414, lon: 101.2806 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MALAYSIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Batu Pahat', country: 'Malaysia', lat: 1.8547, lon: 102.9325 },
  { name: 'Bintulu', country: 'Malaysia', lat: 3.1667, lon: 113.0333 },
  { name: 'Kangar', country: 'Malaysia', lat: 6.4414, lon: 100.1986 },
  { name: 'Klang', country: 'Malaysia', lat: 3.0449, lon: 101.4455 },
  { name: 'Muar', country: 'Malaysia', lat: 2.0442, lon: 102.5689 },
  { name: 'Putrajaya', country: 'Malaysia', lat: 2.9264, lon: 101.6964 },
  { name: 'Tawau', country: 'Malaysia', lat: 4.2500, lon: 117.8833 },
  { name: 'Teluk Intan', country: 'Malaysia', lat: 4.0259, lon: 101.0214 },
  { name: 'Temerloh', country: 'Malaysia', lat: 3.4512, lon: 102.4174 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MYANMAR (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Dawei', country: 'Myanmar', lat: 14.0833, lon: 98.2000 },
  { name: 'Hakha', country: 'Myanmar', lat: 21.9667, lon: 93.6167 },
  { name: 'Lashio', country: 'Myanmar', lat: 22.9333, lon: 97.7500 },
  { name: 'Loikaw', country: 'Myanmar', lat: 19.6744, lon: 97.2094 },
  { name: 'Magway', country: 'Myanmar', lat: 20.1500, lon: 94.9333 },
  { name: 'Sagaing', country: 'Myanmar', lat: 21.8787, lon: 95.9785 },

  // ═══════════════════════════════════════════════════════════════════════════
  // UKRAINE (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Bila Tserkva', country: 'Ukraine', lat: 49.7986, lon: 30.1156 },
  { name: 'Brovary', country: 'Ukraine', lat: 50.5113, lon: 30.7903 },
  { name: 'Kamianske', country: 'Ukraine', lat: 48.5099, lon: 34.6139 },
  { name: 'Kramatorsk', country: 'Ukraine', lat: 48.7241, lon: 37.5558 },
  { name: 'Kremenchuk', country: 'Ukraine', lat: 49.0726, lon: 33.4200 },
  { name: 'Mariupol', country: 'Ukraine', lat: 47.0958, lon: 37.5497 },
  { name: 'Melitopol', country: 'Ukraine', lat: 46.8489, lon: 35.3653 },
  { name: 'Nikopol', country: 'Ukraine', lat: 47.5720, lon: 34.3933 },
  { name: 'Severodonetsk', country: 'Ukraine', lat: 48.9484, lon: 38.4935 },
  { name: 'Sloviansk', country: 'Ukraine', lat: 48.8511, lon: 37.6217 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ROMANIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Alba Iulia', country: 'Romania', lat: 46.0764, lon: 23.5808 },
  { name: 'Baia Mare', country: 'Romania', lat: 47.6567, lon: 23.5683 },
  { name: 'Bistrita', country: 'Romania', lat: 47.1333, lon: 24.5000 },
  { name: 'Botosani', country: 'Romania', lat: 47.7333, lon: 26.6667 },
  { name: 'Deva', country: 'Romania', lat: 45.8833, lon: 22.9000 },
  { name: 'Drobeta-Turnu Severin', country: 'Romania', lat: 44.6333, lon: 22.6500 },
  { name: 'Focsani', country: 'Romania', lat: 45.6972, lon: 27.1833 },
  { name: 'Hunedoara', country: 'Romania', lat: 45.7500, lon: 22.9167 },
  { name: 'Piatra Neamt', country: 'Romania', lat: 46.9333, lon: 26.3667 },
  { name: 'Ramnicu Valcea', country: 'Romania', lat: 45.1000, lon: 24.3667 },
  { name: 'Satu Mare', country: 'Romania', lat: 47.7917, lon: 22.8853 },
  { name: 'Tulcea', country: 'Romania', lat: 45.1667, lon: 28.8000 },
  { name: 'Vaslui', country: 'Romania', lat: 46.6333, lon: 27.7333 },
  { name: 'Zalau', country: 'Romania', lat: 47.1833, lon: 23.0500 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ARGENTINA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Concordia', country: 'Argentina', region: 'Entre Rios', lat: -31.3966, lon: -58.0171 },
  { name: 'Gualeguaychu', country: 'Argentina', region: 'Entre Rios', lat: -33.0103, lon: -58.5172 },
  { name: 'Junin', country: 'Argentina', region: 'Buenos Aires', lat: -34.5844, lon: -60.9469 },
  { name: 'Lujan', country: 'Argentina', region: 'Buenos Aires', lat: -34.5703, lon: -59.1050 },
  { name: 'Mercedes', country: 'Argentina', region: 'Buenos Aires', lat: -34.6514, lon: -59.4306 },
  { name: 'Olavarria', country: 'Argentina', region: 'Buenos Aires', lat: -36.8928, lon: -60.3228 },
  { name: 'Pergamino', country: 'Argentina', region: 'Buenos Aires', lat: -33.8950, lon: -60.5695 },
  { name: 'Rafaela', country: 'Argentina', region: 'Santa Fe', lat: -31.2520, lon: -61.4876 },
  { name: 'San Nicolas', country: 'Argentina', region: 'Buenos Aires', lat: -33.3316, lon: -60.2225 },
  { name: 'Trelew', country: 'Argentina', region: 'Chubut', lat: -43.2489, lon: -65.3093 },
  { name: 'Venado Tuerto', country: 'Argentina', region: 'Santa Fe', lat: -33.7456, lon: -61.9688 },
  { name: 'Zarate', country: 'Argentina', region: 'Buenos Aires', lat: -34.0981, lon: -59.0284 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW ZEALAND (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Ashburton', country: 'New Zealand', lat: -43.8988, lon: 171.7479 },
  { name: 'Blenheim', country: 'New Zealand', lat: -41.5138, lon: 173.9546 },
  { name: 'Cambridge', country: 'New Zealand', lat: -37.8833, lon: 175.4667 },
  { name: 'Kapiti Coast', country: 'New Zealand', lat: -40.9167, lon: 174.9833 },
  { name: 'Levin', country: 'New Zealand', lat: -40.6167, lon: 175.2833 },
  { name: 'Masterton', country: 'New Zealand', lat: -40.9597, lon: 175.6575 },
  { name: 'Oamaru', country: 'New Zealand', lat: -45.0968, lon: 170.9694 },
  { name: 'Pukekohe', country: 'New Zealand', lat: -37.2000, lon: 174.9000 },
  { name: 'Te Awamutu', country: 'New Zealand', lat: -38.0078, lon: 175.3231 },
  { name: 'Tokoroa', country: 'New Zealand', lat: -38.2167, lon: 175.8667 },

  // ═══════════════════════════════════════════════════════════════════════════
  // NETHERLANDS (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Apeldoorn', country: 'Netherlands', lat: 52.2112, lon: 5.9699 },
  { name: 'Dordrecht', country: 'Netherlands', lat: 51.8133, lon: 4.6736 },
  { name: 'Emmen', country: 'Netherlands', lat: 52.7867, lon: 6.8997 },
  { name: 'Haarlemmermeer', country: 'Netherlands', lat: 52.3025, lon: 4.6906 },
  { name: 'Leeuwarden', country: 'Netherlands', lat: 53.2012, lon: 5.7999 },
  { name: 's-Hertogenbosch', country: 'Netherlands', lat: 51.6978, lon: 5.3037 },
  { name: 'Zaanstad', country: 'Netherlands', lat: 52.4547, lon: 4.8121 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SWEDEN (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Eskilstuna', country: 'Sweden', lat: 59.3667, lon: 16.5167 },
  { name: 'Kalmar', country: 'Sweden', lat: 56.6634, lon: 16.3568 },
  { name: 'Kristianstad', country: 'Sweden', lat: 56.0294, lon: 14.1567 },
  { name: 'Nacka', country: 'Sweden', lat: 59.3100, lon: 18.1644 },
  { name: 'Sodertalje', country: 'Sweden', lat: 59.1958, lon: 17.6253 },
  { name: 'Trollhattan', country: 'Sweden', lat: 58.2839, lon: 12.2886 },
  { name: 'Vaxjo', country: 'Sweden', lat: 56.8777, lon: 14.8091 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ETHIOPIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Asella', country: 'Ethiopia', lat: 7.9500, lon: 39.1333 },
  { name: 'Debre Zeit', country: 'Ethiopia', lat: 8.7500, lon: 38.9833 },
  { name: 'Dilla', country: 'Ethiopia', lat: 6.4167, lon: 38.3167 },
  { name: 'Gambela', country: 'Ethiopia', lat: 8.2500, lon: 34.5833 },
  { name: 'Haramaya', country: 'Ethiopia', lat: 9.4000, lon: 42.0167 },
  { name: 'Hosaena', country: 'Ethiopia', lat: 7.5500, lon: 37.8500 },
  { name: 'Jijiga', country: 'Ethiopia', lat: 9.3500, lon: 42.7833 },
  { name: 'Woldia', country: 'Ethiopia', lat: 11.8333, lon: 39.6000 },
  { name: 'Wolaita Sodo', country: 'Ethiopia', lat: 6.8544, lon: 37.7617 },

  // ═══════════════════════════════════════════════════════════════════════════
  // TANZANIA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Babati', country: 'Tanzania', lat: -4.2167, lon: 35.7500 },
  { name: 'Geita', country: 'Tanzania', lat: -2.8714, lon: 32.2303 },
  { name: 'Kahama', country: 'Tanzania', lat: -3.8333, lon: 32.6000 },
  { name: 'Kasulu', country: 'Tanzania', lat: -4.5833, lon: 30.1000 },
  { name: 'Korogwe', country: 'Tanzania', lat: -5.1500, lon: 38.4667 },
  { name: 'Lindi', country: 'Tanzania', lat: -10.0000, lon: 39.7167 },
  { name: 'Mpanda', country: 'Tanzania', lat: -6.3500, lon: 31.0667 },
  { name: 'Mtwara', country: 'Tanzania', lat: -10.2667, lon: 40.1833 },
  { name: 'Shinyanga', country: 'Tanzania', lat: -3.6667, lon: 33.4167 },
  { name: 'Singida', country: 'Tanzania', lat: -4.8167, lon: 34.7500 },
  { name: 'Sumbawanga', country: 'Tanzania', lat: -7.9667, lon: 31.6167 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CAMEROON (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Dschang', country: 'Cameroon', lat: 5.4500, lon: 10.0667 },
  { name: 'Edea', country: 'Cameroon', lat: 3.8000, lon: 10.1333 },
  { name: 'Foumban', country: 'Cameroon', lat: 5.7167, lon: 10.9167 },
  { name: 'Kousseri', country: 'Cameroon', lat: 12.0833, lon: 15.0333 },
  { name: 'Loum', country: 'Cameroon', lat: 4.7167, lon: 9.7333 },
  { name: 'Meiganga', country: 'Cameroon', lat: 6.5167, lon: 14.3000 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SENEGAL (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Fatick', country: 'Senegal', lat: 14.3333, lon: -16.4000 },
  { name: 'Kedougou', country: 'Senegal', lat: 12.5556, lon: -12.1744 },
  { name: 'Richard-Toll', country: 'Senegal', lat: 16.4625, lon: -15.7000 },
  { name: 'Tivaouane', country: 'Senegal', lat: 14.9500, lon: -16.8167 },
  { name: 'Touba', country: 'Senegal', lat: 14.8500, lon: -15.8833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // VENEZUELA (additional)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Acarigua', country: 'Venezuela', lat: 9.5553, lon: -69.1964 },
  { name: 'Baruta', country: 'Venezuela', lat: 10.4303, lon: -66.8733 },
  { name: 'Guanare', country: 'Venezuela', lat: 9.0428, lon: -69.7414 },
  { name: 'Los Teques', country: 'Venezuela', lat: 10.3458, lon: -67.0436 },
  { name: 'Porlamar', country: 'Venezuela', lat: 11.0000, lon: -63.8500 },
  { name: 'Puerto Cabello', country: 'Venezuela', lat: 10.4731, lon: -68.0125 },
  { name: 'San Fernando de Apure', country: 'Venezuela', lat: 7.8944, lon: -67.4731 },
  { name: 'Tucupita', country: 'Venezuela', lat: 9.0589, lon: -62.0511 },
  { name: 'Valera', country: 'Venezuela', lat: 9.3167, lon: -70.6000 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL AFRICA EXPANSION
  // ═══════════════════════════════════════════════════════════════════════════

  // BENIN (additional)
  { name: 'Abomey', country: 'Benin', lat: 7.1833, lon: 1.9833 },
  { name: 'Djougou', country: 'Benin', lat: 9.7000, lon: 1.6667 },
  { name: 'Kandi', country: 'Benin', lat: 11.1333, lon: 2.9333 },
  { name: 'Lokossa', country: 'Benin', lat: 6.6333, lon: 1.7167 },
  { name: 'Natitingou', country: 'Benin', lat: 10.3167, lon: 1.3833 },
  { name: 'Ouidah', country: 'Benin', lat: 6.3667, lon: 2.0833 },
  { name: 'Savalu', country: 'Benin', lat: 7.9333, lon: 1.9833 },

  // BURKINA FASO (additional)
  { name: 'Banfora', country: 'Burkina Faso', lat: 10.6333, lon: -4.7667 },
  { name: 'Dedougou', country: 'Burkina Faso', lat: 12.4667, lon: -3.4667 },
  { name: 'Fada N\'Gourma', country: 'Burkina Faso', lat: 12.0667, lon: 0.3500 },
  { name: 'Gaoua', country: 'Burkina Faso', lat: 10.3167, lon: -3.1833 },
  { name: 'Ouahigouya', country: 'Burkina Faso', lat: 13.5833, lon: -2.4167 },
  { name: 'Tenkodogo', country: 'Burkina Faso', lat: 11.7833, lon: -0.3667 },
  { name: 'Ziniaré', country: 'Burkina Faso', lat: 12.5833, lon: -1.3000 },

  // BURUNDI (additional)
  { name: 'Cibitoke', country: 'Burundi', lat: -2.8833, lon: 29.1167 },
  { name: 'Kayanza', country: 'Burundi', lat: -2.9333, lon: 29.6167 },
  { name: 'Makamba', country: 'Burundi', lat: -4.1333, lon: 29.8000 },
  { name: 'Muyinga', country: 'Burundi', lat: -2.8500, lon: 30.3333 },
  { name: 'Ngozi', country: 'Burundi', lat: -2.9167, lon: 29.8333 },
  { name: 'Rumonge', country: 'Burundi', lat: -3.9736, lon: 29.4386 },
  { name: 'Ruyigi', country: 'Burundi', lat: -3.4833, lon: 30.2500 },

  // CHAD (additional)
  { name: 'Abeche', country: 'Chad', lat: 13.8333, lon: 20.8333 },
  { name: 'Bongor', country: 'Chad', lat: 10.2833, lon: 15.3833 },
  { name: 'Doba', country: 'Chad', lat: 8.6500, lon: 16.8500 },
  { name: 'Koumra', country: 'Chad', lat: 8.9167, lon: 17.5500 },
  { name: 'Mao', country: 'Chad', lat: 14.1167, lon: 15.3167 },
  { name: 'Mongo', country: 'Chad', lat: 12.1833, lon: 18.6833 },
  { name: 'Sarh', country: 'Chad', lat: 9.1500, lon: 18.3833 },

  // COMOROS
  { name: 'Fomboni', country: 'Comoros', lat: -12.2833, lon: 43.7333 },
  { name: 'Moroni', country: 'Comoros', lat: -11.7022, lon: 43.2551 },
  { name: 'Mutsamudu', country: 'Comoros', lat: -12.1667, lon: 44.3833 },

  // DJIBOUTI (additional)
  { name: 'Ali Sabieh', country: 'Djibouti', lat: 11.1556, lon: 42.7128 },
  { name: 'Dikhil', country: 'Djibouti', lat: 11.1083, lon: 42.3694 },
  { name: 'Obock', country: 'Djibouti', lat: 11.9681, lon: 43.2881 },
  { name: 'Tadjoura', country: 'Djibouti', lat: 11.7833, lon: 42.8833 },

  // EQUATORIAL GUINEA
  { name: 'Bata', country: 'Equatorial Guinea', lat: 1.8667, lon: 9.7667 },
  { name: 'Ebebiyin', country: 'Equatorial Guinea', lat: 2.1500, lon: 11.3333 },
  { name: 'Malabo', country: 'Equatorial Guinea', lat: 3.7500, lon: 8.7833 },
  { name: 'Mongomo', country: 'Equatorial Guinea', lat: 1.6333, lon: 11.3167 },

  // ERITREA (additional)
  { name: 'Assab', country: 'Eritrea', lat: 13.0000, lon: 42.7500 },
  { name: 'Barentu', country: 'Eritrea', lat: 15.1083, lon: 37.5917 },
  { name: 'Keren', country: 'Eritrea', lat: 15.7767, lon: 38.4508 },
  { name: 'Massawa', country: 'Eritrea', lat: 15.6078, lon: 39.4503 },
  { name: 'Mendefera', country: 'Eritrea', lat: 14.8833, lon: 38.8167 },
  { name: 'Tessenei', country: 'Eritrea', lat: 15.1100, lon: 36.6575 },

  // GABON (additional)
  { name: 'Franceville', country: 'Gabon', lat: -1.6333, lon: 13.5833 },
  { name: 'Lambarene', country: 'Gabon', lat: -0.7000, lon: 10.2333 },
  { name: 'Moanda', country: 'Gabon', lat: -1.5667, lon: 13.2000 },
  { name: 'Mouila', country: 'Gabon', lat: -1.8667, lon: 11.0500 },
  { name: 'Oyem', country: 'Gabon', lat: 1.6000, lon: 11.5833 },
  { name: 'Port-Gentil', country: 'Gabon', lat: -0.7167, lon: 8.7833 },
  { name: 'Tchibanga', country: 'Gabon', lat: -2.9333, lon: 11.0333 },

  // GAMBIA (additional)
  { name: 'Bakau', country: 'Gambia', lat: 13.4783, lon: -16.6819 },
  { name: 'Banjul', country: 'Gambia', lat: 13.4531, lon: -16.5775 },
  { name: 'Brikama', country: 'Gambia', lat: 13.2711, lon: -16.6508 },
  { name: 'Farafenni', country: 'Gambia', lat: 13.5667, lon: -15.6000 },
  { name: 'Serekunda', country: 'Gambia', lat: 13.4383, lon: -16.6781 },

  // GUINEA (additional)
  { name: 'Faranah', country: 'Guinea', lat: 10.0333, lon: -10.7500 },
  { name: 'Kankan', country: 'Guinea', lat: 10.3833, lon: -9.3000 },
  { name: 'Kindia', country: 'Guinea', lat: 10.0500, lon: -12.8667 },
  { name: 'Labe', country: 'Guinea', lat: 11.3167, lon: -12.2833 },
  { name: 'Mamou', country: 'Guinea', lat: 10.3833, lon: -12.0833 },
  { name: 'N\'Zerekore', country: 'Guinea', lat: 7.7500, lon: -8.8167 },
  { name: 'Siguiri', country: 'Guinea', lat: 11.4167, lon: -9.1667 },

  // GUINEA-BISSAU
  { name: 'Bafata', country: 'Guinea-Bissau', lat: 12.1667, lon: -14.6667 },
  { name: 'Bissau', country: 'Guinea-Bissau', lat: 11.8636, lon: -15.5981 },
  { name: 'Gabu', country: 'Guinea-Bissau', lat: 12.2833, lon: -14.2167 },

  // LESOTHO
  { name: 'Leribe', country: 'Lesotho', lat: -28.8667, lon: 28.0500 },
  { name: 'Mafeteng', country: 'Lesotho', lat: -29.8167, lon: 27.2333 },
  { name: 'Maseru', country: 'Lesotho', lat: -29.3167, lon: 27.4833 },
  { name: 'Mohale\'s Hoek', country: 'Lesotho', lat: -30.1500, lon: 27.4833 },
  { name: 'Qacha\'s Nek', country: 'Lesotho', lat: -30.1167, lon: 28.6833 },
  { name: 'Teyateyaneng', country: 'Lesotho', lat: -29.1500, lon: 27.7500 },

  // LIBERIA (additional)
  { name: 'Buchanan', country: 'Liberia', lat: 5.8833, lon: -10.0500 },
  { name: 'Gbarnga', country: 'Liberia', lat: 7.0000, lon: -9.4667 },
  { name: 'Harper', country: 'Liberia', lat: 4.3833, lon: -7.7167 },
  { name: 'Kakata', country: 'Liberia', lat: 6.5333, lon: -10.3500 },
  { name: 'Voinjama', country: 'Liberia', lat: 8.4167, lon: -9.7500 },
  { name: 'Zwedru', country: 'Liberia', lat: 6.0667, lon: -8.1333 },

  // MALAWI (additional)
  { name: 'Dedza', country: 'Malawi', lat: -14.3833, lon: 34.3333 },
  { name: 'Karonga', country: 'Malawi', lat: -9.9333, lon: 33.9333 },
  { name: 'Kasungu', country: 'Malawi', lat: -13.0333, lon: 33.4833 },
  { name: 'Mangochi', country: 'Malawi', lat: -14.4667, lon: 35.2667 },
  { name: 'Mzuzu', country: 'Malawi', lat: -11.4667, lon: 34.0167 },
  { name: 'Nkhotakota', country: 'Malawi', lat: -12.9167, lon: 34.3000 },
  { name: 'Salima', country: 'Malawi', lat: -13.7833, lon: 34.4500 },
  { name: 'Zomba', country: 'Malawi', lat: -15.3833, lon: 35.3167 },

  // MALI (additional)
  { name: 'Gao', country: 'Mali', lat: 16.2667, lon: -0.0500 },
  { name: 'Kayes', country: 'Mali', lat: 14.4500, lon: -11.4333 },
  { name: 'Kidal', country: 'Mali', lat: 18.4411, lon: 1.4078 },
  { name: 'Koulikoro', country: 'Mali', lat: 12.8667, lon: -7.5500 },
  { name: 'Koutiala', country: 'Mali', lat: 12.3833, lon: -5.4667 },
  { name: 'Mopti', country: 'Mali', lat: 14.4833, lon: -4.2000 },
  { name: 'Segou', country: 'Mali', lat: 13.4333, lon: -5.8833 },
  { name: 'Sikasso', country: 'Mali', lat: 11.3167, lon: -5.6667 },
  { name: 'Timbuktu', country: 'Mali', lat: 16.7735, lon: -3.0074 },

  // MAURITANIA (additional)
  { name: 'Atar', country: 'Mauritania', lat: 20.5167, lon: -13.0500 },
  { name: 'Kaedi', country: 'Mauritania', lat: 16.1500, lon: -13.5000 },
  { name: 'Kiffa', country: 'Mauritania', lat: 16.6167, lon: -11.4000 },
  { name: 'Nouadhibou', country: 'Mauritania', lat: 20.9333, lon: -17.0333 },
  { name: 'Rosso', country: 'Mauritania', lat: 16.5167, lon: -15.8000 },
  { name: 'Zouérat', country: 'Mauritania', lat: 22.7333, lon: -12.4667 },

  // NAMIBIA (additional)
  { name: 'Katima Mulilo', country: 'Namibia', lat: -17.5000, lon: 24.2667 },
  { name: 'Keetmanshoop', country: 'Namibia', lat: -26.5833, lon: 18.1333 },
  { name: 'Luderitz', country: 'Namibia', lat: -26.6500, lon: 15.1667 },
  { name: 'Oshakati', country: 'Namibia', lat: -17.7833, lon: 15.7000 },
  { name: 'Otjiwarongo', country: 'Namibia', lat: -20.4667, lon: 16.6500 },
  { name: 'Rundu', country: 'Namibia', lat: -17.9167, lon: 19.7667 },
  { name: 'Swakopmund', country: 'Namibia', lat: -22.6833, lon: 14.5333 },
  { name: 'Tsumeb', country: 'Namibia', lat: -19.2500, lon: 17.7167 },
  { name: 'Walvis Bay', country: 'Namibia', lat: -22.9575, lon: 14.5053 },

  // NIGER (additional)
  { name: 'Agadez', country: 'Niger', lat: 16.9733, lon: 7.9911 },
  { name: 'Diffa', country: 'Niger', lat: 13.3167, lon: 12.6167 },
  { name: 'Dosso', country: 'Niger', lat: 13.0500, lon: 3.2000 },
  { name: 'Maradi', country: 'Niger', lat: 13.5000, lon: 7.1000 },
  { name: 'Tahoua', country: 'Niger', lat: 14.8897, lon: 5.2628 },
  { name: 'Tillaberi', country: 'Niger', lat: 13.5167, lon: 1.4500 },
  { name: 'Zinder', country: 'Niger', lat: 13.8000, lon: 8.9833 },

  // RWANDA (additional)
  { name: 'Butare', country: 'Rwanda', lat: -2.5964, lon: 29.7394 },
  { name: 'Byumba', country: 'Rwanda', lat: -1.5758, lon: 29.7461 },
  { name: 'Cyangugu', country: 'Rwanda', lat: -2.4833, lon: 28.9000 },
  { name: 'Gisenyi', country: 'Rwanda', lat: -1.7000, lon: 29.2500 },
  { name: 'Kibungo', country: 'Rwanda', lat: -2.1597, lon: 30.5428 },
  { name: 'Kibuye', country: 'Rwanda', lat: -2.0611, lon: 29.3478 },
  { name: 'Ruhengeri', country: 'Rwanda', lat: -1.4994, lon: 29.6339 },

  // SAO TOME AND PRINCIPE
  { name: 'Santo Antonio', country: 'Sao Tome and Principe', lat: 1.6333, lon: 7.4167 },
  { name: 'Sao Tome', country: 'Sao Tome and Principe', lat: 0.3365, lon: 6.7311 },

  // SIERRA LEONE (additional)
  { name: 'Bo', country: 'Sierra Leone', lat: 7.9647, lon: -11.7381 },
  { name: 'Kabala', country: 'Sierra Leone', lat: 9.5833, lon: -11.5500 },
  { name: 'Kenema', country: 'Sierra Leone', lat: 7.8833, lon: -11.1833 },
  { name: 'Koidu', country: 'Sierra Leone', lat: 8.6333, lon: -10.9667 },
  { name: 'Lunsar', country: 'Sierra Leone', lat: 8.6833, lon: -12.5333 },
  { name: 'Makeni', country: 'Sierra Leone', lat: 8.8833, lon: -12.0500 },
  { name: 'Port Loko', country: 'Sierra Leone', lat: 8.7667, lon: -12.7833 },

  // SOMALIA (additional)
  { name: 'Baidoa', country: 'Somalia', lat: 2.1167, lon: 43.6500 },
  { name: 'Beledweyne', country: 'Somalia', lat: 4.7358, lon: 45.2036 },
  { name: 'Bosaso', country: 'Somalia', lat: 11.2833, lon: 49.1833 },
  { name: 'Burao', country: 'Somalia', lat: 9.5167, lon: 45.5333 },
  { name: 'Galkayo', country: 'Somalia', lat: 6.7694, lon: 47.4308 },
  { name: 'Garowe', country: 'Somalia', lat: 8.4000, lon: 48.4833 },
  { name: 'Kismayo', country: 'Somalia', lat: -0.3500, lon: 42.5333 },

  // SOUTH SUDAN (additional)
  { name: 'Aweil', country: 'South Sudan', lat: 8.7667, lon: 27.4000 },
  { name: 'Bor', country: 'South Sudan', lat: 6.2167, lon: 31.5667 },
  { name: 'Malakal', country: 'South Sudan', lat: 9.5333, lon: 31.6500 },
  { name: 'Rumbek', country: 'South Sudan', lat: 6.8000, lon: 29.6833 },
  { name: 'Torit', country: 'South Sudan', lat: 4.4167, lon: 32.5833 },
  { name: 'Wau', country: 'South Sudan', lat: 7.7000, lon: 27.9833 },
  { name: 'Yambio', country: 'South Sudan', lat: 4.5667, lon: 28.4000 },

  // SWAZILAND / ESWATINI
  { name: 'Lobamba', country: 'Eswatini', lat: -26.4667, lon: 31.2000 },
  { name: 'Manzini', country: 'Eswatini', lat: -26.4833, lon: 31.3667 },
  { name: 'Mbabane', country: 'Eswatini', lat: -26.3167, lon: 31.1333 },
  { name: 'Nhlangano', country: 'Eswatini', lat: -27.1167, lon: 31.2000 },
  { name: 'Siteki', country: 'Eswatini', lat: -26.4500, lon: 31.9500 },

  // TOGO (additional)
  { name: 'Atakpame', country: 'Togo', lat: 7.5333, lon: 1.1167 },
  { name: 'Dapaong', country: 'Togo', lat: 10.8667, lon: 0.2000 },
  { name: 'Kara', country: 'Togo', lat: 9.5500, lon: 1.1833 },
  { name: 'Kpalime', country: 'Togo', lat: 6.9000, lon: 0.6333 },
  { name: 'Sokode', country: 'Togo', lat: 8.9833, lon: 1.1333 },
  { name: 'Tsevie', country: 'Togo', lat: 6.4333, lon: 1.2167 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL ASIA EXPANSION
  // ═══════════════════════════════════════════════════════════════════════════

  // AFGHANISTAN (additional)
  { name: 'Baghlan', country: 'Afghanistan', lat: 36.1306, lon: 68.7000 },
  { name: 'Faizabad', country: 'Afghanistan', lat: 37.1167, lon: 70.5833 },
  { name: 'Gardez', country: 'Afghanistan', lat: 33.5942, lon: 69.2147 },
  { name: 'Maymana', country: 'Afghanistan', lat: 35.9211, lon: 64.7836 },
  { name: 'Sheberghan', country: 'Afghanistan', lat: 36.6650, lon: 65.7517 },

  // BHUTAN
  { name: 'Paro', country: 'Bhutan', lat: 27.4305, lon: 89.4120 },
  { name: 'Punakha', country: 'Bhutan', lat: 27.5914, lon: 89.8631 },
  { name: 'Thimphu', country: 'Bhutan', lat: 27.4728, lon: 89.6393 },
  { name: 'Trashigang', country: 'Bhutan', lat: 27.3333, lon: 91.5500 },

  // BRUNEI
  { name: 'Bandar Seri Begawan', country: 'Brunei', lat: 4.9403, lon: 114.9480 },
  { name: 'Seria', country: 'Brunei', lat: 4.6067, lon: 114.3228 },
  { name: 'Tutong', country: 'Brunei', lat: 4.8028, lon: 114.6492 },

  // CAMBODIA (additional)
  { name: 'Battambang', country: 'Cambodia', lat: 13.1000, lon: 103.2000 },
  { name: 'Kampong Cham', country: 'Cambodia', lat: 11.9833, lon: 105.4500 },
  { name: 'Kampot', country: 'Cambodia', lat: 10.6100, lon: 104.1833 },
  { name: 'Kratie', country: 'Cambodia', lat: 12.4833, lon: 106.0167 },
  { name: 'Poi Pet', country: 'Cambodia', lat: 13.6573, lon: 102.5590 },
  { name: 'Pursat', country: 'Cambodia', lat: 12.5333, lon: 103.9167 },
  { name: 'Siem Reap', country: 'Cambodia', lat: 13.3622, lon: 103.8597 },
  { name: 'Sihanoukville', country: 'Cambodia', lat: 10.6093, lon: 103.5297 },

  // EAST TIMOR (TIMOR-LESTE)
  { name: 'Baucau', country: 'Timor-Leste', lat: -8.4667, lon: 126.4500 },
  { name: 'Dili', country: 'Timor-Leste', lat: -8.5594, lon: 125.5795 },
  { name: 'Maliana', country: 'Timor-Leste', lat: -8.9833, lon: 125.2167 },
  { name: 'Suai', country: 'Timor-Leste', lat: -9.3167, lon: 125.2500 },

  // KYRGYZSTAN (additional)
  { name: 'Bishkek', country: 'Kyrgyzstan', lat: 42.8700, lon: 74.5900 },
  { name: 'Jalal-Abad', country: 'Kyrgyzstan', lat: 40.9333, lon: 73.0000 },
  { name: 'Karakol', country: 'Kyrgyzstan', lat: 42.4833, lon: 78.3833 },
  { name: 'Naryn', country: 'Kyrgyzstan', lat: 41.4333, lon: 76.0000 },
  { name: 'Osh', country: 'Kyrgyzstan', lat: 40.5333, lon: 72.8000 },
  { name: 'Tokmok', country: 'Kyrgyzstan', lat: 42.7667, lon: 75.3000 },

  // LAOS (additional)
  { name: 'Luang Prabang', country: 'Laos', lat: 19.8833, lon: 102.1333 },
  { name: 'Pakse', country: 'Laos', lat: 15.1167, lon: 105.7833 },
  { name: 'Savannakhet', country: 'Laos', lat: 16.5500, lon: 104.7500 },
  { name: 'Thakhek', country: 'Laos', lat: 17.4000, lon: 104.8000 },
  { name: 'Vang Vieng', country: 'Laos', lat: 18.9333, lon: 102.4500 },
  { name: 'Xam Neua', country: 'Laos', lat: 20.4167, lon: 104.0333 },

  // MALDIVES
  { name: 'Addu City', country: 'Maldives', lat: -0.6300, lon: 73.1583 },
  { name: 'Fuvahmulah', country: 'Maldives', lat: -0.2989, lon: 73.4242 },
  { name: 'Male', country: 'Maldives', lat: 4.1753, lon: 73.5089 },

  // MONGOLIA (additional)
  { name: 'Choibalsan', country: 'Mongolia', lat: 48.0667, lon: 114.5333 },
  { name: 'Darkhan', country: 'Mongolia', lat: 49.4708, lon: 105.9744 },
  { name: 'Erdenet', country: 'Mongolia', lat: 49.0833, lon: 104.1500 },
  { name: 'Khovd', country: 'Mongolia', lat: 48.0056, lon: 91.6422 },
  { name: 'Murun', country: 'Mongolia', lat: 49.6353, lon: 100.1600 },
  { name: 'Ulgii', country: 'Mongolia', lat: 48.9667, lon: 89.9667 },

  // NEPAL (additional)
  { name: 'Bhaktapur', country: 'Nepal', lat: 27.6710, lon: 85.4298 },
  { name: 'Bharatpur', country: 'Nepal', lat: 27.6833, lon: 84.4333 },
  { name: 'Biratnagar', country: 'Nepal', lat: 26.4833, lon: 87.2833 },
  { name: 'Birgunj', country: 'Nepal', lat: 27.0000, lon: 84.8667 },
  { name: 'Butwal', country: 'Nepal', lat: 27.7000, lon: 83.4500 },
  { name: 'Dharan', country: 'Nepal', lat: 26.8167, lon: 87.2833 },
  { name: 'Hetauda', country: 'Nepal', lat: 27.4167, lon: 85.0333 },
  { name: 'Janakpur', country: 'Nepal', lat: 26.7333, lon: 85.9167 },
  { name: 'Lalitpur', country: 'Nepal', lat: 27.6667, lon: 85.3167 },
  { name: 'Nepalgunj', country: 'Nepal', lat: 28.0500, lon: 81.6167 },
  { name: 'Pokhara', country: 'Nepal', lat: 28.2096, lon: 83.9856 },

  // TAJIKISTAN (additional)
  { name: 'Dushanbe', country: 'Tajikistan', lat: 38.5600, lon: 68.7739 },
  { name: 'Istaravshan', country: 'Tajikistan', lat: 39.9167, lon: 69.0000 },
  { name: 'Khujand', country: 'Tajikistan', lat: 40.2833, lon: 69.6167 },
  { name: 'Khorugh', country: 'Tajikistan', lat: 37.5333, lon: 71.5500 },
  { name: 'Kulob', country: 'Tajikistan', lat: 37.9147, lon: 69.7803 },
  { name: 'Tursunzoda', country: 'Tajikistan', lat: 38.5128, lon: 68.2314 },

  // TURKMENISTAN (additional)
  { name: 'Ashgabat', country: 'Turkmenistan', lat: 37.9500, lon: 58.3833 },
  { name: 'Balkanabat', country: 'Turkmenistan', lat: 39.5108, lon: 54.3672 },
  { name: 'Dashoguz', country: 'Turkmenistan', lat: 41.8361, lon: 59.9667 },
  { name: 'Mary', country: 'Turkmenistan', lat: 37.5944, lon: 61.8306 },
  { name: 'Turkmenbashi', country: 'Turkmenistan', lat: 40.0231, lon: 52.9697 },
  { name: 'Turkmenabat', country: 'Turkmenistan', lat: 39.0733, lon: 63.5786 },

  // UZBEKISTAN (additional)
  { name: 'Andijan', country: 'Uzbekistan', lat: 40.7833, lon: 72.3333 },
  { name: 'Bukhara', country: 'Uzbekistan', lat: 39.7747, lon: 64.4286 },
  { name: 'Fergana', country: 'Uzbekistan', lat: 40.3833, lon: 71.7833 },
  { name: 'Karshi', country: 'Uzbekistan', lat: 38.8500, lon: 65.8000 },
  { name: 'Namangan', country: 'Uzbekistan', lat: 41.0000, lon: 71.6667 },
  { name: 'Navoi', country: 'Uzbekistan', lat: 40.1000, lon: 65.3667 },
  { name: 'Nukus', country: 'Uzbekistan', lat: 42.4619, lon: 59.6003 },
  { name: 'Samarkand', country: 'Uzbekistan', lat: 39.6542, lon: 66.9597 },
  { name: 'Termez', country: 'Uzbekistan', lat: 37.2242, lon: 67.2783 },
  { name: 'Urgench', country: 'Uzbekistan', lat: 41.5500, lon: 60.6333 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL EUROPE EXPANSION
  // ═══════════════════════════════════════════════════════════════════════════

  // ANDORRA
  { name: 'Andorra la Vella', country: 'Andorra', lat: 42.5063, lon: 1.5218 },
  { name: 'Encamp', country: 'Andorra', lat: 42.5361, lon: 1.5828 },
  { name: 'Escaldes-Engordany', country: 'Andorra', lat: 42.5100, lon: 1.5386 },

  // BELARUS (additional)
  { name: 'Babruysk', country: 'Belarus', lat: 53.1500, lon: 29.2333 },
  { name: 'Baranovichi', country: 'Belarus', lat: 53.1333, lon: 26.0167 },
  { name: 'Brest', country: 'Belarus', lat: 52.0975, lon: 23.7342 },
  { name: 'Gomel', country: 'Belarus', lat: 52.4345, lon: 30.9754 },
  { name: 'Grodno', country: 'Belarus', lat: 53.6884, lon: 23.8258 },
  { name: 'Mogilev', country: 'Belarus', lat: 53.9000, lon: 30.3333 },
  { name: 'Pinsk', country: 'Belarus', lat: 52.1167, lon: 26.1000 },
  { name: 'Vitebsk', country: 'Belarus', lat: 55.1833, lon: 30.1667 },

  // BOSNIA AND HERZEGOVINA (additional)
  { name: 'Banja Luka', country: 'Bosnia and Herzegovina', lat: 44.7667, lon: 17.1833 },
  { name: 'Bijeljina', country: 'Bosnia and Herzegovina', lat: 44.7500, lon: 19.2167 },
  { name: 'Mostar', country: 'Bosnia and Herzegovina', lat: 43.3438, lon: 17.8078 },
  { name: 'Tuzla', country: 'Bosnia and Herzegovina', lat: 44.5333, lon: 18.6833 },
  { name: 'Zenica', country: 'Bosnia and Herzegovina', lat: 44.2000, lon: 17.9000 },

  // CYPRUS (additional)
  { name: 'Famagusta', country: 'Cyprus', lat: 35.1250, lon: 33.9500 },
  { name: 'Kyrenia', country: 'Cyprus', lat: 35.3417, lon: 33.3167 },
  { name: 'Larnaca', country: 'Cyprus', lat: 34.9167, lon: 33.6333 },
  { name: 'Paphos', country: 'Cyprus', lat: 34.7667, lon: 32.4167 },

  // ESTONIA (additional)
  { name: 'Kohtla-Jarve', country: 'Estonia', lat: 59.3972, lon: 27.2806 },
  { name: 'Narva', country: 'Estonia', lat: 59.3797, lon: 28.1783 },
  { name: 'Parnu', country: 'Estonia', lat: 58.3861, lon: 24.5036 },
  { name: 'Tartu', country: 'Estonia', lat: 58.3839, lon: 26.7225 },
  { name: 'Viljandi', country: 'Estonia', lat: 58.3639, lon: 25.5900 },

  // ICELAND
  { name: 'Akureyri', country: 'Iceland', lat: 65.6833, lon: -18.1000 },
  { name: 'Hafnarfjordur', country: 'Iceland', lat: 64.0667, lon: -21.9500 },
  { name: 'Keflavik', country: 'Iceland', lat: 64.0000, lon: -22.5500 },
  { name: 'Kopavogur', country: 'Iceland', lat: 64.1000, lon: -21.9000 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1355, lon: -21.8954 },

  // LATVIA (additional)
  { name: 'Daugavpils', country: 'Latvia', lat: 55.8833, lon: 26.5333 },
  { name: 'Jelgava', country: 'Latvia', lat: 56.6500, lon: 23.7167 },
  { name: 'Jurmala', country: 'Latvia', lat: 56.9500, lon: 23.7833 },
  { name: 'Liepaja', country: 'Latvia', lat: 56.5167, lon: 21.0167 },
  { name: 'Ventspils', country: 'Latvia', lat: 57.3933, lon: 21.5606 },

  // LIECHTENSTEIN
  { name: 'Schaan', country: 'Liechtenstein', lat: 47.1667, lon: 9.5167 },
  { name: 'Vaduz', country: 'Liechtenstein', lat: 47.1411, lon: 9.5215 },

  // LITHUANIA (additional)
  { name: 'Kaunas', country: 'Lithuania', lat: 54.8972, lon: 23.8861 },
  { name: 'Klaipeda', country: 'Lithuania', lat: 55.7167, lon: 21.1167 },
  { name: 'Panevezys', country: 'Lithuania', lat: 55.7333, lon: 24.3500 },
  { name: 'Siauliai', country: 'Lithuania', lat: 55.9333, lon: 23.3167 },
  { name: 'Vilnius', country: 'Lithuania', lat: 54.6892, lon: 25.2798 },

  // LUXEMBOURG (additional)
  { name: 'Differdange', country: 'Luxembourg', lat: 49.5244, lon: 5.8914 },
  { name: 'Dudelange', country: 'Luxembourg', lat: 49.4806, lon: 6.0867 },
  { name: 'Esch-sur-Alzette', country: 'Luxembourg', lat: 49.4958, lon: 5.9806 },
  { name: 'Ettelbruck', country: 'Luxembourg', lat: 49.8475, lon: 6.1042 },

  // MALTA
  { name: 'Birkirkara', country: 'Malta', lat: 35.8958, lon: 14.4617 },
  { name: 'Mosta', country: 'Malta', lat: 35.9092, lon: 14.4261 },
  { name: 'Qormi', country: 'Malta', lat: 35.8756, lon: 14.4714 },
  { name: 'Sliema', country: 'Malta', lat: 35.9111, lon: 14.5028 },
  { name: 'Valletta', country: 'Malta', lat: 35.8997, lon: 14.5147 },

  // MOLDOVA (additional)
  { name: 'Balti', country: 'Moldova', lat: 47.7617, lon: 27.9292 },
  { name: 'Cahul', country: 'Moldova', lat: 45.9000, lon: 28.2000 },
  { name: 'Comrat', country: 'Moldova', lat: 46.2944, lon: 28.6556 },
  { name: 'Soroca', country: 'Moldova', lat: 48.1667, lon: 28.3000 },
  { name: 'Tiraspol', country: 'Moldova', lat: 46.8403, lon: 29.6433 },
  { name: 'Ungheni', country: 'Moldova', lat: 47.2167, lon: 27.8000 },

  // MONACO
  { name: 'Monaco', country: 'Monaco', lat: 43.7384, lon: 7.4246 },
  { name: 'Monte Carlo', country: 'Monaco', lat: 43.7396, lon: 7.4269 },

  // MONTENEGRO (additional)
  { name: 'Bar', country: 'Montenegro', lat: 42.0903, lon: 19.1006 },
  { name: 'Budva', country: 'Montenegro', lat: 42.2864, lon: 18.8403 },
  { name: 'Herceg Novi', country: 'Montenegro', lat: 42.4531, lon: 18.5375 },
  { name: 'Kotor', country: 'Montenegro', lat: 42.4247, lon: 18.7711 },
  { name: 'Niksic', country: 'Montenegro', lat: 42.7731, lon: 18.9444 },

  // NORTH MACEDONIA (additional)
  { name: 'Bitola', country: 'North Macedonia', lat: 41.0303, lon: 21.3403 },
  { name: 'Kumanovo', country: 'North Macedonia', lat: 42.1322, lon: 21.7144 },
  { name: 'Ohrid', country: 'North Macedonia', lat: 41.1231, lon: 20.8017 },
  { name: 'Prilep', country: 'North Macedonia', lat: 41.3447, lon: 21.5547 },
  { name: 'Tetovo', country: 'North Macedonia', lat: 42.0069, lon: 20.9714 },

  // SAN MARINO
  { name: 'Borgo Maggiore', country: 'San Marino', lat: 43.9417, lon: 12.4500 },
  { name: 'San Marino', country: 'San Marino', lat: 43.9333, lon: 12.4500 },
  { name: 'Serravalle', country: 'San Marino', lat: 43.9714, lon: 12.4758 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL OCEANIA EXPANSION
  // ═══════════════════════════════════════════════════════════════════════════

  // FIJI (additional)
  { name: 'Ba', country: 'Fiji', lat: -17.5333, lon: 177.6833 },
  { name: 'Labasa', country: 'Fiji', lat: -16.4333, lon: 179.3667 },
  { name: 'Lautoka', country: 'Fiji', lat: -17.6167, lon: 177.4500 },
  { name: 'Nadi', country: 'Fiji', lat: -17.7833, lon: 177.4167 },
  { name: 'Nausori', country: 'Fiji', lat: -18.0333, lon: 178.2500 },
  { name: 'Savusavu', country: 'Fiji', lat: -16.7833, lon: 179.3333 },
  { name: 'Sigatoka', country: 'Fiji', lat: -18.1500, lon: 177.5000 },
  { name: 'Suva', country: 'Fiji', lat: -18.1416, lon: 178.4419 },

  // KIRIBATI
  { name: 'South Tarawa', country: 'Kiribati', lat: 1.4500, lon: 173.0000 },

  // MARSHALL ISLANDS
  { name: 'Majuro', country: 'Marshall Islands', lat: 7.0897, lon: 171.3803 },

  // MICRONESIA
  { name: 'Palikir', country: 'Micronesia', lat: 6.9167, lon: 158.1500 },
  { name: 'Weno', country: 'Micronesia', lat: 7.4500, lon: 151.8500 },

  // NAURU
  { name: 'Yaren', country: 'Nauru', lat: -0.5477, lon: 166.9209 },

  // PALAU
  { name: 'Ngerulmud', country: 'Palau', lat: 7.5006, lon: 134.6244 },

  // PAPUA NEW GUINEA (additional)
  { name: 'Goroka', country: 'Papua New Guinea', lat: -6.0833, lon: 145.3833 },
  { name: 'Lae', country: 'Papua New Guinea', lat: -6.7333, lon: 147.0000 },
  { name: 'Madang', country: 'Papua New Guinea', lat: -5.2167, lon: 145.8000 },
  { name: 'Mount Hagen', country: 'Papua New Guinea', lat: -5.8667, lon: 144.2167 },
  { name: 'Port Moresby', country: 'Papua New Guinea', lat: -9.4647, lon: 147.1925 },
  { name: 'Rabaul', country: 'Papua New Guinea', lat: -4.1833, lon: 152.1667 },
  { name: 'Wewak', country: 'Papua New Guinea', lat: -3.9000, lon: 143.8333 },

  // SAMOA
  { name: 'Apia', country: 'Samoa', lat: -13.8333, lon: -171.7500 },

  // SOLOMON ISLANDS
  { name: 'Gizo', country: 'Solomon Islands', lat: -8.1000, lon: 156.8500 },
  { name: 'Honiara', country: 'Solomon Islands', lat: -9.4333, lon: 159.9500 },

  // TONGA
  { name: 'Nukualofa', country: 'Tonga', lat: -21.2114, lon: -175.1494 },

  // TUVALU
  { name: 'Funafuti', country: 'Tuvalu', lat: -8.5167, lon: 179.2167 },

  // VANUATU
  { name: 'Luganville', country: 'Vanuatu', lat: -15.5167, lon: 167.1667 },
  { name: 'Port Vila', country: 'Vanuatu', lat: -17.7333, lon: 168.3167 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL CARIBBEAN EXPANSION
  // ═══════════════════════════════════════════════════════════════════════════

  // ANTIGUA AND BARBUDA
  { name: 'St. John\'s', country: 'Antigua and Barbuda', lat: 17.1175, lon: -61.8456 },

  // BARBADOS
  { name: 'Bridgetown', country: 'Barbados', lat: 13.1000, lon: -59.6167 },
  { name: 'Speightstown', country: 'Barbados', lat: 13.2500, lon: -59.6500 },

  // DOMINICA
  { name: 'Roseau', country: 'Dominica', lat: 15.3017, lon: -61.3881 },

  // GRENADA
  { name: 'St. George\'s', country: 'Grenada', lat: 12.0561, lon: -61.7486 },

  // SAINT KITTS AND NEVIS
  { name: 'Basseterre', country: 'Saint Kitts and Nevis', lat: 17.2948, lon: -62.7261 },

  // SAINT LUCIA
  { name: 'Castries', country: 'Saint Lucia', lat: 14.0101, lon: -60.9875 },
  { name: 'Vieux Fort', country: 'Saint Lucia', lat: 13.7167, lon: -60.9500 },

  // SAINT VINCENT AND THE GRENADINES
  { name: 'Kingstown', country: 'Saint Vincent and the Grenadines', lat: 13.1600, lon: -61.2248 },

  // SURINAME (additional)
  { name: 'Lelydorp', country: 'Suriname', lat: 5.6833, lon: -55.2333 },
  { name: 'Nieuw Nickerie', country: 'Suriname', lat: 5.9333, lon: -56.9833 },
  { name: 'Paramaribo', country: 'Suriname', lat: 5.8667, lon: -55.1667 },

  // BAHAMAS (additional)
  { name: 'Freeport', country: 'Bahamas', lat: 26.5333, lon: -78.7000 },
  { name: 'Nassau', country: 'Bahamas', lat: 25.0580, lon: -77.3431 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL LATIN AMERICA EXPANSION
  // ═══════════════════════════════════════════════════════════════════════════

  // BOLIVIA (additional)
  { name: 'Cobija', country: 'Bolivia', lat: -11.0333, lon: -68.7500 },
  { name: 'Montero', country: 'Bolivia', lat: -17.3333, lon: -63.2500 },
  { name: 'Oruro', country: 'Bolivia', lat: -17.9667, lon: -67.1167 },
  { name: 'Potosi', country: 'Bolivia', lat: -19.5833, lon: -65.7500 },
  { name: 'Riberalta', country: 'Bolivia', lat: -11.0000, lon: -66.1000 },
  { name: 'Sucre', country: 'Bolivia', lat: -19.0500, lon: -65.2594 },
  { name: 'Tarija', country: 'Bolivia', lat: -21.5333, lon: -64.7333 },
  { name: 'Trinidad', country: 'Bolivia', lat: -14.8333, lon: -64.9000 },
  { name: 'Yacuiba', country: 'Bolivia', lat: -22.0167, lon: -63.6833 },

  // COSTA RICA (additional)
  { name: 'Alajuela', country: 'Costa Rica', lat: 10.0167, lon: -84.2167 },
  { name: 'Cartago', country: 'Costa Rica', lat: 9.8667, lon: -83.9167 },
  { name: 'Heredia', country: 'Costa Rica', lat: 10.0000, lon: -84.1167 },
  { name: 'Liberia', country: 'Costa Rica', lat: 10.6333, lon: -85.4333 },
  { name: 'Limon', country: 'Costa Rica', lat: 10.0000, lon: -83.0333 },
  { name: 'Puntarenas', country: 'Costa Rica', lat: 9.9667, lon: -84.8333 },
  { name: 'San Isidro de El General', country: 'Costa Rica', lat: 9.3667, lon: -83.7000 },

  // ECUADOR (additional)
  { name: 'Ambato', country: 'Ecuador', lat: -1.2500, lon: -78.6167 },
  { name: 'Babahoyo', country: 'Ecuador', lat: -1.8000, lon: -79.5333 },
  { name: 'Esmeraldas', country: 'Ecuador', lat: 0.9500, lon: -79.6500 },
  { name: 'Ibarra', country: 'Ecuador', lat: 0.3500, lon: -78.1167 },
  { name: 'Latacunga', country: 'Ecuador', lat: -0.9333, lon: -78.6167 },
  { name: 'Loja', country: 'Ecuador', lat: -3.9833, lon: -79.2000 },
  { name: 'Machala', country: 'Ecuador', lat: -3.2667, lon: -79.9667 },
  { name: 'Manta', country: 'Ecuador', lat: -0.9500, lon: -80.7333 },
  { name: 'Portoviejo', country: 'Ecuador', lat: -1.0500, lon: -80.4500 },
  { name: 'Riobamba', country: 'Ecuador', lat: -1.6667, lon: -78.6333 },
  { name: 'Santo Domingo de los Colorados', country: 'Ecuador', lat: -0.2500, lon: -79.1500 },

  // EL SALVADOR (additional)
  { name: 'Ahuachapan', country: 'El Salvador', lat: 13.9167, lon: -89.8500 },
  { name: 'San Miguel', country: 'El Salvador', lat: 13.4833, lon: -88.1833 },
  { name: 'San Vicente', country: 'El Salvador', lat: 13.6333, lon: -88.8000 },
  { name: 'Santa Ana', country: 'El Salvador', lat: 13.9833, lon: -89.5667 },
  { name: 'Sonsonate', country: 'El Salvador', lat: 13.7167, lon: -89.7167 },
  { name: 'Usulutan', country: 'El Salvador', lat: 13.3500, lon: -88.4500 },
  { name: 'Zacatecoluca', country: 'El Salvador', lat: 13.5167, lon: -88.8667 },

  // GUATEMALA (additional)
  { name: 'Coban', country: 'Guatemala', lat: 15.4667, lon: -90.3667 },
  { name: 'Escuintla', country: 'Guatemala', lat: 14.3000, lon: -90.7833 },
  { name: 'Huehuetenango', country: 'Guatemala', lat: 15.3167, lon: -91.4667 },
  { name: 'Mazatenango', country: 'Guatemala', lat: 14.5333, lon: -91.5000 },
  { name: 'Puerto Barrios', country: 'Guatemala', lat: 15.7333, lon: -88.6000 },
  { name: 'Quetzaltenango', country: 'Guatemala', lat: 14.8333, lon: -91.5167 },
  { name: 'Solola', country: 'Guatemala', lat: 14.7667, lon: -91.1833 },

  // HONDURAS (additional)
  { name: 'Choluteca', country: 'Honduras', lat: 13.3000, lon: -87.1833 },
  { name: 'Comayagua', country: 'Honduras', lat: 14.4500, lon: -87.6333 },
  { name: 'Danli', country: 'Honduras', lat: 14.0333, lon: -86.5833 },
  { name: 'El Progreso', country: 'Honduras', lat: 15.4000, lon: -87.8000 },
  { name: 'La Ceiba', country: 'Honduras', lat: 15.7833, lon: -86.8000 },
  { name: 'Olanchito', country: 'Honduras', lat: 15.4833, lon: -86.5667 },
  { name: 'Puerto Cortes', country: 'Honduras', lat: 15.8500, lon: -87.9500 },
  { name: 'Santa Rosa de Copan', country: 'Honduras', lat: 14.7667, lon: -88.7833 },

  // NICARAGUA (additional)
  { name: 'Bluefields', country: 'Nicaragua', lat: 12.0167, lon: -83.7667 },
  { name: 'Chinandega', country: 'Nicaragua', lat: 12.6333, lon: -87.0333 },
  { name: 'Esteli', country: 'Nicaragua', lat: 13.0833, lon: -86.3500 },
  { name: 'Granada', country: 'Nicaragua', lat: 11.9333, lon: -85.9500 },
  { name: 'Jinotega', country: 'Nicaragua', lat: 13.0833, lon: -86.0000 },
  { name: 'Juigalpa', country: 'Nicaragua', lat: 12.1000, lon: -85.3667 },
  { name: 'Leon', country: 'Nicaragua', lat: 12.4333, lon: -86.8833 },
  { name: 'Masaya', country: 'Nicaragua', lat: 11.9667, lon: -86.0833 },
  { name: 'Matagalpa', country: 'Nicaragua', lat: 12.9167, lon: -85.9167 },

  // PANAMA (additional)
  { name: 'Chitre', country: 'Panama', lat: 7.9667, lon: -80.4167 },
  { name: 'Colon', country: 'Panama', lat: 9.3500, lon: -79.9000 },
  { name: 'David', country: 'Panama', lat: 8.4333, lon: -82.4333 },
  { name: 'La Chorrera', country: 'Panama', lat: 8.8833, lon: -79.7833 },
  { name: 'Penonome', country: 'Panama', lat: 8.5167, lon: -80.3500 },
  { name: 'Santiago de Veraguas', country: 'Panama', lat: 8.1000, lon: -80.9833 },

  // PARAGUAY (additional)
  { name: 'Caaguazu', country: 'Paraguay', lat: -25.4667, lon: -56.0167 },
  { name: 'Ciudad del Este', country: 'Paraguay', lat: -25.5097, lon: -54.6111 },
  { name: 'Concepcion', country: 'Paraguay', lat: -23.4000, lon: -57.4333 },
  { name: 'Coronel Oviedo', country: 'Paraguay', lat: -25.4500, lon: -56.4500 },
  { name: 'Encarnacion', country: 'Paraguay', lat: -27.3333, lon: -55.8667 },
  { name: 'Luque', country: 'Paraguay', lat: -25.2667, lon: -57.4833 },
  { name: 'Pedro Juan Caballero', country: 'Paraguay', lat: -22.5500, lon: -55.7333 },
  { name: 'San Lorenzo', country: 'Paraguay', lat: -25.3333, lon: -57.5167 },
  { name: 'Villarrica', country: 'Paraguay', lat: -25.7500, lon: -56.4333 },

  // URUGUAY (additional)
  { name: 'Artigas', country: 'Uruguay', lat: -30.4000, lon: -56.4667 },
  { name: 'Colonia del Sacramento', country: 'Uruguay', lat: -34.4667, lon: -57.8500 },
  { name: 'Durazno', country: 'Uruguay', lat: -33.3833, lon: -56.5167 },
  { name: 'Maldonado', country: 'Uruguay', lat: -34.9000, lon: -54.9500 },
  { name: 'Melo', country: 'Uruguay', lat: -32.3667, lon: -54.1833 },
  { name: 'Mercedes', country: 'Uruguay', lat: -33.2500, lon: -58.0333 },
  { name: 'Paysandu', country: 'Uruguay', lat: -32.3167, lon: -58.0833 },
  { name: 'Rivera', country: 'Uruguay', lat: -30.9000, lon: -55.5500 },
  { name: 'Salto', country: 'Uruguay', lat: -31.3833, lon: -57.9667 },
  { name: 'Tacuarembo', country: 'Uruguay', lat: -31.7167, lon: -55.9833 },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL MIDDLE EAST EXPANSION
  // ═══════════════════════════════════════════════════════════════════════════

  // BAHRAIN (additional)
  { name: 'Hamad Town', country: 'Bahrain', lat: 26.1167, lon: 50.5000 },
  { name: 'Isa Town', country: 'Bahrain', lat: 26.1722, lon: 50.5478 },
  { name: 'Muharraq', country: 'Bahrain', lat: 26.2572, lon: 50.6119 },
  { name: 'Riffa', country: 'Bahrain', lat: 26.1292, lon: 50.5553 },

  // KUWAIT (additional)
  { name: 'Al Ahmadi', country: 'Kuwait', lat: 29.0769, lon: 48.0839 },
  { name: 'Al Jahra', country: 'Kuwait', lat: 29.3375, lon: 47.6581 },
  { name: 'Hawalli', country: 'Kuwait', lat: 29.3328, lon: 48.0286 },
  { name: 'Salmiya', country: 'Kuwait', lat: 29.3347, lon: 48.0758 },

  // OMAN (additional)
  { name: 'Barka', country: 'Oman', lat: 23.7078, lon: 57.8861 },
  { name: 'Ibri', country: 'Oman', lat: 23.2253, lon: 56.5164 },
  { name: 'Nizwa', country: 'Oman', lat: 22.9333, lon: 57.5333 },
  { name: 'Salalah', country: 'Oman', lat: 17.0151, lon: 54.0924 },
  { name: 'Sohar', country: 'Oman', lat: 24.3461, lon: 56.7356 },
  { name: 'Sur', country: 'Oman', lat: 22.5667, lon: 59.5289 },

  // QATAR (additional)
  { name: 'Al Khor', country: 'Qatar', lat: 25.6808, lon: 51.4964 },
  { name: 'Al Rayyan', country: 'Qatar', lat: 25.2919, lon: 51.4244 },
  { name: 'Al Wakrah', country: 'Qatar', lat: 25.1700, lon: 51.6036 },
  { name: 'Lusail', country: 'Qatar', lat: 25.4167, lon: 51.4900 },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL GAP-FILL (reach 3000)
  // ═══════════════════════════════════════════════════════════════════════════

  // CAPE VERDE
  { name: 'Mindelo', country: 'Cape Verde', lat: 16.8900, lon: -24.9800 },
  { name: 'Praia', country: 'Cape Verde', lat: 14.9333, lon: -23.5133 },
  { name: 'Santa Maria', country: 'Cape Verde', lat: 16.5981, lon: -22.9058 },

  // MAURITIUS
  { name: 'Beau Bassin-Rose Hill', country: 'Mauritius', lat: -20.2333, lon: 57.4667 },
  { name: 'Curepipe', country: 'Mauritius', lat: -20.3167, lon: 57.5167 },
  { name: 'Port Louis', country: 'Mauritius', lat: -20.1619, lon: 57.4989 },
  { name: 'Quatre Bornes', country: 'Mauritius', lat: -20.2667, lon: 57.4833 },
  { name: 'Vacoas-Phoenix', country: 'Mauritius', lat: -20.2986, lon: 57.4783 },

  // SEYCHELLES
  { name: 'Victoria', country: 'Seychelles', lat: -4.6167, lon: 55.4500 },

  // MADAGASCAR (additional)
  { name: 'Ambanja', country: 'Madagascar', lat: -13.6833, lon: 48.4500 },
  { name: 'Ambatondrazaka', country: 'Madagascar', lat: -17.8333, lon: 48.4167 },
  { name: 'Antsirabe', country: 'Madagascar', lat: -19.8667, lon: 47.0333 },
  { name: 'Fianarantsoa', country: 'Madagascar', lat: -21.4333, lon: 47.0833 },
  { name: 'Mahajanga', country: 'Madagascar', lat: -15.7167, lon: 46.3167 },
  { name: 'Mananjary', country: 'Madagascar', lat: -21.2167, lon: 48.3500 },
  { name: 'Morondava', country: 'Madagascar', lat: -20.2833, lon: 44.2833 },
  { name: 'Nosy Be', country: 'Madagascar', lat: -13.3333, lon: 48.2667 },
  { name: 'Toamasina', country: 'Madagascar', lat: -18.1500, lon: 49.4000 },
  { name: 'Toliara', country: 'Madagascar', lat: -23.3500, lon: 43.6667 },

  // ZIMBABWE (additional)
  { name: 'Chinhoyi', country: 'Zimbabwe', lat: -17.3667, lon: 30.2000 },
  { name: 'Gweru', country: 'Zimbabwe', lat: -19.4500, lon: 29.8167 },
  { name: 'Kadoma', country: 'Zimbabwe', lat: -18.3333, lon: 29.9167 },
  { name: 'Kwekwe', country: 'Zimbabwe', lat: -18.9333, lon: 29.8167 },
  { name: 'Marondera', country: 'Zimbabwe', lat: -18.1833, lon: 31.5500 },
  { name: 'Masvingo', country: 'Zimbabwe', lat: -20.0667, lon: 30.8333 },
  { name: 'Mutare', country: 'Zimbabwe', lat: -18.9667, lon: 32.6500 },
  { name: 'Victoria Falls', country: 'Zimbabwe', lat: -17.9333, lon: 25.8333 },

  // BOTSWANA (additional)
  { name: 'Francistown', country: 'Botswana', lat: -21.1667, lon: 27.5000 },
  { name: 'Kasane', country: 'Botswana', lat: -17.7833, lon: 25.1500 },
  { name: 'Maun', country: 'Botswana', lat: -19.9833, lon: 23.4167 },
  { name: 'Molepolole', country: 'Botswana', lat: -24.4000, lon: 25.5000 },
  { name: 'Palapye', country: 'Botswana', lat: -22.4000, lon: 27.1333 },
  { name: 'Selibe Phikwe', country: 'Botswana', lat: -21.9833, lon: 27.8333 },
  { name: 'Serowe', country: 'Botswana', lat: -22.3833, lon: 26.7167 },

  // SRI LANKA (additional)
  { name: 'Anuradhapura', country: 'Sri Lanka', lat: 8.3500, lon: 80.3833 },
  { name: 'Batticaloa', country: 'Sri Lanka', lat: 7.7167, lon: 81.7000 },
  { name: 'Galle', country: 'Sri Lanka', lat: 6.0333, lon: 80.2167 },
  { name: 'Jaffna', country: 'Sri Lanka', lat: 9.6667, lon: 80.0167 },
  { name: 'Kandy', country: 'Sri Lanka', lat: 7.2906, lon: 80.6337 },
  { name: 'Kurunegala', country: 'Sri Lanka', lat: 7.4833, lon: 80.3667 },
  { name: 'Matara', country: 'Sri Lanka', lat: 5.9500, lon: 80.5333 },
  { name: 'Negombo', country: 'Sri Lanka', lat: 7.2083, lon: 79.8358 },
  { name: 'Ratnapura', country: 'Sri Lanka', lat: 6.6833, lon: 80.4000 },
  { name: 'Trincomalee', country: 'Sri Lanka', lat: 8.5667, lon: 81.2333 },

  // GEORGIA (additional)
  { name: 'Batumi', country: 'Georgia', lat: 41.6458, lon: 41.6417 },
  { name: 'Kutaisi', country: 'Georgia', lat: 42.2679, lon: 42.6946 },
  { name: 'Rustavi', country: 'Georgia', lat: 41.5500, lon: 44.9833 },
  { name: 'Tbilisi', country: 'Georgia', lat: 41.7225, lon: 44.7925 },
  { name: 'Zugdidi', country: 'Georgia', lat: 42.5088, lon: 41.8709 },

  // ARMENIA (additional)
  { name: 'Gyumri', country: 'Armenia', lat: 40.7942, lon: 43.8453 },
  { name: 'Kapan', country: 'Armenia', lat: 39.2075, lon: 46.4056 },
  { name: 'Vanadzor', country: 'Armenia', lat: 40.8128, lon: 44.4883 },
  { name: 'Yerevan', country: 'Armenia', lat: 40.1811, lon: 44.5136 },

  // AZERBAIJAN (additional)
  { name: 'Ganja', country: 'Azerbaijan', lat: 40.6828, lon: 46.3606 },
  { name: 'Lankaran', country: 'Azerbaijan', lat: 38.7536, lon: 48.8511 },
  { name: 'Mingachevir', country: 'Azerbaijan', lat: 40.7703, lon: 47.0489 },
  { name: 'Nakhchivan', country: 'Azerbaijan', lat: 39.2089, lon: 45.4122 },
  { name: 'Sheki', country: 'Azerbaijan', lat: 41.1919, lon: 47.1706 },
  { name: 'Sumqayit', country: 'Azerbaijan', lat: 40.5897, lon: 49.6686 },

  // GUYANA
  { name: 'Georgetown', country: 'Guyana', lat: 6.8013, lon: -58.1553 },
  { name: 'Linden', country: 'Guyana', lat: 6.0000, lon: -58.3000 },
  { name: 'New Amsterdam', country: 'Guyana', lat: 6.2500, lon: -57.5167 },

  // BELIZE
  { name: 'Belize City', country: 'Belize', lat: 17.4986, lon: -88.1886 },
  { name: 'Belmopan', country: 'Belize', lat: 17.2500, lon: -88.7667 },
  { name: 'Orange Walk', country: 'Belize', lat: 18.0833, lon: -88.5500 },
  { name: 'San Ignacio', country: 'Belize', lat: 17.1589, lon: -89.0697 },

  // ZAMBIA (additional)
  { name: 'Chipata', country: 'Zambia', lat: -13.6333, lon: 32.6500 },
  { name: 'Kabwe', country: 'Zambia', lat: -14.4333, lon: 28.4500 },
  { name: 'Kasama', country: 'Zambia', lat: -10.2167, lon: 31.1833 },
  { name: 'Kitwe', country: 'Zambia', lat: -12.8000, lon: 28.2167 },
  { name: 'Livingstone', country: 'Zambia', lat: -17.8500, lon: 25.8500 },
  { name: 'Mansa', country: 'Zambia', lat: -11.2000, lon: 28.8833 },
  { name: 'Ndola', country: 'Zambia', lat: -12.9667, lon: 28.6333 },
  { name: 'Solwezi', country: 'Zambia', lat: -12.1667, lon: 25.8667 },

  // MOZAMBIQUE (additional)
  { name: 'Beira', country: 'Mozambique', lat: -19.8436, lon: 34.8389 },
  { name: 'Chimoio', country: 'Mozambique', lat: -19.1164, lon: 33.4833 },
  { name: 'Inhambane', country: 'Mozambique', lat: -23.8650, lon: 35.3833 },
  { name: 'Lichinga', country: 'Mozambique', lat: -13.3167, lon: 35.2333 },
  { name: 'Nacala', country: 'Mozambique', lat: -14.5667, lon: 40.6833 },
  { name: 'Nampula', country: 'Mozambique', lat: -15.1167, lon: 39.2667 },
  { name: 'Pemba', country: 'Mozambique', lat: -12.9667, lon: 40.5167 },
  { name: 'Quelimane', country: 'Mozambique', lat: -17.8783, lon: 36.8886 },
  { name: 'Tete', country: 'Mozambique', lat: -16.1667, lon: 33.5833 },
  { name: 'Xai-Xai', country: 'Mozambique', lat: -25.0500, lon: 33.6333 },

  // REUNION (France overseas)
  { name: 'Saint-Denis', country: 'Reunion', lat: -20.8789, lon: 55.4481 },
  { name: 'Saint-Pierre', country: 'Reunion', lat: -21.3393, lon: 55.4781 },

  // NEW CALEDONIA (France overseas)
  { name: 'Noumea', country: 'New Caledonia', lat: -22.2763, lon: 166.4572 },

  // FRENCH POLYNESIA (France overseas)
  { name: 'Papeete', country: 'French Polynesia', lat: -17.5350, lon: -149.5696 },

  // CUBA (additional)
  { name: 'Bayamo', country: 'Cuba', lat: 20.3833, lon: -76.6500 },
  { name: 'Ciego de Avila', country: 'Cuba', lat: 21.8403, lon: -78.7619 },
  { name: 'Guantanamo', country: 'Cuba', lat: 20.1417, lon: -75.2092 },
  { name: 'Las Tunas', country: 'Cuba', lat: 20.9617, lon: -76.9544 },
  { name: 'Matanzas', country: 'Cuba', lat: 23.0511, lon: -81.5775 },
  { name: 'Pinar del Rio', country: 'Cuba', lat: 22.4175, lon: -83.6978 },
  { name: 'Sancti Spiritus', country: 'Cuba', lat: 21.9303, lon: -79.4422 },
  { name: 'Trinidad', country: 'Cuba', lat: 21.8022, lon: -79.9842 },
  { name: 'Vinales', country: 'Cuba', lat: 22.6167, lon: -83.7167 },

  // TRINIDAD AND TOBAGO (additional)
  { name: 'Chaguanas', country: 'Trinidad and Tobago', lat: 10.5167, lon: -61.4167 },
  { name: 'San Fernando', country: 'Trinidad and Tobago', lat: 10.2833, lon: -61.4667 },
];
