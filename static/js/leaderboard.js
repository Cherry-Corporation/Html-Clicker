document.addEventListener('DOMContentLoaded', function () {
    // Check if dark mode is enabled from the server (Flask passed the value)
    const darkModeEnabled = "{{ 'true' if dark_mode else 'false' }}" === 'true';

    // Apply the dark mode class to the body if dark mode is enabled
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
});
