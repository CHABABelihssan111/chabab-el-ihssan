import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHandHoldingHeart, FaHandsHelping, FaSeedling, FaCheckCircle, FaPaperPlane, FaCamera, FaImages, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { sadaqaProjects } from '../data/media';
import { getLocalizedContent } from '../utils/languageUtils';
import { sendForm } from '../utils/sendForm';
import { donationCampaigns } from '../data/content';

const RX = {
    ar: { cam: 'التقاط صورة بالكاميرا', gal: 'اختيار من المعرض', rm: 'حذف الصورة', other: 'أخرى (اكتب الاسم)', pick: 'اختر الحملة', otherPh: 'اكتب اسم الحملة', noImg: 'يرجى إرفاق صورة الوصل', big: 'الصورة كبيرة جداً، اختر صورة أصغر', bad: 'الملف ليس صورة' },
    fr: { cam: 'Prendre une photo', gal: 'Choisir dans la galerie', rm: 'Supprimer la photo', other: 'Autre (précisez)', pick: 'Choisir la campagne', otherPh: 'Nom de la campagne', noImg: 'Veuillez joindre la photo du reçu', big: "L'image est trop lourde", bad: "Ce fichier n'est pas une image" },
    en: { cam: 'Take a photo', gal: 'Choose from gallery', rm: 'Remove photo', other: 'Other (specify)', pick: 'Choose the campaign', otherPh: 'Campaign name', noImg: 'Please attach the receipt photo', big: 'Image is too large', bad: 'File is not an image' },
};

// Réduit la photo (max 1600px, JPEG) : plus rapide en 3G/4G, accepte les grosses photos iPhone/Android
const shrink = async (file) => {
    try {
        const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
        const c = document.createElement('canvas');
        c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
        return blob && blob.size < file.size ? new File([blob], 'receipt.jpg', { type: 'image/jpeg' }) : file;
    } catch { return file; }
};

const L = {
    ar: {
        title: 'استمارة المشاركة', sub: 'املأ البيان خانةً خانة وسنتواصل معك بإذن الله.', donationIntro: 'يرجى ملء هذه الاستمارة بعد التبرع بالمال.', campaign: 'الحملة التي تبرعت لها', bank: 'الحساب الذي حوّلت إليه المال', receipt: 'إرفاق صورة الوصل', camera: 'يمكنك اختيار صورة موجودة أو التقاط صورة مباشرة بالكاميرا',
        types: { donate: 'تبرع', join: 'انضم لنا', sadaqa: 'صدقة جارية' },
        f: { name: 'الاسم واللقب', phone: 'رقم الهاتف', email: 'البريد الإلكتروني (اختياري)', wilaya: 'الولاية / البلدية', amount: 'المبلغ المقترح بالدينار (اختياري)', project: 'المشروع', skills: 'مهاراتك أو وقتك المتاح', note: 'ملاحظات إضافية (اختياري)' },
        choose: 'اختر مشروعاً', send: 'إرسال الاستمارة', sending: 'جارٍ الإرسال…', fail: 'تعذّر الإرسال، تأكد من الاسم والهاتف ثم حاول مجدداً.',
        okTitle: 'تم استلام استمارتك', ok: 'جزاك الله خيراً، سنتصل بك قريباً.', home: 'العودة للرئيسية', pay: 'معلومات التبرع',
    },
    fr: {
        title: 'Formulaire de participation', sub: 'Remplissez le formulaire champ par champ, nous vous recontacterons.', donationIntro: 'Veuillez remplir ce formulaire après avoir effectué votre don.', campaign: 'Campagne soutenue', bank: 'Compte bancaire destinataire', receipt: 'Joindre une photo du reçu', camera: 'Choisissez une image existante ou prenez une photo avec votre caméra.',
        types: { donate: 'Faire un don', join: 'Nous rejoindre', sadaqa: 'Sadaqa Jariya' },
        f: { name: 'Nom et prénom', phone: 'Téléphone', email: 'E-mail (facultatif)', wilaya: 'Wilaya / commune', amount: 'Montant proposé en DA (facultatif)', project: 'Projet', skills: 'Vos compétences ou disponibilités', note: 'Remarques (facultatif)' },
        choose: 'Choisir un projet', send: 'Envoyer le formulaire', sending: 'Envoi…', fail: "Échec de l'envoi : vérifiez le nom et le téléphone puis réessayez.",
        okTitle: 'Formulaire reçu', ok: 'Merci, nous vous contacterons bientôt.', home: "Retour à l'accueil", pay: 'Informations de don',
    },
    en: {
        title: 'Participation form', sub: 'Fill in the form field by field and we will get back to you.', donationIntro: 'Please complete this form after making your financial donation.', campaign: 'Which donation campaign did you contribute to?', bank: 'Which bank account did you transfer the money to?', receipt: 'Upload a photo of the payment receipt', camera: 'Choose an existing image or take a picture directly with your camera.',
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
    const blank = { name: '', phone: '', email: '', wilaya: '', amount: '', project: '', bank: '', skills: '', note: '', website: '' };
    const [f, setF] = useState(blank);
    const [st, setSt] = useState('idle');
    const rx = RX[language] || RX.ar;
    const [receipt, setReceipt] = useState(null);
    const [preview, setPreview] = useState('');
    const [other, setOther] = useState('');
    const [rerr, setRerr] = useState('');
    const camRef = useRef(null); const galRef = useRef(null);
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
    const campaignOptions = donationCampaigns.campaigns.map((c) => getLocalizedContent(c.title, language)).filter(Boolean);
    const onPick = async (e) => {
        const file = e.target.files?.[0]; e.target.value = ''; setRerr('');
        if (!file) return;
        if (file.type && !file.type.startsWith('image/')) { setRerr(rx.bad); return; }
        const out = await shrink(file);
        if (out.size > 8 * 1024 * 1024) { setRerr(rx.big); return; }
        setReceipt(out); setPreview(URL.createObjectURL(out));
    };
    const clearReceipt = () => { setReceipt(null); setPreview(''); };
    const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

    // الحقول تتغير حسب النوع، وكل حقل يظهر كخانة مرقمة
    const fields = type === 'donate' ? [['name','text',true],['phone','tel',true],['amount','number',true],['project','campaign',true],['bank','text',true]] : [
        ['name', 'text', true], ['phone', 'tel', true], ['email', 'email', false], ['wilaya', 'text', false],
        ...(type === 'sadaqa' ? [['project', 'select', false]] : []),
        ...(type !== 'join' ? [['amount', 'number', false]] : []),
        ...(type === 'join' ? [['skills', 'text', false]] : []),
        ['note', 'area', false],
    ];

    const submit = async (e) => {
        e.preventDefault();
        if (type === 'donate' && !receipt) { setRerr(rx.noImg); return; }
        setSt('sending');
        let ok;
        if (type === 'donate') {
            const fd = new FormData();
            Object.entries(f).forEach(([k,v]) => fd.append(k, k === 'project' && v === '__other' ? other.trim() : v));
            fd.append('action', 'submit');
            fd.append('receipt', receipt, receipt.name || 'receipt.jpg');
            ok = await fetch('/feedback/donate.php', { method: 'POST', body: fd }).then(r => r.json()).then(j => j.ok === 1).catch(() => false);
        } else ok = await sendForm({ kind: 'form', type, ...f });
        setSt(ok ? 'ok' : 'fail');
        if (ok) { setF(blank); clearReceipt(); setOther(''); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-brand-paper py-16 px-4 transition-colors duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden luxe-card">
                <div className="bg-brand-grid text-white text-center p-8 border-b-8 border-[var(--brand-red)]">
                    <h1 className="font-display text-3xl">{lb.title}</h1>
                    <p className="text-white/80 mt-2">{type === 'donate' ? lb.donationIntro : lb.sub}</p>
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
                                    {(type === 'donate' && k === 'amount' ? (language === 'ar' ? 'المبلغ المتبرع به (دج)' : language === 'fr' ? 'Montant du don (DA)' : 'Donation amount (DZD)') : type === 'donate' && k === 'project' ? lb.campaign : type === 'donate' && k === 'bank' ? lb.bank : lb.f[k])}{req && <i className="text-[var(--brand-red)] not-italic">*</i>}
                                </span>
                                {kind === 'campaign' ? (
                                    <>
                                        <select className={inp} required value={f.project} onChange={set('project')}>
                                            <option value="">{rx.pick}</option>
                                            {campaignOptions.map((n) => <option key={n} value={n}>{n}</option>)}
                                            <option value="__other">{rx.other}</option>
                                        </select>
                                        {f.project === '__other' && <input className={`${inp} mt-2`} required maxLength={120} placeholder={rx.otherPh} value={other} onChange={(e) => setOther(e.target.value)} />}
                                    </>
                                ) : kind === 'area' ? (
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
                        {type === 'donate' && (
                            <div>
                                <span className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-200">6. {lb.receipt} <i className="text-[var(--brand-red)] not-italic">*</i></span>
                                <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onPick} className="hidden" />
                                <input ref={galRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
                                {preview ? (
                                    <div className="relative rounded-xl border-2 border-green-500 p-2 bg-green-50 dark:bg-gray-900">
                                        <img src={preview} alt="" className="max-h-72 mx-auto rounded-lg object-contain" />
                                        <button type="button" onClick={clearReceipt} aria-label={rx.rm} className="absolute top-3 end-3 w-9 h-9 grid place-items-center rounded-full bg-red-600 text-white shadow"><FaTimes /></button>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <button type="button" onClick={() => camRef.current?.click()} className="rounded-lg py-2 text-sm font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 inline-flex items-center justify-center gap-2"><FaCamera /> {rx.cam}</button>
                                            <button type="button" onClick={() => galRef.current?.click()} className="rounded-lg py-2 text-sm font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 inline-flex items-center justify-center gap-2"><FaImages /> {rx.gal}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => camRef.current?.click()} className="min-h-[88px] rounded-xl border-2 border-dashed border-[var(--brand-navy)]/40 bg-white dark:bg-gray-700 font-bold flex flex-col items-center justify-center gap-2 active:scale-95 transition"><FaCamera className="text-2xl text-[var(--brand-navy)] dark:text-[var(--brand-gold)]" /> {rx.cam}</button>
                                        <button type="button" onClick={() => galRef.current?.click()} className="min-h-[88px] rounded-xl border-2 border-dashed border-[var(--brand-navy)]/40 bg-white dark:bg-gray-700 font-bold flex flex-col items-center justify-center gap-2 active:scale-95 transition"><FaImages className="text-2xl text-[var(--brand-navy)] dark:text-[var(--brand-gold)]" /> {rx.gal}</button>
                                    </div>
                                )}
                                {rerr && <p className="mt-2 text-sm text-red-600" role="alert">{rerr}</p>}
                            </div>
                        )}
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
