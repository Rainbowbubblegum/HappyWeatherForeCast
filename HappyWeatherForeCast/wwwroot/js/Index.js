
document.addEventListener('DOMContentLoaded', () => {
    const locationInput = document.getElementById('locationInput');
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

        if (!locationInput.value) {
            setTimeout(() => {
                simulateTyping(locationInput, 'South Africa', 0, 100);
            }, 2000);
        } else {
            $("#sidebar-wrapper").css("height", "auto");
            getForecastData(locationInput.value, false);
            getCurrent(locationInput.value);
            $('.charts-container').fadeIn();
            $('.weeklyHeader').fadeIn();

            $('.temp-header').on('click', function () {
                toggleTemperatureUnits();
            });
            
        }
    });

    $('.temp-header').on('click', function () {
        toggleTemperatureUnits();
    });
});

function toggleTemperatureUnits() {
    $('.temp-cell').each(function () {
        var cell = $(this);
        var isCelsius = cell.text().includes('°C');
        var tempC = cell.data('temp-c');
        var tempF = cell.data('temp-f');

        cell.text(isCelsius ? `${tempF} °F` : `${tempC} °C`);
    });
}

const getWeatherButton = document.getElementById("getWeatherButton");

getWeatherButton.addEventListener("click", () => {
    const location = document.getElementById("locationInput").value;

    getCurrent(location);
    getForecastData(location);
    $("#sidebar-wrapper").css("height", "auto");
    $('.charts-container').fadeIn();
    $('.weeklyHeader').fadeIn();
});


const getCurrent = (location) => {
    fetch(`/Home/GetWeatherData?location=${location}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const resultsDiv = $(".replaceHtml");
                resultsDiv.innerHTML = "";
                data.data.forEach(item => {
                    resultsDiv.innerHTML += `<p>${item.name}, ${item.region}, ${item.country}</p>`;
                });

                renderChart(data.data);

            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => console.error('Error:', error));
}

const getForecastData = (location, drawTable = true) => {
    fetch(`/Home/GetForecastData?location=${location}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (drawTable) {
                    renderForecastTable(data.data);
                }
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
const renderForecastTable = (forecastData) => {
    const weatherResults = document.querySelector(".replaceHtml");
    weatherResults.innerHTML = '';

    if (forecastData && forecastData.forecast && forecastData.forecast.forecastday) {
        weatherResults.innerHTML = buildForecastTabsHTML(forecastData) + buildForecastTableHTML(forecastData);
        attachTabEventListeners(); // Reattach event listeners to the new tabs
    } else {
        weatherResults.innerHTML = '<p>No forecast data available.</p>';
    }
};

function getDayOfWeekIndex(dateString) {
    const dayOfWeek = new Date(dateString).getDay();
    return (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Convert so that Monday is 0, Sunday is 6
}

const buildForecastTabsHTML = (forecastData) => {
    let tabsHTML = '<ul class="nav nav-tabs" id="forecastTabs">';
    const sortedForecastDays = forecastData.forecast.forecastday.sort((a, b) =>
        getDayOfWeekIndex(a.date) - getDayOfWeekIndex(b.date)
    );

    sortedForecastDays.forEach((day, index) => {
        const dayId = `dayTab_${day.date.replace(/-/g, "")}`;
        tabsHTML += `
            <li class="nav-item">
                <a class="nav-link ${index === 0 ? 'active' : ''}" href="javascript:void(0);" data-day-id="${dayId}">
                    ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </a>
            </li>`;
    });
    tabsHTML += '</ul>';
    return tabsHTML;
};


const buildForecastTableHTML = (forecastData) => {
    let tablesHTML = '<div class="forecast-tables">';
    const sortedForecastDays = forecastData.forecast.forecastday.sort((a, b) =>
        getDayOfWeekIndex(a.date) - getDayOfWeekIndex(b.date)
    );

    sortedForecastDays.forEach((day, index) => {
        const dayId = `dayTab_${day.date.replace(/-/g, "")}`;
        const formattedDate = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

        tablesHTML += `
            <div id="${dayId}" class="container mt-4 table-container dayForecast" style="${index === 0 ? '' : 'display: none;'}">
                <h4>${formattedDate}</h4>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Conditions</th>
                            <th class="temp-header">Temperature ( Click To Toggle )</th>
                            <th>Rain %</th>
                        </tr>
                    </thead>
                    <tbody>`;

        day.hour.forEach(hour => {
            const hourTime = new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const iconUrl = `https:${hour.condition.icon}`;

            tablesHTML += `
                        <tr>
                            <td>${hourTime}</td>
                            <td>
                                <img class="weather-icon" src="${iconUrl}" alt="${hour.condition.text}" />
                                ${hour.condition.text}
                            </td>
                            <td class="temp-cell" data-temp-c="${hour.temp_c}" data-temp-f="${hour.temp_f}">${hour.temp_c} °C</td>
                            <td>${hour.chance_of_rain} %</td>
                        </tr>`;
        });

        tablesHTML += `
                    </tbody>
                </table>
            </div>`;
    });
    tablesHTML += '</div>';
    return tablesHTML;
};

const attachTabEventListeners = () => {
    const tabs = document.querySelectorAll('#forecastTabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', function (event) {
            event.preventDefault();
            const dayId = tab.getAttribute('data-day-id');
            showDayForecast(dayId);
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
};