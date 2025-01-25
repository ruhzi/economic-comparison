let gdpChart = null;

export function renderChart(chartData) {
    const ctx = document.getElementById('gdp-chart').getContext('2d');

    if (gdpChart) {
        gdpChart.destroy();
    }

    if (chartData.years.length > 0 && chartData.datasets.length > 0) {
        gdpChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.years,
                datasets: chartData.datasets
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
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
}

export function clearChart() {
    if (gdpChart) {
        gdpChart.destroy();
        gdpChart = null;
    }
}
