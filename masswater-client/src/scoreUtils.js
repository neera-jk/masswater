export function getSkiScore(depthInches, tempF, windMph) {
    let depthPoints = 0;
    if (depthInches >= 24) depthPoints = 40;
    else if (depthInches >= 18) depthPoints = 35;
    else if (depthInches >= 12) depthPoints = 28;
    else if (depthInches >= 6) depthPoints = 18;
    else if (depthInches >= 2) depthPoints = 8;

    let tempPoints = 0;
    if (tempF >= 15 && tempF <= 28) tempPoints = 30;
    else if (tempF >= 10 && tempF <= 32) tempPoints = 24;
    else if (tempF >= 5 && tempF <= 36) tempPoints = 16;
    else if (tempF >= 0 && tempF <= 40) tempPoints = 8;

    let windPoints = 0;
    if (windMph <= 10) windPoints = 30;
    else if (windMph <= 20) windPoints = 22;
    else if (windMph <= 30) windPoints = 12;
    else if (windMph <= 40) windPoints = 4;

    const score = depthPoints + tempPoints + windPoints;

    let label, color;
    if (score >= 80) { label = "Prime powder"; color = "#00e676"; }
    else if (score >= 60) { label = "Good conditions"; color = "#66bb6a"; }
    else if (score >= 40) { label = "Marginal"; color = "#ffa726"; }
    else if (score >= 20) { label = "Icy / thin"; color = "#ef5350"; }
    else { label = "Stay home"; color = "#b0bec5"; }

    const reason =
        score >= 80 ? `Deep snow (${depthInches}"), ideal temp (${tempF}°F), and calm wind (${windMph} mph) — get out there!` :
            score >= 60 ? `Solid base (${depthInches}") with manageable temps and wind — should be a good day.` :
                score >= 40 ? `Thin cover or tough weather — skiable but not ideal.` :
                    score >= 20 ? `Low snow (${depthInches}") or harsh conditions — expect ice and wind.` :
                        `Very little snow, extreme cold/heat, or high wind — not worth the trip.`;

    return { score, label, reason, color, depthPoints, tempPoints, windPoints };
}
