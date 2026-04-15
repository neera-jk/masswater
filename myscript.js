const stations = [
    { id: "KBOS", name: "Boston" },
    { id: "KORH", name: "Worcester Airport" },
    { id: "KBED", name: "Bedford / Hanscom Field" },
    { id: "KACK", name: "Nantucket Airport" },
    { id: "KPVD", name: "Providence (near MA border)" },
];

const locationSelect = document.getElementById("location");

const snowDepthDisplay = document.getElementById("snow-depth-value");
const stationNameDisplay = document.getElementById("station-name");
const loadingMessage = document.getElementById("loading-message");

stations.forEach(function (station) {
    const option = document.createElement("option");
    option.value = station.id;
    option.textContent = station.name;
    locationSelect.appendChild(option);
});

locationSelect.addEventListener("change", function () {
    const selectedStationId = locationSelect.value;
    if (!selectedStationId) return;

    loadingMessage.textContent = "Fetching snow depth data...";
    snowDepthDisplay.textContent = "--";

    fetchSnowData(selectedStationId);
});

function fetchSnowData(stationId) {
    const url = `https://api.weather.gov/stations/${stationId}/observations/latest`;

    fetch(url)
        .then(function (response) {
            // response is the raw HTTP response — we need to convert it to JSON
            return response.json();
        })
        .then(function (data) {
            const snowDepthMeters = data.snowDepth ? data.snowDepth.value : null;

            if (snowDepthMeters === null || snowDepthMeters === undefined) {
                snowDepthDisplay.textContent = "No snow data";
                loadingMessage.textContent = "This station isn't reporting snow depth right now.";
            } else {
                const snowDepthInches = (snowDepthMeters * 39.3701).toFixed(1);
                snowDepthDisplay.textContent = snowDepthInches + '"';
                loadingMessage.textContent = "Snow depth at this station:";
            }
        })
        .catch(function (error) {
            // Something went wrong (network issue, bad station, etc.)
            console.error("Error fetching data:", error);
            loadingMessage.textContent = "Could not fetch data. Check the console for details.";
        });
}
