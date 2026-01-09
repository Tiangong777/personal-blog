import React from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from 'react-simple-maps';

// TopoJSON with ISO_A3 properties
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
// Note: Some sources use numeric IDs, some use ISO. I'll stick to a standard one and add name-based matching if needed.

// Visited countries list (ISO Alpha-3 and common names for robustness)
const visited = [
    "UKR", "JPN", "HKG", "DEU", "VAT", "ITA", "ESP", "PRT", "GRC",
    "LVA", "EGY", "SAU", "QAT", "AUT", "CHE", "FRA", "GBR", "IRL", "ISL", "NLD", "CHN",
    "Ukraine", "Japan", "Hong Kong", "Germany", "Vatican City", "Italy", "Spain", "Portugal", "Greece",
    "Latvia", "Egypt", "Saudi Arabia", "Qatar", "Austria", "Switzerland", "France", "United Kingdom", "Ireland", "Iceland", "Netherlands", "China",
    "Holy See", "United Kingdom of Great Britain and Northern Ireland"
];

// Markers for small places
const markers = [
    { markerOffset: -12, name: "Hong Kong", coordinates: [114.1694, 22.3193] },
    { markerOffset: 12, name: "Vatican City", coordinates: [12.4534, 41.9029] },
];

const TravelMap: React.FC = () => {
    return (
        <section style={{ marginTop: 'var(--space-xxl)', marginBottom: 'var(--space-xxl)' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 'var(--space-xl)',
                borderLeft: '4px solid var(--accent-blue)',
                paddingLeft: 'var(--space-md)'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>TRAVEL_LOGS</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>
                    {visited.filter(v => v.length > 3).length / 2 + 3} COUNTRIES_VISITED
                </span>
            </div>

            <div className="glass" style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'var(--bg-card)',
                overflow: 'hidden'
            }}>
                <ComposableMap
                    projectionConfig={{
                        rotate: [-10, 0, 0],
                        scale: 147
                    }}
                    style={{ width: "100%", height: "auto" }}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const { name, NAME, ISO_A3, iso_a3 } = geo.properties;
                                const geoName = name || NAME;
                                const geoIso = ISO_A3 || iso_a3 || geo.id;

                                const isVisited = visited.some(v =>
                                    v.toLowerCase() === geoName?.toLowerCase() ||
                                    v.toLowerCase() === geoIso?.toLowerCase()
                                );

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={isVisited ? "var(--accent-blue)" : "var(--glass-bg)"}
                                        stroke="var(--glass-border)"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none", transition: "all 0.3s" },
                                            hover: { fill: isVisited ? "var(--accent-glow)" : "var(--glass-border)", outline: "none", cursor: isVisited ? "pointer" : "default" },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {markers.map(({ name, coordinates, markerOffset }) => (
                        <Marker key={name} coordinates={coordinates as [number, number]}>
                            <circle r={2} fill="var(--accent-blue)" stroke="#fff" strokeWidth={1} />
                            <text
                                textAnchor="middle"
                                y={markerOffset}
                                style={{
                                    fontFamily: "Inter",
                                    fill: "var(--text-main)",
                                    fontSize: "9px",
                                    fontWeight: 600,
                                    pointerEvents: "none"
                                }}
                            >
                                {name}
                            </text>
                        </Marker>
                    ))}
                </ComposableMap>
            </div>
        </section>
    );
};

export default TravelMap;
