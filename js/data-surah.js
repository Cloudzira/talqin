/* =====================================================================
   TalqinKu - js/data-surah.js
   Data surah. Menambah surah baru? Tambahkan satu baris di ALL_SURAHS.
   (SURAH_AYAH_COUNTS harus tetap lengkap 114 surah: dipakai untuk
   menghitung nomor ayat global pada server audio cadangan.)
   ===================================================================== */
'use strict';

/* Jumlah ayat tiap surah (urut surah 1 sampai 114) */
const SURAH_AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

/* Daftar surah yang tersedia di aplikasi: nomor, nama, tulisan Arab, jumlah ayat */
const ALL_SURAHS = [
  { num: 1, name: "Al-Fatihah", ar: "سُورَةُ ٱلْفَاتِحَةِ", ayahs: 7 },
  { num: 58, name: "Al-Mujadilah", ar: "سُورَةُ ٱلْمُجَادَلَةِ", ayahs: 22 },
  { num: 59, name: "Al-Hasyr", ar: "سُورَةُ ٱلْحَشْرِ", ayahs: 24 },
  { num: 60, name: "Al-Mumtahanah", ar: "سُورَةُ ٱلْمُمْتَحَنَةِ", ayahs: 13 },
  { num: 61, name: "As-Saff", ar: "سُورَةُ ٱلصَّفِّ", ayahs: 14 },
  { num: 62, name: "Al-Jumu'ah", ar: "سُورَةُ ٱلجُمُعَةِ", ayahs: 11 },
  { num: 63, name: "Al-Munafiqun", ar: "سُورَةُ ٱلنَّافِقُونَ", ayahs: 11 },
  { num: 64, name: "At-Tagabun", ar: "سُورَةُ ٱلتَّغَابُنِ", ayahs: 18 },
  { num: 65, name: "At-Talaq", ar: "سُورَةُ ٱلطَّلَاقِ", ayahs: 12 },
  { num: 66, name: "At-Tahrim", ar: "سُورَةُ ٱلتَّحْرِيمِ", ayahs: 12 },
  { num: 67, name: "Al-Mulk", ar: "سُورَةُ ٱلْمُلْكِ", ayahs: 30 },
  { num: 68, name: "Al-Qalam", ar: "سُورَةُ ٱلْقَلَمِ", ayahs: 52 },
  { num: 69, name: "Al-Haqqah", ar: "سُورَةُ ٱلْحَاقَّةِ", ayahs: 52 },
  { num: 70, name: "Al-Ma'arij", ar: "سُورَةُ ٱلْمَعَارِجِ", ayahs: 44 },
  { num: 71, name: "Nuh", ar: "سُورَةُ نُوحٍ", ayahs: 28 },
  { num: 72, name: "Al-Jinn", ar: "سُورَةُ ٱلْجِنِّ", ayahs: 28 },
  { num: 73, name: "Al-Muzzammil", ar: "سُورَةُ ٱلْمُزَّمِّلِ", ayahs: 20 },
  { num: 74, name: "Al-Muddassir", ar: "سُورَةُ ٱلْمُدَّثِّرِ", ayahs: 56 },
  { num: 75, name: "Al-Qiyamah", ar: "سُورَةُ ٱلْقِيَامَةِ", ayahs: 40 },
  { num: 76, name: "Al-Insan", ar: "سُورَةُ ٱلْإِنسَانِ", ayahs: 31 },
  { num: 77, name: "Al-Mursalat", ar: "سُورَةُ ٱلْمُرْسَلَاتِ", ayahs: 50 },
  { num: 78, name: "An-Naba'", ar: "سُورَةُ ٱلنَّبَإِ", ayahs: 40 },
  { num: 79, name: "An-Nazi'at", ar: "سُورَةُ ٱلنَّازِعَاتِ", ayahs: 46 },
  { num: 80, name: "'Abasa", ar: "سُورَةُ عَبَسَ", ayahs: 42 },
  { num: 81, name: "At-Takwir", ar: "سُورَةُ ٱلتَّكْوِيرِ", ayahs: 29 },
  { num: 82, name: "Al-Infitar", ar: "سُورَةُ ٱلْإِنْفِطَارِ", ayahs: 19 },
  { num: 83, name: "Al-Mutaffifin", ar: "سُورَةُ ٱلْمُطَفِّفِينَ", ayahs: 36 },
  { num: 84, name: "Al-Insyiqaq", ar: "سُورَةُ ٱلْإِنْشِقَاقِ", ayahs: 25 },
  { num: 85, name: "Al-Buruj", ar: "سُورَةُ ٱلْبُرُوجِ", ayahs: 22 },
  { num: 86, name: "At-Tariq", ar: "سُورَةُ ٱلطَّارِقِ", ayahs: 17 },
  { num: 87, name: "Al-A'la", ar: "سُورَةُ ٱلْأَعْلَىٰ", ayahs: 19 },
  { num: 88, name: "Al-Gasyiyah", ar: "سُورَةُ ٱلْغَاشِيَةِ", ayahs: 26 },
  { num: 89, name: "Al-Fajr", ar: "سُورَةُ ٱلْفَجْرِ", ayahs: 30 },
  { num: 90, name: "Al-Balad", ar: "سُورَةُ ٱلْبَلَدِ", ayahs: 20 },
  { num: 91, name: "Asy-Syams", ar: "سُورَةُ ٱلشَّمْسِ", ayahs: 15 },
  { num: 92, name: "Al-Lail", ar: "سُورَةُ ٱلَّيْلِ", ayahs: 21 },
  { num: 93, name: "Ad-Duha", ar: "سُورَةُ ٱلضُّحَىٰ", ayahs: 11 },
  { num: 94, name: "Asy-Syarh", ar: "سُورَةُ ٱلشَّرْحِ", ayahs: 8 },
  { num: 95, name: "At-Tin", ar: "سُورَةُ ٱلتِّينِ", ayahs: 8 },
  { num: 96, name: "Al-'Alaq", ar: "سُورَةُ ٱلْعَلَقِ", ayahs: 19 },
  { num: 97, name: "Al-Qadr", ar: "سُورَةُ ٱلْقَدْرِ", ayahs: 5 },
  { num: 98, name: "Al-Bayyinah", ar: "سُورَةُ ٱلْبَيِّنَةِ", ayahs: 8 },
  { num: 99, name: "Az-Zalzalah", ar: "سُورَةُ ٱلزَّلْزَلَةِ", ayahs: 8 },
  { num: 100, name: "Al-'Adiyat", ar: "سُورَةُ ٱلْعَادِيَاتِ", ayahs: 11 },
  { num: 101, name: "Al-Qari'ah", ar: "سُورَةُ ٱلْقَارِعَةِ", ayahs: 11 },
  { num: 102, name: "At-Takasur", ar: "سُورَةُ ٱلتَّكَاثُرِ", ayahs: 8 },
  { num: 103, name: "Al-'Asr", ar: "سُورَةُ ٱلْعَصْرِ", ayahs: 3 },
  { num: 104, name: "Al-Humazah", ar: "سُورَةُ ٱلْهُمَزَةِ", ayahs: 9 },
  { num: 105, name: "Al-Fil", ar: "سُورَةُ ٱلْفِيلِ", ayahs: 5 },
  { num: 106, name: "Quraisy", ar: "سُورَةُ قُرَيْشٍ", ayahs: 4 },
  { num: 107, name: "Al-Ma'un", ar: "سُورَةُ ٱلْمَاعُونِ", ayahs: 7 },
  { num: 108, name: "Al-Kausar", ar: "سُورَةُ ٱلْكَوْثَرِ", ayahs: 3 },
  { num: 109, name: "Al-Kafirun", ar: "سُورَةُ ٱلْكَافِرُونَ", ayahs: 6 },
  { num: 110, name: "An-Nasr", ar: "سُورَةُ ٱلنَّصْرِ", ayahs: 3 },
  { num: 111, name: "Al-Lahab", ar: "سُورَةُ ٱللَّهَبِ", ayahs: 5 },
  { num: 112, name: "Al-Ikhlas", ar: "سُورَةُ ٱلْإِخْلَاصِ", ayahs: 4 },
  { num: 113, name: "Al-Falaq", ar: "سُورَةُ ٱلْفَلَقِ", ayahs: 5 },
  { num: 114, name: "An-Nas", ar: "سُورَةُ ٱلنَّاسِ", ayahs: 6 }
];

/* Mencari data surah berdasarkan nomor */
function findSurah(num) {
  return ALL_SURAHS.find((surah) => surah.num === num);
}

/* Nomor ayat global (1..6236), dipakai server cadangan */
function globalAyahNumber(surah, ayah) {
  let total = 0;
  for (let i = 0; i < surah - 1; i++) total += SURAH_AYAH_COUNTS[i];
  return total + ayah;
}
