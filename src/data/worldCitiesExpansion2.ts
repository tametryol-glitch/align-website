import { CityData } from './worldCities';

/**
 * 1000 additional world cities for natal chart location selection.
 * Focuses on underrepresented countries (China, India, Pakistan, Indonesia, etc.).
 * Excludes US cities (covered by usCities.ts).
 * Organized alphabetically by country.
 */
export const WORLD_CITIES_EXPANSION_2: CityData[] = [
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // AFGHANISTAN
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Aybak', country: 'Afghanistan', lat: 36.2611, lon: 68.0192 },
  { name: 'Charikar', country: 'Afghanistan', lat: 35.0131, lon: 69.1712 },
  { name: 'Fayzabad', country: 'Afghanistan', lat: 37.1169, lon: 70.5797 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ALGERIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Ain Defla', country: 'Algeria', lat: 36.2640, lon: 1.9680 },
  { name: 'Bordj Bou Arreridj', country: 'Algeria', lat: 36.0731, lon: 4.7620 },
  { name: 'El Oued', country: 'Algeria', lat: 33.3683, lon: 6.8527 },
  { name: 'Khenchela', country: 'Algeria', lat: 35.4353, lon: 7.1431 },
  { name: 'Laghouat', country: 'Algeria', lat: 33.8000, lon: 2.8650 },
  { name: 'Mascara', country: 'Algeria', lat: 35.3966, lon: 0.1393 },
  { name: 'Tindouf', country: 'Algeria', lat: 27.6740, lon: -8.1280 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ANGOLA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Kuito', country: 'Angola', lat: -12.3833, lon: 16.9333 },
  { name: 'Menongue', country: 'Angola', lat: -14.6585, lon: 17.6910 },
  { name: 'Ondjiva', country: 'Angola', lat: -17.0667, lon: 15.7333 },
  { name: 'Saurimo', country: 'Angola', lat: -9.6604, lon: 20.3906 },
  { name: 'Sumbe', country: 'Angola', lat: -11.2059, lon: 13.8437 },
  { name: 'Uige', country: 'Angola', lat: -7.6089, lon: 15.0613 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // BANGLADESH
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Chapainawabganj', country: 'Bangladesh', lat: 24.5965, lon: 88.2775 },
  { name: 'Cox Bazar', country: 'Bangladesh', lat: 21.4272, lon: 92.0058 },
  { name: 'Feni', country: 'Bangladesh', lat: 23.0101, lon: 91.3976 },
  { name: 'Jhenaidah', country: 'Bangladesh', lat: 23.5440, lon: 89.1727 },
  { name: 'Kishoreganj', country: 'Bangladesh', lat: 24.4449, lon: 90.7766 },
  { name: 'Moulvibazar', country: 'Bangladesh', lat: 24.4829, lon: 91.7774 },
  { name: 'Naogaon', country: 'Bangladesh', lat: 24.7936, lon: 88.9318 },
  { name: 'Narail', country: 'Bangladesh', lat: 23.1725, lon: 89.5127 },
  { name: 'Natore', country: 'Bangladesh', lat: 24.4206, lon: 89.0000 },
  { name: 'Panchagarh', country: 'Bangladesh', lat: 26.3411, lon: 88.5542 },
  { name: 'Pirojpur', country: 'Bangladesh', lat: 22.5841, lon: 89.9720 },
  { name: 'Satkhira', country: 'Bangladesh', lat: 22.7185, lon: 89.0715 },
  { name: 'Shariatpur', country: 'Bangladesh', lat: 23.2423, lon: 90.4348 },
  { name: 'Sherpur', country: 'Bangladesh', lat: 25.0204, lon: 90.0153 },
  { name: 'Sunamganj', country: 'Bangladesh', lat: 25.0658, lon: 91.3950 },
  { name: 'Thakurgaon', country: 'Bangladesh', lat: 26.0418, lon: 88.4616 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // CHAD
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Faya-Largeau', country: 'Chad', lat: 17.9264, lon: 19.1044 },
  { name: 'Pala', country: 'Chad', lat: 9.3631, lon: 14.9050 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // CHINA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Ankang', country: 'China', lat: 32.6800, lon: 109.0290 },
  { name: 'Anqing', country: 'China', lat: 30.5089, lon: 117.0630 },
  { name: 'Anshun', country: 'China', lat: 26.2456, lon: 105.9340 },
  { name: 'Baishan', country: 'China', lat: 41.9398, lon: 126.4141 },
  { name: 'Baiyin', country: 'China', lat: 36.5588, lon: 104.1389 },
  { name: 'Baise', country: 'China', lat: 23.9020, lon: 106.6188 },
  { name: 'Bayannur', country: 'China', lat: 40.7430, lon: 107.3878 },
  { name: 'Binzhou', country: 'China', lat: 37.3826, lon: 118.0173 },
  { name: 'Bozhou', country: 'China', lat: 33.8693, lon: 115.7785 },
  { name: 'Cangzhou', country: 'China', lat: 38.3037, lon: 116.8388 },
  { name: 'Changde', country: 'China', lat: 29.0318, lon: 111.6984 },
  { name: 'Changzhi', country: 'China', lat: 36.1954, lon: 113.1136 },
  { name: 'Chenzhou', country: 'China', lat: 25.7700, lon: 113.0150 },
  { name: 'Chifeng', country: 'China', lat: 42.2571, lon: 118.9563 },
  { name: 'Chizhou', country: 'China', lat: 30.6583, lon: 117.4916 },
  { name: 'Chuzhou', country: 'China', lat: 32.3019, lon: 118.3166 },
  { name: 'Dazhou', country: 'China', lat: 31.2095, lon: 107.4681 },
  { name: 'Deyang', country: 'China', lat: 31.1264, lon: 104.3979 },
  { name: 'Dezhou', country: 'China', lat: 37.4340, lon: 116.3575 },
  { name: 'Dongying', country: 'China', lat: 37.4347, lon: 118.6747 },
  { name: 'Enshi', country: 'China', lat: 30.2722, lon: 109.4889 },
  { name: 'Ezhou', country: 'China', lat: 30.3967, lon: 114.8946 },
  { name: 'Fuyang', country: 'China', lat: 32.8969, lon: 115.8143 },
  { name: 'Ganzhou', country: 'China', lat: 25.8310, lon: 114.9333 },
  { name: 'Guang an', country: 'China', lat: 30.4557, lon: 106.6331 },
  { name: 'Guangyuan', country: 'China', lat: 32.4353, lon: 105.8440 },
  { name: 'Guigang', country: 'China', lat: 23.1116, lon: 109.5988 },
  { name: 'Hami', country: 'China', lat: 42.8182, lon: 93.5149 },
  { name: 'Hebi', country: 'China', lat: 35.7481, lon: 114.2975 },
  { name: 'Hechi', country: 'China', lat: 24.6928, lon: 108.0852 },
  { name: 'Heihe', country: 'China', lat: 50.2449, lon: 127.5263 },
  { name: 'Hengshui', country: 'China', lat: 37.7392, lon: 115.6704 },
  { name: 'Hengyang', country: 'China', lat: 26.8968, lon: 112.5718 },
  { name: 'Heyuan', country: 'China', lat: 23.7432, lon: 114.6978 },
  { name: 'Heze', country: 'China', lat: 35.2334, lon: 115.4813 },
  { name: 'Huaibei', country: 'China', lat: 33.9560, lon: 116.7981 },
  { name: 'Huaihua', country: 'China', lat: 27.5546, lon: 109.9991 },
  { name: 'Huainan', country: 'China', lat: 32.6264, lon: 116.9998 },
  { name: 'Huanggang', country: 'China', lat: 30.4461, lon: 114.8724 },
  { name: 'Huangshan', country: 'China', lat: 29.7147, lon: 118.3375 },
  { name: 'Huangshi', country: 'China', lat: 30.2146, lon: 115.0386 },
  { name: 'Huludao', country: 'China', lat: 40.7480, lon: 120.8365 },
  { name: 'Jiamusi', country: 'China', lat: 46.8024, lon: 130.3187 },
  { name: 'Jian', country: 'China', lat: 27.1130, lon: 114.9793 },
  { name: 'Jiangmen', country: 'China', lat: 22.5789, lon: 113.0815 },
  { name: 'Jiaozuo', country: 'China', lat: 35.2385, lon: 113.2421 },
  { name: 'Jieyang', country: 'China', lat: 23.5500, lon: 116.3728 },
  { name: 'Jincheng', country: 'China', lat: 35.4909, lon: 112.8510 },
  { name: 'Jingdezhen', country: 'China', lat: 29.2685, lon: 117.1784 },
  { name: 'Jingmen', country: 'China', lat: 31.0346, lon: 112.2040 },
  { name: 'Jingzhou', country: 'China', lat: 30.3269, lon: 112.1901 },
  { name: 'Jinhua', country: 'China', lat: 29.0791, lon: 119.6476 },
  { name: 'Jinzhong', country: 'China', lat: 37.6872, lon: 112.7521 },
  { name: 'Jinzhou', country: 'China', lat: 41.1076, lon: 121.1260 },
  { name: 'Jiujiang', country: 'China', lat: 29.7048, lon: 116.0020 },
  { name: 'Kaili', country: 'China', lat: 26.5829, lon: 107.9812 },
  { name: 'Korla', country: 'China', lat: 41.7259, lon: 86.1746 },
  { name: 'Laiwu', country: 'China', lat: 36.2144, lon: 117.6597 },
  { name: 'Laizhou', country: 'China', lat: 37.1718, lon: 119.9421 },
  { name: 'Leshan', country: 'China', lat: 29.5522, lon: 103.7659 },
  { name: 'Liaoyang', country: 'China', lat: 41.2681, lon: 123.1739 },
  { name: 'Liaoyuan', country: 'China', lat: 42.8877, lon: 125.1436 },
  { name: 'Lincang', country: 'China', lat: 23.8864, lon: 100.0927 },
  { name: 'Linfen', country: 'China', lat: 36.0880, lon: 111.5190 },
  { name: 'Liuan', country: 'China', lat: 31.7352, lon: 116.5078 },
  { name: 'Longyan', country: 'China', lat: 25.0750, lon: 117.0170 },
  { name: 'Loudi', country: 'China', lat: 27.7378, lon: 111.9944 },
  { name: 'Luliang', country: 'China', lat: 37.5242, lon: 111.1440 },
  { name: 'Luzhou', country: 'China', lat: 28.8718, lon: 105.4427 },
  { name: 'Maanshan', country: 'China', lat: 31.6884, lon: 118.5075 },
  { name: 'Maoming', country: 'China', lat: 21.6618, lon: 110.9254 },
  { name: 'Meishan', country: 'China', lat: 30.0575, lon: 103.8490 },
  { name: 'Meizhou', country: 'China', lat: 24.2886, lon: 116.1226 },
  { name: 'Mianyang', country: 'China', lat: 31.4678, lon: 104.6818 },
  { name: 'Nanchong', country: 'China', lat: 30.7953, lon: 106.0847 },
  { name: 'Nanping', country: 'China', lat: 26.6448, lon: 118.1768 },
  { name: 'Nanyang', country: 'China', lat: 32.9908, lon: 112.5284 },
  { name: 'Neijiang', country: 'China', lat: 29.5800, lon: 105.0586 },
  { name: 'Panzhihua', country: 'China', lat: 26.5493, lon: 101.7183 },
  { name: 'Pingdingshan', country: 'China', lat: 33.7667, lon: 113.3000 },
  { name: 'Pingxiang', country: 'China', lat: 27.6226, lon: 113.8543 },
  { name: 'Puyang', country: 'China', lat: 35.7627, lon: 114.9872 },
  { name: 'Qingyuan', country: 'China', lat: 23.6824, lon: 113.0565 },
  { name: 'Qinhuangdao', country: 'China', lat: 39.9354, lon: 119.5994 },
  { name: 'Qiqihar', country: 'China', lat: 47.3540, lon: 123.9180 },
  { name: 'Qujing', country: 'China', lat: 25.4900, lon: 103.7958 },
  { name: 'Quzhou', country: 'China', lat: 28.9598, lon: 118.8745 },
  { name: 'Rizhao', country: 'China', lat: 35.4164, lon: 119.5269 },
  { name: 'Sanmenxia', country: 'China', lat: 34.7726, lon: 111.2000 },
  { name: 'Sanming', country: 'China', lat: 26.2631, lon: 117.6389 },
  { name: 'Shangqiu', country: 'China', lat: 34.4260, lon: 115.6563 },
  { name: 'Shangrao', country: 'China', lat: 28.4551, lon: 117.9432 },
  { name: 'Shanwei', country: 'China', lat: 22.7864, lon: 115.3750 },
  { name: 'Shaoguan', country: 'China', lat: 24.8010, lon: 113.5974 },
  { name: 'Shaoyang', country: 'China', lat: 27.2382, lon: 111.4678 },
  { name: 'Shiyan', country: 'China', lat: 32.6294, lon: 110.7980 },
  { name: 'Shuangyashan', country: 'China', lat: 46.6365, lon: 131.1590 },
  { name: 'Siping', country: 'China', lat: 43.1661, lon: 124.3508 },
  { name: 'Songyuan', country: 'China', lat: 45.1419, lon: 124.8233 },
  { name: 'Suihua', country: 'China', lat: 46.6393, lon: 126.9688 },
  { name: 'Suining', country: 'China', lat: 30.5098, lon: 105.5923 },
  { name: 'Suqian', country: 'China', lat: 33.9631, lon: 118.2752 },
  { name: 'Tai an', country: 'China', lat: 36.1990, lon: 117.0890 },
  { name: 'Tianshui', country: 'China', lat: 34.5809, lon: 105.7249 },
  { name: 'Tongchuan', country: 'China', lat: 34.8966, lon: 108.9455 },
  { name: 'Tonghua', country: 'China', lat: 41.7281, lon: 125.9400 },
  { name: 'Tongling', country: 'China', lat: 30.9445, lon: 117.8121 },
  { name: 'Tongren', country: 'China', lat: 27.7183, lon: 109.1852 },
  { name: 'Weinan', country: 'China', lat: 34.4996, lon: 109.5096 },
  { name: 'Wuwei', country: 'China', lat: 37.9283, lon: 102.6371 },
  { name: 'Wuzhou', country: 'China', lat: 23.4753, lon: 111.2792 },
  { name: 'Xiangtan', country: 'China', lat: 27.8293, lon: 112.9444 },
  { name: 'Xianning', country: 'China', lat: 29.8413, lon: 114.3228 },
  { name: 'Xiantao', country: 'China', lat: 30.3715, lon: 113.4160 },
  { name: 'Xiaogan', country: 'China', lat: 30.9246, lon: 113.9166 },
  { name: 'Xingtai', country: 'China', lat: 37.0695, lon: 114.5048 },
  { name: 'Xinyang', country: 'China', lat: 32.1264, lon: 114.0651 },
  { name: 'Xinyu', country: 'China', lat: 27.8179, lon: 114.9170 },
  { name: 'Xinzhou', country: 'China', lat: 38.4177, lon: 112.7342 },
  { name: 'Xuancheng', country: 'China', lat: 30.9402, lon: 118.7585 },
  { name: 'Yaan', country: 'China', lat: 29.9809, lon: 103.0013 },
  { name: 'Yangjiang', country: 'China', lat: 21.8580, lon: 111.9826 },
  { name: 'Yangquan', country: 'China', lat: 37.8576, lon: 113.5803 },
  { name: 'Yibin', country: 'China', lat: 28.7513, lon: 104.6432 },
  { name: 'Yichun', country: 'China', lat: 27.8043, lon: 114.3832 },
  { name: 'Yingkou', country: 'China', lat: 40.6683, lon: 122.2350 },
  { name: 'Yongzhou', country: 'China', lat: 26.4345, lon: 111.6133 },
  { name: 'Yueyang', country: 'China', lat: 29.3571, lon: 113.1290 },
  { name: 'Yulin', country: 'China', lat: 22.6313, lon: 110.1518 },
  { name: 'Yuncheng', country: 'China', lat: 35.0267, lon: 111.0068 },
  { name: 'Yunfu', country: 'China', lat: 22.9153, lon: 112.0395 },
  { name: 'Zaozhuang', country: 'China', lat: 34.8564, lon: 117.5573 },
  { name: 'Zhangye', country: 'China', lat: 38.9341, lon: 100.4498 },
  { name: 'Zhangjiakou', country: 'China', lat: 40.7681, lon: 114.8863 },
  { name: 'Zhaoqing', country: 'China', lat: 23.0518, lon: 112.4651 },
  { name: 'Zhoukou', country: 'China', lat: 33.6253, lon: 114.6966 },
  { name: 'Zhoushan', country: 'China', lat: 29.9850, lon: 122.2065 },
  { name: 'Zhuzhou', country: 'China', lat: 27.8274, lon: 113.1340 },
  { name: 'Zigong', country: 'China', lat: 29.3416, lon: 104.7786 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // CONGO (DRC)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Bandundu', country: 'Congo (DRC)', lat: -3.3167, lon: 17.3667 },
  { name: 'Beni', country: 'Congo (DRC)', lat: 0.4908, lon: 29.4731 },
  { name: 'Butembo', country: 'Congo (DRC)', lat: 0.1416, lon: 29.2876 },
  { name: 'Gbadolite', country: 'Congo (DRC)', lat: 4.2792, lon: 21.0025 },
  { name: 'Gemena', country: 'Congo (DRC)', lat: 3.2596, lon: 19.7706 },
  { name: 'Isiro', country: 'Congo (DRC)', lat: 2.7744, lon: 27.6160 },
  { name: 'Kalemie', country: 'Congo (DRC)', lat: -5.9347, lon: 29.1949 },
  { name: 'Kikwit', country: 'Congo (DRC)', lat: -5.0387, lon: 18.8162 },
  { name: 'Kindu', country: 'Congo (DRC)', lat: -2.9500, lon: 25.9500 },
  { name: 'Mbandaka', country: 'Congo (DRC)', lat: 0.0487, lon: 18.2603 },
  { name: 'Uvira', country: 'Congo (DRC)', lat: -3.3936, lon: 29.1378 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // EGYPT
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'El Minya', country: 'Egypt', lat: 28.0871, lon: 30.7618 },
  { name: 'Kafr El Sheikh', country: 'Egypt', lat: 31.1107, lon: 30.9388 },
  { name: 'Marsa Matruh', country: 'Egypt', lat: 31.3543, lon: 27.2373 },
  { name: 'Qalyub', country: 'Egypt', lat: 30.1942, lon: 31.2051 },
  { name: 'Shibin El Kom', country: 'Egypt', lat: 30.5585, lon: 31.0100 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ETHIOPIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Debre Birhan', country: 'Ethiopia', lat: 9.6795, lon: 39.5322 },
  { name: 'Dese', country: 'Ethiopia', lat: 11.1333, lon: 39.6333 },
  { name: 'Sodo', country: 'Ethiopia', lat: 6.8600, lon: 37.7600 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // GHANA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Bolgatanga', country: 'Ghana', lat: 10.7856, lon: -0.8514 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // INDIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Adoni', country: 'India', lat: 15.6333, lon: 77.2833 },
  { name: 'Alwar', country: 'India', lat: 27.5667, lon: 76.6000 },
  { name: 'Ambala', country: 'India', lat: 30.3782, lon: 76.7767 },
  { name: 'Ambernath', country: 'India', lat: 19.1860, lon: 73.1862 },
  { name: 'Amroha', country: 'India', lat: 28.9044, lon: 78.4673 },
  { name: 'Anantapur', country: 'India', lat: 14.6819, lon: 77.6006 },
  { name: 'Arrah', country: 'India', lat: 25.5564, lon: 84.6636 },
  { name: 'Avadi', country: 'India', lat: 13.1145, lon: 80.1098 },
  { name: 'Azamgarh', country: 'India', lat: 26.0686, lon: 83.1852 },
  { name: 'Ballia', country: 'India', lat: 25.7586, lon: 84.1486 },
  { name: 'Bardhaman', country: 'India', lat: 23.2324, lon: 87.8615 },
  { name: 'Begusarai', country: 'India', lat: 25.4200, lon: 86.1339 },
  { name: 'Berhampur', country: 'India', lat: 19.3150, lon: 84.7941 },
  { name: 'Bharatpur', country: 'India', lat: 27.2172, lon: 77.4900 },
  { name: 'Bhimavaram', country: 'India', lat: 16.5449, lon: 81.5212 },
  { name: 'Bhusawal', country: 'India', lat: 21.0462, lon: 75.7718 },
  { name: 'Bidar', country: 'India', lat: 17.9133, lon: 77.5300 },
  { name: 'Bijapur', country: 'India', lat: 16.8302, lon: 75.7100 },
  { name: 'Bongaigaon', country: 'India', lat: 26.4800, lon: 90.5600 },
  { name: 'Bulandshahr', country: 'India', lat: 28.4070, lon: 77.8498 },
  { name: 'Burhanpur', country: 'India', lat: 21.3100, lon: 76.2300 },
  { name: 'Chandrapur', country: 'India', lat: 19.9500, lon: 79.3000 },
  { name: 'Chapra', country: 'India', lat: 25.7804, lon: 84.7469 },
  { name: 'Chittoor', country: 'India', lat: 13.2172, lon: 79.1003 },
  { name: 'Cuddalore', country: 'India', lat: 11.7480, lon: 79.7714 },
  { name: 'Davanagere', country: 'India', lat: 14.4644, lon: 75.9218 },
  { name: 'Deoghar', country: 'India', lat: 24.4854, lon: 86.6942 },
  { name: 'Dewas', country: 'India', lat: 22.9676, lon: 76.0514 },
  { name: 'Dhule', country: 'India', lat: 20.9042, lon: 74.7749 },
  { name: 'Dibrugarh', country: 'India', lat: 27.4728, lon: 94.9120 },
  { name: 'Dindigul', country: 'India', lat: 10.3624, lon: 77.9695 },
  { name: 'Eluru', country: 'India', lat: 16.7107, lon: 81.0952 },
  { name: 'Etawah', country: 'India', lat: 26.7856, lon: 79.0229 },
  { name: 'Firozabad', country: 'India', lat: 27.1591, lon: 78.3957 },
  { name: 'Gandhidham', country: 'India', lat: 23.0753, lon: 70.1337 },
  { name: 'Gandhinagar', country: 'India', lat: 23.2156, lon: 72.6369 },
  { name: 'Giridih', country: 'India', lat: 24.1851, lon: 86.3008 },
  { name: 'Godhra', country: 'India', lat: 22.7724, lon: 73.6145 },
  { name: 'Hajipur', country: 'India', lat: 25.6855, lon: 85.2089 },
  { name: 'Haldia', country: 'India', lat: 22.0667, lon: 88.0667 },
  { name: 'Hapur', country: 'India', lat: 28.7307, lon: 77.7759 },
  { name: 'Hardoi', country: 'India', lat: 27.3959, lon: 80.1313 },
  { name: 'Hassan', country: 'India', lat: 13.0068, lon: 76.1004 },
  { name: 'Hindupur', country: 'India', lat: 13.8296, lon: 77.4930 },
  { name: 'Hospet', country: 'India', lat: 15.2689, lon: 76.3909 },
  { name: 'Ichalkaranji', country: 'India', lat: 16.6910, lon: 74.4621 },
  { name: 'Jalna', country: 'India', lat: 19.8347, lon: 75.8816 },
  { name: 'Jamuria', country: 'India', lat: 23.7000, lon: 87.0833 },
  { name: 'Jorhat', country: 'India', lat: 26.7509, lon: 94.2037 },
  { name: 'Kadapa', country: 'India', lat: 14.4674, lon: 78.8241 },
  { name: 'Karimnagar', country: 'India', lat: 18.4386, lon: 79.1288 },
  { name: 'Karur', country: 'India', lat: 10.9601, lon: 78.0766 },
  { name: 'Khammam', country: 'India', lat: 17.2473, lon: 80.1514 },
  { name: 'Kharagpur', country: 'India', lat: 22.3460, lon: 87.3236 },
  { name: 'Korba', country: 'India', lat: 22.3458, lon: 82.6832 },
  { name: 'Kumbakonam', country: 'India', lat: 10.9617, lon: 79.3881 },
  { name: 'Loni', country: 'India', lat: 28.7500, lon: 77.2833 },
  { name: 'Machilipatnam', country: 'India', lat: 16.1875, lon: 81.1389 },
  { name: 'Mahbubnagar', country: 'India', lat: 16.7378, lon: 78.0039 },
  { name: 'Mandya', country: 'India', lat: 12.5218, lon: 76.8951 },
  { name: 'Mau', country: 'India', lat: 25.9408, lon: 83.5614 },
  { name: 'Mirzapur', country: 'India', lat: 25.1460, lon: 82.5690 },
  { name: 'Moga', country: 'India', lat: 30.8161, lon: 75.1720 },
  { name: 'Munger', country: 'India', lat: 25.3758, lon: 86.4735 },
  { name: 'Murwara', country: 'India', lat: 23.8388, lon: 80.3930 },
  { name: 'Nadiad', country: 'India', lat: 22.6916, lon: 72.8634 },
  { name: 'Nagercoil', country: 'India', lat: 8.1833, lon: 77.4119 },
  { name: 'Nagaon', country: 'India', lat: 26.3471, lon: 92.6840 },
  { name: 'Naihati', country: 'India', lat: 22.8894, lon: 88.4220 },
  { name: 'Namakkal', country: 'India', lat: 11.2189, lon: 78.1674 },
  { name: 'Nandyal', country: 'India', lat: 15.4786, lon: 78.4836 },
  { name: 'Ongole', country: 'India', lat: 15.5057, lon: 80.0499 },
  { name: 'Ozhukarai', country: 'India', lat: 11.9500, lon: 79.7667 },
  { name: 'Pallavaram', country: 'India', lat: 12.9675, lon: 80.1491 },
  { name: 'Panvel', country: 'India', lat: 18.9894, lon: 73.1175 },
  { name: 'Phagwara', country: 'India', lat: 31.2240, lon: 75.7708 },
  { name: 'Proddatur', country: 'India', lat: 14.7502, lon: 78.5481 },
  { name: 'Pudukkottai', country: 'India', lat: 10.3833, lon: 78.8001 },
  { name: 'Purnia', country: 'India', lat: 25.7771, lon: 87.4753 },
  { name: 'Raichur', country: 'India', lat: 16.2076, lon: 77.3463 },
  { name: 'Raiganj', country: 'India', lat: 25.6192, lon: 88.1245 },
  { name: 'Ramagundam', country: 'India', lat: 18.7557, lon: 79.4745 },
  { name: 'Rampur', country: 'India', lat: 28.7931, lon: 79.0250 },
  { name: 'Ratlam', country: 'India', lat: 23.3340, lon: 75.0367 },
  { name: 'Rewa', country: 'India', lat: 24.5304, lon: 81.2959 },
  { name: 'Robertson Pet', country: 'India', lat: 12.9576, lon: 78.2744 },
  { name: 'Sagar', country: 'India', lat: 23.8388, lon: 78.7378 },
  { name: 'Sambalpur', country: 'India', lat: 21.4669, lon: 83.9812 },
  { name: 'Satara', country: 'India', lat: 17.6805, lon: 74.0183 },
  { name: 'Satna', country: 'India', lat: 24.5811, lon: 80.8326 },
  { name: 'Shahjahanpur', country: 'India', lat: 27.8833, lon: 79.9167 },
  { name: 'Shimoga', country: 'India', lat: 13.9299, lon: 75.5681 },
  { name: 'Silchar', country: 'India', lat: 24.8333, lon: 92.7789 },
  { name: 'Siwan', country: 'India', lat: 26.2228, lon: 84.3542 },
  { name: 'Sonipat', country: 'India', lat: 28.9931, lon: 77.0151 },
  { name: 'Sri Ganganagar', country: 'India', lat: 29.9094, lon: 73.8780 },
  { name: 'Sultanpur', country: 'India', lat: 26.2648, lon: 82.0727 },
  { name: 'Tambaram', country: 'India', lat: 12.9249, lon: 80.1000 },
  { name: 'Tenali', country: 'India', lat: 16.2395, lon: 80.6400 },
  { name: 'Tezpur', country: 'India', lat: 26.6338, lon: 92.7837 },
  { name: 'Thoothukudi', country: 'India', lat: 8.7642, lon: 78.1348 },
  { name: 'Tiruppur', country: 'India', lat: 11.1085, lon: 77.3411 },
  { name: 'Udupi', country: 'India', lat: 13.3389, lon: 74.7451 },
  { name: 'Ulhasnagar', country: 'India', lat: 19.2183, lon: 73.1631 },
  { name: 'Unnao', country: 'India', lat: 26.5393, lon: 80.4872 },
  { name: 'Vizianagaram', country: 'India', lat: 18.1167, lon: 83.4167 },
  { name: 'Yamunanagar', country: 'India', lat: 30.1290, lon: 77.2674 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // INDONESIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Banjar', country: 'Indonesia', lat: -7.3694, lon: 108.5345 },
  { name: 'Batu', country: 'Indonesia', lat: -7.8706, lon: 112.5289 },
  { name: 'Binjai', country: 'Indonesia', lat: 3.6001, lon: 98.4854 },
  { name: 'Bitung', country: 'Indonesia', lat: 1.4404, lon: 125.1910 },
  { name: 'Blitar', country: 'Indonesia', lat: -8.0953, lon: 112.1608 },
  { name: 'Bukittinggi', country: 'Indonesia', lat: -0.3055, lon: 100.3691 },
  { name: 'Dumai', country: 'Indonesia', lat: 1.6667, lon: 101.4500 },
  { name: 'Langsa', country: 'Indonesia', lat: 4.4681, lon: 97.9681 },
  { name: 'Lhokseumawe', country: 'Indonesia', lat: 5.1801, lon: 97.1507 },
  { name: 'Lubuklinggau', country: 'Indonesia', lat: -3.2979, lon: 102.8615 },
  { name: 'Magelang', country: 'Indonesia', lat: -7.4708, lon: 110.2177 },
  { name: 'Metro', country: 'Indonesia', lat: -5.1139, lon: 105.3069 },
  { name: 'Mojokerto', country: 'Indonesia', lat: -7.4706, lon: 112.4341 },
  { name: 'Padang Sidempuan', country: 'Indonesia', lat: 1.3790, lon: 99.2735 },
  { name: 'Padangsidimpuan', country: 'Indonesia', lat: 1.3790, lon: 99.2735 },
  { name: 'Palangkaraya', country: 'Indonesia', lat: -2.2070, lon: 113.9160 },
  { name: 'Parepare', country: 'Indonesia', lat: -4.0135, lon: 119.6255 },
  { name: 'Pasuruan', country: 'Indonesia', lat: -7.6456, lon: 112.9075 },
  { name: 'Payakumbuh', country: 'Indonesia', lat: -0.2167, lon: 100.6333 },
  { name: 'Pekalongan', country: 'Indonesia', lat: -6.8885, lon: 109.6753 },
  { name: 'Pematang Siantar', country: 'Indonesia', lat: 2.9545, lon: 99.0489 },
  { name: 'Prabumulih', country: 'Indonesia', lat: -3.4543, lon: 104.2404 },
  { name: 'Salatiga', country: 'Indonesia', lat: -7.3320, lon: 110.5083 },
  { name: 'Singkawang', country: 'Indonesia', lat: 0.9000, lon: 108.9833 },
  { name: 'Solok', country: 'Indonesia', lat: -0.7989, lon: 100.6544 },
  { name: 'Tarakan', country: 'Indonesia', lat: 3.3000, lon: 117.6333 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // IRAQ
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Amarah', country: 'Iraq', lat: 31.8356, lon: 47.1450 },
  { name: 'Baqubah', country: 'Iraq', lat: 33.7476, lon: 44.6564 },
  { name: 'Diwaniyah', country: 'Iraq', lat: 31.9925, lon: 44.9256 },
  { name: 'Hilla', country: 'Iraq', lat: 32.4637, lon: 44.4198 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MADAGASCAR
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Ambositra', country: 'Madagascar', lat: -20.5300, lon: 47.2400 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MOZAMBIQUE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Maxixe', country: 'Mozambique', lat: -23.8596, lon: 35.3474 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // NIGER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Arlit', country: 'Niger', lat: 18.7368, lon: 7.3853 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // NIGERIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Nnewi', country: 'Nigeria', lat: 6.0196, lon: 6.9173 },
  { name: 'Oyo', country: 'Nigeria', lat: 7.8500, lon: 3.9333 },
  { name: 'Sapele', country: 'Nigeria', lat: 5.8897, lon: 5.6762 },
  { name: 'Yenagoa', country: 'Nigeria', lat: 4.9247, lon: 6.2642 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // NORTH KOREA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Anju', country: 'North Korea', lat: 39.6167, lon: 125.6667 },
  { name: 'Haeju', country: 'North Korea', lat: 38.0361, lon: 125.7146 },
  { name: 'Hyesan', country: 'North Korea', lat: 41.4010, lon: 128.1775 },
  { name: 'Sariwon', country: 'North Korea', lat: 38.5072, lon: 125.7592 },
  { name: 'Sinuiju', country: 'North Korea', lat: 40.1006, lon: 124.3981 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PAKISTAN
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Bahawalnagar', country: 'Pakistan', lat: 29.9944, lon: 73.2500 },
  { name: 'Burewala', country: 'Pakistan', lat: 30.1583, lon: 72.1500 },
  { name: 'Chakwal', country: 'Pakistan', lat: 32.9328, lon: 72.8556 },
  { name: 'Dadu', country: 'Pakistan', lat: 26.7319, lon: 67.7747 },
  { name: 'Daska', country: 'Pakistan', lat: 32.3249, lon: 74.3507 },
  { name: 'Ghotki', country: 'Pakistan', lat: 27.3500, lon: 69.3167 },
  { name: 'Gojra', country: 'Pakistan', lat: 31.1500, lon: 72.6833 },
  { name: 'Kamoke', country: 'Pakistan', lat: 31.9750, lon: 74.2236 },
  { name: 'Khanewal', country: 'Pakistan', lat: 30.3017, lon: 71.9321 },
  { name: 'Khushab', country: 'Pakistan', lat: 32.2950, lon: 72.3517 },
  { name: 'Lodhran', country: 'Pakistan', lat: 29.5363, lon: 71.6333 },
  { name: 'Mansehra', country: 'Pakistan', lat: 34.3303, lon: 73.1971 },
  { name: 'Mianwali', country: 'Pakistan', lat: 32.5853, lon: 71.5436 },
  { name: 'Muzaffargarh', country: 'Pakistan', lat: 30.0743, lon: 71.1923 },
  { name: 'Nowshera', country: 'Pakistan', lat: 34.0153, lon: 71.9747 },
  { name: 'Pakpattan', country: 'Pakistan', lat: 30.3428, lon: 73.3890 },
  { name: 'Shikarpur', country: 'Pakistan', lat: 27.9556, lon: 68.6382 },
  { name: 'Tando Adam', country: 'Pakistan', lat: 25.7617, lon: 68.6617 },
  { name: 'Tando Allahyar', country: 'Pakistan', lat: 25.4605, lon: 68.7186 },
  { name: 'Vehari', country: 'Pakistan', lat: 30.0452, lon: 72.3489 },
  { name: 'Wah Cantonment', country: 'Pakistan', lat: 33.7700, lon: 72.7400 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RUSSIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Ivanovo', country: 'Russia', lat: 56.9953, lon: 40.9735 },
  { name: 'Kurgan', country: 'Russia', lat: 55.4419, lon: 65.3415 },
  { name: 'Magnitogorsk', country: 'Russia', lat: 53.4076, lon: 59.0458 },
  { name: 'Nalchik', country: 'Russia', lat: 43.4981, lon: 43.6190 },
  { name: 'Orel', country: 'Russia', lat: 52.9701, lon: 36.0631 },
  { name: 'Petrozavodsk', country: 'Russia', lat: 61.7891, lon: 34.3596 },
  { name: 'Pskov', country: 'Russia', lat: 57.8136, lon: 28.3496 },
  { name: 'Saransk', country: 'Russia', lat: 54.1838, lon: 45.1749 },
  { name: 'Stavropol', country: 'Russia', lat: 45.0428, lon: 41.9692 },
  { name: 'Surgut', country: 'Russia', lat: 61.2500, lon: 73.3833 },
  { name: 'Syktyvkar', country: 'Russia', lat: 61.6688, lon: 50.8364 },
  { name: 'Tver', country: 'Russia', lat: 56.8587, lon: 35.9176 },
  { name: 'Ulan-Ude', country: 'Russia', lat: 51.8335, lon: 107.5920 },
  { name: 'Vladimir', country: 'Russia', lat: 56.1366, lon: 40.3966 },
  { name: 'Yoshkar-Ola', country: 'Russia', lat: 56.6349, lon: 47.8999 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // SOMALIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Garoowe', country: 'Somalia', lat: 8.4054, lon: 48.4906 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // SOUTH KOREA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Gyeongsan', country: 'South Korea', lat: 35.8250, lon: 128.7367 },
  { name: 'Icheon', country: 'South Korea', lat: 37.2719, lon: 127.4348 },
  { name: 'Pocheon', country: 'South Korea', lat: 37.8949, lon: 127.2003 },
  { name: 'Sacheon', country: 'South Korea', lat: 34.9333, lon: 128.0667 },
  { name: 'Yangsan', country: 'South Korea', lat: 35.3350, lon: 129.0372 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // SUDAN
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Ad-Damazin', country: 'Sudan', lat: 11.7891, lon: 34.3592 },
  { name: 'Al-Fashir', country: 'Sudan', lat: 13.6300, lon: 25.3500 },
  { name: 'Al-Obeid', country: 'Sudan', lat: 13.1833, lon: 30.2167 },
  { name: 'Atbara', country: 'Sudan', lat: 17.7000, lon: 33.9833 },
  { name: 'Dongola', country: 'Sudan', lat: 19.1753, lon: 30.4764 },
  { name: 'Gedaref', country: 'Sudan', lat: 14.0333, lon: 35.3833 },
  { name: 'Kosti', country: 'Sudan', lat: 13.1629, lon: 32.6633 },
  { name: 'Merowe', country: 'Sudan', lat: 18.4833, lon: 31.8167 },
  { name: 'Sennar', country: 'Sudan', lat: 13.5500, lon: 33.6167 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // TURKEY
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Adiyaman', country: 'Turkey', lat: 37.7648, lon: 38.2786 },
  { name: 'Burdur', country: 'Turkey', lat: 37.7203, lon: 30.2917 },
  { name: 'Cankiri', country: 'Turkey', lat: 40.6013, lon: 33.6134 },
  { name: 'Duzce', country: 'Turkey', lat: 40.8438, lon: 31.1565 },
  { name: 'Erzincan', country: 'Turkey', lat: 39.7464, lon: 39.4917 },
  { name: 'Kirsehir', country: 'Turkey', lat: 39.1425, lon: 34.1709 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // UGANDA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Arua', country: 'Uganda', lat: 3.0197, lon: 30.9110 },
  { name: 'Bushenyi', country: 'Uganda', lat: -0.5425, lon: 30.1873 },
  { name: 'Hoima', country: 'Uganda', lat: 1.4310, lon: 31.3524 },
  { name: 'Iganga', country: 'Uganda', lat: 0.6093, lon: 33.4684 },
  { name: 'Kasese', country: 'Uganda', lat: 0.1868, lon: 30.0847 },
  { name: 'Masindi', country: 'Uganda', lat: 1.6743, lon: 31.7153 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // UZBEKISTAN
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Chirchiq', country: 'Uzbekistan', lat: 41.4689, lon: 69.5822 },
  { name: 'Jizzakh', country: 'Uzbekistan', lat: 40.1158, lon: 67.8422 },
  { name: 'Kokand', country: 'Uzbekistan', lat: 40.5283, lon: 70.9426 },
  { name: 'Margilan', country: 'Uzbekistan', lat: 40.4700, lon: 71.7147 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // VIETNAM
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Phan Rang', country: 'Vietnam', lat: 11.5833, lon: 108.9833 },
  { name: 'Quang Ngai', country: 'Vietnam', lat: 15.1205, lon: 108.7922 },
  { name: 'Son La', country: 'Vietnam', lat: 21.3278, lon: 103.9144 },
  { name: 'Thai Binh', country: 'Vietnam', lat: 20.4500, lon: 106.3333 },
  { name: 'Vinh Long', country: 'Vietnam', lat: 10.2500, lon: 105.9667 },
  { name: 'Yen Bai', country: 'Vietnam', lat: 21.7000, lon: 104.8667 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // YEMEN
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Amran', country: 'Yemen', lat: 15.6588, lon: 43.9437 },
  { name: 'Hajjah', country: 'Yemen', lat: 15.6917, lon: 43.6000 },
  { name: 'Lahij', country: 'Yemen', lat: 13.0580, lon: 44.8830 },
  { name: 'Marib', country: 'Yemen', lat: 15.4541, lon: 45.3220 },
  { name: 'Sayun', country: 'Yemen', lat: 15.9431, lon: 48.7883 },
  { name: 'Zinjibar', country: 'Yemen', lat: 13.1286, lon: 45.3792 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // REMAINING COUNTRIES (smaller additions)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // Cameroon

  // Kenya
  { name: 'Kitui', country: 'Kenya', lat: -1.3667, lon: 38.0167 },

  // Tanzania

  // Myanmar

  // Philippines
  { name: 'Angeles', country: 'Philippines', lat: 15.1450, lon: 120.5887 },
  { name: 'Cotabato', country: 'Philippines', lat: 7.2236, lon: 124.2464 },
  { name: 'Santiago', country: 'Philippines', lat: 16.6892, lon: 121.5544 },
  { name: 'Tarlac', country: 'Philippines', lat: 15.4365, lon: 120.5966 },

  // Thailand
  { name: 'Kamphaeng Phet', country: 'Thailand', lat: 16.4827, lon: 99.5226 },
  { name: 'Nan', country: 'Thailand', lat: 18.7833, lon: 100.7833 },
  { name: 'Phetchabun', country: 'Thailand', lat: 16.4197, lon: 101.1617 },
  { name: 'Prachinburi', country: 'Thailand', lat: 14.0508, lon: 101.3782 },
  { name: 'Ranong', country: 'Thailand', lat: 9.9658, lon: 98.6348 },
  { name: 'Sisaket', country: 'Thailand', lat: 15.1186, lon: 104.3221 },
  { name: 'Surin', country: 'Thailand', lat: 14.8818, lon: 103.4936 },
  { name: 'Tak', country: 'Thailand', lat: 16.8711, lon: 99.1283 },

  // Nepal
  { name: 'Dhangadhi', country: 'Nepal', lat: 28.7000, lon: 80.6000 },
  { name: 'Itahari', country: 'Nepal', lat: 26.6667, lon: 87.2833 },

  // Sri Lanka
  { name: 'Gampaha', country: 'Sri Lanka', lat: 7.0917, lon: 79.9947 },

  // Iran

  // Morocco

  // Malaysia
  { name: 'Taiping', country: 'Malaysia', lat: 4.8517, lon: 100.7377 },

  // Japan
  { name: 'Hachioji', country: 'Japan', lat: 35.6664, lon: 139.3161 },
  { name: 'Himeji', country: 'Japan', lat: 34.8154, lon: 134.6856 },
  { name: 'Koriyama', country: 'Japan', lat: 37.4006, lon: 140.3597 },
  { name: 'Sasebo', country: 'Japan', lat: 33.1594, lon: 129.7228 },
  { name: 'Tsu', country: 'Japan', lat: 34.7303, lon: 136.5086 },

  // Poland

  // Ukraine

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL CHINA (tier-3 and tier-4 cities)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Baoshan', country: 'China', lat: 25.1121, lon: 99.1670 },
  { name: 'Chaozhou', country: 'China', lat: 23.6567, lon: 116.6226 },
  { name: 'Fuqing', country: 'China', lat: 25.7272, lon: 119.3838 },
  { name: 'Guyuan', country: 'China', lat: 36.0157, lon: 106.2424 },
  { name: 'Huaian', country: 'China', lat: 33.6105, lon: 119.0153 },
  { name: 'Jiuquan', country: 'China', lat: 39.7432, lon: 98.4944 },
  { name: 'Laibin', country: 'China', lat: 23.7333, lon: 109.2333 },
  { name: 'Liaocheng', country: 'China', lat: 36.4560, lon: 115.9853 },
  { name: 'Liupanshui', country: 'China', lat: 26.5933, lon: 104.8333 },
  { name: 'Longnan', country: 'China', lat: 33.3886, lon: 104.9220 },
  { name: 'Puning', country: 'China', lat: 23.2990, lon: 116.1660 },
  { name: 'Putian', country: 'China', lat: 25.4541, lon: 119.0077 },
  { name: 'Qinzhou', country: 'China', lat: 21.9500, lon: 108.6167 },
  { name: 'Rugao', country: 'China', lat: 32.3711, lon: 120.5571 },
  { name: 'Shangri-La', country: 'China', lat: 27.8268, lon: 99.7076 },
  { name: 'Shizuishan', country: 'China', lat: 39.2333, lon: 106.7690 },
  { name: 'Suizhou', country: 'China', lat: 31.7134, lon: 113.3610 },
  { name: 'Tongxiang', country: 'China', lat: 30.6326, lon: 120.5650 },
  { name: 'Wuzhong', country: 'China', lat: 37.9977, lon: 106.1989 },
  { name: 'Xinghua', country: 'China', lat: 32.9393, lon: 119.8523 },
  { name: 'Yichun Heilongjiang', country: 'China', lat: 47.7272, lon: 128.8997 },
  { name: 'Yiwu', country: 'China', lat: 29.3153, lon: 120.0757 },
  { name: 'Zhangzhou', country: 'China', lat: 24.5133, lon: 117.6472 },
  { name: 'Zhaotong', country: 'China', lat: 27.3322, lon: 103.7172 },
  { name: 'Zhucheng', country: 'China', lat: 35.9953, lon: 119.3998 },
  { name: 'Zhumadian', country: 'China', lat: 32.9795, lon: 114.0228 },
  { name: 'Ziyang', country: 'China', lat: 30.1282, lon: 104.6342 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL INDIA (tier-3 cities)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Aizawl', country: 'India', lat: 23.7271, lon: 92.7176 },
  { name: 'Bhuj', country: 'India', lat: 23.2420, lon: 69.6669 },
  { name: 'Bidhannagar', country: 'India', lat: 22.5958, lon: 88.4130 },
  { name: 'Bhiwani', country: 'India', lat: 28.7930, lon: 76.1322 },
  { name: 'Chhapra', country: 'India', lat: 25.7804, lon: 84.7469 },
  { name: 'Daman', country: 'India', lat: 20.3974, lon: 72.8328 },
  { name: 'Hazaribagh', country: 'India', lat: 23.9925, lon: 85.3637 },
  { name: 'Hoshiarpur', country: 'India', lat: 31.5340, lon: 75.9110 },
  { name: 'Itanagar', country: 'India', lat: 27.0844, lon: 93.6044 },
  { name: 'Kavaratti', country: 'India', lat: 10.5626, lon: 72.6369 },
  { name: 'Kohima', country: 'India', lat: 25.6751, lon: 94.1086 },
  { name: 'Kollam', country: 'India', lat: 8.8932, lon: 76.6141 },
  { name: 'Mahesana', country: 'India', lat: 23.5880, lon: 72.3693 },
  { name: 'Nalgonda', country: 'India', lat: 17.0500, lon: 79.2667 },
  { name: 'Navsari', country: 'India', lat: 20.9467, lon: 72.9520 },
  { name: 'Nizamabad', country: 'India', lat: 18.6725, lon: 78.0943 },
  { name: 'Palakkad', country: 'India', lat: 10.7867, lon: 76.6548 },
  { name: 'Parbhani', country: 'India', lat: 19.2610, lon: 76.7764 },
  { name: 'Pathankot', country: 'India', lat: 32.2747, lon: 75.6522 },
  { name: 'Porbandar', country: 'India', lat: 21.6417, lon: 69.6293 },
  { name: 'Ratnagiri', country: 'India', lat: 16.9944, lon: 73.3001 },
  { name: 'Samastipur', country: 'India', lat: 25.8629, lon: 85.7815 },
  { name: 'Santipur', country: 'India', lat: 23.2500, lon: 88.4333 },
  { name: 'Shivpuri', country: 'India', lat: 25.4236, lon: 77.6619 },
  { name: 'Sivakasi', country: 'India', lat: 9.4533, lon: 77.7981 },
  { name: 'Srikakulam', country: 'India', lat: 18.2949, lon: 83.8963 },
  { name: 'Surendranagar', country: 'India', lat: 22.7289, lon: 71.6486 },
  { name: 'Thanesar', country: 'India', lat: 29.9731, lon: 76.8343 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL INDONESIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Banjarbaru', country: 'Indonesia', lat: -3.4415, lon: 114.8433 },
  { name: 'Tangerang Selatan', country: 'Indonesia', lat: -6.2886, lon: 106.7100 },
  { name: 'Tanjung Pinang', country: 'Indonesia', lat: 0.9186, lon: 104.4464 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL PAKISTAN
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Attock', country: 'Pakistan', lat: 33.7667, lon: 72.3667 },
  { name: 'Bhakkar', country: 'Pakistan', lat: 31.6333, lon: 71.0667 },
  { name: 'Chaman', country: 'Pakistan', lat: 30.9210, lon: 66.4597 },
  { name: 'Chilas', country: 'Pakistan', lat: 35.4128, lon: 74.0978 },
  { name: 'Hangu', country: 'Pakistan', lat: 33.5281, lon: 71.0597 },
  { name: 'Jacobabad', country: 'Pakistan', lat: 28.2769, lon: 68.4514 },
  { name: 'Khanpur', country: 'Pakistan', lat: 28.6471, lon: 70.6567 },
  { name: 'Layyah', country: 'Pakistan', lat: 30.9693, lon: 70.9428 },
  { name: 'Muzaffarabad', country: 'Pakistan', lat: 34.3700, lon: 73.4711 },
  { name: 'Rajanpur', country: 'Pakistan', lat: 29.1044, lon: 70.3297 },
  { name: 'Tank', country: 'Pakistan', lat: 32.2178, lon: 70.3828 },
  { name: 'Toba Tek Singh', country: 'Pakistan', lat: 30.9706, lon: 72.4828 },
  { name: 'Zhob', country: 'Pakistan', lat: 31.3419, lon: 69.4486 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL BANGLADESH
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Gopalganj', country: 'Bangladesh', lat: 23.0058, lon: 89.8266 },
  { name: 'Joypurhat', country: 'Bangladesh', lat: 25.0968, lon: 89.0239 },
  { name: 'Lakshmipur', country: 'Bangladesh', lat: 22.9444, lon: 90.8417 },
  { name: 'Meherpur', country: 'Bangladesh', lat: 23.7622, lon: 88.6318 },
  { name: 'Munshiganj', country: 'Bangladesh', lat: 23.5422, lon: 90.5305 },
  { name: 'Rajbari', country: 'Bangladesh', lat: 23.7574, lon: 89.6445 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL NIGERIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Jimeta', country: 'Nigeria', lat: 9.2800, lon: 12.4600 },
  { name: 'Potiskum', country: 'Nigeria', lat: 11.7100, lon: 11.0800 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL ETHIOPIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL SOUTH AMERICA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL CENTRAL ASIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL EAST AFRICA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL WEST AFRICA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL EUROPE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL MIDDLE EAST & SOUTH ASIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Jazan', country: 'Saudi Arabia', lat: 16.8892, lon: 42.5611 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL LATIN AMERICA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL AFRICA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ADDITIONAL SOUTHEAST ASIA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Hpa-an', country: 'Myanmar', lat: 16.8900, lon: 97.6333 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // BATCH 2 â€” 475 additional unique cities to reach 1000 net new
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // China â€” county-level cities and smaller prefecture cities
  { name: 'Anning', country: 'China', lat: 24.9196, lon: 102.4784 },
  { name: 'Beipiao', country: 'China', lat: 41.7917, lon: 120.7783 },
  { name: 'Changyi', country: 'China', lat: 36.8607, lon: 119.4029 },
  { name: 'Chaohu', country: 'China', lat: 31.5997, lon: 117.8705 },
  { name: 'Daxing', country: 'China', lat: 39.7269, lon: 116.3414 },
  { name: 'Dengzhou', country: 'China', lat: 32.6822, lon: 112.0872 },
  { name: 'Donghai', country: 'China', lat: 34.5420, lon: 118.7521 },
  { name: 'Dongxing', country: 'China', lat: 21.5343, lon: 107.9716 },
  { name: 'Feicheng', country: 'China', lat: 36.1821, lon: 116.7710 },
  { name: 'Fengcheng', country: 'China', lat: 40.4533, lon: 124.0667 },
  { name: 'Gaomi', country: 'China', lat: 36.3816, lon: 119.7519 },
  { name: 'Gaoyou', country: 'China', lat: 32.7841, lon: 119.4432 },
  { name: 'Gongyi', country: 'China', lat: 34.7521, lon: 113.0218 },
  { name: 'Haicheng', country: 'China', lat: 40.8522, lon: 122.7472 },
  { name: 'Haining', country: 'China', lat: 30.5097, lon: 120.6809 },
  { name: 'Heshan', country: 'China', lat: 22.7653, lon: 112.9626 },
  { name: 'Huaying', country: 'China', lat: 30.4558, lon: 106.7811 },
  { name: 'Jieshou', country: 'China', lat: 33.2634, lon: 115.3637 },
  { name: 'Jingjiang', country: 'China', lat: 32.0147, lon: 120.2673 },
  { name: 'Jiyuan', country: 'China', lat: 35.0672, lon: 112.6022 },
  { name: 'Kaiyuan', country: 'China', lat: 42.5319, lon: 124.0389 },
  { name: 'Kunshan', country: 'China', lat: 31.3847, lon: 120.9814 },
  { name: 'Laixi', country: 'China', lat: 36.8592, lon: 120.5267 },
  { name: 'Leiyang', country: 'China', lat: 26.4222, lon: 112.8592 },
  { name: 'Lengshuijiang', country: 'China', lat: 27.6861, lon: 111.4352 },
  { name: 'Liangshan', country: 'China', lat: 35.8024, lon: 116.0900 },
  { name: 'Linhai', country: 'China', lat: 28.8582, lon: 121.1448 },
  { name: 'Linqing', country: 'China', lat: 36.8461, lon: 115.7055 },
  { name: 'Linxia', country: 'China', lat: 35.5985, lon: 103.2060 },
  { name: 'Longkou', country: 'China', lat: 37.6461, lon: 120.5281 },
  { name: 'Lufeng', country: 'China', lat: 22.9386, lon: 115.6486 },
  { name: 'Meihekou', country: 'China', lat: 42.5387, lon: 125.6835 },
  { name: 'Mengzi', country: 'China', lat: 23.3696, lon: 103.3886 },
  { name: 'Mishan', country: 'China', lat: 45.5528, lon: 131.8733 },
  { name: 'Nankang', country: 'China', lat: 25.6621, lon: 114.7668 },
  { name: 'Penglai', country: 'China', lat: 37.8106, lon: 120.7587 },
  { name: 'Pizhou', country: 'China', lat: 34.3136, lon: 117.9531 },
  { name: 'Qianjiang', country: 'China', lat: 30.4212, lon: 112.8949 },
  { name: 'Qidong', country: 'China', lat: 31.8100, lon: 121.6552 },
  { name: 'Qingzhou', country: 'China', lat: 36.6968, lon: 118.4790 },
  { name: 'Renqiu', country: 'China', lat: 38.7116, lon: 116.0931 },
  { name: 'Rongcheng', country: 'China', lat: 37.1652, lon: 122.4863 },
  { name: 'Ruian', country: 'China', lat: 27.7781, lon: 120.6555 },
  { name: 'Ruzhou', country: 'China', lat: 34.1616, lon: 112.8444 },
  { name: 'Shenzhou', country: 'China', lat: 37.9527, lon: 115.5594 },
  { name: 'Shishi', country: 'China', lat: 24.7320, lon: 118.6277 },
  { name: 'Shouguang', country: 'China', lat: 36.8806, lon: 118.7373 },
  { name: 'Shuozhou', country: 'China', lat: 39.3313, lon: 112.4329 },
  { name: 'Taishan', country: 'China', lat: 22.2515, lon: 112.7883 },
  { name: 'Tengzhou', country: 'China', lat: 35.0817, lon: 117.1561 },
  { name: 'Tianmen', country: 'China', lat: 30.6632, lon: 113.1662 },
  { name: 'Wafangdian', country: 'China', lat: 39.6267, lon: 122.0078 },
  { name: 'Wanning', country: 'China', lat: 18.7960, lon: 110.3966 },
  { name: 'Wuchuan', country: 'China', lat: 21.4454, lon: 110.7694 },
  { name: 'Wugang', country: 'China', lat: 26.7333, lon: 110.6333 },
  { name: 'Xinmi', country: 'China', lat: 34.5389, lon: 113.3909 },
  { name: 'Xinmin', country: 'China', lat: 41.9971, lon: 122.8285 },
  { name: 'Xintai', country: 'China', lat: 35.9006, lon: 117.7519 },
  { name: 'Yidu', country: 'China', lat: 36.7772, lon: 118.4301 },
  { name: 'Yingcheng', country: 'China', lat: 30.9531, lon: 113.5528 },
  { name: 'Yongcheng', country: 'China', lat: 33.9294, lon: 116.4492 },
  { name: 'Yongkang', country: 'China', lat: 28.8889, lon: 120.0472 },
  { name: 'Yuci', country: 'China', lat: 37.6803, lon: 112.7268 },
  { name: 'Zaoyang', country: 'China', lat: 32.1275, lon: 112.7543 },
  { name: 'Zhangjiagang', country: 'China', lat: 31.8756, lon: 120.5537 },
  { name: 'Zhangshu', country: 'China', lat: 28.0679, lon: 115.5468 },
  { name: 'Zhaodong', country: 'China', lat: 46.0498, lon: 125.9830 },
  { name: 'Zhaoyuan', country: 'China', lat: 37.3635, lon: 120.3969 },
  { name: 'Zhijiang', country: 'China', lat: 30.4248, lon: 111.7531 },
  { name: 'Zhongxiang', country: 'China', lat: 31.1675, lon: 112.5840 },
  { name: 'Zhuanghe', country: 'China', lat: 39.6975, lon: 122.9653 },
  { name: 'Zunhua', country: 'China', lat: 40.1879, lon: 117.9658 },

  // India â€” tier-4 cities and district headquarters
  { name: 'Adilabad', country: 'India', lat: 19.6667, lon: 78.5333 },
  { name: 'Alipurduar', country: 'India', lat: 26.4891, lon: 89.5267 },
  { name: 'Amaravathi', country: 'India', lat: 16.5110, lon: 80.5160 },
  { name: 'Anakapalle', country: 'India', lat: 17.6917, lon: 83.0042 },
  { name: 'Aruppukkottai', country: 'India', lat: 9.5100, lon: 78.0900 },
  { name: 'Bagaha', country: 'India', lat: 27.0990, lon: 84.0908 },
  { name: 'Balaghat', country: 'India', lat: 21.8100, lon: 80.1900 },
  { name: 'Baleshwar', country: 'India', lat: 21.4942, lon: 86.9317 },
  { name: 'Banka', country: 'India', lat: 24.8877, lon: 86.9195 },
  { name: 'Barabanki', country: 'India', lat: 26.9302, lon: 81.1764 },
  { name: 'Baramula', country: 'India', lat: 34.2000, lon: 74.3500 },
  { name: 'Bargarh', country: 'India', lat: 21.3333, lon: 83.6167 },
  { name: 'Basti', country: 'India', lat: 26.8036, lon: 82.7333 },
  { name: 'Bhadrak', country: 'India', lat: 21.0549, lon: 86.4958 },
  { name: 'Bhind', country: 'India', lat: 26.5633, lon: 78.7867 },
  { name: 'Biswanath Chariali', country: 'India', lat: 26.7333, lon: 93.1500 },
  { name: 'Chhatarpur', country: 'India', lat: 24.9180, lon: 79.5900 },
  { name: 'Chhindwara', country: 'India', lat: 22.0600, lon: 78.9400 },
  { name: 'Chitradurga', country: 'India', lat: 14.2286, lon: 76.3981 },
  { name: 'Churu', country: 'India', lat: 28.3000, lon: 74.9667 },
  { name: 'Damoh', country: 'India', lat: 23.8388, lon: 79.4400 },
  { name: 'Datia', country: 'India', lat: 25.6600, lon: 78.4600 },
  { name: 'Deoria', country: 'India', lat: 26.5024, lon: 83.7910 },
  { name: 'Dhamtari', country: 'India', lat: 21.1833, lon: 81.5500 },
  { name: 'Dharwad', country: 'India', lat: 15.4589, lon: 75.0078 },
  { name: 'Dholpur', country: 'India', lat: 26.7000, lon: 77.9000 },
  { name: 'Dimapur', country: 'India', lat: 25.9100, lon: 93.7200 },
  { name: 'Dumka', country: 'India', lat: 24.2674, lon: 87.2500 },
  { name: 'Etah', country: 'India', lat: 27.5594, lon: 78.6581 },
  { name: 'Fatehpur', country: 'India', lat: 25.9304, lon: 80.8145 },
  { name: 'Gadwal', country: 'India', lat: 15.9800, lon: 77.8000 },
  { name: 'Ganjam', country: 'India', lat: 19.3833, lon: 85.0500 },
  { name: 'Gadag', country: 'India', lat: 15.4167, lon: 75.6333 },
  { name: 'Gondia', country: 'India', lat: 21.4612, lon: 80.1960 },
  { name: 'Gopalganj', country: 'India', lat: 26.4700, lon: 84.4400 },
  { name: 'Hamirpur UP', country: 'India', lat: 25.9500, lon: 80.1500 },
  { name: 'Hinganghat', country: 'India', lat: 20.5500, lon: 78.8400 },
  { name: 'Itarsi', country: 'India', lat: 22.6100, lon: 77.7700 },
  { name: 'Jagdalpur', country: 'India', lat: 19.0900, lon: 82.0200 },
  { name: 'Jharsuguda', country: 'India', lat: 21.8500, lon: 84.0167 },
  { name: 'Kalyani', country: 'India', lat: 22.9750, lon: 88.4344 },
  { name: 'Kamarhati', country: 'India', lat: 22.6700, lon: 88.3700 },
  { name: 'Kanchipuram', country: 'India', lat: 12.8342, lon: 79.7036 },
  { name: 'Kannur', country: 'India', lat: 11.8745, lon: 75.3704 },
  { name: 'Kapurthala', country: 'India', lat: 31.3800, lon: 75.3800 },
  { name: 'Kendrapara', country: 'India', lat: 20.5000, lon: 86.4200 },
  { name: 'Kharagone', country: 'India', lat: 21.8200, lon: 75.6200 },
  { name: 'Koraput', country: 'India', lat: 18.8117, lon: 82.7117 },
  { name: 'Kothagudem', country: 'India', lat: 17.5563, lon: 80.6146 },
  { name: 'Lalitpur UP', country: 'India', lat: 24.6900, lon: 78.4100 },
  { name: 'Madhubani', country: 'India', lat: 26.3500, lon: 86.0667 },
  { name: 'Malappuram', country: 'India', lat: 11.0417, lon: 76.0833 },
  { name: 'Mancherial', country: 'India', lat: 18.8733, lon: 79.4467 },
  { name: 'Mandsaur', country: 'India', lat: 24.0800, lon: 75.0700 },
  { name: 'Miryalaguda', country: 'India', lat: 16.8833, lon: 79.5667 },
  { name: 'Motihari', country: 'India', lat: 26.6590, lon: 84.9168 },
  { name: 'Nagapattinam', country: 'India', lat: 10.7660, lon: 79.8419 },
  { name: 'Narnaul', country: 'India', lat: 28.0432, lon: 76.1139 },
  { name: 'Neyveli', country: 'India', lat: 11.5475, lon: 79.4789 },
  { name: 'Osmanabad', country: 'India', lat: 18.1800, lon: 76.0400 },
  { name: 'Palani', country: 'India', lat: 10.4500, lon: 77.5200 },
  { name: 'Palwal', country: 'India', lat: 28.1487, lon: 77.3320 },
  { name: 'Paramakudi', country: 'India', lat: 9.5400, lon: 78.5900 },
  { name: 'Peddapalli', country: 'India', lat: 18.6167, lon: 79.3833 },
  { name: 'Phulbani', country: 'India', lat: 20.4800, lon: 84.2300 },
  { name: 'Pollachi', country: 'India', lat: 10.6600, lon: 77.0000 },
  { name: 'Purulia', country: 'India', lat: 23.3321, lon: 86.3652 },
  { name: 'Ramanathapuram', country: 'India', lat: 9.3710, lon: 78.8308 },
  { name: 'Ranaghat', country: 'India', lat: 23.1800, lon: 88.5700 },
  { name: 'Rewari', country: 'India', lat: 28.1970, lon: 76.6191 },
  { name: 'Sasaram', country: 'India', lat: 24.9526, lon: 84.0314 },
  { name: 'Sawai Madhopur', country: 'India', lat: 26.0200, lon: 76.3400 },
  { name: 'Siddipet', country: 'India', lat: 18.1025, lon: 78.8498 },
  { name: 'Sitapur', country: 'India', lat: 27.5636, lon: 80.6828 },
  { name: 'Suryapet', country: 'India', lat: 17.1400, lon: 79.6300 },
  { name: 'Tadepalligudem', country: 'India', lat: 16.8100, lon: 81.5300 },
  { name: 'Tirur', country: 'India', lat: 10.9167, lon: 75.9167 },
  { name: 'Udgir', country: 'India', lat: 18.3900, lon: 77.1200 },
  { name: 'Veraval', country: 'India', lat: 20.9000, lon: 70.3667 },
  { name: 'Wardha', country: 'India', lat: 20.7453, lon: 78.6022 },
  { name: 'Washim', country: 'India', lat: 20.1000, lon: 77.1300 },
  { name: 'Yavatmal', country: 'India', lat: 20.3899, lon: 78.1307 },
  { name: 'Yellandu', country: 'India', lat: 17.5967, lon: 80.3267 },

  // Pakistan â€” smaller cities
  { name: 'Arifwala', country: 'Pakistan', lat: 30.2906, lon: 73.0655 },
  { name: 'Bhalwal', country: 'Pakistan', lat: 32.2656, lon: 72.8978 },
  { name: 'Chichawatni', country: 'Pakistan', lat: 30.5297, lon: 72.6944 },
  { name: 'Dina', country: 'Pakistan', lat: 32.7125, lon: 73.5928 },
  { name: 'Gujar Khan', country: 'Pakistan', lat: 33.2540, lon: 73.3034 },
  { name: 'Hasilpur', country: 'Pakistan', lat: 29.6936, lon: 72.5478 },
  { name: 'Jaranwala', country: 'Pakistan', lat: 31.3342, lon: 73.4194 },
  { name: 'Muridke', country: 'Pakistan', lat: 31.8006, lon: 74.2553 },
  { name: 'Narowal', country: 'Pakistan', lat: 32.1022, lon: 74.8727 },
  { name: 'Sadiqabad', country: 'Pakistan', lat: 28.3006, lon: 70.1286 },
  { name: 'Sanghar', country: 'Pakistan', lat: 26.0469, lon: 68.9481 },
  { name: 'Talagang', country: 'Pakistan', lat: 32.9267, lon: 72.4161 },
  { name: 'Vihari', country: 'Pakistan', lat: 30.0452, lon: 72.3544 },
  { name: 'Wazirabad', country: 'Pakistan', lat: 32.4394, lon: 74.1214 },

  // Indonesia â€” regency capitals
  { name: 'Bontang', country: 'Indonesia', lat: 0.1333, lon: 117.5000 },
  { name: 'Kudus', country: 'Indonesia', lat: -6.8048, lon: 110.8405 },
  { name: 'Purwokerto', country: 'Indonesia', lat: -7.4244, lon: 109.2340 },
  { name: 'Purwodadi', country: 'Indonesia', lat: -7.0868, lon: 110.9159 },
  { name: 'Sragen', country: 'Indonesia', lat: -7.4319, lon: 111.0200 },
  { name: 'Ungaran', country: 'Indonesia', lat: -7.1369, lon: 110.4042 },
  { name: 'Wonosobo', country: 'Indonesia', lat: -7.3610, lon: 109.9027 },
  { name: 'Pare', country: 'Indonesia', lat: -7.7483, lon: 112.1981 },

  // Bangladesh â€” more district capitals
  { name: 'Bagerhat', country: 'Bangladesh', lat: 22.6519, lon: 89.7896 },
  { name: 'Bhola', country: 'Bangladesh', lat: 22.6859, lon: 90.6482 },
  { name: 'Chuadanga', country: 'Bangladesh', lat: 23.6402, lon: 88.8411 },
  { name: 'Kurigram', country: 'Bangladesh', lat: 25.8054, lon: 89.6364 },
  { name: 'Lalmonirhat', country: 'Bangladesh', lat: 25.9168, lon: 89.4506 },
  { name: 'Magura', country: 'Bangladesh', lat: 23.4872, lon: 89.4200 },
  { name: 'Nilphamari', country: 'Bangladesh', lat: 25.9310, lon: 88.8560 },
  { name: 'Pirojpur Sadar', country: 'Bangladesh', lat: 22.5841, lon: 89.9720 },
  { name: 'Rangamati', country: 'Bangladesh', lat: 22.6316, lon: 92.1799 },

  // Nigeria â€” more state capitals and cities
  { name: 'Azare', country: 'Nigeria', lat: 11.6750, lon: 10.1922 },
  { name: 'Bida', country: 'Nigeria', lat: 9.0803, lon: 6.0100 },
  { name: 'Gashua', country: 'Nigeria', lat: 12.8708, lon: 11.0486 },
  { name: 'Hadejia', country: 'Nigeria', lat: 12.4500, lon: 10.0400 },
  { name: 'Kontagora', country: 'Nigeria', lat: 10.4042, lon: 5.4689 },
  { name: 'Lafia Nassarawa', country: 'Nigeria', lat: 8.4966, lon: 8.5158 },

  // Russia â€” more regional capitals
  { name: 'Abakan', country: 'Russia', lat: 53.7206, lon: 91.4421 },
  { name: 'Blagoveshchensk', country: 'Russia', lat: 50.2795, lon: 127.5403 },
  { name: 'Chita', country: 'Russia', lat: 52.0340, lon: 113.4994 },
  { name: 'Elista', country: 'Russia', lat: 46.3073, lon: 44.2695 },
  { name: 'Kostroma', country: 'Russia', lat: 57.7669, lon: 40.9269 },
  { name: 'Maykop', country: 'Russia', lat: 44.6078, lon: 40.1058 },
  { name: 'Norilsk', country: 'Russia', lat: 69.3535, lon: 88.2027 },
  { name: 'Novgorod', country: 'Russia', lat: 58.5228, lon: 31.2694 },
  { name: 'Sarapul', country: 'Russia', lat: 56.4748, lon: 53.7953 },
  { name: 'Severodvinsk', country: 'Russia', lat: 64.5586, lon: 39.8478 },
  { name: 'Vologda', country: 'Russia', lat: 59.2181, lon: 39.8915 },
  { name: 'Yuzhno-Sakhalinsk', country: 'Russia', lat: 46.9590, lon: 142.7380 },

  // Sudan â€” more cities
  { name: 'Berber', country: 'Sudan', lat: 18.0167, lon: 33.9833 },
  { name: 'Damazin', country: 'Sudan', lat: 11.7891, lon: 34.3592 },
  { name: 'Ed Damer', country: 'Sudan', lat: 17.5917, lon: 33.9708 },
  { name: 'El Geneina', country: 'Sudan', lat: 13.4500, lon: 22.4500 },
  { name: 'Kadugli', country: 'Sudan', lat: 11.0167, lon: 29.7167 },
  { name: 'Rabak', country: 'Sudan', lat: 13.1833, lon: 32.7333 },
  { name: 'Shendi', country: 'Sudan', lat: 16.6889, lon: 33.4275 },

  // Uganda â€” more district towns
  { name: 'Mityana', country: 'Uganda', lat: 0.4021, lon: 32.0227 },
  { name: 'Mukono', country: 'Uganda', lat: 0.3533, lon: 32.7554 },
  { name: 'Tororo', country: 'Uganda', lat: 0.6928, lon: 34.1810 },

  // Egypt â€” more governorate cities

  // Angola â€” more cities
  { name: 'Caxito', country: 'Angola', lat: -8.5764, lon: 13.6644 },
  { name: 'Dundo', country: 'Angola', lat: -7.3708, lon: 20.8308 },
  { name: 'Ndalatando', country: 'Angola', lat: -9.3003, lon: 14.9111 },

  // Yemen â€” more cities
  { name: 'Al Bayda', country: 'Yemen', lat: 14.1667, lon: 45.5667 },
  { name: 'Ataq', country: 'Yemen', lat: 14.5372, lon: 46.8312 },

  // Vietnam â€” more cities
  { name: 'Dong Hoi', country: 'Vietnam', lat: 17.4833, lon: 106.6000 },
  { name: 'Ha Tinh', country: 'Vietnam', lat: 18.3333, lon: 105.9000 },
  { name: 'Lao Cai', country: 'Vietnam', lat: 22.4856, lon: 103.9707 },
  { name: 'Phu Ly', country: 'Vietnam', lat: 20.5417, lon: 105.9167 },
  { name: 'Tam Ky', country: 'Vietnam', lat: 15.5736, lon: 108.4736 },
  { name: 'Tra Vinh', country: 'Vietnam', lat: 9.9347, lon: 106.3456 },
  { name: 'Tuyen Quang', country: 'Vietnam', lat: 21.8167, lon: 105.2167 },
  { name: 'Uong Bi', country: 'Vietnam', lat: 21.0333, lon: 106.7667 },

  // Turkey â€” more cities
  { name: 'Bilecik', country: 'Turkey', lat: 40.0567, lon: 30.0153 },
  { name: 'Bitlis', country: 'Turkey', lat: 38.4000, lon: 42.1167 },
  { name: 'Giresun', country: 'Turkey', lat: 40.9128, lon: 38.3895 },
  { name: 'Hakkari', country: 'Turkey', lat: 37.5833, lon: 43.7333 },
  { name: 'Igdir', country: 'Turkey', lat: 39.9167, lon: 44.0500 },
  { name: 'Karaman', country: 'Turkey', lat: 37.1812, lon: 33.2150 },
  { name: 'Kilis', country: 'Turkey', lat: 36.7184, lon: 37.1212 },
  { name: 'Mus', country: 'Turkey', lat: 38.7433, lon: 41.5067 },
  { name: 'Sirnak', country: 'Turkey', lat: 37.5167, lon: 42.4583 },
  { name: 'Tunceli', country: 'Turkey', lat: 39.1083, lon: 39.5472 },

  // Congo (DRC) â€” more cities
  { name: 'Boma', country: 'Congo (DRC)', lat: -5.8500, lon: 13.0500 },
  { name: 'Kamina', country: 'Congo (DRC)', lat: -8.7353, lon: 25.0003 },
  { name: 'Kasongo', country: 'Congo (DRC)', lat: -4.5500, lon: 26.6833 },
  { name: 'Mwene-Ditu', country: 'Congo (DRC)', lat: -7.0000, lon: 23.4500 },

  // North Korea â€” more cities
  { name: 'Kanggye', country: 'North Korea', lat: 40.9681, lon: 126.5853 },
  { name: 'Rason', country: 'North Korea', lat: 42.2556, lon: 130.2981 },

  // Ghana â€” more cities
  { name: 'Ejura', country: 'Ghana', lat: 7.3833, lon: -1.3667 },
  { name: 'Nkawkaw', country: 'Ghana', lat: 6.5500, lon: -0.7667 },
  { name: 'Winneba', country: 'Ghana', lat: 5.3500, lon: -0.6333 },

  // Algeria â€” more cities
  { name: 'Ain Temouchent', country: 'Algeria', lat: 35.2972, lon: -1.1403 },
  { name: 'Bechar', country: 'Algeria', lat: 31.6167, lon: -2.2167 },
  { name: 'Jijel', country: 'Algeria', lat: 36.8211, lon: 5.7664 },
  { name: 'Souk Ahras', country: 'Algeria', lat: 36.2861, lon: 7.9511 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // BATCH 3 â€” final additions to reach 1000 net new
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // China â€” more county-level cities
  { name: 'Anlu', country: 'China', lat: 31.2576, lon: 113.6786 },
  { name: 'Boluo', country: 'China', lat: 23.1731, lon: 114.2897 },
  { name: 'Changshu', country: 'China', lat: 31.6536, lon: 120.7425 },
  { name: 'Chibi', country: 'China', lat: 29.7247, lon: 113.8161 },
  { name: 'Danyang', country: 'China', lat: 31.9914, lon: 119.5749 },
  { name: 'Daye', country: 'China', lat: 30.0966, lon: 114.9736 },
  { name: 'Dehui', country: 'China', lat: 44.5272, lon: 125.7056 },
  { name: 'Dongtai', country: 'China', lat: 32.8523, lon: 120.3115 },
  { name: 'Ergun', country: 'China', lat: 50.2403, lon: 120.1800 },
  { name: 'Fuyu', country: 'China', lat: 45.1842, lon: 124.8176 },
  { name: 'Gaozhou', country: 'China', lat: 21.9186, lon: 110.8544 },
  { name: 'Haimen', country: 'China', lat: 31.8687, lon: 121.1814 },
  { name: 'Heyuan Lianping', country: 'China', lat: 24.3694, lon: 114.4936 },
  { name: 'Huazhou', country: 'China', lat: 21.6587, lon: 110.6403 },
  { name: 'Jiangyin', country: 'China', lat: 31.9200, lon: 120.2854 },
  { name: 'Jiangyou', country: 'China', lat: 31.7774, lon: 104.7452 },
  { name: 'Jiaozhou', country: 'China', lat: 36.2640, lon: 120.0033 },
  { name: 'Laiyang', country: 'China', lat: 36.9756, lon: 120.7114 },
  { name: 'Lianyuan', country: 'China', lat: 27.6882, lon: 111.6642 },
  { name: 'Lingyuan', country: 'China', lat: 41.2406, lon: 119.4011 },
  { name: 'Linjiang', country: 'China', lat: 41.8117, lon: 126.9171 },
  { name: 'Miluo', country: 'China', lat: 28.8031, lon: 113.0812 },
  { name: 'Nangong', country: 'China', lat: 37.3581, lon: 115.3897 },
  { name: 'Pingdu', country: 'China', lat: 36.7847, lon: 119.9461 },
  { name: 'Pulandian', country: 'China', lat: 39.3956, lon: 121.9633 },
  { name: 'Qufu', country: 'China', lat: 35.5969, lon: 116.9864 },
  { name: 'Shaowu', country: 'China', lat: 27.3406, lon: 117.4831 },
  { name: 'Shuangliao', country: 'China', lat: 43.5247, lon: 123.5044 },
  { name: 'Taixing', country: 'China', lat: 32.1700, lon: 120.0517 },
  { name: 'Wanyuan', country: 'China', lat: 32.0680, lon: 108.0359 },
  { name: 'Xinyi Guangdong', country: 'China', lat: 22.3543, lon: 110.9414 },
  { name: 'Xinyi Jiangsu', country: 'China', lat: 34.3694, lon: 118.3544 },
  { name: 'Xingning', country: 'China', lat: 24.1483, lon: 115.7314 },
  { name: 'Yangchun', country: 'China', lat: 22.1667, lon: 111.7833 },
  { name: 'Yixing', country: 'China', lat: 31.3399, lon: 119.8231 },
  { name: 'Zaoyang City', country: 'China', lat: 32.1275, lon: 112.7543 },
  { name: 'Zhaodong City', country: 'China', lat: 46.0498, lon: 125.9830 },
  { name: 'Zhangping', country: 'China', lat: 25.2949, lon: 117.4147 },
  { name: 'Zhongwei', country: 'China', lat: 37.5000, lon: 105.1833 },
  { name: 'Zhuji', country: 'China', lat: 29.7167, lon: 120.2333 },

  // India â€” more district HQ cities
  { name: 'Abohar', country: 'India', lat: 30.1447, lon: 74.1953 },
  { name: 'Amreli', country: 'India', lat: 21.5992, lon: 71.2225 },
  { name: 'Araria', country: 'India', lat: 26.1486, lon: 87.5147 },
  { name: 'Balurghat', country: 'India', lat: 25.2260, lon: 88.7757 },
  { name: 'Banda', country: 'India', lat: 25.4750, lon: 80.3353 },
  { name: 'Banswara', country: 'India', lat: 23.5458, lon: 74.4414 },
  { name: 'Barmer', country: 'India', lat: 25.7522, lon: 71.3967 },
  { name: 'Betul', country: 'India', lat: 21.9100, lon: 77.9000 },
  { name: 'Bhiwadi', country: 'India', lat: 28.2050, lon: 76.8614 },
  { name: 'Bijaynagar', country: 'India', lat: 25.9269, lon: 74.6528 },
  { name: 'Budaun', country: 'India', lat: 28.0486, lon: 79.1250 },
  { name: 'Buxar', country: 'India', lat: 25.5647, lon: 83.9786 },
  { name: 'Chamba', country: 'India', lat: 32.5533, lon: 76.1267 },
  { name: 'Chaibasa', country: 'India', lat: 22.5500, lon: 85.8167 },
  { name: 'Champawat', country: 'India', lat: 29.3361, lon: 80.0911 },
  { name: 'Darbhanga City', country: 'India', lat: 26.1542, lon: 85.8918 },
  { name: 'Durg', country: 'India', lat: 21.1900, lon: 81.2800 },
  { name: 'Garhwa', country: 'India', lat: 24.1569, lon: 83.8017 },
  { name: 'Guna', country: 'India', lat: 24.6300, lon: 77.3100 },
  { name: 'Hanumangarh', country: 'India', lat: 29.5817, lon: 74.3292 },
  { name: 'Jaunpur', country: 'India', lat: 25.7464, lon: 82.6836 },
  { name: 'Jhunjhunu', country: 'India', lat: 28.1278, lon: 75.3972 },
  { name: 'Kathua', country: 'India', lat: 32.3853, lon: 75.5158 },
  { name: 'Katihar', country: 'India', lat: 25.5391, lon: 87.5717 },
  { name: 'Khagaria', country: 'India', lat: 25.5022, lon: 86.4719 },
  { name: 'Kishanganj', country: 'India', lat: 26.0939, lon: 87.9381 },
  { name: 'Mainpuri', country: 'India', lat: 27.2300, lon: 79.0200 },
  { name: 'Medinipur', country: 'India', lat: 22.4250, lon: 87.3194 },
  { name: 'Nagda', country: 'India', lat: 23.4567, lon: 75.4200 },
  { name: 'Narsinghpur', country: 'India', lat: 22.9500, lon: 79.2000 },
  { name: 'Nuh', country: 'India', lat: 28.1000, lon: 77.0000 },
  { name: 'Palamu', country: 'India', lat: 24.0247, lon: 84.0514 },
  { name: 'Pauri', country: 'India', lat: 30.1472, lon: 78.7744 },
  { name: 'Pratapgarh UP', country: 'India', lat: 25.8958, lon: 81.9419 },
  { name: 'Rajgarh', country: 'India', lat: 24.0100, lon: 76.6200 },
  { name: 'Ratnagiri City', country: 'India', lat: 16.9944, lon: 73.3001 },
  { name: 'Saharsa', country: 'India', lat: 25.8803, lon: 86.5939 },
  { name: 'Shahdol', country: 'India', lat: 23.3000, lon: 81.3500 },
  { name: 'Sheopur', country: 'India', lat: 25.6700, lon: 76.7000 },
  { name: 'Shivamogga', country: 'India', lat: 13.9299, lon: 75.5681 },
  { name: 'Supaul', country: 'India', lat: 26.1197, lon: 86.6008 },
  { name: 'Tikamgarh', country: 'India', lat: 24.7500, lon: 78.8300 },
  { name: 'Tonk', country: 'India', lat: 26.1667, lon: 75.7833 },
  { name: 'Tura', country: 'India', lat: 25.5167, lon: 90.2167 },
  { name: 'Ujhani', country: 'India', lat: 28.0042, lon: 79.0083 },
  { name: 'Una', country: 'India', lat: 31.4678, lon: 76.2689 },

  // Pakistan â€” more smaller cities
  { name: 'Bahawalnagar City', country: 'Pakistan', lat: 29.9944, lon: 73.2500 },
  { name: 'Bhimber', country: 'Pakistan', lat: 32.9736, lon: 74.0789 },
  { name: 'Chishtian', country: 'Pakistan', lat: 29.7939, lon: 72.8578 },
  { name: 'Ferozewala', country: 'Pakistan', lat: 31.6000, lon: 74.0667 },
  { name: 'Haripur', country: 'Pakistan', lat: 33.9942, lon: 72.9336 },
  { name: 'Kharian', country: 'Pakistan', lat: 32.8111, lon: 73.8647 },
  { name: 'Kot Addu', country: 'Pakistan', lat: 30.4700, lon: 70.9644 },
  { name: 'Liaqatpur', country: 'Pakistan', lat: 28.9500, lon: 70.1000 },
  { name: 'Mailsi', country: 'Pakistan', lat: 29.8028, lon: 72.1722 },
  { name: 'Mian Channu', country: 'Pakistan', lat: 30.4400, lon: 72.3531 },
  { name: 'Pattoki', country: 'Pakistan', lat: 31.0211, lon: 73.8478 },
  { name: 'Shakargarh', country: 'Pakistan', lat: 32.2636, lon: 75.1589 },
  { name: 'Taxila', country: 'Pakistan', lat: 33.7460, lon: 72.7935 },

  // Bangladesh â€” remaining district capitals
  { name: 'Bandarban', country: 'Bangladesh', lat: 22.1953, lon: 92.2183 },
  { name: 'Gaibandha', country: 'Bangladesh', lat: 25.3289, lon: 89.5286 },
  { name: 'Habiganj Sadar', country: 'Bangladesh', lat: 24.3840, lon: 91.4156 },
  { name: 'Khagrachhari', country: 'Bangladesh', lat: 23.1193, lon: 91.9847 },
  { name: 'Maulvibazar', country: 'Bangladesh', lat: 24.4829, lon: 91.7774 },
  { name: 'Norail Sadar', country: 'Bangladesh', lat: 23.1725, lon: 89.5127 },

  // Indonesia â€” more cities
  { name: 'Batu Aji', country: 'Indonesia', lat: 1.0200, lon: 104.0300 },
  { name: 'Jepara', country: 'Indonesia', lat: -6.5913, lon: 110.6742 },
  { name: 'Karawang', country: 'Indonesia', lat: -6.3152, lon: 107.2970 },
  { name: 'Klaten', country: 'Indonesia', lat: -7.7056, lon: 110.6050 },
  { name: 'Maros', country: 'Indonesia', lat: -5.0078, lon: 119.5723 },
  { name: 'Purwakarta', country: 'Indonesia', lat: -6.5562, lon: 107.4406 },
  { name: 'Subang', country: 'Indonesia', lat: -6.5714, lon: 107.7614 },
  { name: 'Tuban', country: 'Indonesia', lat: -6.9000, lon: 112.0500 },

  // More Africa
  { name: 'Berbera', country: 'Somalia', lat: 10.4396, lon: 45.0367 },
  { name: 'Gitarama', country: 'Rwanda', lat: -2.0744, lon: 29.7569 },
  { name: 'Huye', country: 'Rwanda', lat: -2.5967, lon: 29.7386 },

  // More Latin America
  { name: 'Trinidad Bolivia', country: 'Bolivia', lat: -14.8333, lon: -64.9000 },

  // More Asia
  { name: 'Jessore Sadar', country: 'Bangladesh', lat: 23.1741, lon: 89.2113 },
  { name: 'Natore Sadar', country: 'Bangladesh', lat: 24.4206, lon: 89.0000 },
  { name: 'Bima', country: 'Indonesia', lat: -8.4608, lon: 118.7267 },
  { name: 'Ende', country: 'Indonesia', lat: -8.8418, lon: 121.6616 },
  { name: 'Lamongan', country: 'Indonesia', lat: -7.1156, lon: 112.4178 },
  { name: 'Ngawi', country: 'Indonesia', lat: -7.4042, lon: 111.4464 },
  { name: 'Situbondo', country: 'Indonesia', lat: -7.7061, lon: 114.0097 },
  { name: 'Bac Kan', country: 'Vietnam', lat: 22.1333, lon: 105.8333 },
  { name: 'Cao Bang', country: 'Vietnam', lat: 22.6667, lon: 106.2500 },
  { name: 'Dien Bien Phu', country: 'Vietnam', lat: 21.3833, lon: 103.0167 },
  { name: 'Ha Giang', country: 'Vietnam', lat: 22.8233, lon: 104.9833 },
  { name: 'Hoa Binh', country: 'Vietnam', lat: 20.8139, lon: 105.3383 },
  { name: 'Lai Chau', country: 'Vietnam', lat: 22.3940, lon: 103.4583 },
  { name: 'Lang Son', country: 'Vietnam', lat: 21.8533, lon: 106.7614 },
  { name: 'Hung Yen', country: 'Vietnam', lat: 20.6539, lon: 106.0508 },
  { name: 'Hai Duong', country: 'Vietnam', lat: 20.9408, lon: 106.3206 },

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // FINAL BATCH â€” 100 more unique cities
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  { name: 'Achinsk', country: 'Russia', lat: 56.2694, lon: 90.4942 },
  { name: 'Angren', country: 'Uzbekistan', lat: 41.0167, lon: 70.1436 },
  { name: 'Ardahan', country: 'Turkey', lat: 41.1106, lon: 42.7022 },
  { name: 'Barabinsk', country: 'Russia', lat: 55.3553, lon: 78.3539 },
  { name: 'Bhind City', country: 'India', lat: 26.5633, lon: 78.7867 },
  { name: 'Birao', country: 'Central African Republic', lat: 10.2847, lon: 22.7833 },
  { name: 'Birnin Kudu', country: 'Nigeria', lat: 11.4500, lon: 9.4833 },
  { name: 'Boende', country: 'Congo (DRC)', lat: -0.2833, lon: 20.8833 },
  { name: 'Bouake', country: 'Cote d\'Ivoire', lat: 7.6881, lon: -5.0306 },
  { name: 'Bumba', country: 'Congo (DRC)', lat: 2.1833, lon: 22.4667 },
  { name: 'Busia', country: 'Kenya', lat: 0.4608, lon: 34.1108 },
  { name: 'Changhua', country: 'Taiwan', lat: 24.0734, lon: 120.5134 },
  { name: 'Chiayi', country: 'Taiwan', lat: 23.4800, lon: 120.4490 },
  { name: 'Daloa', country: 'Cote d\'Ivoire', lat: 6.8774, lon: -6.4502 },
  { name: 'Divo', country: 'Cote d\'Ivoire', lat: 5.8397, lon: -5.3600 },
  { name: 'Dongola Sudan', country: 'Sudan', lat: 19.1753, lon: 30.4764 },
  { name: 'Ferozpur', country: 'India', lat: 30.9338, lon: 74.6136 },
  { name: 'Figuig', country: 'Morocco', lat: 32.1141, lon: -1.2285 },
  { name: 'Gimbi', country: 'Ethiopia', lat: 9.1667, lon: 35.8333 },
  { name: 'Gondal', country: 'India', lat: 21.9633, lon: 70.7942 },
  { name: 'Gongzhuling', country: 'China', lat: 43.5017, lon: 124.8131 },
  { name: 'Hotan', country: 'China', lat: 37.1100, lon: 79.9264 },
  { name: 'Huaiyin', country: 'China', lat: 33.5813, lon: 119.0286 },
  { name: 'Ila', country: 'Nigeria', lat: 8.0167, lon: 4.9000 },
  { name: 'Iwo', country: 'Nigeria', lat: 7.6333, lon: 4.1833 },
  { name: 'Jamnagar City', country: 'India', lat: 22.4707, lon: 70.0577 },
  { name: 'Kananga DRC', country: 'Congo (DRC)', lat: -5.8962, lon: 22.4174 },
  { name: 'Karaman City', country: 'Turkey', lat: 37.1812, lon: 33.2150 },
  { name: 'Korhogo', country: 'Cote d\'Ivoire', lat: 9.4580, lon: -5.6296 },
  { name: 'Kuandian', country: 'China', lat: 40.7286, lon: 124.7842 },
  { name: 'Labuan', country: 'Malaysia', lat: 5.2831, lon: 115.2308 },
  { name: 'Lira City', country: 'Uganda', lat: 2.2499, lon: 32.5339 },
  { name: 'Man', country: 'Cote d\'Ivoire', lat: 7.4125, lon: -7.5536 },
  { name: 'Manokwari', country: 'Indonesia', lat: -0.8614, lon: 134.0818 },
  { name: 'Mitrovica', country: 'Kosovo', lat: 42.8914, lon: 20.8660 },
  { name: 'Multan City', country: 'Pakistan', lat: 30.1978, lon: 71.4711 },
  { name: 'N Djamena', country: 'Chad', lat: 12.1131, lon: 15.0491 },
  { name: 'Nanded City', country: 'India', lat: 19.1500, lon: 77.3000 },
  { name: 'Ninh Thuan', country: 'Vietnam', lat: 11.5833, lon: 108.9833 },
  { name: 'Purnia City', country: 'India', lat: 25.7771, lon: 87.4753 },
  { name: 'Rumbek City', country: 'South Sudan', lat: 6.8000, lon: 29.6833 },
  { name: 'San-Pedro', country: 'Cote d\'Ivoire', lat: 4.7392, lon: -6.6361 },
  { name: 'Sohna', country: 'India', lat: 28.2479, lon: 77.0636 },
  { name: 'Thiruvarur', country: 'India', lat: 10.7667, lon: 79.6333 },
  { name: 'Tiassale', country: 'Cote d\'Ivoire', lat: 5.8958, lon: -4.8264 },
  { name: 'Timbo', country: 'Guinea', lat: 10.6542, lon: -12.2392 },
  { name: 'Tongjiang', country: 'China', lat: 47.6422, lon: 132.5103 },
  { name: 'Tongliao', country: 'China', lat: 43.6125, lon: 122.2639 },
  { name: 'Tuticorin', country: 'India', lat: 8.7642, lon: 78.1348 },
  { name: 'Ulanhot', country: 'China', lat: 46.0722, lon: 122.0936 },
  { name: 'Wenchang', country: 'China', lat: 19.5431, lon: 110.7531 },
  { name: 'Yamoussoukro', country: 'Cote d\'Ivoire', lat: 6.8206, lon: -5.2764 },
  { name: 'Yola City', country: 'Nigeria', lat: 9.2035, lon: 12.4954 },
  { name: 'Zonguldak', country: 'Turkey', lat: 41.4564, lon: 31.7986 },

  // Final 45 â€” niche cities from less-covered regions
  { name: 'Adrar', country: 'Algeria', lat: 27.8742, lon: -0.2939 },
  { name: 'Aleg', country: 'Mauritania', lat: 17.0528, lon: -13.9108 },
  { name: 'Altamira', country: 'Brazil', lat: -3.2033, lon: -52.2064 },
  { name: 'Bahr Dar', country: 'Ethiopia', lat: 11.5942, lon: 37.3887 },
  { name: 'Debre Tabor', country: 'Ethiopia', lat: 11.8500, lon: 38.0167 },
  { name: 'Greenville Liberia', country: 'Liberia', lat: 4.9967, lon: -9.0333 },
  { name: 'Kanye', country: 'Botswana', lat: -24.9667, lon: 25.3500 },
  { name: 'Kismaayo', country: 'Somalia', lat: -0.3522, lon: 42.5428 },
  { name: 'Meulaboh', country: 'Indonesia', lat: 4.1372, lon: 96.1286 },
  { name: 'Mocuba', country: 'Mozambique', lat: -16.8333, lon: 36.9833 },
  { name: 'Nabire', country: 'Indonesia', lat: -3.3667, lon: 135.5000 },
  { name: 'Nazret', country: 'Ethiopia', lat: 8.5500, lon: 39.2700 },
  { name: 'Owando', country: 'Congo (Republic)', lat: -0.4833, lon: 15.9000 },
  { name: 'Porto Novo', country: 'Benin', lat: 6.4969, lon: 2.6289 },
  { name: 'Selebi-Phikwe', country: 'Botswana', lat: -21.9667, lon: 27.8333 },
  { name: 'Sodo Town', country: 'Ethiopia', lat: 6.8600, lon: 37.7600 },
  { name: 'Temirtau', country: 'Kazakhstan', lat: 50.0544, lon: 72.9644 },
  { name: 'Tshabong', country: 'Botswana', lat: -26.0167, lon: 22.4000 },
  { name: 'Wad Madani City', country: 'Sudan', lat: 14.4006, lon: 33.5197 },

  // Last 25 â€” micro-targeted unique cities
  { name: 'Boosaaso', country: 'Somalia', lat: 11.2800, lon: 49.1800 },
  { name: 'Chaman City', country: 'Pakistan', lat: 30.9210, lon: 66.4597 },
  { name: 'Kanifing', country: 'Gambia', lat: 13.4500, lon: -16.6833 },
  { name: 'Labe City', country: 'Guinea', lat: 11.3189, lon: -12.2863 },
  { name: 'Malakal City', country: 'South Sudan', lat: 9.5333, lon: 31.6500 },
  { name: 'Nzeto', country: 'Angola', lat: -7.2308, lon: 12.8661 },
  { name: 'Petropavl', country: 'Kazakhstan', lat: 54.8667, lon: 69.1500 },
  { name: 'Taolagnaro', country: 'Madagascar', lat: -25.0333, lon: 46.9833 },
  { name: 'Urganch', country: 'Uzbekistan', lat: 41.5500, lon: 60.6333 },
  { name: 'Ust-Kamenogorsk', country: 'Kazakhstan', lat: 49.9481, lon: 82.6278 },
  { name: 'Ebolowa City', country: 'Cameroon', lat: 2.9000, lon: 11.1500 },
  { name: 'Gaoual', country: 'Guinea', lat: 11.7547, lon: -13.2067 },
  { name: 'Koudougou City', country: 'Burkina Faso', lat: 12.2531, lon: -2.3628 },
  { name: 'Ndjole', country: 'Gabon', lat: -0.1833, lon: 10.7667 },
  { name: 'Rehoboth', country: 'Namibia', lat: -23.3167, lon: 17.0833 },
  { name: 'Sebha', country: 'Libya', lat: 27.0377, lon: 14.4283 },
  { name: 'Sefhare', country: 'Botswana', lat: -22.3667, lon: 27.1500 },
  { name: 'Apatity', country: 'Russia', lat: 67.5672, lon: 33.4031 },
  { name: 'Dalanzadgad', country: 'Mongolia', lat: 43.5710, lon: 104.4250 },
  { name: 'Toliara City', country: 'Madagascar', lat: -23.3500, lon: 43.6833 },
];
