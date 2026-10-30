const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");
const weatherPanel = document.getElementById("weatherPanel");

document.getElementById("todayDate").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

function getWeatherInfo(code) {
  if (code === 0) return { text: "Clear sky", icon: "☀️" };
  if ([1, 2].includes(code)) return { text: "Mainly clear / Partly cloudy", icon: "🌤️" };
  if (code === 3) return { text: "Overcast", icon: "☁️" };
  if ([45, 48].includes(code)) return { text: "Foggy", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code)) return { text: "Drizzle", icon: "🌦️" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { text: "Rain", icon: "🌧️" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: "Snow", icon: "❄️" };
  if ([95, 96, 99].includes(code)) return { text: "Thunderstorm", icon: "⛈️" };
  return { text: "Weather information available", icon: "🌡️" };
}

async function getWeather(city) {
  const locationUrl =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const locationResponse = await fetch(locationUrl);
  if (!locationResponse.ok) throw new Error("Unable to search for this city. Please try again.");
  const locationData = await locationResponse.json();

  if (!locationData.results || locationData.results.length === 0) {
    throw new Error("City not found. Please check the spelling and try again.");
  }

  const place = locationData.results[0];
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) throw new Error("Unable to get weather data right now. Please try again.");
  const weatherData = await weatherResponse.json();

  return { place, current: weatherData.current };
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    message.textContent = "Please enter a city name.";
    return;
  }

  message.textContent = "Getting weather information...";
  weatherPanel.hidden = true;
  searchButton.disabled = true;
  searchButton.textContent = "Searching...";

  try {
    const result = await getWeather(city);
    const { place, current } = result;
    const weather = getWeatherInfo(current.weather_code);

    document.getElementById("cityName").textContent =
      `${place.name}${place.admin1 ? ", " + place.admin1 : ""}, ${place.country}`;
    document.getElementById("weatherDescription").textContent = weather.text;
    document.getElementById("weatherIcon").textContent = weather.icon;
    document.getElementById("temperature").textContent =
      Math.round(current.temperature_2m);
    document.getElementById("feelsLike").textContent =
      `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById("humidity").textContent =
      `${current.relative_humidity_2m}%`;
    document.getElementById("windSpeed").textContent =
      `${current.wind_speed_10m} km/h`;
    document.getElementById("apparentTemp").textContent =
      `${Math.round(current.apparent_temperature)}°C`;

    const time = current.time ? current.time.split("T")[1] : "--:--";
    document.getElementById("localTime").textContent = time;

    weatherPanel.hidden = false;
    message.textContent = "";
  } catch (error) {
    message.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
});

// Load a default city when the website opens.
cityInput.value = "Pune";
getWeather("Pune")
  .then(({ place, current }) => {
    const weather = getWeatherInfo(current.weather_code);
    document.getElementById("cityName").textContent =
      `${place.name}${place.admin1 ? ", " + place.admin1 : ""}, ${place.country}`;
    document.getElementById("weatherDescription").textContent = weather.text;
    document.getElementById("weatherIcon").textContent = weather.icon;
    document.getElementById("temperature").textContent = Math.round(current.temperature_2m);
    document.getElementById("feelsLike").textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
    document.getElementById("windSpeed").textContent = `${current.wind_speed_10m} km/h`;
    document.getElementById("apparentTemp").textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById("localTime").textContent = current.time.split("T")[1];
    weatherPanel.hidden = false;
  })
  .catch(() => {
    message.textContent = "Enter a city and press Search to load weather information.";
  });
