import { setDarkMode, toggleDarkMode } from './utils/darkMode.js';
import { fetchCountryData } from './utils/countryData.js';
import { populateYearDropdowns } from './utils/yearSelection.js';
import { getGDPData } from './utils/gdpData.js';

document.addEventListener('DOMContentLoaded', () => {
    setDarkMode();
    fetchCountryData();
    populateYearDropdowns();

    document.getElementById('toggle-dark-mode').addEventListener('click', () => {
        toggleDarkMode();
    });

    document.getElementById('country').addEventListener('change', () => {
        getGDPData();
    });

    document.getElementById('start-year').addEventListener('change', () => {
        getGDPData();
    });

    document.getElementById('end-year').addEventListener('change', () => {
        getGDPData();
    });
});
