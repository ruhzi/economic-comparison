// countryData.js
export let countryCodeToName = {};
let countryData = []; // Store country data globally

export function fetchCountryData() {
    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(data => {
            // Sort countries by name
            data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            
            // Store data globally
            countryData = data;
            
            // Populate the initial select
            populateCountrySelect(document.querySelector('.country-select'));

            // Create the country code to name mapping
            countryCodeToName = data.reduce((acc, country) => {
                acc[country.cca2] = country.name.common;
                return acc;
            }, {});
        })
        .catch(error => console.error('Error fetching country data:', error));
}

// Function to populate a single select element with country options
export function populateCountrySelect(selectElement) {
    // Clear existing options except the first one
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }

    // Add country options
    countryData.forEach(country => {
        const option = document.createElement('option');
        option.value = country.cca2;
        option.textContent = country.name.common;
        selectElement.appendChild(option);
    });
}