import { useState } from "react"
import SnowGauge from "./SnowGauge"
import ScoreCard from "./ScoreCard"

const stations = [
    { id: "KORH", name: "Wachusett Mountain (Worcester)" },
    { id: "KCON", name: "Cannon Mountain (Concord NH)" },
    { id: "KVSF", name: "Okemo / Killington area (Springfield VT)" },
    { id: "KEEN", name: "Wildcat / Attitash area (Keene NH)" },
    { id: "KLEB", name: "Sunapee / Dartmouth area (Lebanon NH)" },
    { id: "KBTV", name: "Stowe / Sugarbush area (Burlington VT)" },
    { id: "KBML", name: "Bretton Woods area (Berlin NH)" },
    { id: "KACK", name: "Nantucket (coastal reference)" },
]

// Check if presentWeather array from NOAA contains any snow condition
function checkIsSnowing(presentWeather) {
    if (!presentWeather || presentWeather.length === 0) return false
    return presentWeather.some(w => {
        const desc = (w.weather || "").toLowerCase()
        return desc.includes("snow") || desc.includes("flurr")
    })
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000)
    if (seconds < 10) return "just now"
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes === 1) return "1 minute ago"
    return `${minutes} minutes ago`
}

function StationPicker() {
    const [data, setData] = useState(null)
    const [message, setMessage] = useState("Select a location above")
    const [loading, setLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(null)

    function handleStationChange(event) {
        const stationId = event.target.value
        if (!stationId) return

        setLoading(true)
        setMessage("Fetching data from NOAA...")
        setData(null)

        fetch(`https://api.weather.gov/stations/${stationId}/observations/latest`)
            .then(r => r.json())
            .then(obs => {
                const raw = obs.properties || obs

                const snowMeters = raw.snowDepth ? raw.snowDepth.value : null
                const depthInches = snowMeters !== null
                    ? parseFloat((snowMeters * 39.3701).toFixed(1))
                    : 0

                const tempC = raw.temperature ? raw.temperature.value : null
                const tempF = tempC !== null ? Math.round(tempC * 9 / 5 + 32) : null

                const windKmh = raw.windSpeed ? raw.windSpeed.value : null
                const windMph = windKmh !== null ? Math.round(windKmh * 0.621371) : null

                const humidity = raw.relativeHumidity
                    ? Math.round(raw.relativeHumidity.value)
                    : null

                const isSnowing = checkIsSnowing(raw.presentWeather)

                setData({ depthInches, tempF, windMph, humidity, isSnowing })
                setMessage(isSnowing ? "It's snowing right now!" : "Current conditions")
                setLoading(false)
                setLastUpdated(new Date())
            })
            .catch(() => {
                setMessage("Could not fetch data. Try again.")
                setLoading(false)
            })
    }

    return (
        <div className="station-picker" style={{
            border: "1px solid rgba(140,200,255,0.15)",
            borderRadius: "16px",
            padding: "1.5rem",
            width: "100%",
            maxWidth: "820px",
        }}>
            <select
                className="station-select"
                onChange={handleStationChange}
                defaultValue=""
                style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(140,200,255,0.2)",
                    borderRadius: "10px",
                    color: "#d0e8ff",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    outline: "none",
                    marginBottom: "1.2rem",
                }}
            >
                <option value="" disabled>— Select a station —</option>
                {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>

            <div className="content-columns" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                {/* Left column: ScoreCard */}
                <div className="column-left" style={{ flex: 1, minWidth: 0 }}>
                    {data && (
                        <ScoreCard
                            depthInches={data.depthInches}
                            tempF={data.tempF}
                            windMph={data.windMph}
                        />
                    )}

                    {lastUpdated && (
                        <p className="last-updated" style={{
                            textAlign: "center",
                            fontSize: "11px",
                            color: "rgba(180,210,255,0.3)",
                            marginTop: "0.8rem",
                            letterSpacing: "1px"
                        }}>
                            Last updated: {getTimeAgo(lastUpdated)}
                        </p>
                    )}
                </div>

                {/* Right column: Gauge + Stats */}
                <div className="column-right" style={{ flex: 1, minWidth: 0 }}>
                    {(data || loading) && (
                        <div className="gauge-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem", marginBottom: "1.5rem" }}>
                            <div className="gauge-wrapper" style={{ position: "relative" }}>
                                {data ? (
                                    <SnowGauge depthInches={data.depthInches} isSnowing={data.isSnowing} />
                                ) : (
                                    <div className="gauge-placeholder" style={{
                                        border: "2px solid rgba(140,200,255,0.15)",
                                        background: "rgba(0,0,0,0.3)"
                                    }} />
                                )}
                                <div className="gauge-ticks" style={{ position: "absolute", right: "-30px", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px 0" }}>
                                    {["30\"", "20\"", "10\"", "0\""].map(t => (
                                        <div key={t} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <div style={{ width: "8px", height: "1px", background: "rgba(140,200,255,0.2)" }} />
                                            <span style={{ fontSize: "10px", color: "rgba(180,210,255,0.35)", whiteSpace: "nowrap" }}>{t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="depth-info" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div className="depth-value" style={{ fontFamily: "'Playfair Display', serif", fontSize: "58px", fontWeight: 700, color: "#a8d8ff", lineHeight: 1 }}>
                                    {loading ? "..." : data ? data.depthInches + '"' : "--"}
                                </div>
                                <div className="depth-label" style={{ fontSize: "11px", textTransform: "uppercase", color: "rgba(180,210,255,0.4)" }}>
                                    Snow depth
                                </div>
                                <div className="status-message" style={{ fontSize: "12px", marginTop: "2px" }}>
                                    {message}
                                </div>
                                {data && (
                                    <div className="replay-hint" style={{ fontSize: "11px", fontStyle: "italic", marginTop: "4px" }}>
                                        ← click to replay
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {data && (
                <div className="weather-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "1.2rem" }}>
                    {[
                        { label: "Temp", value: data.tempF !== null ? data.tempF + "°F" : "N/A" },
                        { label: "Wind", value: data.windMph !== null ? data.windMph + " mph" : "N/A" },
                        { label: "Humidity", value: data.humidity !== null ? data.humidity + "%" : "N/A" },
                    ].map(stat => (
                        <div key={stat.label} className="stat-card" style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(140,200,255,0.1)",
                            borderRadius: "10px",
                            padding: "10px",
                            textAlign: "center"
                        }}>
                            <div className="stat-value" style={{ fontSize: "18px", color: "#c8e8ff" }}>{stat.value}</div>
                            <div className="stat-label" style={{ fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", marginTop: "2px" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </div >
    )
}

export default StationPicker