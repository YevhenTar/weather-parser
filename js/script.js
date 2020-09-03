"use strict";

let hasError = false;
let forecast = {};

function getWeatherSearchQuery(city) {
    let searchQuery;
    searchQuery = typeof city === "string" ?
        `q=${city}` :
        `lat=${city.lat}&lon=${city.lon}`;
    return searchQuery;
}

function getWindByDeg(deg) {
    const map = [
        {wind: 'N', begin: -22.5, end: 22.5},
        {wind: 'NE', begin: 22.6, end: 67.4},
        {wind: 'E', begin: 67.5, end: 112.5},
        {wind: 'SE', begin: 112.6, end: 157.4},
        {wind: 'S', begin: 157.5, end: 202.5},
        {wind: 'SW', begin: 202.6, end: 247.4},
        {wind: 'W', begin: 247.5, end: 292.5},
        {wind: 'NW', begin: 292.6, end: 337.4},
    ];
    for (const windDirectionData of map) {
        if (deg >= windDirectionData.begin && deg <= windDirectionData.end) {
            return windDirectionData.wind;
        }
    }

    return 'N';
}

function getDayOfWeek(date) {
    const days = [
        'Воскресенье',
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота',
    ];

    return days[date.getUTCDay()];
}

function updateErrorTab(hasError) {
    document.getElementById("weather-tab").style.display = hasError ? "none" : "block";
    document.getElementById("forecast-tab").style.display = "none";
    document.getElementById("data-tab").style.display = "none";
    document.getElementById("mistake-tab").style.display = hasError ? "block" : "none";
}

function update5DaysForecast(fiveDaysForecast) {
    const forecastBoxes = [
        document.getElementById("forecast-box1"),
        document.getElementById("forecast-box2"),
        document.getElementById("forecast-box3"),
        document.getElementById("forecast-box4"),
        document.getElementById("forecast-box5"),
    ];
    forecastBoxes.forEach(element => {
        element.innerHTML = '';
    });
    const entries = Object.entries(fiveDaysForecast).slice(0, 5);
    entries.forEach(([key, values], index) => {
        const firstItem = 0 === index ?
            values[0] :
            values[values.length / 2 - 1];
        const itemDate = new Date(firstItem.dt * 1000);
        const {
            main: {temp},
            weather: [{icon, description}],
        } = firstItem;
        forecastBoxes[index].dataset.forecastKey = key;
        forecastBoxes[index].innerHTML = `${getDayOfWeek(itemDate)}<br>
                               ${itemDate.toLocaleDateString()}<br><br>
                               <img id="icon" src="http://openweathermap.org/img/wn/${icon}.png"><br><br>
                               ${temp.toFixed(1)}\u00B0C<br><br>
                               ${description}`;
    });
    updateSingleForecastDay(entries[0][1]);
}

function updateSingleForecastDay(dayForecast) {
    const weatherBoxes = [
        document.getElementById("weather-box11"),
        document.getElementById("weather-box22"),
        document.getElementById("weather-box33"),
        document.getElementById("weather-box44"),
        document.getElementById("weather-box55"),
        document.getElementById("weather-box66"),
    ];
    const dayDate = new Date(dayForecast[0].dt * 1000);
    document.getElementById("info-box2").innerText = `${dayDate.toLocaleDateString()}, ${getDayOfWeek(dayDate)}`;
    document.getElementById("info-box3").innerText = `${dayDate.toLocaleDateString()}, ${getDayOfWeek(dayDate)}`;

    weatherBoxes.forEach(element => {
        element.innerHTML = '';
    });

    dayForecast.slice(0, 6).forEach((item, index) => {
        const itemDate = new Date(item.dt * 1000);
        const {
            main: {temp, feels_like: feelLike},
            weather: [{icon, description}],
            wind: {speed: windSpeed, deg: windDeg},
        } = item;

        weatherBoxes[index].innerHTML = `${itemDate.toLocaleTimeString()}<br>
                           <img class="forecast-icon forecast-icon-${index}" src="http://openweathermap.org/img/wn/${icon}.png"><br>
                           ${description}<br>
                           ${temp.toFixed(1)} \u00B0C<br>
                           ${feelLike.toFixed(1)} \u00B0C<br>
                           ${windSpeed} м/с, ${getWindByDeg(windDeg)}`;
    });
}

function selectForecastDay(element, fiveDaysForecast) {
    document.querySelectorAll(".forecast-box__day-item").forEach(element => {
        element.classList.remove("active");
    });
    const key = element.dataset.forecastKey;
    if (fiveDaysForecast.hasOwnProperty(key)) {
        updateSingleForecastDay(fiveDaysForecast[key]);
        element.classList.add("active");
    }
}

function setLocalStorage(queryValue) {
    localStorage.setItem("forecastData", JSON.stringify({name: queryValue}));
}

function getLocalStorage() {
    const data = localStorage.getItem("forecastData");

    return null !== data ? JSON.parse(data) : null;
}

function clearLocalStorage() {
    localStorage.removeItem("forecastData");
}

function getWeather(city) {
    let searchQuery = getWeatherSearchQuery(city);
    let url = `http://api.openweathermap.org/data/2.5/weather?${searchQuery}&appid=1833049079056b5453b544e3041de6c9&lang=ru&units=metric`;
    let request = new XMLHttpRequest();

    let searchField = document.getElementById("search");
    let currentDate = document.getElementById("current-date");
    let icon = document.getElementById("icon");
    let weatherIcon = document.getElementById("weather-ico");
    let weatherTemp = document.getElementById("weather-temp");
    let weatherInfo = document.getElementById("weather-info");

    request.open("GET", url);
    request.responseType = "json";
    request.onreadystatechange = () => {
        if (4 !== request.readyState) {
            return;
        }
        hasError = (200 !== request.status);
        if (!hasError) {
            let response = request.response;

            const cityName = response.name;

            const daytime = response.dt;
            let currDate = daytime * 1000;
            let todayDate = (new Date(currDate)).toLocaleDateString();

            const weather = response.weather;
            let weather_icon = weather[0].icon;
            let weather_description = weather[0].description;

            const main = response.main;
            let main_temp = main.temp;
            let main_feelstemp = main.feels_like;

            const sys = response.sys;
            let countryCode = sys.country;
            let sys_sunrise = sys.sunrise * 1000;
            let sys_sunset = sys.sunset * 1000;
            let sunrise = (new Date(sys_sunrise)).toLocaleTimeString();
            let sunset = (new Date(sys_sunset)).toLocaleTimeString();

            let duration = sys_sunset - sys_sunrise;

            const correctDuration = new Date(duration);

            const coord = response.coord;

            getForecast({lat: coord.lat, lon: coord.lon});
            getNearbyForecast({lat: coord.lat, lon: coord.lon});

            let result = `<img id="icon" src=" http://openweathermap.org/img/wn/${weather_icon}.png"><br>
                                                ${weather_description}`;

            let resultTemp = `<span class="temp-span">${main_temp.toFixed(1)} \u00B0C</span><br>
                                Ощущается ${main_feelstemp.toFixed(1)} \u00B0C`;

            let resultInfo = `Восход: ${sunrise}<br><br>
                            Закат: ${sunset}<br><br>
            Продолжительность дня: ${correctDuration.getUTCHours()} ч. 
                                   ${correctDuration.getUTCMinutes()} мин.`;

            let resultDate = `${todayDate}`;

            let resultCity = `${cityName}, ${countryCode}`;

            weatherIcon.innerHTML = result;
            weatherTemp.innerHTML = resultTemp;
            weatherInfo.innerHTML = resultInfo;
            currentDate.innerHTML = resultDate;
            searchField.value = resultCity;
        } else if (404 === request.status) {
            let mistakeText = document.getElementById("mistake-text");
            mistakeText.innerHTML = `Город "${searchField.value}" не найден в базе данных ресурса.<br><br>
                                     Введите, пожалуйста, другой город.`;
        }
        updateErrorTab(hasError);
    }
    request.send();
}

function getForecast(city) {
    let searchQuery = getWeatherSearchQuery(city);
    const url = `http://api.openweathermap.org/data/2.5/forecast?${searchQuery}&appid=1833049079056b5453b544e3041de6c9&lang=ru&units=metric`;
    const forecastRequest = new XMLHttpRequest();

    let weatherBoxes = [
        document.getElementById("weather-box1"),
        document.getElementById("weather-box2"),
        document.getElementById("weather-box3"),
        document.getElementById("weather-box4"),
        document.getElementById("weather-box5"),
        document.getElementById("weather-box6"),
    ];
    let infoBox = document.getElementById("info-box");

    forecastRequest.open("GET", url);
    forecastRequest.responseType = "json";
    forecastRequest.onreadystatechange = () => {
        if (4 !== forecastRequest.readyState || 200 !== forecastRequest.status) {
            return;
        }
        forecast = {};
        forecastRequest.response.list.forEach(item => {
            const itemDate = new Date(item.dt * 1000);
            const key = `${itemDate.getUTCFullYear()}-${itemDate.getUTCMonth()}-${itemDate.getUTCDate()}`;
            if (!forecast.hasOwnProperty(key)) {
                forecast[key] = [];
            }
            forecast[key].push(item);
        });
        update5DaysForecast(forecast);

        forecastRequest.response.list.slice(0, 6).forEach((item, index) => {
            const hourTime = (new Date(item.dt * 1000)).toLocaleTimeString();
            const {
                main: {temp, feels_like: feelLike},
                weather: [{icon, description}],
                wind: {speed: windSpeed, deg: windDeg},
            } = item;

            weatherBoxes[index].innerHTML = `${hourTime}<br>
                           <img class="forecast-icon forecast-icon-${index}" src="http://openweathermap.org/img/wn/${icon}.png"><br>
                           ${description}<br>
                           ${temp.toFixed(1)} \u00B0C<br>
                           ${feelLike.toFixed(1)} \u00B0C<br>
                           ${windSpeed.toFixed(2)} м/с, ${getWindByDeg(windDeg)}`;
        });
    }
    forecastRequest.send();
}

function getNearbyForecast(city) {
    let searchQuery = getWeatherSearchQuery(city);
    let url = `http://api.openweathermap.org/data/2.5/find?${searchQuery}&cnt=50&appid=1833049079056b5453b544e3041de6c9&lang=ru&units=metric`;
    const circleRequest = new XMLHttpRequest();


    let surroundBox1 = document.getElementById("surround-box1");
    let surroundBox2 = document.getElementById("surround-box2");
    let surroundBox3 = document.getElementById("surround-box3");
    let surroundBox4 = document.getElementById("surround-box4");

    circleRequest.open("GET", url);
    circleRequest.responseType = "json";
    circleRequest.onreadystatechange = () => {
        if (4 === circleRequest.readyState && 200 === circleRequest.status) {
            let response = circleRequest.response;

            const list = response.list;
            let name_nearCity = list[19].name;
            let icon_nearCity = list[19].weather[0].icon;
            let temp_nearCity = list[19].main.temp;

            let name_nearCity2 = list[24].name;
            let icon_nearCity2 = list[24].weather[0].icon;
            let temp_nearCity2 = list[24].main.temp;

            let name_nearCity3 = list[35].name;
            let icon_nearCity3 = list[35].weather[0].icon;
            let temp_nearCity3 = list[35].main.temp;

            let name_nearCity4 = list[38].name;
            let icon_nearCity4 = list[38].weather[0].icon;
            let temp_nearCity4 = list[38].main.temp;


            let resultNearCity = ` <div class="near-place">${name_nearCity}</div><div class="near-weather"><img id="icon2" src=" http://openweathermap.org/img/wn/${icon_nearCity}.png">
                                   ${temp_nearCity.toFixed(1)}\u00B0C</div>`;
            surroundBox1.innerHTML = resultNearCity;

            let resultNearCity2 = ` <div class="near-place">${name_nearCity2}</div><div class="near-weather"><img id="icon2" src=" http://openweathermap.org/img/wn/${icon_nearCity2}.png">
                                   ${temp_nearCity2.toFixed(1)}\u00B0C</div>`;
            surroundBox2.innerHTML = resultNearCity2;

            let resultNearCity3 = ` <div class="near-place">  ${name_nearCity3}</div><div class="near-weather"><img id="icon2" src=" http://openweathermap.org/img/wn/${icon_nearCity3}.png">
                                 ${temp_nearCity3.toFixed(1)}\u00B0C</div>`;
            surroundBox3.innerHTML = resultNearCity3;

            let resultNearCity4 = ` <div class="near-place">${name_nearCity4} </div><div class="near-weather"><img id="icon2" src=" http://openweathermap.org/img/wn/${icon_nearCity4}.png">
                                    ${(temp_nearCity4).toFixed(1)}\u00B0C</div>`;
            surroundBox4.innerHTML = resultNearCity4;
        }

    }
    circleRequest.send();
}


window.addEventListener("load", function () {

    document.getElementById("current-weather-link").addEventListener("click", () => {
        if (hasError) {
            return;
        }
        document.getElementById("weather-tab").style.display = "block";
        document.getElementById("forecast-tab").style.display = "none";
        document.getElementById("data-tab").style.display = "none";
    });
    document.getElementById("forecast-link").addEventListener("click", () => {
        if (hasError) {
            return;
        }
        selectForecastDay(document.getElementById("forecast-box1"), forecast);
        document.getElementById("weather-tab").style.display = "none";
        document.getElementById("forecast-tab").style.display = "block";
        document.getElementById("data-tab").style.display = "none";
    });
    document.getElementById("data-link").addEventListener("click", () => {
        if (hasError) {
            return;
        }
        const { name: cityName } = getLocalStorage() || {};
        if (undefined === cityName) {
            dataCity.innerText = "Данные не сохранены";
            displayButton.classList.add("hidden");
        } else {
            dataCity.innerText = cityName;
            displayButton.classList.remove("hidden");
        }

        document.getElementById("weather-tab").style.display = "none";
        document.getElementById("forecast-tab").style.display = "none";
        document.getElementById("data-tab").style.display = "block";
    });
    document.querySelectorAll("[data-forecast-day-trigger]").forEach(element => {
        element.addEventListener("click", () => {
            selectForecastDay(element, forecast);
        });
    });


    const searchButton = document.getElementById('search-button');
    const searchField = document.getElementById('search');
    const clearButton = document.getElementById('clear-btn');
    const displayButton = document.getElementById('display-btn');
    const dataCity = document.getElementById('data-city');

    dataCity.innerText = "";

    searchButton.addEventListener("click", () => {
        document.getElementById("mistake-tab").style.display = "none";
        const searchName = searchField.value;
        getWeather(searchName);
        setLocalStorage(searchName);
    });

    clearButton.addEventListener("click", () => {
        clearLocalStorage();
        dataCity.innerText = "";
        displayButton.classList.add("hidden");
    });
    displayButton.addEventListener("click", () => {
        const { name: cityName } = getLocalStorage() || {};
        if (undefined === cityName) {
            dataCity.innerText = "Данные не сохранены";
            displayButton.classList.add("hidden");
        } else {
            searchField.value = cityName;
            searchButton.click();
        }
    });


    const geoLocation = navigator.geolocation;
    if (undefined === geoLocation) {
        getWeather('Kiev');
    } else {
        geoLocation.getCurrentPosition(
            (pos) => {
                let locationPlace = {
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                };
                getWeather(locationPlace);
            },
            (error) => {
                console.log(`Geo-location error (${error.code}): ${error.message}`);
                getWeather('Kiev');
            });
    }
});
