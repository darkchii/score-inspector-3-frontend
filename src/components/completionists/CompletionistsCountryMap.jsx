import { useEffect, useMemo, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { lookup } from "country-data-list";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FormatNumber } from "../../util/Helper";

const WORLD_GEOJSON_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
const DARK_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const DARK_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const COUNTRY_FILL_COLOR_RANGE = {
    min: "rgb(70, 90, 120)",
    max: "rgb(185, 205, 225)",
};

function parseRgbColor(color) {
    const match = color.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i);
    if (!match) {
        return null;
    }

    return [
        Math.max(0, Math.min(255, Number(match[1]))),
        Math.max(0, Math.min(255, Number(match[2]))),
        Math.max(0, Math.min(255, Number(match[3]))),
    ];
}

function getCountryFillColor(count, maxCount, colorRange = COUNTRY_FILL_COLOR_RANGE) {
    if (!count || maxCount <= 0) {
        return "#e7ecf200";
    }

    const minRgb = parseRgbColor(colorRange?.min);
    const maxRgb = parseRgbColor(colorRange?.max);
    if (!minRgb || !maxRgb) {
        return "rgb(140, 160, 180)";
    }

    const normalized = Math.min(1, count / maxCount);
    const interpolated = minRgb.map((channel, idx) => (
        Math.round(channel + (maxRgb[idx] - channel) * normalized)
    ));

    return `rgb(${interpolated[0]}, ${interpolated[1]}, ${interpolated[2]})`;
}

function CompletionistsCountryMap({ data }) {
    const [worldGeoJson, setWorldGeoJson] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();

        (async () => {
            try {
                const response = await fetch(WORLD_GEOJSON_URL, { signal: abortController.signal });
                if (!response.ok) {
                    throw new Error(`Failed to fetch world geojson (${response.status})`);
                }
                const geoJson = await response.json();
                setWorldGeoJson(geoJson);
            } catch (e) {
                if (e.name !== "AbortError") {
                    console.error(e);
                }
            }
        })();

        return () => {
            abortController.abort();
        };
    }, []);

    const countryCounts = useMemo(() => {
        if (!data) {
            return {};
        }

        // Some users are completionists in multiple modes; count each user once globally.
        const usersById = new Map();

        for (const item of Object.values(data).flat()) {
            if(!item.user?.osuApi?.id) {
                continue;
            }

            if (!usersById.has(item.user_id)) {
                usersById.set(item.user_id, item.user);
            }
        }

        const counts = {};
        for (const user of usersById.values()) {
            const alpha2 = user?.osuApi?.country_code;
            if (!alpha2) {
                continue;
            }

            const countryLookup = lookup.countries({ alpha2: alpha2.toUpperCase() })?.[0];
            const alpha3 = countryLookup?.alpha3;

            if (!alpha3) {
                continue;
            }

            counts[alpha3] = (counts[alpha3] || 0) + 1;
        }

        console.log("Country counts:", counts);
        return counts;
    }, [data]);

    const maxCountryCount = useMemo(() => {
        const values = Object.values(countryCounts);
        return values.length ? Math.max(...values) : 0;
    }, [countryCounts]);

    const coveredCountries = useMemo(() => Object.keys(countryCounts).length, [countryCounts]);

    return (
        <Grid size={{ xs: 12 }}>
            <Paper elevation={3} sx={{ padding: 1 }}>
                <Typography variant="h6">Completionists by Country</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Countries represented: {FormatNumber(coveredCountries)}
                </Typography>
                <div style={{ height: 420, width: "100%" }}>
                    {
                        worldGeoJson ? (
                            <MapContainer
                                center={[20, 0]}
                                zoom={1.35}
                                minZoom={1}
                                maxZoom={6}
                                scrollWheelZoom={false}
                                style={{
                                    height: "100%",
                                    width: "100%",
                                    borderRadius: 8,
                                    background: "#ffffff00",
                                }}
                            >
                                <TileLayer
                                    attribution={DARK_TILE_ATTRIBUTION}
                                    url={DARK_TILE_URL}
                                    noWrap={true}
                                    //transparent if no tiles, to avoid white background
                                    background={"#ffffff00"}
                                />
                                <GeoJSON
                                    data={worldGeoJson}
                                    style={(feature) => {
                                        const iso3 = feature?.properties?.["ISO3166-1-Alpha-3"];
                                        const count = iso3 ? (countryCounts[iso3] || 0) : 0;
                                        return {
                                            fillColor: getCountryFillColor(count, maxCountryCount),
                                            weight: 0.8,
                                            opacity: 1,
                                            color: "#6f7582",
                                            fillOpacity: count ? 0.85 : 0.55,
                                        };
                                    }}
                                    onEachFeature={(feature, layer) => {
                                        console.log(feature);
                                        const iso3 = feature?.properties?.["ISO3166-1-Alpha-3"];
                                        const count = iso3 ? (countryCounts[iso3] || 0) : 0;
                                        const countryName = feature?.properties?.ADMIN || feature?.properties?.name || iso3 || "Unknown";
                                        layer.bindTooltip(`${countryName}: ${FormatNumber(count)} completionist${count === 1 ? "" : "s"}`);
                                    }}
                                />
                            </MapContainer>
                        ) : (
                            <div style={{ padding: 12 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Loading world map...
                                </Typography>
                            </div>
                        )
                    }
                </div>
            </Paper>
        </Grid>
    );
}

export default CompletionistsCountryMap;
