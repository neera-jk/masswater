import { getSkiScore } from "./scoreUtils";

const card = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(140,200,255,0.15)",
    borderRadius: 12,
    padding: 24,
    color: "#d0e8ff",
    fontFamily: "inherit",
};

const breakdownCard = {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(140,200,255,0.12)",
    borderRadius: 8,
    padding: "12px 16px",
    textAlign: "center",
};

export default function ScoreCard({ depthInches, tempF, windMph }) {
    const { score, label, reason, color, depthPoints, tempPoints, windPoints } =
        getSkiScore(depthInches, tempF, windMph);

    return (
        <div className="score-card" style={card}>
            {/* Score */}
            <div className="score-display" style={{ textAlign: "center", marginBottom: 12 }}>
                <span className="score-number" style={{ fontSize: 56, fontWeight: 800, color }}>{score}</span>
                <span className="score-max" style={{ fontSize: 20, opacity: 0.5, marginLeft: 4 }}>/ 100</span>
            </div>

            {/* Label badge */}
            <div className="score-badge" style={{ textAlign: "center", marginBottom: 16 }}>
                <span
                    className="score-label"
                    style={{
                        background: color,
                        color: "#0a1929",
                        fontWeight: 700,
                        fontSize: 14,
                        padding: "4px 14px",
                        borderRadius: 20,
                    }}
                >
                    {label}
                </span>
            </div>

            {/* Progress bar */}
            <div
                className="score-progress-track"
                style={{
                    marginBottom: 14,
                    overflow: "hidden",
                }}
            >
                <div
                    className="score-progress-fill"
                    style={{
                        height: "100%",
                        borderRadius: 5,
                        background: color,
                        transition: "width 0.4s ease",
                    }}
                />
            </div>

            {/* Reason */}
            <p className="score-reason" style={{ textAlign: "center", fontSize: 14, opacity: 0.75, margin: "0 0 20px" }}>
                {reason}
            </p>

            {/* Breakdown */}
            <div className="score-breakdown" style={{ display: "flex", gap: 12 }}>
                <BreakdownItem title="Depth" pts={depthPoints} max={40} color="#4fc3f7" />
                <BreakdownItem title="Temp" pts={tempPoints} max={30} color="#ba68c8" />
                <BreakdownItem title="Wind" pts={windPoints} max={30} color="#4dd0e1" />
            </div>
        </div>
    );
}

function BreakdownItem({ title, pts, max, color }) {
    return (
        <div className="breakdown-card" style={breakdownCard}>
            <div className="breakdown-title" style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>{title}</div>
            <div className="breakdown-points" style={{ fontSize: 22, fontWeight: 700, color }}>+{pts} pts</div>
            <div className="breakdown-max" style={{ fontSize: 11, opacity: 0.4 }}>max {max}</div>
        </div>
    );
}
