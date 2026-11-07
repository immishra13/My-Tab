
document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // MYTAB PHASE 5
    // PERSONALISATION STUDIO
    // ==========================================

    const storage = window.MyTabStorage;

    if (!storage) {
        console.error("MyTab storage is unavailable.");
        return;
    }


    // ==========================================
    // 1. LOAD PHASE 5 CSS
    // ==========================================

    if (!document.querySelector("#phase5Stylesheet")) {

        const stylesheet = document.createElement("link");

        stylesheet.id = "phase5Stylesheet";
        stylesheet.rel = "stylesheet";
        stylesheet.href = "css/phase5.css";

        document.head.appendChild(stylesheet);

    }


    // ==========================================
    // 2. DEFAULT PREFERENCES
    // ==========================================

    const DEFAULT_PREFERENCES = {

        theme: "dark",

        accent: "#a5b8ff",

        density: "comfortable",

        widgets: {
            clock: true,
            search: true,
            shortcuts: true,
            notes: true,
            todo: true,
            weather: true,
            calendar: true
        }

    };


    let preferences = {
        ...DEFAULT_PREFERENCES,
        widgets: { ...DEFAULT_PREFERENCES.widgets }
    };


    const ACCENT_COLOURS = [

        { name: "Blue", value: "#a5b8ff" },
        { name: "Purple", value: "#b69cff" },
        { name: "Green", value: "#8ce2b2" },
        { name: "Pink", value: "#ff9ecb" },
        { name: "Orange", value: "#ffb477" },
        { name: "Cyan", value: "#83dfff" }

    ];


    // ==========================================
    // 3. LOAD SAVED PREFERENCES
    // ==========================================

    const savedPreferences =
        await storage.get("phase5Preferences");

    if (
        savedPreferences &&
        typeof savedPreferences === "object"
    ) {

        preferences = {

            theme: ["dark", "midnight", "light"].includes(
                savedPreferences.theme
            )
                ? savedPreferences.theme
                : DEFAULT_PREFERENCES.theme,

            accent: /^#[0-9a-fA-F]{6}$/.test(
                savedPreferences.accent || ""
            )
                ? savedPreferences.accent
                : DEFAULT_PREFERENCES.accent,

            density: ["compact", "comfortable"].includes(
                savedPreferences.density
            )
                ? savedPreferences.density
                : DEFAULT_PREFERENCES.density,

            widgets: {
                ...DEFAULT_PREFERENCES.widgets,

                ...(savedPreferences.widgets &&
                    typeof savedPreferences.widgets === "object"
                    ? savedPreferences.widgets
                    : {})
            }

        };

    }


    // ==========================================
    // 4. ELEMENT REFERENCES
    // ==========================================

    const settingsDialog =
        document.getElementById("settingsDialog");

    const settingsContent =
        settingsDialog?.querySelector(".settings-content");

    if (!settingsContent) {
        console.error("Customisation Studio not found.");
        return;
    }


    // ==========================================
    // 5. CREATE PERSONALISATION PANEL
    // ==========================================

    const panel = document.createElement("section");

    panel.className = "personalisation-section";

    panel.innerHTML = `

        <div class="settings-divider"></div>

        <div class="personalisation-intro">

            <span class="settings-eyebrow">
                PHASE 05 · PERSONALISATION
            </span>

            <h3>Make MyTab yours.</h3>

            <p>
                Control what you see, choose your favourite theme
                and personalise the entire dashboard.
            </p>

        </div>


        <!-- WIDGET VISIBILITY -->

        <div class="personalisation-group">

            <div class="personalisation-group-title">
                Widget visibility
            </div>

            <div class="widget-toggle-list" id="widgetToggleList">

                <div class="widget-toggle-row">
                    <div class="widget-toggle-info">
                        <strong>Live Clock</strong>
                        <span>Time, date and greeting</span>
                    </div>

                    <label class="widget-switch">
                        <input type="checkbox" data-widget="clock">
                        <span class="widget-switch-track"></span>
                    </label>
                </div>

                <div class="widget-toggle-row">
                    <div class="widget-toggle-info">
                        <strong>Search Bar</strong>
                        <span>Search engine and search input</span>
                    </div>

                    <label class="widget-switch">
                        <input type="checkbox" data-widget="search">
                        <span class="widget-switch-track"></span>
                    </label>
                </div>

                <div class="widget-toggle-row">
                    <div class="widget-toggle-info">
                        <strong>Website Shortcuts</strong>
                        <span>Your favourite websites</span>
                    </div>

                    <label class="widget-switch">
                        <input type="checkbox" data-widget="shortcuts">
                        <span class="widget-switch-track"></span>
                    </label>
                </div>

                <div class="widget-toggle-row">
                    <div class="widget-toggle-info">
                        <strong>Quick Notes</strong>
                        <span>Your saved notes</span>
                    </div>

                    <label class="widget-switch">
                        <input type="checkbox" data-widget="notes">
                        <span class="widget-switch-track"></span>
                    </label>
                </div>

                <div class="widget-toggle-row">
                    <div class="widget-toggle-info">
                        <strong>To-Do List</strong>
                        <span>Your daily tasks</span>
                    </div>

                    <label class="widget-switch">
                        <input type="checkbox" data-widget="todo">
                        <span class="widget-switch-track"></span>
                    </label>
                </div>

                <div class="widget-toggle-row">
                    <div class="widget-toggle-info">
                        <strong>Live Weather</strong>
                        <span>Local weather information</span>
                    </div>

                    <label class="widget-switch">
                        <input type="checkbox" data-widget="weather">
                        <span class="widget-switch-track"></span>
                    </label>
                </div>

                <div class="widget-toggle-row">
                    <div class="widget-toggle-info">
                        <strong>Calendar</strong>
                        <span>Monthly calendar and events</span>
                    </div>

                    <label class="widget-switch">
                        <input type="checkbox" data-widget="calendar">
                        <span class="widget-switch-track"></span>
                    </label>
                </div>

            </div>

        </div>


        <!-- THEME SELECTOR -->

        <div class="personalisation-group">

            <div class="personalisation-group-title">
                Choose your theme
            </div>

            <div class="theme-options">

                <button
                    type="button"
                    class="theme-option"
                    data-theme="dark"
                >
                    <span class="theme-preview preview-dark"></span>
                    Dark
                </button>

                <button
                    type="button"
                    class="theme-option"
                    data-theme="midnight"
                >
                    <span class="theme-preview preview-midnight"></span>
                    Midnight
                </button>

                <button
                    type="button"
                    class="theme-option"
                    data-theme="light"
                >
                    <span class="theme-preview preview-light"></span>
                    Light
                </button>

            </div>

        </div>


        <!-- ACCENT COLOURS -->

        <div class="personalisation-group">

            <div class="personalisation-group-title">
                Accent colour
            </div>

            <div class="accent-options" id="accentOptions">

                ${ACCENT_COLOURS.map(colour => `
                    <button
                        type="button"
                        class="accent-swatch"
                        data-accent="${colour.value}"
                        title="${colour.name}"
                        aria-label="${colour.name} accent"
                        style="background:${colour.value}"
                    ></button>
                `).join("")}

            </div>

            <div class="custom-accent-control">

                <label for="customAccent">
                    Choose custom colour
                </label>

                <input
                    type="color"
                    id="customAccent"
                    value="#a5b8ff"
                >

            </div>

        </div>


        <!-- LAYOUT DENSITY -->

        <div class="personalisation-group">

            <div class="personalisation-group-title">
                Dashboard spacing
            </div>

            <div class="density-options">

                <button
                    type="button"
                    class="density-option"
                    data-density="compact"
                >
                    Compact
                </button>

                <button
                    type="button"
                    class="density-option"
                    data-density="comfortable"
                >
                    Comfortable
                </button>

            </div>

        </div>


        <!-- RESET -->

        <div class="personalisation-footer">

            <span id="personalisationStatus">
                Your preferences are saved automatically.
            </span>

            <button
                type="button"
                id="resetPersonalisation"
                class="personalisation-reset"
            >
                Reset personalisation
            </button>

        </div>

    `;


    settingsContent.appendChild(panel);


    // ==========================================
    // 6. WIDGET ELEMENT MAPPING
    // ==========================================

    function getWidgetElements() {

        const weatherCalendar =
            document.querySelector(".weather-calendar-section");

        return {

            clock: document.querySelector(".greeting"),

            search: document.querySelector(".search-container"),

            shortcuts: document.querySelector(".shortcuts-section"),

            notes: document.querySelector(".notes-card"),

            todo: document.querySelector(".todo-card"),

            weather: weatherCalendar?.querySelector(
                ".weather-calendar-grid .wc-card:first-child"
            ),

            calendar: weatherCalendar?.querySelector(
                ".weather-calendar-grid .wc-card:last-child"
            )

        };

    }


    // ==========================================
    // 7. HEX TO RGB
    // ==========================================

    function hexToRgb(hex) {

        const clean = hex.replace("#", "");

        const number = parseInt(clean, 16);

        return [
            (number >> 16) & 255,
            (number >> 8) & 255,
            number & 255
        ].join(", ");

    }


    // ==========================================
    // 8. APPLY THEME
    // ==========================================

    function applyTheme() {

        document.body.dataset.theme = preferences.theme;

        document.body.dataset.density = preferences.density;

        document.documentElement.style.setProperty(
            "--mytab-accent",
            preferences.accent
        );

        document.documentElement.style.setProperty(
            "--mytab-accent-rgb",
            hexToRgb(preferences.accent)
        );

        panel.querySelectorAll("[data-theme]").forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.theme === preferences.theme
            );

        });

        panel.querySelectorAll("[data-density]").forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.density === preferences.density
            );

        });

        panel.querySelectorAll("[data-accent]").forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.accent.toLowerCase() ===
                    preferences.accent.toLowerCase()
            );

        });

        panel.querySelector("#customAccent").value =
            preferences.accent;

    }


    // ==========================================
    // 9. APPLY WIDGET VISIBILITY
    // ==========================================

    function applyWidgetVisibility() {

        const elements = getWidgetElements();

        Object.entries(preferences.widgets).forEach(([key, visible]) => {

            const element = elements[key];

            if (element) {

                element.hidden = visible === false;

            }

        });

        panel.querySelectorAll("[data-widget]").forEach(input => {

            input.checked =
                preferences.widgets[input.dataset.widget] !== false;

        });

    }


    // ==========================================
    // 10. SAVE PREFERENCES
    // ==========================================

    let saveTimer = null;

    const status =
        panel.querySelector("#personalisationStatus");


    async function savePreferences() {

        status.textContent = "Saving...";

        const saved = await storage.set({
            phase5Preferences: preferences
        });

        status.textContent = saved
            ? "Preferences saved automatically."
            : "Unable to save preferences.";

    }


    function scheduleSave() {

        clearTimeout(saveTimer);

        saveTimer = setTimeout(savePreferences, 250);

    }


    // ==========================================
    // 11. WIDGET SWITCHES
    // ==========================================

    panel.querySelectorAll("[data-widget]").forEach(input => {

        input.addEventListener("change", () => {

            preferences.widgets[input.dataset.widget] =
                input.checked;

            applyWidgetVisibility();

            scheduleSave();

        });

    });


    // ==========================================
    // 12. THEME BUTTONS
    // ==========================================

    panel.querySelectorAll("[data-theme]").forEach(button => {

        button.addEventListener("click", () => {

            preferences.theme = button.dataset.theme;

            applyTheme();

            scheduleSave();

        });

    });


    // ==========================================
    // 13. ACCENT COLOUR BUTTONS
    // ==========================================

    panel.querySelectorAll("[data-accent]").forEach(button => {

        button.addEventListener("click", () => {

            preferences.accent = button.dataset.accent;

            applyTheme();

            scheduleSave();

        });

    });


    // ==========================================
    // 14. CUSTOM ACCENT COLOUR
    // ==========================================

    const customAccent =
        panel.querySelector("#customAccent");

    customAccent.addEventListener("input", () => {

        preferences.accent = customAccent.value;

        applyTheme();

        scheduleSave();

    });


    // ==========================================
    // 15. LAYOUT DENSITY
    // ==========================================

    panel.querySelectorAll("[data-density]").forEach(button => {

        button.addEventListener("click", () => {

            preferences.density = button.dataset.density;

            applyTheme();

            scheduleSave();

        });

    });


    // ==========================================
    // 16. RESET PERSONALISATION
    // ==========================================

    panel.querySelector("#resetPersonalisation")
        .addEventListener("click", async () => {

            const confirmed = confirm(
                "Reset themes, colours, widget visibility and spacing to defaults?"
            );

            if (!confirmed) return;

            clearTimeout(saveTimer);

            preferences = {

                ...DEFAULT_PREFERENCES,

                widgets: {
                    ...DEFAULT_PREFERENCES.widgets
                }

            };

            applyTheme();

            applyWidgetVisibility();

            await savePreferences();

        });


    // ==========================================
    // 17. INITIALISE
    // ==========================================

    applyTheme();

    applyWidgetVisibility();


    console.log("MyTab Phase 5 loaded successfully.");

});
