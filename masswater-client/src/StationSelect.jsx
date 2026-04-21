import stations from "./stations"
import styles from "./StationPicker.module.css"

function StationSelect({ onChange }) {
    return (
        <select
            className={styles.stationSelect}
            onChange={onChange}
            defaultValue=""
        >
            <option value="" disabled>Select a mountain range</option>
            {stations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>
    )
}

export default StationSelect
