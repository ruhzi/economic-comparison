import { fetchCountryData, populateCountrySelect } from './utils/countryData.js';
import { fetchPoliticalLeaders } from './utils/politicalData.js';
import { renderChart } from './utils/chart.js';
import { setDarkMode, toggleDarkMode } from './utils/darkMode.js';

document.addEventListener('DOMContentLoaded', () => {
    setDarkMode();
    fetchCountryData();
    document.getElementById('toggle-dark-mode').addEventListener('click', toggleDarkMode);
    document.getElementById('country-select').addEventListener('change', handleCountrySelection);
});

async function handleCountrySelection(event) {
    const countryCode = event.target.value;
    if (!countryCode) return;

    try {
        if (window.currentChart) {
            window.currentChart.destroy();
            window.currentChart = null;
        }

        const chartContainer = document.getElementById('chart-container');
        chartContainer.innerHTML = `
            <div class="text-center text-gray-500 h-full flex items-center justify-center">
                <p>Select a political leader to view GDP data</p>
            </div>
        `;

        const politicalErasDiv = document.getElementById('political-eras');
        politicalErasDiv.innerHTML = '<p class="text-gray-600">Loading political data...</p>';

        const leaders = await fetchPoliticalLeaders(countryCode);
        displayPoliticalEras(leaders, countryCode);
    } catch (error) {
        document.getElementById('political-eras').innerHTML = 
            `<p class="text-red-500">Error loading political data: ${error.message}</p>`;
        document.getElementById('chart-container').innerHTML = `
            <div class="text-center text-gray-500 h-full flex items-center justify-center">
                <p>Select a political leader to view GDP data</p>
            </div>
        `;
    }
}

function displayPoliticalEras(leaders, countryCode) {
    const politicalErasDiv = document.getElementById('political-eras');
    
    if (!leaders || leaders.length === 0) {
        politicalErasDiv.innerHTML = '<p class="text-gray-600">No political data available for this country.</p>';
        return;
    }

    let html = '<div class="space-y-4">';
    
    leaders.forEach((leader) => {
        const isActive = !leader.endDate || leader.endDate === new Date().getFullYear();
        html += `
            <div class="p-4 border rounded-lg hover:shadow-md transition-shadow ${
                isActive ? 'border-blue-500' : 'border-gray-200'
            } bg-gray-800 text-white">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-semibold text-white">${leader.name}</h3>
                        <p class="text-sm text-gray-300">${leader.position}</p>
                        <p class="text-sm text-gray-300">
                            ${leader.startDate} - ${isActive ? 'Present' : leader.endDate}
                        </p>
                        <p class="text-sm text-gray-300">Party: ${leader.party}</p>
                    </div>
                    <button 
                        class="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                        onclick="fetchGDPDataForEra('${countryCode}', '${leader.startDate}', '${leader.endDate || new Date().getFullYear()}')"
                    >
                        View GDP Data
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    politicalErasDiv.innerHTML = html;
}

window.fetchGDPDataForEra = async function(countryCode, startYear, endYear) {
    try {
        const chartContainer = document.getElementById('chart-container');
        
        if (window.currentChart) {
            window.currentChart.destroy();
            window.currentChart = null;
        }

        if (startYear < 1960) {
            chartContainer.innerHTML = `
                <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                    <p>Note: World Bank data is only available from 1960 onwards. Please select a more recent time period.</p>
                </div>
            `;
            return;
        }
        
        chartContainer.innerHTML = `
            <canvas id="gdp-chart" style="height: 100%; width: 100%;"></canvas>
        `;
        
        const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.KD.ZG?date=${startYear}:${endYear}&format=json`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data || !data[1]) {
            throw new Error('No GDP data available');
        }

        updateChart(data[1], startYear, endYear);

        window.scrollTo({
            top: chartContainer.offsetTop - 100,
            behavior: 'smooth'
        });
    } catch (error) {
        document.getElementById('chart-container').innerHTML = 
            `<p class="text-red-500">Error loading GDP data: ${error.message}</p>`;
    }
};

function updateChart(gdpData, startYear, endYear) {
    const canvas = document.getElementById('gdp-chart');
    const ctx = canvas.getContext('2d');
    
    if (window.currentChart) {
        window.currentChart.destroy();
    }

    const years = [];
    const values = [];

    gdpData.forEach(item => {
        if (item.value !== null) {
            years.push(item.date);
            values.push(item.value);
        }
    });

    window.currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: `GDP Growth Rate (${startYear}-${endYear})`,
                data: values,
                borderColor: '#4F46E5',
                backgroundColor: 'transparent',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'GDP Growth Rate Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Growth Rate (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            }
        }
    });
}
