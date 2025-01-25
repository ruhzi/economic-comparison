export let countryCodeToName = {};
let countryData = [];

export function fetchCountryData() {
    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            countryData = data;
            populateCountrySelect(document.querySelector('.country-select'));
            countryCodeToName = data.reduce((acc, country) => {
                acc[country.cca2] = country.name.common;
                return acc;
            }, {});
        })
        .catch(error => console.error('Error fetching country data:', error));
}

export function populateCountrySelect(selectElement) {
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }

    countryData.forEach(country => {
        const option = document.createElement('option');
        option.value = country.cca2;
        option.textContent = country.name.common;
        selectElement.appendChild(option);
    });
}
