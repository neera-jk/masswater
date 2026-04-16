import { useEffect, useRef } from "react"

function SnowGauge({ depthInches, isSnowing, maxDepth = 30 }) {
    const canvasRef = useRef(null)
    const gaugeRef = useRef(null)

    // We use a ref to store all the animation state
    // This way React re-renders don't mess with our canvas loop
    const stateRef = useRef({
        particles: [],
        grainField: [],
        currentFillY: 999,
        targetFillY: 999,
        animating: false,
        raf: null,
        isSnowing: false,
        snowColor: { r: 210, g: 230, b: 255 },
    })

    // Build a stable random grain field once we know the canvas size
    function buildGrainField(w, h) {
        const grains = []
        const count = Math.floor((w * h) / 5)
        for (let i = 0; i < count; i++) {
            grains.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.8 + 0.3,
                bright: Math.random(),
            })
        }
        stateRef.current.grainField = grains
    }

    function makeParticle(canvasWidth) {
        return {
            x: Math.random() * canvasWidth,
            y: -3,
            r: Math.random() * 1.8 + 0.8,
            speed: Math.random() * 1.4 + 0.6,
            drift: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.4 + 0.6,
        }
    }

    function drawPack(ctx, topY, canvasW, canvasH, snowColor) {
        const packH = canvasH - topY
        if (packH <= 0) return

        const { r, g, b } = snowColor

        // Base fill with bumpy top edge
        ctx.fillStyle = `rgba(${r},${g},${b},0.55)`
        ctx.beginPath()
        ctx.moveTo(0, topY)
        const steps = 16
        for (let i = 0; i <= steps; i++) {
            const px = (i / steps) * canvasW
            const bump =
                Math.sin(i * 2.1) * 3.5 +
                Math.sin(i * 4.7 + 1.2) * 1.8 +
                Math.cos(i * 1.3 + 0.5) * 2
            ctx.lineTo(px, topY + bump)
        }
        ctx.lineTo(canvasW, canvasH)
        ctx.lineTo(0, canvasH)
        ctx.closePath()
        ctx.fill()

        // Draw individual grains inside the pack
        for (const grain of stateRef.current.grainField) {
            const edgeBump =
                Math.sin((grain.x / canvasW) * steps * 2.1) * 3.5 +
                Math.sin((grain.x / canvasW) * steps * 4.7 + 1.2) * 1.8
            if (grain.y < topY + edgeBump + 2) continue

            const depthRatio = (grain.y - topY) / packH
            const lightness = 0.9 - depthRatio * 0.35
            const rr = Math.round(r * lightness + grain.bright * 30)
            const gg = Math.round(g * lightness + grain.bright * 30)
            const bb = Math.round(Math.min(255, b * lightness + grain.bright * 20 + 15))
            const alpha = 0.15 + grain.bright * 0.35

            ctx.beginPath()
            ctx.arc(grain.x, grain.y, grain.r, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha})`
            ctx.fill()
        }

        // Sparkle highlights near surface
        for (let i = 0; i < 8; i++) {
            const sx = Math.random() * canvasW
            const sy = topY + 4 + Math.random() * Math.min(20, packH * 0.15)
            ctx.beginPath()
            ctx.arc(sx, sy, 0.8, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.3})`
            ctx.fill()
        }
    }

    function startLoop() {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        const s = stateRef.current

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Ease toward target fill level
            if (s.animating) {
                s.currentFillY += (s.targetFillY - s.currentFillY) * 0.025
                if (Math.abs(s.currentFillY - s.targetFillY) < 0.4) {
                    s.currentFillY = s.targetFillY
                    s.animating = false
                    // If not snowing, clear out particles once pack settles
                    if (!s.isSnowing) s.particles = []
                }
            }

            drawPack(ctx, s.currentFillY, canvas.width, canvas.height, s.snowColor)

            // Spawn particles:
            // - While animating: frequent spawns for the fill effect
            // - After settled + still snowing: steady stream of falling flakes
            // - After settled + not snowing: very rare occasional flake
            if (s.animating && Math.random() < 0.5) {
                s.particles.push(makeParticle(canvas.width))
            } else if (!s.animating && s.isSnowing && Math.random() < 0.3) {
                s.particles.push(makeParticle(canvas.width))
            } else if (!s.animating && !s.isSnowing && Math.random() < 0.008) {
                // just one lazy stray flake every now and then
                s.particles.push(makeParticle(canvas.width))
            }

            // Draw and update each particle
            s.particles = s.particles.filter(p => {
                p.y += p.speed
                p.x += p.drift

                // If snowing, flakes keep falling past the pack (onto it)
                // If not snowing, they stop at the pack surface
                const stopY = s.isSnowing ? canvas.height + 5 : s.currentFillY - p.r
                if (p.y >= stopY) return false

                ctx.save()
                ctx.translate(p.x, p.y)
                ctx.rotate(Math.random() * Math.PI)
                ctx.beginPath()
                ctx.ellipse(0, 0, p.r, p.r * 0.7, 0, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(220,238,255,${p.opacity})`
                ctx.fill()
                ctx.restore()
                return true
            })

            s.raf = requestAnimationFrame(loop)
        }

        if (s.raf) cancelAnimationFrame(s.raf)
        loop()
    }

    // When depthInches or isSnowing changes, retrigger the animation
    useEffect(() => {
        const canvas = canvasRef.current
        const gauge = gaugeRef.current
        if (!canvas || !gauge) return

        canvas.width = gauge.offsetWidth
        canvas.height = gauge.offsetHeight
        buildGrainField(canvas.width, canvas.height)

        const pct = Math.min(96, Math.max(1, (depthInches / maxDepth) * 100))
        const s = stateRef.current

        s.isSnowing = isSnowing
        s.snowColor =
            depthInches >= 12
                ? { r: 210, g: 230, b: 255 }
                : depthInches >= 4
                    ? { r: 230, g: 215, b: 180 }
                    : { r: 200, g: 200, b: 210 }

        s.particles = []
        s.currentFillY = canvas.height
        s.targetFillY = canvas.height - (canvas.height * pct) / 100
        s.animating = true

        startLoop()

        // Clean up animation loop when component unmounts
        return () => {
            if (stateRef.current.raf) cancelAnimationFrame(stateRef.current.raf)
        }
    }, [depthInches, isSnowing])

    return (
        <div ref={gaugeRef} onClick={() => {
            // replay on click
            const canvas = canvasRef.current
            if (!canvas) return
            const s = stateRef.current
            s.particles = []
            s.currentFillY = canvas.height
            s.animating = true
        }} style={{
            width: "80px",
            height: "220px",
            borderRadius: "40px",
            border: "2px solid rgba(140,200,255,0.25)",
            background: "rgba(0,0,0,0.3)",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
        }}>
            <canvas ref={canvasRef} style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%", height: "100%"
            }} />
        </div>
    )
}

export default SnowGauge