
document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // MYTAB PHASE 4.2
    // WEATHER + CALENDAR
    // ==========================================

    const storage = window.MyTabStorage;

    const productivitySection =
        document.getElementById("productivitySection");

    if (!productivitySection || !storage) {
        console.error("MyTab Phase 4.2: Required elements or storage unavailable.");
        return;
    }

    // Load Phase 4.2 stylesheet automatically.

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "css/phase42.css";
    document.head.appendChild(stylesheet);


    // ==========================================
    // 1. CREATE WIDGET HTML
    // ==========================================

    const section = document.createElement("section");

    section.className = "weather-calendar-section";

    section.innerHTML = `
        <div class="productivity-heading">
            <div>
                <span class="productivity-eyebrow">YOUR DAILY OVERVIEW</span>
                <h2>Plan your day.</h2>
            </div>
            <span class="productivity-status">WEATHER & CALENDAR</span>
        </div>

        <div class="weather-calendar-grid">

            <article class="wc-card">

                <div class="wc-card-header">

                    <div class="wc-title-group">
                        <div class="wc-icon">☀</div>
                        <div>
                            <h3>Live Weather</h3>
                            <p>Weather around you.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        class="wc-refresh"
                        id="weatherRefresh"
                        title="Refresh weather"
                        aria-label="Refresh weather"
                    >↻</button>

                </div>

                <div id="weatherContent" aria-live="polite">
                    <div class="weather-message">
                        <span>📍</span>
                        <span>Allow location access to see your local weather.</span>
                        <button type="button" id="weatherEnable">
                            Enable location
                        </button>
                    </div>
                </div>

            </article>


            <article class="wc-card">

                <div class="wc-card-header">

                    <div class="wc-title-group">
                        <div class="wc-icon">▦</div>
                        <div>
                            <h3>Calendar</h3>
                            <p>Keep track of important days.</p>
                        </div>
                    </div>

                    <div class="calendar-navigation">

                        <button
                            type="button"
                            id="calendarPrevious"
                            aria-label="Previous month"
                        >‹</button>

                        <span class="calendar-month" id="calendarMonth">
                            Month
                        </span>

                        <button
                            type="button"
                            id="calendarNext"
                            aria-label="Next month"
                        >›</button>

                    </div>

                </div>


                <div class="calendar-weekdays">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                </div>

                <div
                    class="calendar-days"
                    id="calendarDays"
                    aria-label="Monthly calendar"
                ></div>


                <div class="calendar-event-area">

                    <div class="calendar-event-heading">
                        <strong id="selectedDateLabel">Today's events</strong>
                        <span id="eventCount">0 events</span>
                    </div>

                    <form id="calendarEventForm" class="calendar-event-form">

                        <input
                            type="text"
                            id="calendarEventInput"
                            placeholder="Add an event..."
                            maxlength="100"
                            autocomplete="off"
                            required
                        >

                        <button type="submit" aria-label="Add event">+</button>

                    </form>

                    <div
                        class="calendar-events-list"
                        id="calendarEventsList"
                        aria-live="polite"
                    ></div>

                </div>

            </article>

        </div>
    `;

    productivitySection.insertAdjacentElement("afterend", section);


    // ==========================================
    // 2. WEATHER ELEMENTS
    // ==========================================

    const weatherContent =
        document.getElementById("weatherContent");

    const weatherRefresh =
        document.getElementById("weatherRefresh");

    const weatherEnable =
        document.getElementById("weatherEnable");

    let lastCoordinates = null;
    let weatherTimer = null;
    let weatherRequestInProgress = false;


    // ==========================================
    // 3. WEATHER CONDITION MAPPING
    // ==========================================

    function getWeatherInfo(code, isDay) {

        const conditions = {

            0: ["Clear sky", isDay ? "☀️" : "🌙"],

            1: ["Mainly clear", isDay ? "🌤️" : "🌙"],

            2: ["Partly cloudy", "⛅"],

            3: ["Overcast", "☁️"],

            45: ["Foggy", "🌫️"],

            48: ["Rime fog", "🌫️"],

            51: ["Light drizzle", "🌦️"],

            53: ["Drizzle", "🌦️"],

            55: ["Heavy drizzle", "🌧️"],

            56: ["Freezing drizzle", "🌧️"],

            57: ["Heavy freezing drizzle", "🌧️"],

            61: ["Slight rain", "🌧️"],

            63: ["Moderate rain", "🌧️"],

            65: ["Heavy rain", "🌧️"],

            66: ["Freezing rain", "🌧️"],

            67: ["Heavy freezing rain", "🌧️"],

            71: ["Slight snowfall", "🌨️"],

            73: ["Moderate snowfall", "🌨️"],

            75: ["Heavy snowfall", "❄️"],

            77: ["Snow grains", "❄️"],

            80: ["Rain showers", "🌦️"],

            81: ["Moderate showers", "🌧️"],

            82: ["Heavy showers", "⛈️"],

            85: ["Snow showers", "🌨️"],

            86: ["Heavy snow showers", "❄️"],

            95: ["Thunderstorm", "⛈️"],

            96: ["Thunderstorm with hail", "⛈️"],

            99: ["Severe thunderstorm", "⛈️"]

        };

        return conditions[code] || ["Unknown conditions", "🌡️"];

    }


    // ==========================================
    // 4. WEATHER MESSAGE
    // ==========================================

    function showWeatherMessage(message, showRetry = false) {

        weatherContent.replaceChildren();

        const wrapper = document.createElement("div");

        wrapper.className = "weather-message";

        const text = document.createElement("span");

        text.textContent = message;

        wrapper.appendChild(text);

        if (showRetry) {

            const button = document.createElement("button");

            button.type = "button";
            button.textContent = "Try again";

            button.addEventListener("click", loadWeather);

            wrapper.appendChild(button);

        }

        weatherContent.appendChild(wrapper);

    }


    // ==========================================
    // 5. DISPLAY WEATHER
    // ==========================================

    function renderWeather(data, locationText) {

        const current = data.current;

        const [condition, symbol] = getWeatherInfo(
            current.weather_code,
            current.is_day
        );

        weatherContent.replaceChildren();

        const main = document.createElement("div");

        main.className = "weather-main";

        const icon = document.createElement("span");

        icon.className = "weather-symbol";
        icon.textContent = symbol;

        const temperatureGroup = document.createElement("div");

        const temperature = document.createElement("div");

        temperature.className = "weather-temperature";

        temperature.textContent =
            `${Math.round(current.temperature_2m)}°C`;

        const description = document.createElement("div");

        description.className = "weather-condition";
        description.textContent = condition;

        const location = document.createElement("div");

        location.className = "weather-location";
        location.textContent = locationText;

        temperatureGroup.appendChild(temperature);
        temperatureGroup.appendChild(description);
        temperatureGroup.appendChild(location);

        main.appendChild(icon);
        main.appendChild(temperatureGroup);


        const details = document.createElement("div");

        details.className = "weather-details";

        const weatherStats = [
            {
                label: "Feels like",
                value: `${Math.round(current.apparent_temperature)}°C`
            },
            {
                label: "Humidity",
                value: `${current.relative_humidity_2m}%`
            },
            {
                label: "Wind",
                value: `${Math.round(current.wind_speed_10m)} km/h`
            }
        ];

        weatherStats.forEach(stat => {

            const item = document.createElement("div");

            item.className = "weather-detail";

            const label = document.createElement("span");
            label.textContent = stat.label;

            const value = document.createElement("strong");
            value.textContent = stat.value;

            item.appendChild(label);
            item.appendChild(value);

            details.appendChild(item);

        });


        const updated = document.createElement("div");

        updated.className = "weather-updated";

        updated.textContent =
            `Updated ${new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            })}`;


        weatherContent.appendChild(main);
        weatherContent.appendChild(details);
        weatherContent.appendChild(updated);

    }


    // ==========================================
    // 6. GET DEVICE LOCATION + WEATHER
    // ==========================================

    async function loadWeather() {

        if (weatherRequestInProgress) return;

        if (!navigator.geolocation) {

            showWeatherMessage(
                "Geolocation is not supported by this browser.",
                false
            );

            return;

        }

        if (!navigator.onLine) {

            showWeatherMessage(
                "You are offline. Connect to the internet to load weather.",
                true
            );

            return;

        }

        weatherRequestInProgress = true;

        weatherRefresh.disabled = true;
        weatherRefresh.textContent = "…";

        showWeatherMessage("Detecting your location...");


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    // Keep coordinates in memory only.
                    lastCoordinates = { latitude, longitude };

                    showWeatherMessage("Fetching local weather...");

                    const params = new URLSearchParams({
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                        current: [
                            "temperature_2m",
                            "relative_humidity_2m",
                            "apparent_temperature",
                            "is_day",
                            "weather_code",
                            "wind_speed_10m"
                        ].join(","),
                        timezone: "auto",
                        forecast_days: "1"
                    });

                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?${params}`
                    );

                    if (!response.ok) {

                        throw new Error(
                            `Weather service returned ${response.status}`
                        );

                    }

                    const data = await response.json();

                    if (!data.current) {

                        throw new Error("Weather data is unavailable.");

                    }

                    const locationText =
                        `Your current area · ${data.timezone || "Local time"}`;

                    renderWeather(data, locationText);

                } catch (error) {

                    console.error("Weather error:", error);

                    showWeatherMessage(
                        "Unable to fetch weather. Check your internet connection.",
                        true
                    );

                } finally {

                    weatherRequestInProgress = false;

                    weatherRefresh.disabled = false;
                    weatherRefresh.textContent = "↻";

                }

            },

            (error) => {

                weatherRequestInProgress = false;

                weatherRefresh.disabled = false;
                weatherRefresh.textContent = "↻";

                let message = "Unable to detect your location.";

                if (error.code === 1) {

                    message =
                        "Location permission was denied. Allow location access in Chrome site settings.";

                } else if (error.code === 2) {

                    message =
                        "Your device location is currently unavailable.";

                } else if (error.code === 3) {

                    message =
                        "Location request timed out. Please try again.";

                }

                showWeatherMessage(message, true);

                console.warn("Geolocation error:", error.message);

            },

            {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 300000
            }

        );

    }


    weatherRefresh.addEventListener("click", loadWeather);
    weatherEnable.addEventListener("click", loadWeather);


    // Request permission on initial load.
    loadWeather();


    // Refresh every 15 minutes.
    weatherTimer = setInterval(() => {

        if (document.visibilityState === "visible") {
            loadWeather();
        }

    }, 15 * 60 * 1000);


    // ==========================================
    // 7. CALENDAR ELEMENTS
    // ==========================================

    const calendarMonth =
        document.getElementById("calendarMonth");

    const calendarDays =
        document.getElementById("calendarDays");

    const previousMonth =
        document.getElementById("calendarPrevious");

    const nextMonth =
        document.getElementById("calendarNext");

    const selectedDateLabel =
        document.getElementById("selectedDateLabel");

    const eventCount =
        document.getElementById("eventCount");

    const calendarEventForm =
        document.getElementById("calendarEventForm");

    const calendarEventInput =
        document.getElementById("calendarEventInput");

    const calendarEventsList =
        document.getElementById("calendarEventsList");


    const today = new Date();

    let displayedYear = today.getFullYear();

    let displayedMonth = today.getMonth();

    let selectedDate = formatDate(today);

    let calendarEvents = [];


    // ==========================================
    // 8. DATE HELPERS
    // ==========================================

    function formatDate(dateObject) {

        const year = dateObject.getFullYear();

        const month = String(
            dateObject.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            dateObject.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function parseLocalDate(value) {

        const [year, month, day] = value.split("-").map(Number);

        return new Date(year, month - 1, day);

    }


    function formatReadableDate(value) {

        return parseLocalDate(value).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    }


    // ==========================================
    // 9. LOAD CALENDAR EVENTS
    // ==========================================

    const savedEvents = await storage.get("calendarEvents");

    if (Array.isArray(savedEvents)) {

        calendarEvents = savedEvents.filter(event =>
            event &&
            typeof event.id === "string" &&
            typeof event.title === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(event.date)
        );

    }


    // ==========================================
    // 10. SAVE EVENTS
    // ==========================================

    async function saveEvents() {

        const saved = await storage.set({
            calendarEvents
        });

        if (!saved) {

            console.error("Could not save calendar events.");

        }

        return saved;

    }


    // ==========================================
    // 11. RENDER EVENTS FOR SELECTED DATE
    // ==========================================

    function renderSelectedEvents() {

        calendarEventsList.replaceChildren();

        const selectedEvents = calendarEvents.filter(
            event => event.date === selectedDate
        );

        selectedDateLabel.textContent =
            formatReadableDate(selectedDate);

        eventCount.textContent =
            `${selectedEvents.length} ${selectedEvents.length === 1 ? "event" : "events"}`;


        if (selectedEvents.length === 0) {

            const empty = document.createElement("div");

            empty.className = "calendar-empty";

            empty.textContent = "No events scheduled for this day.";

            calendarEventsList.appendChild(empty);

            return;

        }


        selectedEvents.forEach(event => {

            const row = document.createElement("div");

            row.className = "calendar-event";

            const dot = document.createElement("span");

            dot.className = "calendar-event-dot";

            const title = document.createElement("span");

            title.className = "calendar-event-name";

            title.textContent = event.title;

            const remove = document.createElement("button");

            remove.type = "button";

            remove.className = "calendar-event-delete";

            remove.textContent = "×";

            remove.title = "Delete event";

            remove.setAttribute(
                "aria-label",
                `Delete event ${event.title}`
            );

            remove.addEventListener("click", async () => {

                const previousEvents = [...calendarEvents];

                calendarEvents = calendarEvents.filter(
                    item => item.id !== event.id
                );

                const saved = await saveEvents();

                if (!saved) {

                    calendarEvents = previousEvents;

                }

                renderCalendar();

            });

            row.appendChild(dot);
            row.appendChild(title);
            row.appendChild(remove);

            calendarEventsList.appendChild(row);

        });

    }


    // ==========================================
    // 12. RENDER MONTHLY CALENDAR
    // ==========================================

    function renderCalendar() {

        calendarDays.replaceChildren();

        const firstDay = new Date(
            displayedYear,
            displayedMonth,
            1
        ).getDay();

        const daysInMonth = new Date(
            displayedYear,
            displayedMonth + 1,
            0
        ).getDate();

        const previousMonthDays = new Date(
            displayedYear,
            displayedMonth,
            0
        ).getDate();

        calendarMonth.textContent = new Date(
            displayedYear,
            displayedMonth,
            1
        ).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
        });


        const eventDates = new Set(
            calendarEvents.map(event => event.date)
        );


        // 42 cells give a consistent six-week calendar.

        for (let index = 0; index < 42; index++) {

            let day;
            let dateObject;
            let outsideMonth = false;

            if (index < firstDay) {

                day = previousMonthDays - firstDay + index + 1;

                dateObject = new Date(
                    displayedYear,
                    displayedMonth - 1,
                    day
                );

                outsideMonth = true;

            } else if (index >= firstDay + daysInMonth) {

                day = index - firstDay - daysInMonth + 1;

                dateObject = new Date(
                    displayedYear,
                    displayedMonth + 1,
                    day
                );

                outsideMonth = true;

            } else {

                day = index - firstDay + 1;

                dateObject = new Date(
                    displayedYear,
                    displayedMonth,
                    day
                );

            }


            const dateValue = formatDate(dateObject);

            const button = document.createElement("button");

            button.type = "button";

            button.className = "calendar-day";

            button.textContent = day;

            button.setAttribute(
                "aria-label",
                formatReadableDate(dateValue)
            );


            if (outsideMonth) {
                button.classList.add("outside-month");
            }

            if (dateValue === formatDate(today)) {
                button.classList.add("today");
            }

            if (dateValue === selectedDate) {
                button.classList.add("selected");
            }

            if (eventDates.has(dateValue)) {
                button.classList.add("has-event");
            }


            button.addEventListener("click", () => {

                selectedDate = dateValue;

                if (outsideMonth) {

                    displayedYear = dateObject.getFullYear();

                    displayedMonth = dateObject.getMonth();

                }

                renderCalendar();

            });


            calendarDays.appendChild(button);

        }

        renderSelectedEvents();

    }


    // ==========================================
    // 13. MONTH NAVIGATION
    // ==========================================

    previousMonth.addEventListener("click", () => {

        displayedMonth--;

        if (displayedMonth < 0) {

            displayedMonth = 11;

            displayedYear--;

        }

        renderCalendar();

    });


    nextMonth.addEventListener("click", () => {

        displayedMonth++;

        if (displayedMonth > 11) {

            displayedMonth = 0;

            displayedYear++;

        }

        renderCalendar();

    });


    // ==========================================
    // 14. ADD CALENDAR EVENT
    // ==========================================

    calendarEventForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const title = calendarEventInput.value.trim();

        if (!title) return;

        if (calendarEvents.length >= 500) {

            alert("You can keep up to 500 calendar events.");

            return;

        }

        const newEvent = {

            id: crypto.randomUUID(),

            title,

            date: selectedDate,

            createdAt: Date.now()

        };

        calendarEvents.push(newEvent);

        const saved = await saveEvents();

        if (!saved) {

            calendarEvents.pop();

            alert("Could not save this event.");

            return;

        }

        calendarEventInput.value = "";

        renderCalendar();

    });


    // ==========================================
    // 15. INITIAL CALENDAR RENDER
    // ==========================================

    renderCalendar();


    console.log("MyTab Phase 4.2 loaded successfully.");

});
