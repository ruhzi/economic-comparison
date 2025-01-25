import { setDarkMode, toggleDarkMode } from './utils/darkMode.js';
import { fetchCountryData, populateCountrySelect } from './utils/countryData.js';
import { populateYearDropdowns } from './utils/yearSelection.js';
import { getGDPData } from './utils/gdpData.js';

document.addEventListener('DOMContentLoaded', () => {
    setDarkMode();
    fetchCountryData();
    populateYearDropdowns();

    document.getElementById('toggle-dark-mode').addEventListener('click', toggleDarkMode);
    document.getElementById('add-country').addEventListener('click', addCountrySelect);

    const initialGroup = document.querySelector('.country-select-group');
    setupCountrySelect(initialGroup);

    document.getElementById('start-year').addEventListener('change', getGDPData);
    document.getElementById('end-year').addEventListener('change', getGDPData);
});

function addCountrySelect() {
    const container = document.getElementById('country-container');
    const countryGroups = container.querySelectorAll('.country-select-group');

    if (countryGroups.length >= 5) {
        alert('Maximum 5 countries can be compared at once');
        return;
    }

    const newGroup = document.createElement('div');
    newGroup.className = 'country-select-group flex gap-4 items-center';
    newGroup.innerHTML = `
        <select class="country-select w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700">
            <option value="">Choose a country</option>
        </select>
        <button class="remove-country btn-secondary p-2 rounded-lg">✕</button>
    `;

    container.appendChild(newGroup);

    const newSelect = newGroup.querySelector('.country-select');
    populateCountrySelect(newSelect);

    setupCountrySelect(newGroup);

    document.querySelectorAll('.remove-country').forEach(btn => {
        btn.style.display = 'block';
    });
}

function setupCountrySelect(groupElement) {
    const select = groupElement.querySelector('.country-select');
    const removeBtn = groupElement.querySelector('.remove-country');

    select.removeEventListener('change', getGDPData);
    select.addEventListener('change', () => {
        if (select.value) {
            getGDPData();
        }
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            groupElement.remove();
            const remainingGroups = document.querySelectorAll('.country-select-group');
            if (remainingGroups.length === 1) {
                remainingGroups[0].querySelector('.remove-country').style.display = 'none';
            }
            getGDPData();
        });
    }
}
