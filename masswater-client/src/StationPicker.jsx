import { useState } from "react"
import SnowGauge from "./SnowGauge"
import ScoreCard from "./ScoreCard"
import styles from "./StationPicker.module.css"

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
    const [tempUnit, setTempUnit] = useState('f')
    const [windUnit, setWindUnit] = useState('mph')

    function handleStationChange(event) {
        const stationId = event.target.value
        if (!stationId) return

        setLoading(true)
        setMessage("Fetching data from NOAA...")
        setData(null)
        setLastUpdated(null)

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
                setMessage("Could not reach this station. Try another.")
                setLastUpdated(null)
                setData(null)
                setLoading(false)
            })
    }

    return (
        <div className={styles.stationPicker}>
            <select
                className={styles.stationSelect}
                onChange={handleStationChange}
                defaultValue=""
            >
                <option value="" disabled>Select a mountain range</option>
                {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>

            {(data || loading) && (
                <div className={styles.mainCard}>
                    <div className={styles.gaugeLayout}>

                        <div className={styles.columnLeft}>
                            {loading && (
                                <div className={styles.loadingSkeleton}>
                                    <div className={`${styles.skeleton}`} style={{ height: "120px", marginBottom: "12px" }} />
                                    <div className={`${styles.skeleton}`} style={{ height: "20px", width: "60%", margin: "0 auto 8px" }} />
                                    <div className={styles.skeletonGrid}>
                                        <div className={styles.skeleton} style={{ height: "60px" }} />
                                        <div className={styles.skeleton} style={{ height: "60px" }} />
                                        <div className={styles.skeleton} style={{ height: "60px" }} />
                                    </div>
                                </div>
                            )}

                            {data && data.tempF === null && data.windMph === null && (
                                <p className={styles.nullDataWarning}>
                                    This station isn't reporting full data right now.
                                </p>
                            )}

                            <div className={styles.scoreCardWrap}>
                                {data && (
                                    <ScoreCard
                                        depthInches={data.depthInches}
                                        tempF={data.tempF}
                                        windMph={data.windMph}
                                    />
                                )}
                                {lastUpdated && (
                                    <p className={styles.lastUpdated}>
                                        Last updated: {getTimeAgo(lastUpdated)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className={styles.columnRight}>
                            {(data || loading) && (
                                <div className={styles.gaugeSection}>
                                    <div className={styles.gaugeAndTicks}>
                                        {data ? (
                                            <SnowGauge
                                                depthInches={data.depthInches}
                                                isSnowing={data.isSnowing}
                                            />
                                        ) : (
                                            <div className={styles.gaugePlaceholder} />
                                        )}
                                        <div className={styles.gaugeTicks}>
                                            {["30\"", "20\"", "10\"", "0\""].map(t => (
                                                <div key={t} className={styles.gaugeTick}>
                                                    <div className={styles.gaugeTickLine} />
                                                    <span className={styles.gaugeTickLabel}>{t}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.depthLabel}>Snow depth</div>

                                    <div className={styles.depthRow}>
                                        <div className={styles.depthValue}>
                                            {loading ? "..." : data ? data.depthInches + '"' : "--"}
                                        </div>
                                        <div className={styles.statusMessage}>
                                            {message}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {data && (
                <div className={styles.weatherStats}>
                    <div
                        className={styles.statCardClickable}
                        onClick={() => setTempUnit(u => u === 'f' ? 'c' : 'f')}
                    >
                        <div className={styles.statValue}>
                            {data.tempF !== null
                                ? tempUnit === 'f'
                                    ? data.tempF + '°F'
                                    : Math.round((data.tempF - 32) * 5 / 9) + '°C'
                                : 'N/A'}
                        </div>
                        <div className={styles.statLabel}>Temp</div>
                        <div className={styles.statUnitHint}>
                            {tempUnit === 'f' ? 'tap for °C' : 'tap for °F'}
                        </div>
                    </div>

                    <div
                        className={styles.statCardClickable}
                        onClick={() => setWindUnit(u => u === 'mph' ? 'kmh' : 'mph')}
                    >
                        <div className={styles.statValue}>
                            {data.windMph !== null
                                ? windUnit === 'mph'
                                    ? data.windMph + ' mph'
                                    : Math.round(data.windMph * 1.60934) + ' km/h'
                                : 'N/A'}
                        </div>
                        <div className={styles.statLabel}>Wind</div>
                        <div className={styles.statUnitHint}>
                            {windUnit === 'mph' ? 'tap for km/h' : 'tap for mph'}
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statValue}>
                            {data.humidity !== null ? data.humidity + '%' : 'N/A'}
                        </div>
                        <div className={styles.statLabel}>Humidity</div>
                        <div className={styles.statUnitHint}>&nbsp;</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StationPicker