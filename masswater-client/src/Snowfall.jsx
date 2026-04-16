import { useEffect, useRef } from "react"

function Snowfall() {
    const containerRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        const flakes = []

        // Create 60 snowflakes and add them to the container
        for (let i = 0; i < 60; i++) {
            const flake = document.createElement("div")
            const size = Math.random() * 4 + 2

            flake.style.cssText = `
        position: absolute;
        background: white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        opacity: 0;
        animation: snowfall ${Math.random() * 6 + 5}s linear ${Math.random() * 8}s infinite;
      `
            container.appendChild(flake)
            flakes.push(flake)
        }

        // Clean up snowflakes when component unmounts
        return () => {
            flakes.forEach(f => f.remove())
        }
    }, [])

    return (
        <>
            <style>{`
        @keyframes snowfall {
          0%   { transform: translateY(-10px) translateX(0px); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(100vh) translateX(30px); opacity: 0; }
        }
      `}</style>
            <div
                ref={containerRef}
                style={{
                    position: "fixed",
                    top: 0, left: 0,
                    width: "100%", height: "100%",
                    pointerEvents: "none",
                    zIndex: 0
                }}
            />
        </>
    )
}

export default Snowfall