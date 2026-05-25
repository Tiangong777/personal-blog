import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion } from 'framer-motion';

const geoUrl = "/data/countries-110m.json";

const visitedCountryIds = new Set([
    "040", // Austria
    "156", // China
    "250", // France
    "276", // Germany
    "300", // Greece
    "352", // Iceland
    "372", // Ireland
    "380", // Italy
    "392", // Japan
    "428", // Latvia
    "528", // Netherlands
    "620", // Portugal
    "634", // Qatar
    "682", // Saudi Arabia
    "724", // Spain
    "756", // Switzerland
    "804", // Ukraine
    "818", // Egypt
    "826", // United Kingdom
]);

const markers = [
    { markerOffset: -12, name: "Hong Kong", coordinates: [114.1694, 22.3193] },
    { markerOffset: 12, name: "Vatican City", coordinates: [12.4534, 41.9029] },
];

const nodeCount = visitedCountryIds.size + markers.length;

const TravelMap: React.FC = () => {
    return (
        <section>
            <div className="flex justify-between items-end mb-12 border-l-4 border-accent pl-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tighter uppercase">足迹</h2>
                    <p className="text-text-secondary font-mono text-xs mt-2 font-bold tracking-widest opacity-50 uppercase">到过的地方</p>
                </div>
                <div className="text-right">
                    <span className="text-[20px] font-heading font-black text-accent tracking-tighter leading-none block">
                        {nodeCount}
                    </span>
                    <span className="text-[8px] font-bold tracking-widest text-text-secondary uppercase">Nodes discovered</span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-4 md:p-8 overflow-hidden relative"
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--map-glow),transparent_58%)]" />

                <div className="absolute top-4 right-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(0,242,255,0.6)]" />
                    <span className="text-[10px] font-mono text-text-secondary opacity-50 uppercase tracking-tighter">Live Map Renderer v1.0.4</span>
                </div>

                <ComposableMap
                    projectionConfig={{ rotate: [-10, 0, 0], scale: 148 }}
                    className="relative z-10 w-full h-auto min-h-[320px] transition-all duration-700 md:min-h-[520px]"
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const countryId = String(geo.id).padStart(3, "0");
                                const isVisited = visitedCountryIds.has(countryId);
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        className={isVisited ? "travel-map-country-lit" : "travel-map-country"}
                                        fill={isVisited ? "var(--accent)" : "var(--map-land)"}
                                        stroke={isVisited ? "var(--map-lit-stroke)" : "var(--map-stroke)"}
                                        strokeWidth={isVisited ? 0.7 : 0.45}
                                        style={{
                                            default: { outline: "none", transition: "fill 180ms ease, opacity 180ms ease" },
                                            hover: { fill: isVisited ? "var(--map-lit-hover)" : "var(--map-land-hover)", outline: "none", cursor: 'crosshair' },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {markers.map(({ name, coordinates, markerOffset }) => (
                        <Marker key={name} coordinates={coordinates as [number, number]}>
                            <circle r={7} fill="var(--accent)" opacity={0.16} className="animate-pulse" />
                            <circle r={2.8} fill="var(--accent)" stroke="var(--map-marker-ring)" strokeWidth={1.4} />
                            <text
                                textAnchor="middle"
                                y={markerOffset}
                                className="text-[8px] fill-text-primary font-mono font-black tracking-tighter opacity-80"
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
