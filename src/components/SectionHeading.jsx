import React from 'react';

// Titre de section : pastille, titre, filet dégradé or → rouge.
const SectionHeading = ({ eyebrow, title, subtitle }) => (
    <div className="max-w-3xl mx-auto text-center mb-12">
        {eyebrow && <span className="inline-block rounded-full bg-[var(--brand-red)]/10 text-[var(--brand-red)] px-4 py-1 text-sm font-bold mb-3">{eyebrow}</span>}
        <h2 className="font-display text-2xl md:text-4xl text-[var(--brand-navy)] dark:text-white">{title}</h2>
        <div className="heading-bar" />
        {subtitle && <p className="mt-5 text-gray-600 dark:text-gray-300 leading-relaxed">{subtitle}</p>}
    </div>
);

export default SectionHeading;
