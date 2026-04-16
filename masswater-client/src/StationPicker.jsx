import { useState } from "react"
import SnowGauge from "./SnowGauge"

const stations = [
    { id: "KBOS", name: "Boston (Logan Airport)" },
    { id: "KORH", name: "Worcester Airport" },
    { id: "KBED", name: "Bedford / Hanscom Field" },
    { id: "KACK", name: "Nantucket Airport" },
    { id: "KPVD", name: "Providence (near MA border)" },
]

function getVerdict(depth) {
    if (depth >= 12) return { cls: "yes", text: `Yes, go ski! — ${depth}" on the ground` }
    if (depth >= 4) return { cls: "maybe", text: `Maybe — only ${depth}" right now` }
    return { cls: "no", text: `Not enough snow — ${depth}" on the ground` }
}

// Check if presentWeather array from NOAA contains any snow condition
function checkIsSnowing(presentWeather) {
    if (!presentWeather || presentWeather.length === 0) return false
    return presentWeather.some(w => {
        const desc = (w.weather || "").toLowerCase()
        return desc.includes("snow") || desc.includes("flurr")
    })
}

function StationPicker() {
    const [data, setData] = useState(null)
    const [message, setMessage] = useState("Select a location above")
    const [loading, setLoading] = useState(false)

    function handleStationChange(event) {
        const stationId = event.target.value
        if (!stationId) return

        setLoading(true)
        setMessage("Fetching data from NOAA...")
        setData(null)

        fetch(`https://api.weather.gov/stations/${stationId}/observations/latest`)
            .then(r => r.json())
            .then(obs => {
                const snowMeters = obs.snowDepth ? obs.snowDepth.value : null
                const depthInches = snowMeters !== null
                    ? parseFloat((snowMeters * 39.3701).toFixed(1))
                    : 0

                const tempC = obs.temperature ? obs.temperature.value : null
                const tempF = tempC !== null ? Math.round(tempC * 9 / 5 + 32) : null

                const windKmh = obs.windSpeed ? obs.windSpeed.value : null
                const windMph = windKmh !== null ? Math.round(windKmh * 0.621371) : null

                const humidity = obs.relativeHumidity
                    ? Math.round(obs.relativeHumidity.value)
                    : null

                const isSnowing = checkIsSnowing(obs.presentWeather)

                setData({ depthInches, tempF, windMph, humidity, isSnowing })
                setMessage(isSnowing ? "It's snowing right now!" : "Current conditions")
                setLoading(false)
            })
            .catch(() => {
                setMessage("Could not fetch data. Try again.")
                setLoading(false)
            })
    }

    const verdict = data ? getVerdict(data.depthInches) : null

    const verdictColors = {
        yes: { bg: "rgba(30,120,60,0.25)", border: "rgba(80,200,120,0.3)", text: "#7ddba8" },
        maybe: { bg: "rgba(160,110,0,0.25)", border: "rgba(220,170,40,0.3)", text: "#f0c84a" },
        no: { bg: "rgba(140,30,30,0.25)", border: "rgba(220,80,80,0.3)", text: "#e88080" },
    }

    return (
        <div style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(140,200,255,0.15)",
            borderRadius: "16px",
            padding: "1.5rem",
            width: "100%",
            maxWidth: "420px",
        }}>
            <select
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

            {verdict && (
                <div style={{
                    background: verdictColors[verdict.cls].bg,
                    border: `1px solid ${verdictColors[verdict.cls].border}`,
                    borderRadius: "10px",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "1.4rem",
                }}>
                    <div style={{
                        width: "9px", height: "9px", borderRadius: "50%",
                        background: verdictColors[verdict.cls].text,
                        flexShrink: 0
                    }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: verdictColors[verdict.cls].text }}>
                        {verdict.text}
                    </span>
                </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2.5rem", marginBottom: "1.5rem" }}>
                <div style={{ position: "relative" }}>
                    {data ? (
                        <SnowGauge depthInches={data.depthInches} isSnowing={data.isSnowing} />
                    ) : (
                        <div style={{
                            width: "80px", height: "220px", borderRadius: "40px",
                            border: "2px solid rgba(140,200,255,0.15)",
                            background: "rgba(0,0,0,0.3)"
                        }} />
                    )}
                    <div style={{ position: "absolute", right: "-30px", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px 0" }}>
                        {["30\"", "20\"", "10\"", "0\""].map(t => (
                            <div key={t} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <div style={{ width: "8px", height: "1px", background: "rgba(140,200,255,0.2)" }} />
                                <span style={{ fontSize: "10px", color: "rgba(180,210,255,0.35)", whiteSpace: "nowrap" }}>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "58px", fontWeight: 700, color: "#a8d8ff", lineHeight: 1 }}>
                        {loading ? "..." : data ? data.depthInches + '"' : "--"}
                    </div>
                    <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(180,210,255,0.4)" }}>
                        Snow depth
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(180,210,255,0.5)", marginTop: "2px" }}>
                        {message}
                    </div>
                    {data && (
                        <div style={{ fontSize: "11px", color: "rgba(180,210,255,0.25)", fontStyle: "italic", marginTop: "4px" }}>
                            ← click to replay
                        </div>
                    )}
                </div>
            </div>

            {data && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                    {[
                        { label: "Temp", value: data.tempF !== null ? data.tempF + "°F" : "N/A" },
                        { label: "Wind", value: data.windMph !== null ? data.windMph + " mph" : "N/A" },
                        { label: "Humidity", value: data.humidity !== null ? data.humidity + "%" : "N/A" },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(140,200,255,0.1)",
                            borderRadius: "10px",
                            padding: "10px",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "18px", fontWeight: 500, color: "#c8e8ff" }}>{stat.value}</div>
                            <div style={{ fontSize: "10px", color: "rgba(180,210,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginTop: "2px" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default StationPicker