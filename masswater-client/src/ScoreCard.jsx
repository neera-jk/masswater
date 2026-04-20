import { getSkiScore } from "./scoreUtils";
import styles from "./ScoreCard.module.css";

export default function ScoreCard({ depthInches, tempF, windMph }) {
    const { score, label, reason, color, depthPoints, tempPoints, windPoints } =
        getSkiScore(depthInches, tempF, windMph);

    return (
        <div className={styles.scoreCard}>
            {/* Score */}
            <div className={styles.scoreDisplay}>
                <span className={styles.scoreNumber} style={{ color }}>{score}</span>
                <span className={styles.scoreMax}>/ 100</span>
            </div>

            {/* Label badge */}
            <div className={styles.scoreBadge}>
                <span
                    className={styles.scoreLabel}
                    style={{ background: color }}
                >
                    {label}
                </span>
            </div>

            {/* Progress bar */}
            <div className={styles.scoreProgressTrack}>
                <div
                    className={styles.scoreProgressFill}
                    style={{ background: color }}
                />
            </div>

            {/* Reason */}
            <p className={styles.scoreReason}>
                {reason}
            </p>

            {/* Breakdown */}
            <div className={styles.scoreBreakdown}>
                <BreakdownItem title="Depth" pts={depthPoints} max={40} color="#4fc3f7" />
                <BreakdownItem title="Temp" pts={tempPoints} max={30} color="#ba68c8" />
                <BreakdownItem title="Wind" pts={windPoints} max={30} color="#4dd0e1" />
            </div>
        </div>
    );
}

function BreakdownItem({ title, pts, max, color }) {
    return (
        <div className={styles.breakdownCard}>
            <div className={styles.breakdownTitle}>{title}</div>
            <div className={styles.breakdownPoints} style={{ color }}>+{pts} pts</div>
            <div className={styles.breakdownMax}>max {max}</div>
        </div>
    );
}
