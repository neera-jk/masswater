import { useState } from "react"
import styles from "./StatCards.module.css"

function StatCards({ tempF, windMph, humidity }) {
    const [tempUnit, setTempUnit] = useState('f')
    const [windUnit, setWindUnit] = useState('mph')

    const tempValue = tempF !== null
        ? tempUnit === 'f'
            ? tempF + '°F'
            : Math.round((tempF - 32) * 5 / 9) + '°C'
        : 'N/A'

    const windValue = windMph !== null
        ? windUnit === 'mph'
            ? windMph + ' mph'
            : Math.round(windMph * 1.60934) + ' km/h'
        : 'N/A'

    return (
        <div className={styles.weatherStats}>
            <div
                className={styles.statCardClickable}
                onClick={() => setTempUnit(u => u === 'f' ? 'c' : 'f')}
            >
                <div className={styles.statValue}>{tempValue}</div>
                <div className={styles.statLabel}>Temp</div>
                <div className={styles.statUnitHint}>
                    {tempUnit === 'f' ? 'tap for °C' : 'tap for °F'}
                </div>
            </div>

            <div
                className={styles.statCardClickable}
                onClick={() => setWindUnit(u => u === 'mph' ? 'kmh' : 'mph')}
            >
                <div className={styles.statValue}>{windValue}</div>
                <div className={styles.statLabel}>Wind</div>
                <div className={styles.statUnitHint}>
                    {windUnit === 'mph' ? 'tap for km/h' : 'tap for mph'}
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statValue}>
                    {humidity !== null ? humidity + '%' : 'N/A'}
                </div>
                <div className={styles.statLabel}>Humidity</div>
                <div className={styles.statUnitHint}>&nbsp;</div>
            </div>
        </div>
    )
}

export default StatCards
