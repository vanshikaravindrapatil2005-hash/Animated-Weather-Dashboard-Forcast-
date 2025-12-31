const apiKey = '7dc9eb71047a62ce60eae72bfa840b71'; // Your OpenWeatherMap API key
const searchBtn = document.getElementById('searchBtn');
const gpsBtn = document.getElementById('gpsBtn');
const cityInput = document.getElementById('cityInput');
const weatherCard = document.getElementById('weatherCard');
const forecastCard = document.getElementById('forecastCard');
let weatherAnimation;

// Lottie animation URLs for weather conditions
const animations = {
    Clear: 'https://assets2.lottiefiles.com/packages/lf20_k80dqgtl.json', // Sun
    Clouds: 'https://assets2.lottiefiles.com/packages/lf20_kof97aeu.json', // Clouds
    Rain: 'https://assets2.lottiefiles.com/packages/lf20_kd5euvdj.json', // Rain
    Snow: 'https://assets2.lottiefiles.com/packages/lf20_rj4tkg0h.json', // Snow
    Thunderstorm: 'https://assets2.lottiefiles.com/packages/lf20_xlmz9xwm.json', // Storm
    Drizzle: 'https://assets2.lottiefiles.com/packages/lf20_kd5euvdj.json', // Rain
    Mist: 'https://assets2.lottiefiles.com/packages/lf20_kof97aeu.json' // Clouds
};

// Moon animation for night
const moonAnimation = 'https://assets2.lottiefiles.com/packages/lf20_y6m8wpcu.json';
// Hot sun animation for high temperatures
const hotSunAnimation = 'https://assets2.lottiefiles.com/packages/lf20_k80dqgtl.json'; // Using the same sun for now, can be replaced with a more intense one

// Function to fetch weather data
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (data.cod === 200) {
            updateWeatherUI(data);
            fetchForecast(data.coord.lat, data.coord.lon);
        } else {
            alert('City not found!');
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

// Function to fetch forecast data
async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        updateForecastUI(data.list.slice(0, 5)); // Next 5 entries (15 hours)
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// Function to update weather UI
function updateWeatherUI(data) {
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('temp').textContent = Math.round(data.main.temp) + '°C';
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('windSpeed').textContent = data.wind.speed + ' m/s';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    document.getElementById('clouds').textContent = data.clouds.all + '%';
    document.getElementById('lastUpdate').textContent = 'Last updated: ' + new Date().toLocaleString();



    // Load Lottie animation
    const condition = data.weather[0].main;
    const currentTime = Date.now() / 1000; // Current time in seconds
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    const isNight = currentTime < sunrise || currentTime > sunset;
    const temperature = data.main.temp;

    console.log('Weather condition:', condition);
    console.log('Current time:', new Date(currentTime * 1000));
    console.log('Sunrise:', new Date(sunrise * 1000));
    console.log('Sunset:', new Date(sunset * 1000));
    console.log('Is night:', isNight);
    console.log('Temperature:', temperature);

    let animationPath = animations[condition] || animations.Clear;
    if (condition === 'Clear') {
        if (isNight) {
            animationPath = moonAnimation;
            console.log('Using moon animation');
        } else if (temperature > 30) {
            animationPath = hotSunAnimation; // Hot sun for high temperatures
            console.log('Using hot sun animation');
        } else {
            console.log('Using regular sun animation');
        }
    }
    console.log('Animation path:', animationPath);

    if (weatherAnimation) weatherAnimation.destroy();
    weatherAnimation = lottie.loadAnimation({
        container: document.getElementById('weatherIcon'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animationPath
    });

    // Change background based on weather
    changeBackground(condition);

    weatherCard.classList.remove('hidden');
    weatherCard.classList.add('weather-update');
}

// Function to update forecast UI
function updateForecastUI(forecast) {
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = '';
    forecast.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const temp = Math.round(item.main.temp) + '°C';
        const desc = item.weather[0].description;
                const div = document.createElement('div');
                div.className = 'forecast-item p-4 text-center';
        div.innerHTML = `
            <p class="text-white font-bold">${time}</p>
            <p class="text-white">${temp}</p>
            <p class="text-white text-sm">${desc}</p>
        `;
        forecastList.appendChild(div);
    });
    forecastCard.classList.remove('hidden');
}

// Function to change background based on weather
function changeBackground(condition) {
    let gradient;
    switch (condition) {
        case 'Clear':
            gradient = 'linear-gradient(135deg, rgba(255,215,0,0.5) 0%, rgba(255,165,0,0.5) 100%)';
            break;
        case 'Clouds':
            gradient = 'linear-gradient(135deg, rgba(176,196,222,0.5) 0%, rgba(119,136,153,0.5) 100%)';
            break;
        case 'Rain':
            gradient = 'linear-gradient(135deg, rgba(70,130,180,0.5) 0%, rgba(47,79,79,0.5) 100%)';
            break;
        case 'Snow':
            gradient = 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(240,248,255,0.5) 100%)';
            break;
        case 'Thunderstorm':
            gradient = 'linear-gradient(135deg, rgba(47,79,79,0.5) 0%, rgba(0,0,0,0.5) 100%)';
            break;
        default:
            gradient = 'linear-gradient(135deg, rgba(102,126,234,0.5) 0%, rgba(118,75,162,0.5) 50%, rgba(240,147,251,0.5) 100%)';
    }
    document.documentElement.style.setProperty('--bg-gradient', gradient);
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim() || citySelect.value;
    if (city) fetchWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim() || citySelect.value;
        if (city) fetchWeather(city);
    }
});

citySelect.addEventListener('change', () => {
    const city = citySelect.value;
    if (city) fetchWeather(city);
});

gpsBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
                const data = await response.json();
                updateWeatherUI(data);
                fetchForecast(latitude, longitude);
            } catch (error) {
                console.error('Error fetching weather by location:', error);
            }
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Auto-update every 10 minutes
setInterval(() => {
    const city = document.getElementById('cityName').textContent;
    if (city && city !== '') fetchWeather(city);
}, 600000);

// Load default weather on page load - try GPS first, fallback to New York
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
            const data = await response.json();
            if (data.cod === 200) {
                updateWeatherUI(data);
                fetchForecast(latitude, longitude);
            } else {
                fetchWeather('New York');
            }
        } catch (error) {
            console.error('Error fetching weather by location:', error);
            fetchWeather('New York');
        }
    }, () => {
        // GPS denied or unavailable, load default city
        fetchWeather('New York');
    });
} else {
    // Geolocation not supported, load default city
    fetchWeather('New York');
}
