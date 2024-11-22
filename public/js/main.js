async function searchCity() {
    const searchInput = document.getElementById('searchInput');
    const city = searchInput.value.trim();
    
    // Add loading state
    const searchButton = document.querySelector('button');
    searchButton.disabled = true;
    searchButton.textContent = 'Searching...';
    
    try {
        if (!city) {
            throw new Error('Please enter a city name');
        }

        const response = await fetch(`/search?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch weather data');
        }
        
        displaySearchResult(data);
        searchInput.value = ''; // Clear input after successful search
        
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'An error occurred while searching for the city.');
    } finally {
        // Reset button state
        searchButton.disabled = false;
        searchButton.textContent = 'Search';
    }
}

function displaySearchResult(cityData) {
    const weatherGrid = document.querySelector('.weather-grid');
    
    // Remove existing search result if it exists
    const existingCard = weatherGrid.querySelector(
        `.weather-card[data-city="${cityData.location.name}"]`
    );
    if (existingCard) {
        existingCard.remove();
    }
    
    const weatherCard = document.createElement('div');
    weatherCard.className = 'weather-card';
    weatherCard.setAttribute('data-city', cityData.location.name);
    
    // Add animation class
    weatherCard.classList.add('fade-in');
    
    weatherCard.innerHTML = `
        <h2>${cityData.location.name}, ${cityData.location.country}</h2>
        <div class="weather-info">
            <img src="${cityData.current.condition.icon}" alt="weather icon">
            <p class="temperature">${cityData.current.temp_c}°C</p>
            <p class="description">${cityData.current.condition.text}</p>
            <div class="details">
                <p>Humidity: ${cityData.current.humidity}%</p>
                <p>Wind: ${cityData.current.wind_kph} km/h</p>
            </div>
        </div>
    `;
    
    weatherGrid.insertBefore(weatherCard, weatherGrid.firstChild);
}

// Add event listener for Enter key
document.getElementById('searchInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchCity();
    }
}); 