import React, { useState, useCallback } from 'react';
import './App.css';

function App() {
  const [search, setSearch] = useState(""); 
  const [city, setCity] = useState(null); 
  const [error, setError] = useState(""); 
  const [alert, setAlert] = useState(""); 

  const getWeatherData = useCallback(async () => {
    if (!search.trim()) {
      setError("Please enter a city name.");
      setCity(null);
      return;
    }

    if (search.length < 3) {
      setError("Please enter at least 3 characters for the city name.");
      setCity(null);
      return;
    }

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=9fca93ff758b81866359c3e97034d4d7&units=metric`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.cod === '404') {
          setError(`City "${search}" not found. Please enter a valid city name.`);
        } else {
          setError(`Error: ${errorData.message}`);
        }
        setCity(null);
        return;
      }

      const data = await response.json();
      console.log("Wind speed (m/s):", data.wind.speed);
      console.log("Visibility (meters):", data.visibility);

      if (data.name.toLowerCase() === search.toLowerCase()) {
        setCity(data); 
        setError("");  
        checkForDanger(data); 
      } else {
        setError(`Invalid city name "${search}". Please enter the full city name.`);
        setCity(null);
      }

    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Failed to fetch weather data.");
      setCity(null);
    }
  }, [search]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      getWeatherData(); 
    }
  };

  const getWeatherIcon = (weatherCondition) => {
    const iconUrls = {
      Clear: "https://cdn-icons-png.flaticon.com/512/3222/3222807.png",
      Clouds: "https://cdn-icons-png.flaticon.com/128/2441/2441600.png",
      Rain: "https://cdn-icons-png.flaticon.com/128/2060/2060846.png",
      Snow: "https://cdn-icons-png.flaticon.com/128/6409/6409363.png",
      Mist: "https://cdn-icons-png.flaticon.com/128/15485/15485837.png",
      Default: "https://cdn-icons-png.flaticon.com/128/3222/3222791.png",
    };
    return iconUrls[weatherCondition] || iconUrls.Default;
  };

  const checkForDanger = (data) => {
    const alerts = [];

    if (data.weather[0].main === "Thunderstorm") {
      alerts.push("Thunderstorm Alert! Stay indoors.");
    }
    if (data.main.temp > 40) {
      alerts.push("High Temperature Alert! Stay hydrated.");
    }
    if (data.wind.speed > 7) { // Wind speed in m/s
      alerts.push("Strong Wind Alert! Avoid outdoor activities.");
    }
    if (data.weather[0].main === "Snow") {
      alerts.push("Snow Alert! Roads may be slippery.");
    }
    if (data.weather[0].main === "Extreme") {
      alerts.push("Extreme Weather Alert! Take necessary precautions.");
    }

    setAlert(alerts.join(" "));
  };

  return (
    <div className="App">
      <div className="weather-card">
        <div className="search">
          <input
            type="search"
            placeholder="Enter city name"
            spellCheck="false"
            onChange={(e) => setSearch(e.target.value)} 
            onKeyDown={handleKeyDown} 
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {alert && <p className="alert-message">{alert}</p>}
        {city && (
          <div className="weather">
            <img
              className="weather-icon"
              src={getWeatherIcon(city.weather[0].main)}
              alt="Weather Icon"
            />
            <h1 className="temp">{city.main.temp.toFixed(2)}°C</h1>
            <h2 className="city">{city.name}</h2>
            <p className="weather-description">{city.weather[0].description}</p>
            <div className="details">
              <div className="col">
                <img src="https://static-00.iconduck.com/assets.00/humidity-icon-2048x1675-xxsge5os.png" alt="Humidity Icon" />
                <p className="weather-info">Humidity: {city.main.humidity}%</p>
              </div>
              <div className="col">
                <img src="https://cdn-icons-png.flaticon.com/512/136/136712.png" alt="Wind Icon" />
                <p className="weather-info">Wind Speed: {city.wind.speed.toFixed(1)} m/s</p> {/* Display in m/s */}
              </div>
              <div className="col">
                <img src="https://static.vecteezy.com/system/resources/thumbnails/013/250/795/small_2x/wind-3d-rendering-isometric-icon-png.png" alt="Pressure Icon" />
                <p className="weather-info">Pressure: {city.main.pressure} hPa</p>
              </div>
              <div className="col">
                <img src="https://cdn-icons-png.flaticon.com/512/2163/2163090.png" alt="Visibility Icon" />
                <p className="weather-info">Visibility: {(city.visibility / 1000).toFixed(1)} km</p> {/* Converted to km */}
              </div>
              <div className="col">
                <img src="https://png.pngtree.com/element_our/20190528/ourmid/pngtree-sunrise-icon-image_1175247.jpg" alt="Sunrise Icon" />
                <p className="weather-info">Sunrise: {new Date(city.sys.sunrise * 1000).toLocaleTimeString()}</p>
              </div>
              <div className="col">
                <img src="https://png.pngtree.com/element_our/20190528/ourmid/pngtree-sunset-icon-image_1175233.jpg" alt="Sunset Icon" />
                <p className="weather-info">Sunset: {new Date(city.sys.sunset * 1000).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
