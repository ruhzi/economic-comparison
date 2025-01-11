// Toggle dark mode
document.getElementById('toggle-dark-mode').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    // Change button text or icon on toggle
    if (document.body.classList.contains('dark-mode')) {
        this.innerHTML = '🌞'; // Switch to light mode icon
    } else {
        this.innerHTML = '🌙'; // Switch to dark mode icon
    }
});

// Store country code to name mapping 
let countryCodeToName = {};

// Fetch the country codes and names from the Restcountries API
fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
        // Sort the countries alphabetically by name
        data.sort((a, b) => {
            const nameA = a.name.common.toUpperCase();
            const nameB = b.name.common.toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        // Populate the country dropdown with options
        const countrySelect = document.getElementById('country');
        data.forEach(country => {
            const option = document.createElement('option');
            option.value = country.cca2;
            option.textContent = country.name.common;
            countrySelect.appendChild(option);
        });

        // Create a mapping for country codes to country names
        countryCodeToName = data.reduce((acc, country) => {
            acc[country.cca2] = country.name.common;
            return acc;
        }, {});
    })
    .catch(error => console.error('Error fetching country data:', error));

// Dynamically populate start and end year dropdowns
const startYearSelect = document.getElementById('start-year');
const endYearSelect = document.getElementById('end-year');
const currentYear = new Date().getFullYear();

for (let year = 1960; year <= currentYear; year++) {
    const startOption = document.createElement('option');
    startOption.value = year;
    startOption.textContent = year;
    startYearSelect.appendChild(startOption);

    const endOption = document.createElement('option');
    endOption.value = year;
    endOption.textContent = year;
    endYearSelect.appendChild(endOption);
}

// Global chart instance
let gdpChart = null;

// Fetch GDP data for a country and date range
function getGDPData() {
    const countryCode = document.getElementById('country').value;
    const startYear = document.getElementById('start-year').value;
    const endYear = document.getElementById('end-year').value;

    if (!countryCode) {
        alert('Please select a country.');
        return;
    }

    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.KD.ZG?date=${startYear}:${endYear}&format=json`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const gdpData = data[1];
            let gdpHTML = '<h3>GDP Growth Data</h3>';
            let totalGrowthRate = 0;
            let count = 0;
            let years = [];
            let growthRates = [];

            if (!gdpData || gdpData.length === 0) {
                gdpHTML += '<p>No data found for this country and period.</p>';
            } else {
                gdpHTML += `<table><thead><tr><th>Year</th><th>GDP Growth Rate (%)</th></tr></thead><tbody>`;
                gdpData.forEach(item => {
                    const year = item.date;
                    const growthRate = item.value ? item.value.toFixed(2) + '%' : 'No data';
                    const countryName = countryCodeToName[countryCode] || "Unknown";

                    // Display "Year - Growth Rate"
                    gdpHTML += `<tr><td>${year} - </td><td>${growthRate}</td></tr>`;

                    if (item.value) {
                        totalGrowthRate += item.value;
                        count++;
                        years.push(year);
                        growthRates.push(item.value);
                    }
                });

                gdpHTML += '</tbody></table>';

                if (count > 0) {
                    const averageGrowthRate = (totalGrowthRate / count).toFixed(2);
                    gdpHTML += `<p><strong>Average GDP Growth Rate:</strong> ${averageGrowthRate}%</p>`;
                } else {
                    gdpHTML += '<p><strong>Average GDP Growth Rate:</strong> No data available.</p>';
                }

                // Render the chart
                renderChart(years, growthRates);
            }
            document.getElementById('gdp-data').innerHTML = gdpHTML;
        })
        .catch(error => console.error('Error fetching GDP data:', error));
}

// Render the GDP chart using Chart.js
function renderChart(years, growthRates) {
    const ctx = document.getElementById('gdp-chart').getContext('2d');

    // Destroy the previous chart (if any)
    if (gdpChart) {
        gdpChart.destroy();
    }

    // Create a new chart
    gdpChart = new Chart(ctx, {
        type: 'line', // Line chart for GDP growth rates
        data: {
            labels: years, // X-axis: Years
            datasets: [{
                label: 'GDP Growth Rate (%)',
                data: growthRates, // Y-axis: GDP growth rates
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true, // Fill the area under the line
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'GDP Growth Rate (%)'
                    },
                    ticks: {
                        beginAtZero: false
                    }
                }
            },
        },
    },
    )
}

// Event listeners for the country and date range selection
document.getElementById('country').addEventListener('change', getGDPData);
document.getElementById('start-year').addEventListener('change', getGDPData);
document.getElementById('end-year').addEventListener('change', getGDPData);
