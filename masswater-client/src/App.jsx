import StationPicker from "./StationPicker"
import Snowfall from "./Snowfall"
import "./index.css"
import styles from "./App.module.css"

function App() {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <Snowfall />
      <Mountain />
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
        boxSizing: "border-box",
        width: "100%",
        gap: "1rem"
      }}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>
            MASSACHUSETTS SNOW TRACKER
          </h1>
          <p className={styles.headerSubtitle}>
            New England · Real-time conditions
          </p>
        </div>
        <StationPicker />
      </div>
    </div>
  )
}

function Mountain() {
  return (
    <svg
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", pointerEvents: "none", zIndex: 1 }}
      viewBox="0 0 800 120"
      preserveAspectRatio="none"
    >
      <polygon points="0,120 120,40 240,80 380,10 520,65 640,30 760,70 800,50 800,120" fill="rgba(8,20,50,0.7)" />
      <polygon points="0,120 80,60 180,90 300,25 420,75 550,40 680,80 800,55 800,120" fill="rgba(10,24,58,0.5)" />
      <polygon points="120,40 160,50 140,65" fill="rgba(220,240,255,0.5)" />
      <polygon points="380,10 420,22 400,32" fill="rgba(220,240,255,0.6)" />
      <polygon points="640,30 675,42 657,52" fill="rgba(220,240,255,0.5)" />
    </svg>
  )
}

export default App