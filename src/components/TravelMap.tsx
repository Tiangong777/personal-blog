import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion } from 'framer-motion';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const visited = [
    "UKR", "JPN", "HKG", "DEU", "VAT", "ITA", "ESP", "PRT", "GRC",
    "LVA", "EGY", "SAU", "QAT", "AUT", "CHE", "FRA", "GBR", "IRL", "ISL", "NLD", "CHN"
];

const markers = [
    { markerOffset: -12, name: "Hong Kong", coordinates: [114.1694, 22.3193] },
    { markerOffset: 12, name: "Vatican City", coordinates: [12.4534, 41.9029] },
];

const TravelMap: React.FC = () => {
    return (
        <section>
            <div className="flex justify-between items-end mb-12 border-l-4 border-accent-blue pl-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-outfit font-black tracking-tighter uppercase">Travel_Logs</h2>
                    <p className="text-text-dim font-mono text-xs mt-2 font-bold tracking-widest opacity-50 uppercase">Geospatial footprint</p>
                </div>
                <div className="text-right">
                    <span className="text-[20px] font-outfit font-black text-accent-blue tracking-tighter leading-none block">
                        {visited.length}
                    </span>
                    <span className="text-[8px] font-bold tracking-widest text-text-dim uppercase">Nodes discovered</span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-4 md:p-8 overflow-hidden relative"
            >
                <div className="absolute top-4 right-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_8px_rgba(0,242,255,0.6)]" />
                    <span className="text-[10px] font-mono text-text-dim opacity-50 uppercase tracking-tighter">Live Map Renderer v1.0.4</span>
                </div>

                <ComposableMap
                    projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
                    className="w-full h-auto grayscale transition-all duration-700 hover:grayscale-0"
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const iso = geo.properties.ISO_A3 || geo.id;
                                const isVisited = visited.includes(iso);
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={isVisited ? "var(--accent-blue)" : "rgba(255,255,255,0.03)"}
                                        stroke="rgba(255,255,255,0.05)"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: isVisited ? "#22d3ee" : "rgba(255,255,255,0.1)", outline: "none", cursor: 'crosshair' },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {markers.map(({ name, coordinates, markerOffset }) => (
                        <Marker key={name} coordinates={coordinates as [number, number]}>
                            <circle r={2} fill="var(--accent-blue)" className="animate-pulse" />
                            <text
                                textAnchor="middle"
                                y={markerOffset}
                                className="text-[8px] fill-text-dim font-mono font-bold tracking-tighter opacity-70"
                                pointerEvents="none"
                            >
                                {name.toUpperCase()}
                            </text>
                        </Marker>
                    ))}
                </ComposableMap>
            </motion.div>
        </section>
    );
};

export default TravelMap;
