import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../context/LanguageContext';
import { achievementPlaces } from '../data/media';
import { getLocalizedContent } from '../utils/languageUtils';

const ALGERIA_CENTER = [28.2, 2.6];
const SIDES = { left: [-6, 0], right: [6, 0], top: [0, -8], bottom: [0, 8] };

const AchievementsMapInner = () => {
    const { language } = useLanguage();
    return (
        <MapContainer center={ALGERIA_CENTER} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
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
    );
};

export default AchievementsMapInner;
