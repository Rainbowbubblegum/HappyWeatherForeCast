
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Function to simulate typing
        const simulateTyping = (element, text, index, interval) => {
            if (index < text.length) {
                element.value += text[index++];
                setTimeout(() => simulateTyping(element, text, index, interval), interval);
            } else {
                // Once typing is complete, trigger the click event on the Get Weather button
                document.getElementById('getWeatherButton').click();
            }
        };

        // Start simulating typing
        const locationInput = document.getElementById('locationInput');
        simulateTyping(locationInput, 'South Africa', 0, 100); // 100ms interval between each letter
    }, 2000);
});

const getWeatherButton = document.getElementById("getWeatherButton");

getWeatherButton.addEventListener("click", () => {
    const location = document.getElementById("locationInput").value;

    getCurrent(location);
    getForecastData(location);
});


const getCurrent = (location) => {
    fetch(`/Home/GetWeatherData?location=${location}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const resultsDiv = document.getElementById("weatherResults");
                resultsDiv.innerHTML = ""; // Clear previous results
                data.data.forEach(item => {
                    resultsDiv.innerHTML += `<p>${item.name}, ${item.region}, ${item.country} - Lat: ${item.lat}, Lon: ${item.lon}</p>`;
                });

                renderChart(data.data);

            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => console.error('Error:', error));
}

const getForecastData = (location) => {
    fetch(`/Home/GetForecastData?location=${location}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Call a function to render charts for forecast data
                renderForecastCharts(data.data);
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => console.error('Error:', error));
};

const renderForecastCharts = (forecastData) => {
    const hours = forecastData.forecast.forecastday[0].hour.map(h => h.time);
    const temperatures = forecastData.forecast.forecastday[0].hour.map(h => h.temp_c);
    const humidity = forecastData.forecast.forecastday[0].hour.map(h => h.humidity);
    const windSpeed = forecastData.forecast.forecastday[0].hour.map(h => h.wind_kph);

    renderLineChart('tempChart', 'Temperature (°C)', hours, temperatures, 'rgb(255, 99, 132)');
    renderLineChart('humidityChart', 'Humidity (%)', hours, humidity, 'rgb(54, 162, 235)');
    renderLineChart('windSpeedChart', 'Wind Speed (kph)', hours, windSpeed, 'rgb(75, 192, 192)');
};

const renderLineChart = (canvasId, label, labels, data, borderColor) => {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: borderColor,
                fill: false
            }]
        },
        options: {
            responsive: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

const renderChart = (data) => {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                label: 'Latitude',
                backgroundColor: 'rgb(255, 99, 132)',
                data: data.map(item => item.lat),
            }, {
                label: 'Longitude',
                backgroundColor: 'rgb(54, 162, 235)',
                data: data.map(item => item.lon),
            }]
        },
        options: {
            responsive: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};