import React from 'react';

// Emblèmes animés (SVG léger, sans bibliothèque) : traits fins dorés, mouvement discret et sobre.
const SHAPES = {
    siqaya: (<><path className="em-drop" d="M12 3.2c3.4 4.1 5.6 6.9 5.6 9.7a5.6 5.6 0 0 1-11.2 0c0-2.8 2.2-5.6 5.6-9.7Z" /><path className="em-wave" d="M8.4 14.2c1.1-.9 2.2-.9 3.6 0s2.5.9 3.6 0" /></>),
    okfoulni: (<path className="em-heart" d="M12 20.2s-7.6-4.5-7.6-10.2A4.3 4.3 0 0 1 12 7.600a4.300 4.300 0 0 1 7.600 2.400c0 5.700-7.600 10.200-7.600 10.200Z" />),
    ramadan: (<><path className="em-moon" d="M15.800 4.600A8 8 0 1 0 19.400 15 6.600 6.600 0 0 1 15.800 4.600Z" /><path className="em-star" d="m17.800 6.200.5 1.300 1.300.5-1.300.5-.5 1.300-.5-1.300-1.300-.5 1.300-.5Z" /></>),
    wartil: (<><path d="M12 6.500C10.200 5.200 7.800 4.800 5 5v12c2.800-.2 5.200.2 7 1.500 1.800-1.300 4.200-1.700 7-1.500V5c-2.800-.2-5.200.2-7 1.500Z" /><path className="em-page" d="M12 6.500v12" /></>),
    food: (<><path className="em-wheat" d="M12 21V8" /><path className="em-wheat" d="M12 8c-2.400 0-3.500-1.500-3.500-3.500 2.100 0 3.500 1.400 3.500 3.500Zm0 0c2.400 0 3.500-1.500 3.500-3.500-2.100 0-3.500 1.400-3.500 3.500Zm0 5c-2.400 0-3.500-1.500-3.500-3.500 2.100 0 3.500 1.400 3.500 3.500Zm0 0c2.400 0 3.500-1.500 3.500-3.500-2.100 0-3.500 1.400-3.500 3.500Z" /></>),
};

const ProgramEmblem = ({ id }) => (
    <span className={`emblem em-${SHAPES[id] ? id : 'food'}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{SHAPES[id] || SHAPES.food}</svg>
    </span>
);

export default ProgramEmblem;
