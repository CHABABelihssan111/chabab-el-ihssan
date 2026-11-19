import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaWhatsapp, FaEnvelope, FaFacebookMessenger } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { projectCategories } from '../data/siteData';
import { getLocalizedContent } from '../utils/languageUtils';
import settings from '../data/settings';

const L = {
    ar: { title: 'وثّق تبرعك', name: 'الاسم', amount: 'المبلغ (دج / €)', campaign: 'الحملة أو المشروع الذي تبرعت له', ph: 'مثال: لبسة العيد',
        hint: 'بعد الضغط على أحد الأزرار ستُفتح المحادثة، ألصق الرسالة وأرفق صورة الوصل.',
        msg: (n, a, c) => `السلام عليكم، تبرعت بمبلغ ${a} للحملة: ${c}.\nالاسم: ${n}\nوهذا وصل الدفع 👇`,
        copied: 'تم نسخ الرسالة، ألصقها في المحادثة وأرفق الوصل', fill: 'املأ الاسم والمبلغ والحملة', subj: 'وصل تبرع' },
    fr: { title: 'Confirmez votre don', name: 'Nom', amount: 'Montant (DA / €)', campaign: 'Campagne ou projet soutenu', ph: "Ex : Habits de l'Aïd",
        hint: "La conversation s'ouvrira : collez le message et joignez la photo du reçu.",
        msg: (n, a, c) => `Salam, j'ai fait un don de ${a} pour : ${c}.\nNom : ${n}\nVoici le reçu 👇`,
        copied: 'Message copié : collez-le et joignez le reçu', fill: 'Remplissez nom, montant et campagne', subj: 'Reçu de don' },
    en: { title: 'Confirm your donation', name: 'Name', amount: 'Amount (DZD / €)', campaign: 'Campaign or project supported', ph: 'e.g. Eid clothes',
        hint: 'The chat will open: paste the message and attach the receipt photo.',
        msg: (n, a, c) => `Hello, I donated ${a} to: ${c}.\nName: ${n}\nHere is the receipt 👇`,
        copied: 'Message copied: paste it and attach the receipt', fill: 'Fill in name, amount and campaign', subj: 'Donation receipt' },
};

const inputCls = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-3';

const ReceiptForm = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.ar;
    const [f, setF] = useState({ name: '', amount: '', campaign: '' });
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

    const options = projectCategories.flatMap((c) => c.items || []).map((i) => getLocalizedContent(i.title, language)).filter(Boolean);
    const text = lb.msg(f.name.trim(), f.amount.trim(), f.campaign.trim());
    const ok = f.name.trim() && f.amount.trim() && f.campaign.trim();
    const guard = () => { if (!ok) { toast.error(lb.fill); return false; } return true; };

    const messenger = async () => {
        if (!guard()) return;
        try { await navigator.clipboard.writeText(text); toast.success(lb.copied); } catch { /* ignore */ }
        window.open(settings.payment?.messenger_url || 'https://m.me/chababelihssan3', '_blank', 'noopener');
    };
    const phone = String(settings.phone_display || '').split('/').pop().replace(/\D/g, '').replace(/^0/, '213');
    const whatsapp = () => guard() && window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    const email = () => guard() && (window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(lb.subj)}&body=${encodeURIComponent(text)}`);

    const btn = 'flex-1 min-w-[130px] min-h-[48px] rounded-lg text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition';
    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border-t-4 border-green-600">
            <div className="text-green-600 text-4xl mb-3 flex justify-center"><FaPaperPlane /></div>
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-5 text-gray-800 dark:text-white">{lb.title}</h3>
            <div className="space-y-3">
                <input className={inputCls} placeholder={lb.name} value={f.name} onChange={set('name')} />
                <input className={inputCls} placeholder={lb.amount} value={f.amount} onChange={set('amount')} inputMode="decimal" />
                <input className={inputCls} placeholder={lb.campaign + ' — ' + lb.ph} value={f.campaign} onChange={set('campaign')} list="cei-campaigns" />
                <datalist id="cei-campaigns">{options.map((o) => <option key={o} value={o} />)}</datalist>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
                <button type="button" onClick={messenger} className={`${btn} bg-blue-600 hover:bg-blue-700`}><FaFacebookMessenger /> Messenger</button>
                <button type="button" onClick={whatsapp} className={`${btn} bg-green-600 hover:bg-green-700`}><FaWhatsapp /> WhatsApp</button>
                <button type="button" onClick={email} className={`${btn} bg-gray-700 hover:bg-gray-800`}><FaEnvelope /> Email</button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">{lb.hint}</p>
        </div>
    );
};

export default ReceiptForm;
