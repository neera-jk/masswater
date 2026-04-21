import { useState } from "react"
import SnowGauge from "./SnowGauge"
import ScoreCard from "./ScoreCard"
import StationSelect from "./StationSelect"
import StatCards from "./StatCards"
import styles from "./StationPicker.module.css"
import stations from "./stations"
import { checkIsSnowing, getTimeAgo } from "./utils"

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
            <StationSelect onChange={handleStationChange} />

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
                <StatCards
                    tempF={data.tempF}
                    windMph={data.windMph}
                    humidity={data.humidity}
                />
            )}
        </div>
    )
}

export default StationPicker