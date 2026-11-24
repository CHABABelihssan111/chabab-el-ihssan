import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../context/LanguageContext';
import { achievementPlaces } from '../data/media';
import { getLocalizedContent } from '../utils/languageUtils';

const ALGERIA_CENTER = [28.2, 2.6];
const SIDES = { left: [-6, 0], right: [6, 0], top: [0, -8], bottom: [0, 8] };

const LABEL = {
    ar: { locked: 'الخريطة مقفلة — اضغط لفتحها', open: 'اضغط لقفل الخريطة' },
    fr: { locked: 'Carte verrouillée — touchez pour déverrouiller', open: 'Touchez pour verrouiller la carte' },
    en: { locked: 'Map locked — tap to unlock', open: 'Tap to lock the map' },
};

// Verrouillée par défaut : la page défile normalement ; déverrouillée, on peut déplacer/zoomer.
const Lock = ({ locked }) => {
    const map = useMap();
    useEffect(() => {
        ['dragging', 'touchZoom', 'doubleClickZoom', 'scrollWheelZoom', 'boxZoom', 'keyboard']
            .forEach((k) => map[k]?.[locked ? 'disable' : 'enable']());
    }, [locked, map]);
    return null;
};

const AchievementsMapInner = () => {
    const { language } = useLanguage();
    const [locked, setLocked] = useState(true);
    const txt = (LABEL[language] || LABEL.en)[locked ? 'locked' : 'open'];
    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            aria-pressed={locked}
            aria-label={txt}
            title={txt}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, width: 42, height: 42, borderRadius: 10, border: '2px solid rgba(0,0,0,.2)', background: locked ? '#7a1034' : '#fff', color: locked ? '#fff' : '#7a1034', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.3)', cursor: 'pointer' }}
        >
            {locked ? <FaLock /> : <FaLockOpen />}
        </button>
        <MapContainer center={ALGERIA_CENTER} zoom={5} scrollWheelZoom={false} dragging={false} touchZoom={false} doubleClickZoom={false} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                        <Lock locked={locked} />
                        {!locked && <ZoomControl position="bottomright" />}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {achievementPlaces.map((p) => (
                            <CircleMarker
                                key={p.id}
                                center={[p.lat, p.lng]}
                                radius={9}
                                pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#c8102e', fillOpacity: 0.95 }}
                            >
                                <Tooltip permanent direction={SIDES[p.label_side] ? p.label_side : 'right'} offset={SIDES[p.label_side] || SIDES.right}>
                                    <span className="font-arabic font-bold">{getLocalizedContent(p.name, language)}</span>
                                </Tooltip>
                            </CircleMarker>
                        ))}
                    </MapContainer>
        </div>
    );
};

export default AchievementsMapInner;
