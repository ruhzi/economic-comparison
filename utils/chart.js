// chart.js
let gdpChart = null;

export function renderChart(years, growthRates) {
    const ctx = document.getElementById('gdp-chart').getContext('2d');

    if (gdpChart) {
        gdpChart.destroy();
    }

    gdpChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'GDP Growth Rate (%)',
                data: growthRates,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
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
            }
        }
    });
}
