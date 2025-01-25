// darkMode.js
export function setDarkMode() {
    const isDarkMode = localStorage.getItem('dark-mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('toggle-dark-mode').innerHTML = '🌞'; 
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('toggle-dark-mode').innerHTML = '🌙'; 
    }
}

export function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDarkMode);

    const button = document.getElementById('toggle-dark-mode');
    button.innerHTML = isDarkMode ? '🌞' : '🌙'; 
}
