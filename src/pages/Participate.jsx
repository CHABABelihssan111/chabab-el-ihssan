import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHandHoldingHeart, FaHandsHelping, FaSeedling, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { sadaqaProjects } from '../data/media';
import { getLocalizedContent } from '../utils/languageUtils';
import { sendForm } from '../utils/sendForm';

const L = {
    ar: {
        title: 'استمارة المشاركة', sub: 'املأ البيان خانةً خانة وسنتواصل معك بإذن الله.',
        types: { donate: 'تبرع', join: 'انضم لنا', sadaqa: 'صدقة جارية' },
        f: { name: 'الاسم الكامل', phone: 'رقم الهاتف', email: 'البريد الإلكتروني (اختياري)', wilaya: 'الولاية / البلدية', amount: 'المبلغ المقترح بالدينار (اختياري)', project: 'المشروع', skills: 'مهاراتك أو وقتك المتاح', note: 'ملاحظات إضافية (اختياري)' },
        choose: 'اختر مشروعاً', send: 'إرسال الاستمارة', sending: 'جارٍ الإرسال…', fail: 'تعذّر الإرسال، تأكد من الاسم والهاتف ثم حاول مجدداً.',
        okTitle: 'تم استلام استمارتك', ok: 'جزاك الله خيراً، سنتصل بك قريباً.', home: 'العودة للرئيسية', pay: 'معلومات التبرع',
    },
    fr: {
        title: 'Formulaire de participation', sub: 'Remplissez le formulaire champ par champ, nous vous recontacterons.',
        types: { donate: 'Faire un don', join: 'Nous rejoindre', sadaqa: 'Sadaqa Jariya' },
        f: { name: 'Nom complet', phone: 'Téléphone', email: 'E-mail (facultatif)', wilaya: 'Wilaya / commune', amount: 'Montant proposé en DA (facultatif)', project: 'Projet', skills: 'Vos compétences ou disponibilités', note: 'Remarques (facultatif)' },
        choose: 'Choisir un projet', send: 'Envoyer le formulaire', sending: 'Envoi…', fail: "Échec de l'envoi : vérifiez le nom et le téléphone puis réessayez.",
        okTitle: 'Formulaire reçu', ok: 'Merci, nous vous contacterons bientôt.', home: "Retour à l'accueil", pay: 'Informations de don',
    },
    en: {
        title: 'Participation form', sub: 'Fill in the form field by field and we will get back to you.',
        types: { donate: 'Donate', join: 'Join us', sadaqa: 'Sadaqa Jariya' },
        f: { name: 'Full name', phone: 'Phone number', email: 'Email (optional)', wilaya: 'Wilaya / town', amount: 'Suggested amount in DZD (optional)', project: 'Project', skills: 'Your skills or available time', note: 'Additional notes (optional)' },
        choose: 'Choose a project', send: 'Send form', sending: 'Sending…', fail: 'Could not send: check name and phone, then try again.',
        okTitle: 'Form received', ok: 'Thank you, we will contact you soon.', home: 'Back to home', pay: 'Donation details',
    },
};
const ICON = { donate: FaHandHoldingHeart, join: FaHandsHelping, sadaqa: FaSeedling };
const inp = 'w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] transition';

const Participate = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.en;
    const [params, setParams] = useSearchParams();
    const type = ['donate', 'join', 'sadaqa'].includes(params.get('type')) ? params.get('type') : 'join';
    const blank = { name: '', phone: '', email: '', wilaya: '', amount: '', project: '', skills: '', note: '', website: '' };
    const [f, setF] = useState(blank);
    const [st, setSt] = useState('idle');
    const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

    // الحقول تتغير حسب النوع، وكل حقل يظهر كخانة مرقمة
    const fields = [
        ['name', 'text', true], ['phone', 'tel', true], ['email', 'email', false], ['wilaya', 'text', false],
        ...(type === 'sadaqa' ? [['project', 'select', false]] : []),
        ...(type !== 'join' ? [['amount', 'number', false]] : []),
        ...(type === 'join' ? [['skills', 'text', false]] : []),
        ['note', 'area', false],
    ];

    const submit = async (e) => {
        e.preventDefault();
        setSt('sending');
        const ok = await sendForm({ kind: 'form', type, ...f });
        setSt(ok ? 'ok' : 'fail');
        if (ok) setF(blank);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-brand-paper py-16 px-4 transition-colors duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden luxe-card">
                <div className="bg-brand-grid text-white text-center p-8 border-b-8 border-[var(--brand-red)]">
                    <h1 className="font-display text-3xl">{lb.title}</h1>
                    <p className="text-white/80 mt-2">{lb.sub}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 dark:bg-gray-900" role="tablist">
                    {Object.keys(lb.types).map((k) => {
                        const Icon = ICON[k];
                        return (
                            <button key={k} type="button" role="tab" aria-selected={type === k} onClick={() => { setParams({ type: k }, { replace: true }); setSt('idle'); }}
                                className={`flex flex-col items-center gap-1 rounded-xl py-3 text-sm font-bold transition ${type === k ? 'bg-[var(--brand-navy)] text-white shadow-lg' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                                <Icon className="text-xl" /> {lb.types[k]}
                            </button>
                        );
                    })}
                </div>

                {st === 'ok' ? (
                    <div className="p-10 text-center" role="status">
                        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lb.okTitle}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">{lb.ok}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/" className="btn-brand py-2.5 px-6">{lb.home}</Link>
                            {type !== 'join' && <Link to="/donate" className="btn-brand-light py-2.5 px-6 border border-gray-200">{lb.pay}</Link>}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={submit} className="p-6 md:p-8 grid gap-5">
                        {fields.map(([k, kind, req], i) => (
                            <label key={k} className="block">
                                <span className="flex items-center gap-2 mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    <b className="w-6 h-6 rounded-full bg-[var(--brand-navy)] text-white text-xs grid place-items-center">{i + 1}</b>
                                    {lb.f[k]}{req && <i className="text-[var(--brand-red)] not-italic">*</i>}
                                </span>
                                {kind === 'area' ? (
                                    <textarea className={`${inp} resize-none`} rows={3} maxLength={1500} value={f[k]} onChange={set(k)} />
                                ) : kind === 'select' ? (
                                    <select className={inp} value={f[k]} onChange={set(k)}>
                                        <option value="">{lb.choose}</option>
                                        {sadaqaProjects.map((p) => { const n = getLocalizedContent(p.title, language); return <option key={p.id} value={n}>{n}</option>; })}
                                    </select>
                                ) : (
                                    <input className={inp} type={kind} required={req} min={kind === 'number' ? 0 : undefined} inputMode={kind === 'tel' ? 'tel' : undefined} maxLength={kind === 'tel' ? 30 : 120} value={f[k]} onChange={set(k)} autoComplete={k === 'name' ? 'name' : k === 'phone' ? 'tel' : k === 'email' ? 'email' : 'off'} />
                                )}
                            </label>
                        ))}
                        <input type="text" name="website" value={f.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 w-0" />
                        {st === 'fail' && <p className="text-center text-red-600 text-sm" role="alert">{lb.fail}</p>}
                        <button type="submit" disabled={st === 'sending'} className="btn-brand py-3 px-8 mx-auto inline-flex items-center gap-2 disabled:opacity-60">
                            <FaPaperPlane className="rtl:-scale-x-100" /> {st === 'sending' ? lb.sending : lb.send}
                        </button>
                    </form>
                )}
            </div>
        </motion.div>
    );
};

export default Participate;
