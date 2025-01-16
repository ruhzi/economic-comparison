// gdpData.js
import { countryCodeToName } from './countryData.js';
import { renderChart } from './chart.js';

export async function getGDPData() {
    const countrySelects = document.querySelectorAll('.country-select');
    const selectedCountries = Array.from(countrySelects)
        .map(select => select.value)
        .filter(value => value !== '');

    if (selectedCountries.length === 0) {
        document.getElementById('gdp-data').innerHTML = '<p>Please select at least one country.</p>';
        return;
    }

    const startYear = document.getElementById('start-year').value;
    const endYear = document.getElementById('end-year').value;

    try {
        const countryData = await Promise.all(
            selectedCountries.map(async countryCode => {
                const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.KD.ZG?date=${startYear}:${endYear}&format=json`;
                const response = await fetch(url);
                const data = await response.json();
                return {
                    countryCode,
                    countryName: countryCodeToName[countryCode],
                    data: data[1] || []
                };
            })
        );

        let gdpHTML = selectedCountries.length > 1 ? 
            '<h3>GDP Growth Data Comparison</h3>' : 
            `<h3>GDP Growth Data for ${countryData[0].countryName}</h3>`;

        const chartData = {
            years: new Set(), // Using Set to collect unique years
            datasets: []
        };

        // Create a table for each country
        countryData.forEach(({ countryCode, countryName, data }) => {
            let totalGrowthRate = 0;
            let count = 0;
            const countryGrowthRates = [];
            const years = [];

            if (selectedCountries.length > 1) {
                gdpHTML += `<h4 class="mt-4 mb-2 font-semibold">${countryName}</h4>`;
            }
            
            gdpHTML += `<table class="w-full mb-4">
                <thead><tr><th>Year</th><th>GDP Growth Rate (%)</th></tr></thead>
                <tbody>`;

            // Sort data by year in descending order
            data.sort((a, b) => b.date - a.date);

            data.forEach(item => {
                const year = item.date;
                const growthRate = item.value ? item.value.toFixed(2) + '%' : 'No data';

                gdpHTML += `<tr><td>${year}</td><td>${growthRate}</td></tr>`;

                if (item.value !== null) {
                    totalGrowthRate += item.value;
                    count++;
                    years.push(year);
                    countryGrowthRates.push(item.value);
                    chartData.years.add(year); // Add to unique years set
                }
            });

            gdpHTML += '</tbody></table>';

            if (count > 0) {
                const averageGrowthRate = (totalGrowthRate / count).toFixed(2);
                gdpHTML += `<p><strong>Average GDP Growth Rate:</strong> ${averageGrowthRate}%</p>`;
            }

            // Add dataset for this country
            chartData.datasets.push({
                label: countryName,
                data: countryGrowthRates,
                borderColor: getRandomColor(),
                backgroundColor: 'transparent',
                tension: 0.1
            });
        });

        document.getElementById('gdp-data').innerHTML = gdpHTML;

        // Convert years Set to sorted array and prepare final chart data
        const sortedYears = Array.from(chartData.years).sort();
        renderChart({
            years: sortedYears,
            datasets: chartData.datasets
        });

    } catch (error) {
        console.error('Error fetching GDP data:', error);
        document.getElementById('gdp-data').innerHTML = '<p>Error fetching GDP data. Please try again.</p>';
    }
}

function createColorPicker() {
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#C9CBCF'
    ];
    const usedColors = new Set();

    return function getRandomColor() {
        // Get available colors by filtering out used ones
        const availableColors = colors.filter(color => !usedColors.has(color));

        // If no colors are available, reset the used colors and start over
        if (availableColors.length === 0) {
            usedColors.clear();
            availableColors.push(...colors);
        }

        // Choose a random color from available colors
        const color = availableColors[Math.floor(Math.random() * availableColors.length)];

        // Mark the selected color as used
        usedColors.add(color);

        return color;
    };
}

// Usage
const getRandomColor = createColorPicker();
console.log(getRandomColor()); // Each call will avoid previously chosen colors until all are used