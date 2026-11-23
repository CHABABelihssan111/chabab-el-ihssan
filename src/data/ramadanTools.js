// Outils du mode Ramadan : heures de l'Imsak/Iftar (Alger), jour du mois, invocation du jour.
// Calcul astronomique (algorithme NOAA) : aucune connexion ni API nécessaire → fonctionne hors-ligne.
// Les heures sont approximatives (±1-2 min) : suivre le calendrier officiel de la mosquée / du ministère.

export const CITY = { lat: 36.7538, lon: 3.0588, tz: 1 }; // Alger (UTC+1 toute l'année)
export const FAJR_ANGLE = 18;      // angle utilisé en Algérie pour le Fajr
export const MAGHRIB_OFFSET = 1;   // minutes après le coucher du soleil (prudence)

const RAD = Math.PI / 180;
const HOUR = 3600000;
export const DAY = 86400000;

// ─── Temps « courant » (en développement seulement : ?ramadan_test=2027-02-20T17:30) ───
const loadedAt = Date.now();
let testBase = null;
if (import.meta.env?.DEV && typeof location !== 'undefined') {
    const v = new URLSearchParams(location.search).get('ramadan_test');
    const t = v ? Date.parse(`${v}+01:00`) : NaN;
    if (!Number.isNaN(t)) testBase = t;
}
export const getNow = () => (testBase === null ? Date.now() : testBase + (Date.now() - loadedAt));

// ─── Calcul solaire ───
const julian = (y, m, d) => {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
};

const sunParams = (jd) => {
    const T = (jd - 2451545.0) / 36525;
    const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
    const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    const C = Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T))
        + Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T)
        + Math.sin(3 * M * RAD) * 0.000289;
    const omega = 125.04 - 1934.136 * T;
    const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * RAD);
    const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
    const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
    const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD)) / RAD;
    const y = Math.tan((eps * RAD) / 2) ** 2;
    const eqTime = (4 * (y * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(M * RAD)
        + 4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD)
        - 0.5 * y * y * Math.sin(4 * L0 * RAD) - 1.25 * e * e * Math.sin(2 * M * RAD))) / RAD;
    return { decl, eqTime };
};

// minutes depuis minuit local, quand le soleil est à -angle° ; rising = matin (true) / soir (false)
const eventMinutes = (y, m, d, angle, rising) => {
    const { lat, lon, tz } = CITY;
    const { decl, eqTime } = sunParams(julian(y, m, d) + 0.5 - tz / 24);
    const cosH = (Math.sin(-angle * RAD) - Math.sin(lat * RAD) * Math.sin(decl * RAD))
        / (Math.cos(lat * RAD) * Math.cos(decl * RAD));
    const H = Math.acos(Math.min(1, Math.max(-1, cosH))) / RAD;
    const noon = 720 - 4 * lon - eqTime + tz * 60;
    return rising ? noon - 4 * H : noon + 4 * H;
};

// Date locale d'Alger pour un instant donné
export const ymd = (ms) => {
    const d = new Date(ms + CITY.tz * HOUR);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
};
const dayStart = ({ y, m, d }) => Date.UTC(y, m - 1, d) - CITY.tz * HOUR;

// Fajr (Imsak) et Maghrib (Iftar) du jour d'Alger contenant `ms`
export const timesFor = (ms) => {
    const p = ymd(ms);
    const base = dayStart(p);
    return {
        base,
        fajr: base + Math.floor(eventMinutes(p.y, p.m, p.d, FAJR_ANGLE, true)) * 60000,
        maghrib: base + (Math.ceil(eventMinutes(p.y, p.m, p.d, 0.833, false)) + MAGHRIB_OFFSET) * 60000,
    };
};

export const fmtClock = (ms) => {
    const d = new Date(ms + CITY.tz * HOUR);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};
export const fmtCountdown = (diff) => {
    const s = Math.max(0, Math.floor(diff / 1000));
    return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
};

// Prochain événement : suhoor (avant le Fajr) → iftar (avant le Maghrib) → nuit (jusqu'au Fajr du lendemain)
export const nextEvent = (now) => {
    const t = timesFor(now);
    if (now < t.fajr) return { kind: 'suhoor', at: t.fajr, t };
    if (now < t.maghrib) return { kind: 'iftar', at: t.maghrib, t };
    return { kind: 'night', at: timesFor(now + DAY).fajr, t };
};

// État du mois de Ramadan à partir de ramadan.json
export const ramadanState = (r, now = getNow()) => {
    if (!r || r.enabled === false || !r.start_date) return null;
    const start = Date.parse(`${String(r.start_date).slice(0, 10)}T00:00:00+01:00`);
    if (Number.isNaN(start)) return null;
    const days = Number(r.days) || 30;
    const end = start + days * DAY;
    const phase = now < start ? 'before' : now < end ? 'during' : 'after';
    const dayNo = phase === 'during' ? Math.min(days, Math.floor((now - start) / DAY) + 1) : 0;
    // thème visuel : 7 jours avant → 3 jours après (Aïd)
    const themeOn = now >= start - 7 * DAY && now < end + 3 * DAY;
    return { start, end, days, phase, dayNo, themeOn };
};

// Imsakiya : tableau des jours du mois
export const imsakiya = (r) => {
    const s = ramadanState(r);
    if (!s) return [];
    return Array.from({ length: s.days }, (_, i) => {
        const t = timesFor(s.start + i * DAY + 12 * HOUR);
        return { n: i + 1, date: new Date(t.base + 12 * HOUR), fajr: t.fajr, maghrib: t.maghrib };
    });
};

// ─── Invocations ───
export const IFTAR_DUA = {
    text: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    src: 'رواه أبو داود',
};
export const QADR_DUA = {
    text: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    src: 'رواه الترمذي — يُكثَر منه في الليالي الوترية من العشر الأواخر',
};
export const DUAS = [
    { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', src: 'البقرة ٢٠١' },
    { text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', src: 'طه ٢٥-٢٦' },
    { text: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', src: 'البقرة ١٢٧' },
    { text: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', src: 'رواه أبو داود والنسائي' },
    { text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', src: 'رواه الترمذي' },
    { text: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ', src: 'إبراهيم ٤٠' },
    { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', src: 'رواه مسلم' },
    { text: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا', src: 'البقرة ٢٨٦' },
    { text: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', src: 'الأعراف ٢٣' },
    { text: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ دِقَّهُ وَجِلَّهُ وَأَوَّلَهُ وَآخِرَهُ وَعَلَانِيَتَهُ وَسِرَّهُ', src: 'رواه مسلم' },
    { text: 'رَبِّ زِدْنِي عِلْمًا', src: 'طه ١١٤' },
    { text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', src: 'الفرقان ٧٤' },
    { text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', src: 'التوبة ١٢٩' },
    { text: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', src: 'إبراهيم ٤١' },
    { text: 'لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', src: 'الأنبياء ٨٧' },
    { text: 'اللَّهُمَّ مُصَرِّفَ الْقُلُوبِ صَرِّفْ قُلُوبَنَا عَلَى طَاعَتِكَ', src: 'رواه مسلم' },
    { text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ', src: 'آل عمران ٨' },
    { text: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ', src: 'النمل ١٩' },
    { text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ', src: 'رواه البخاري' },
    { text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ', src: 'الأعراف ١٢٦' },
    { text: 'اللَّهُمَّ آتِ نَفْسِي تَقْوَاهَا وَزَكِّهَا أَنتَ خَيْرُ مَن زَكَّاهَا أَنتَ وَلِيُّهَا وَمَوْلَاهَا', src: 'رواه مسلم' },
    { text: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', src: 'القصص ٢٤' },
    { text: 'رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا', src: 'الفرقان ٦٥' },
    { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَلٍ، وَأَعُوذُ بِكَ مِنَ النَّارِ وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَلٍ', src: 'رواه ابن ماجه' },
    { text: 'رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنتَ خَيْرُ الرَّاحِمِينَ', src: 'المؤمنون ١٠٩' },
    { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', src: 'متفق عليه' },
    { text: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ وَتُبْ عَلَيْنَا إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ', src: 'البقرة ١٢٧-١٢٨' },
    { text: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا وَفِي بَصَرِي نُورًا وَفِي سَمْعِي نُورًا', src: 'متفق عليه' },
    { text: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْقَوْمِ الظَّالِمِينَ', src: 'يونس ٨٥' },
];

// Invocation du jour : liste de 30 invocations qui tourne ; ليالي القدر الوترية (21→29) : دعاء العفو
export const duaForDay = (dayNo) => {
    if (dayNo >= 21 && dayNo % 2 === 1 && dayNo <= 29) return { ...QADR_DUA, qadr: true };
    return DUAS[(Math.max(1, dayNo) - 1) % DUAS.length];
};

// ─── Textes de l'interface ───
export const RL = {
    ar: {
        iftarIn: 'الإفطار بعد', suhoorIn: 'الإمساك بعد', nightIn: 'السحور والفجر بعد',
        iftarNow: 'حان وقت الإفطار — تقبّل الله صيامكم', fajr: 'الإمساك (الفجر)', maghrib: 'الإفطار (المغرب)',
        today: 'مواقيت اليوم · الجزائر العاصمة', approx: 'المواقيت تقريبية، يُعتمد تقويم المسجد.',
        iftarDua: 'دعاء الإفطار', duaTitle: (n) => `دعاء اليوم ${n}`, qadrTitle: 'دعاء ليلة القدر',
        table: 'إمساكية رمضان', day: 'اليوم', date: 'التاريخ',
        chipIftar: 'الإفطار بعد', chipSuhoor: 'الإمساك بعد', chipNight: 'الفجر بعد',
    },
    fr: {
        iftarIn: "Iftar dans", suhoorIn: "Imsak dans", nightIn: 'Fajr dans',
        iftarNow: "C'est l'heure de l'iftar — que Dieu accepte votre jeûne", fajr: 'Imsak (Fajr)', maghrib: 'Iftar (Maghrib)',
        today: "Horaires du jour · Alger", approx: "Horaires approximatifs : se fier au calendrier de la mosquée.",
        iftarDua: "Invocation de l'iftar", duaTitle: (n) => `Invocation du jour ${n}`, qadrTitle: 'Invocation de la Nuit du Destin',
        table: 'Imsakiya du Ramadan', day: 'Jour', date: 'Date',
        chipIftar: 'Iftar dans', chipSuhoor: 'Imsak dans', chipNight: 'Fajr dans',
    },
    en: {
        iftarIn: 'Iftar in', suhoorIn: 'Fasting begins in', nightIn: 'Fajr in',
        iftarNow: "It's time to break the fast", fajr: 'Imsak (Fajr)', maghrib: 'Iftar (Maghrib)',
        today: "Today's times · Algiers", approx: 'Times are approximate: follow your mosque calendar.',
        iftarDua: 'Iftar supplication', duaTitle: (n) => `Supplication of day ${n}`, qadrTitle: 'Supplication for Laylat al-Qadr',
        table: 'Ramadan timetable', day: 'Day', date: 'Date',
        chipIftar: 'Iftar in', chipSuhoor: 'Fast begins in', chipNight: 'Fajr in',
    },
};

// ─── Les 5 prières + lever du soleil (Alger) ───
export const ISHA_ANGLE = 17; // angle utilisé en Algérie pour l'Isha
export const prayerTimesFor = (ms) => {
    const p = ymd(ms);
    const base = dayStart(p);
    const { decl, eqTime } = sunParams(julian(p.y, p.m, p.d) + 0.5 - CITY.tz / 24);
    const noon = 720 - 4 * CITY.lon - eqTime + CITY.tz * 60;
    const asrAlt = Math.atan(1 / (1 + Math.tan(Math.abs(CITY.lat - decl) * RAD))) / RAD;
    const at = (min) => base + min * 60000;
    return {
        fajr: at(Math.floor(eventMinutes(p.y, p.m, p.d, FAJR_ANGLE, true))),
        sunrise: at(Math.floor(eventMinutes(p.y, p.m, p.d, 0.833, true))),
        dhuhr: at(Math.ceil(noon) + 1),
        asr: at(Math.ceil(eventMinutes(p.y, p.m, p.d, -asrAlt, false))),
        maghrib: at(Math.ceil(eventMinutes(p.y, p.m, p.d, 0.833, false)) + MAGHRIB_OFFSET),
        isha: at(Math.ceil(eventMinutes(p.y, p.m, p.d, ISHA_ANGLE, false))),
    };
};
