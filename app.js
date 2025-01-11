// Store country code to name mapping
let countryCodeToName = {};

// Fetch the country codes and names from the Restcountries API
fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
        // Sort the countries alphabetically by name
        data.sort((a, b) => {
            const nameA = a.name.common.toUpperCase(); // Ignore case
            const nameB = b.name.common.toUpperCase(); // Ignore case
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });

        // Populate the country dropdown with options
        const countrySelect = document.getElementById('country');
        data.forEach(country => {
            const option = document.createElement('option');
            option.value = country.cca2;  // Store the country code as value
            option.textContent = country.name.common;  // Display the country name
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

// Populate the year dropdowns with years from 1960 to the current year
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

// Fetch GDP data for a country and date range
function getGDPData() {
    const countryCode = document.getElementById('country').value;  // Get selected country code
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

            // Check if data exists for the selected country
            if (!gdpData || gdpData.length === 0) {
                gdpHTML += '<p>No data found for this country and period.</p>';
            } else {
                // Create a table to display GDP data
                gdpHTML += `<table><thead><tr><th>Year</th><th>GDP Growth Rate (%)</th></tr></thead><tbody>`;

                // Loop through the data and display the results in table rows
                gdpData.forEach(item => {
                    const year = item.date;
                    const growthRate = item.value ? item.value.toFixed(2) : 'No data';
                    const countryName = countryCodeToName[countryCode] || "Unknown";

                    gdpHTML += `<tr><td>${year}</td><td>${growthRate}</td></tr>`;

                    // Accumulate the growth rate for average calculation
                    if (item.value) {
                        totalGrowthRate += item.value;
                        count++;
                    }
                });

                gdpHTML += '</tbody></table>';

                // Calculate the average GDP growth rate
                if (count > 0) {
                    const averageGrowthRate = (totalGrowthRate / count).toFixed(2);
                    gdpHTML += `<p><strong>Average GDP Growth Rate:</strong> ${averageGrowthRate}%</p>`;
                } else {
                    gdpHTML += '<p><strong>Average GDP Growth Rate:</strong> No data available.</p>';
                }
            }
            document.getElementById('gdp-data').innerHTML = gdpHTML;
        })
        .catch(error => console.error('Error fetching GDP data:', error));
}
