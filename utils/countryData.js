// countryData.js
export let countryCodeToName = {};

export function fetchCountryData() {
    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            const countrySelect = document.getElementById('country');
            data.forEach(country => {
                const option = document.createElement('option');
                option.value = country.cca2;
                option.textContent = country.name.common;
                countrySelect.appendChild(option);
            });

            countryCodeToName = data.reduce((acc, country) => {
                acc[country.cca2] = country.name.common;
                return acc;
            }, {});
        })
        .catch(error => console.error('Error fetching country data:', error));
}
