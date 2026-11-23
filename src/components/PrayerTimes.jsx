import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaMosque, FaRegCalendarAlt } from 'react-icons/fa';
import { prayerTimesFor, fmtClock, fmtCountdown, getNow, DAY, ramadanState } from '../data/ramadanTools';
import { ramadan as ramadanData } from '../data/content';

const L = {
    ar: { title: 'مواقيت الصلاة', sub: 'بتوقيت الجزائر العاصمة', next: 'الصلاة القادمة', in: 'بعد', note: 'المواقيت تقريبية وقد تختلف بدقيقة أو دقيقتين عن التقويم الرسمي، والتاريخ الهجري حسابي.',
        names: { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' }, locale: 'ar' },
    fr: { title: 'Horaires de prière', sub: 'Heure d’Alger', next: 'Prochaine prière', in: 'dans', note: 'Horaires indicatifs (±1–2 min par rapport au calendrier officiel). Date hégirienne calculée.',
        names: { fajr: 'Fajr', sunrise: 'Lever', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' }, locale: 'fr' },
    en: { title: 'Prayer times', sub: 'Algiers time', next: 'Next prayer', in: 'in', note: 'Times are approximate (±1–2 min vs. the official calendar). Hijri date is calculated.',
        names: { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' }, locale: 'en' },
};
const ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

const PrayerTimes = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.en;
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const [now, setNow] = useState(() => getNow());
    useEffect(() => { const i = setInterval(() => setNow(getNow()), 1000); return () => clearInterval(i); }, []);

    if (!ramadanState(ramadanData, now)?.themeOn) return null; // يظهر فقط في فترة رمضان

    const today = prayerTimesFor(now);
    let nextKey = ORDER.find((k) => today[k] > now);
    let nextAt = nextKey ? today[nextKey] : null;
    if (!nextKey) { nextKey = 'fajr'; nextAt = prayerTimesFor(now + DAY).fajr; }

    const date = new Date(now);
    let hijri = '', greg = '';
    try {
        hijri = new Intl.DateTimeFormat(`${lb.locale}-u-ca-islamic-umalqura-nu-latn`, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
        greg = new Intl.DateTimeFormat(lb.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Algiers' }).format(date);
    } catch { /* ancien navigateur */ }

    return (
        <section dir={dir} className="py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-[var(--brand-navy)] to-[#12255e] text-white">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="font-display text-2xl md:text-3xl flex items-center gap-3"><FaMosque /> {lb.title}</h2>
                            <p className="text-white/70 text-sm mt-1">{lb.sub}</p>
                            <p className="mt-3 flex items-center gap-2 text-white/90 text-sm md:text-base"><FaRegCalendarAlt /> <span>{hijri}</span></p>
                            <p className="text-white/60 text-xs md:text-sm mt-1">{greg}</p>
                        </div>
                        <div className="text-center bg-white/10 rounded-xl px-6 py-4 backdrop-blur">
                            <p className="text-xs text-white/70">{lb.next}: <b className="text-[var(--brand-gold)]">{lb.names[nextKey]}</b></p>
                            <p className="font-display text-3xl md:text-4xl tabular-nums mt-1" dir="ltr">{fmtCountdown(nextAt - now)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-white/10">
                        {ORDER.map((k) => (
                            <div key={k} className={`py-4 text-center transition ${k === nextKey ? 'bg-[var(--brand-red)] scale-[1.03] shadow-lg' : 'bg-[#16295f]'}`}>
                                <p className="text-xs md:text-sm text-white/80">{lb.names[k]}</p>
                                <p className="font-display text-lg md:text-xl tabular-nums" dir="ltr">{fmtClock(today[k])}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-[11px] text-white/50 text-center px-4 py-2">{lb.note}</p>
                </div>
            </div>
        </section>
    );
};

export default PrayerTimes;
