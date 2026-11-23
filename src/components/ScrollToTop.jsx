import React from 'react';
import { FaPhoneAlt } from 'react-icons/fa';
import settings from '../data/settings';

// زر اتصال عائم (يحلّ محلّ سهم الصعود): ضغطة واحدة تفتح الاتصال مباشرة.
const first = String(settings.phone_display || '0557343528').split('/')[0].replace(/\D/g, '').replace(/^0/, '');

const ScrollToTop = () => (
    <a
        href={`tel:+213${first}`}
        aria-label="Call us"
        className="fixed bottom-8 right-4 md:right-8 z-50 w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
        <span className="absolute inset-0 rounded-full bg-green-500/50 animate-ping" aria-hidden="true" />
        <FaPhoneAlt className="relative text-lg" />
    </a>
);

export default ScrollToTop;
