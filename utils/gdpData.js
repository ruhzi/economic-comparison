// gdpData.js
import { countryCodeToName } from './countryData.js';
import { renderChart } from './chart.js';

export function getGDPData() {
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

                renderChart(years, growthRates);
            }
            document.getElementById('gdp-data').innerHTML = gdpHTML;
        })
        .catch(error => console.error('Error fetching GDP data:', error));
}
