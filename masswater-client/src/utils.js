export function checkIsSnowing(presentWeather) {
    if (!presentWeather || presentWeather.length === 0) return false
    return presentWeather.some(w => {
        const desc = (w.weather || "").toLowerCase()
        return desc.includes("snow") || desc.includes("flurr")
    })
}

export function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000)
    if (seconds < 10) return "just now"
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes === 1) return "1 minute ago"
    return `${minutes} minutes ago`
}
