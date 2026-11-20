import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { FaHeart, FaUniversity, FaMobileAlt, FaEuroSign } from 'react-icons/fa';
import PageHeader from '../components/PageHeader';
import PayCard from '../components/PayCard';
import settings from '../data/settings';

const L = {
    ar: {
        copy: 'نسخ', copied: 'تم النسخ ✓',
        ccpTitle: 'CCP / بريدي موب (BaridiMob)',
        ccpNumber: 'رقم الحساب البريدي CCP', ccpKey: 'المفتاح (Clé)', rip: 'RIP',
        cpaTitle: 'تحويل بنكي (CPA)', cpaAccount: 'رقم الحساب', holder: 'اسم صاحب الحساب',
        amountBanner: (a) => `مبلغ تبرعك: ${a} دج — حوّله إلى أحد الحسابين أدناه`,
        euroTitle: 'حساب باليورو (IBAN EUR)', iban: 'IBAN EUR',
        note: 'يرجى إرسال صورة وصل الدفع إلى حساب Messenger الخاص بالجمعية، مع ذكر المبلغ الذي أرسلته والحملة التي تريد التبرع لها.',
        steps: 'كيف أتبرع؟ ١) انسخ رقم الحساب ٢) حوّل المبلغ من تطبيق بريدي موب أو بنكك ٣) أرسل لنا الوصل على بريدنا الإلكتروني لنوثّق تبرعك.',
    },
    fr: {
        copy: 'Copier', copied: 'Copié ✓',
        ccpTitle: 'CCP / BaridiMob',
        ccpNumber: 'Numéro de compte CCP', ccpKey: 'Clé', rip: 'RIP',
        cpaTitle: 'Virement bancaire (CPA)', cpaAccount: 'N° de compte', holder: 'Titulaire du compte',
        amountBanner: (a) => `Votre don : ${a} DA — à virer sur l'un des comptes ci-dessous`,
        euroTitle: 'Compte en euros (IBAN EUR)', iban: 'IBAN EUR',
        note: "Merci d'envoyer la photo du reçu de paiement sur le compte Messenger de l'association, en précisant le montant versé et la campagne que vous souhaitez soutenir.",
        steps: '1) Copiez le numéro de compte 2) Faites le virement depuis BaridiMob ou votre banque 3) Envoyez-nous le reçu par e-mail pour que nous enregistrions votre don.',
    },
    en: {
        copy: 'Copy', copied: 'Copied ✓',
        ccpTitle: 'CCP / BaridiMob',
        ccpNumber: 'CCP account number', ccpKey: 'Key (Clé)', rip: 'RIP',
        cpaTitle: 'Bank transfer (CPA)', cpaAccount: 'Account number', holder: 'Account holder',
        amountBanner: (a) => `Your donation: ${a} DZD — send it to one of the accounts below`,
        euroTitle: 'Euro account (IBAN EUR)', iban: 'IBAN EUR',
        note: "Please send a photo of the payment receipt to the association's Messenger account, stating the amount you sent and which campaign you want to donate to.",
        steps: '1) Copy the account number 2) Transfer from BaridiMob or your bank 3) Email us the receipt so we can record your gift.',
    },
};

const Donate = () => {
    const { t, language } = useLanguage();
    const lb = L[language] || L.ar;
    const [params] = useSearchParams();
    const pay = settings.payment || {};

    // ?amount=3000 (envoyé par la section Ramadan) : on l'affiche
    const rawAmount = parseInt(params.get('amount'), 10);
    const amount = rawAmount > 0 && rawAmount < 100000000 ? rawAmount.toLocaleString('en-US') : '';

    const hasCcp = Boolean(pay.ccp_number || pay.rip);
    const ccpRows = [
        pay.ccp_number && { label: lb.ccpNumber, value: pay.ccp_number },
        pay.ccp_key && { label: lb.ccpKey, value: pay.ccp_key },
        pay.rip && { label: lb.rip, value: pay.rip },
        pay.account_name && { label: lb.holder, value: pay.account_name },
    ].filter(Boolean);
    const cpaRows = [
        pay.cpa_account && { label: lb.cpaAccount, value: pay.cpa_account },
        pay.account_name && { label: lb.holder, value: pay.account_name },
    ].filter(Boolean);
    const euroRows = [
        { label: lb.iban, value: pay.iban_eur || '' },
        pay.account_name && { label: lb.holder, value: pay.account_name },
    ].filter(Boolean);
    const messenger = pay.messenger_url || 'https://m.me/chababelihssan3';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-12 md:pb-20 bg-brand-paper min-h-screen transition-colors duration-300"
        >
            <PageHeader title={t.donate_title} subtitle={t.donate_hero_desc} />
            <div className="container mx-auto px-4 pt-8 md:pt-12">
                <div className="max-w-xl mx-auto space-y-6">
                    {amount && (
                        <div className="rounded-xl bg-[var(--brand-gold)]/20 border border-[var(--brand-gold)] text-center font-bold text-[var(--brand-navy)] dark:text-white p-4">
                            {lb.amountBanner(amount)}
                        </div>
                    )}

                    <p className="text-center text-gray-700 dark:text-gray-300 leading-relaxed">{lb.steps}</p>

                    {hasCcp && (
                        <PayCard
                            icon={<FaMobileAlt />}
                            title={lb.ccpTitle}
                            rows={ccpRows}
                            copyLabel={lb.copy}
                            copiedLabel={lb.copied}
                        />
                    )}

                    {cpaRows.length > 0 && (
                        <PayCard
                            icon={<FaUniversity />}
                            title={lb.cpaTitle}
                            rows={cpaRows}
                            copyLabel={lb.copy}
                            copiedLabel={lb.copied}
                        />
                    )}

                    <p className="text-center text-green-600 dark:text-green-400 font-bold leading-relaxed">
                        <a href={messenger} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                            {lb.note}
                        </a>
                    </p>

                    {pay.iban_eur && (
                        <PayCard
                            icon={<FaEuroSign />}
                            title={lb.euroTitle}
                            rows={euroRows}
                            copyLabel={lb.copy}
                            copiedLabel={lb.copied}
                        />
                    )}

                </div>

                <div className="mt-16 text-center bg-blue-50 dark:bg-gray-800 p-8 md:p-10 rounded-2xl max-w-4xl mx-auto transition-colors duration-300">
                    <FaHeart className="text-red-500 text-5xl mx-auto mb-6 animate-pulse" />
                    <h2 className="font-display text-3xl md:text-4xl text-[var(--brand-navy)] dark:text-white mb-4">{t.impact_title}</h2>
                </div>
            </div>
        </motion.div>
    );
};

export default Donate;
