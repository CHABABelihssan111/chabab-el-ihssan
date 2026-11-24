import React, { useState } from 'react';
import { FaCommentDots, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { sendForm } from '../utils/sendForm';

const L = {
    ar: { title: 'ملاحظاتك تهمّنا', sub: 'اقتراح؟ ملاحظة؟ مشكلة في الموقع؟ اكتب لنا وسنقرأ كل رسالة.', type: 'نوع الرسالة', types: [['suggestion', 'اقتراح'], ['remark', 'ملاحظة'], ['problem', 'مشكلة'], ['thanks', 'شكر']], name: 'الاسم (اختياري)', contact: 'هاتف أو بريد للرد (اختياري)', msg: 'اكتب رسالتك هنا…', send: 'إرسال', sending: 'جارٍ الإرسال…', ok: 'وصلتنا رسالتك، جزاك الله خيراً.', again: 'إرسال رسالة أخرى', fail: 'تعذّر الإرسال، حاول لاحقاً.' },
    fr: { title: 'Votre avis compte', sub: 'Une suggestion, une remarque, un problème ? Écrivez-nous, nous lisons chaque message.', type: 'Type de message', types: [['suggestion', 'Suggestion'], ['remark', 'Remarque'], ['problem', 'Problème'], ['thanks', 'Remerciement']], name: 'Nom (facultatif)', contact: 'Téléphone ou e-mail pour répondre (facultatif)', msg: 'Écrivez votre message ici…', send: 'Envoyer', sending: 'Envoi…', ok: 'Message bien reçu, merci !', again: 'Envoyer un autre message', fail: "Échec de l'envoi, réessayez plus tard." },
    en: { title: 'Your feedback matters', sub: 'A suggestion, a remark, a problem? Write to us — we read every message.', type: 'Message type', types: [['suggestion', 'Suggestion'], ['remark', 'Remark'], ['problem', 'Problem'], ['thanks', 'Thanks']], name: 'Name (optional)', contact: 'Phone or email to reply (optional)', msg: 'Write your message here…', send: 'Send', sending: 'Sending…', ok: 'Message received, thank you!', again: 'Send another message', fail: 'Could not send, please try again later.' },
};
const inp = 'w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] transition';

// قسم الملاحظات: يظهر في أسفل كل صفحات الموقع، بعرض كامل، قبل التذييل.
const FeedbackBox = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.en;
    const [f, setF] = useState({ type: 'suggestion', name: '', contact: '', message: '', website: '' });
    const [st, setSt] = useState('idle'); // idle | sending | ok | fail
    const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setSt('sending');
        const ok = await sendForm({ kind: 'feedback', ...f });
        setSt(ok ? 'ok' : 'fail');
        if (ok) setF({ type: 'suggestion', name: '', contact: '', message: '', website: '' });
    };

    return (
        <section id="feedback" className="feedback-box relative isolate overflow-hidden w-full text-white py-14 px-4">
            <div className="container mx-auto max-w-3xl relative z-10">
                <div className="text-center mb-8">
                    <FaCommentDots className="text-4xl mx-auto mb-3 text-[var(--brand-gold)]" aria-hidden="true" />
                    <h2 className="font-display text-2xl md:text-3xl">{lb.title}</h2>
                    <p className="mt-2 text-white/80">{lb.sub}</p>
                </div>

                {st === 'ok' ? (
                    <div className="text-center bg-white/10 rounded-2xl p-8 ring-1 ring-white/20" role="status">
                        <FaCheckCircle className="text-4xl mx-auto mb-3 text-green-400" />
                        <p className="font-bold mb-4">{lb.ok}</p>
                        <button type="button" onClick={() => setSt('idle')} className="btn-glass py-2 px-6">{lb.again}</button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="flex flex-wrap gap-2 justify-center" role="radiogroup" aria-label={lb.type}>
                            {lb.types.map(([v, label]) => (
                                <button key={v} type="button" role="radio" aria-checked={f.type === v} onClick={() => setF((p) => ({ ...p, type: v }))}
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${f.type === v ? 'bg-[var(--brand-gold)] text-[var(--brand-navy-dark)]' : 'bg-white/10 ring-1 ring-white/25 hover:bg-white/20'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <input className={inp} value={f.name} onChange={set('name')} placeholder={lb.name} maxLength={80} autoComplete="name" />
                            <input className={inp} value={f.contact} onChange={set('contact')} placeholder={lb.contact} maxLength={120} />
                        </div>
                        <textarea className={`${inp} resize-none`} rows={4} required minLength={3} maxLength={2000} value={f.message} onChange={set('message')} placeholder={lb.msg} />
                        {/* فخ للروبوتات: يبقى فارغاً عند البشر */}
                        <input type="text" name="website" value={f.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 w-0" />
                        {st === 'fail' && <p className="text-center text-red-300 text-sm" role="alert">{lb.fail}</p>}
                        <button type="submit" disabled={st === 'sending'} className="btn-brand btn-pulse py-3 px-8 mx-auto inline-flex items-center gap-2 disabled:opacity-60">
                            <FaPaperPlane className="rtl:-scale-x-100" /> {st === 'sending' ? lb.sending : lb.send}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default FeedbackBox;
