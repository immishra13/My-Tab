
document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // 1. ELEMENTS
    // ==========================================

    const clock = document.getElementById("clock");
    const date = document.getElementById("date");
    const greeting = document.getElementById("greetingText");

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    const addButton = document.getElementById("addShortcutButton");
    const shortcutDialog = document.getElementById("shortcutDialog");
    const shortcutForm = document.getElementById("shortcutForm");
    const cancelButton = document.getElementById("cancelShortcut");

    const shortcutDialogTitle = document.getElementById("shortcutDialogTitle");
    const saveShortcutButton = document.getElementById("saveShortcutButton");

    const siteNameInput = document.getElementById("siteName");
    const siteUrlInput = document.getElementById("siteUrl");
    const siteIconInput = document.getElementById("siteIcon");

    const shortcutLimit = document.getElementById("shortcutLimit");

    const settingsButton = document.getElementById("settingsButton");
    const settingsDialog = document.getElementById("settingsDialog");
    const closeSettings = document.getElementById("closeSettings");

    const wallpaperLayer = document.getElementById("wallpaperLayer");
    const backgroundOverlay = document.getElementById("backgroundOverlay");

    const wallpaperInput = document.getElementById("wallpaperInput");
    const wallpaperStatus = document.getElementById("wallpaperStatus");
    const removeWallpaper = document.getElementById("removeWallpaper");

    const brightnessSlider = document.getElementById("brightnessSlider");
    const blurSlider = document.getElementById("blurSlider");
    const overlaySlider = document.getElementById("overlaySlider");

    const brightnessValue = document.getElementById("brightnessValue");
    const blurValue = document.getElementById("blurValue");
    const overlayValue = document.getElementById("overlayValue");

    const resetSettings = document.getElementById("resetSettings");


    // ==========================================
    // 2. DEFAULT DATA
    // ==========================================

    const DEFAULT_SETTINGS = {
        brightness: 100,
        blur: 0,
        overlay: 22
    };

    let settings = { ...DEFAULT_SETTINGS };

    let wallpaperObjectURL = null;

    let shortcuts = [];

    let editingIndex = null;

    let shortcutLimitValue = 6;


    // ==========================================
    // 3. CLOCK
    // ==========================================

    function updateClock() {

        const now = new Date();

        clock.textContent = now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

        date.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        const hour = now.getHours();

        if (hour < 12) {
            greeting.textContent = "Good morning";
        } else if (hour < 17) {
            greeting.textContent = "Good afternoon";
        } else {
            greeting.textContent = "Good evening";
        }

    }

    updateClock();
    setInterval(updateClock, 1000);


    // ==========================================
    // 4. GOOGLE SEARCH
    // ==========================================

    searchForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const query = searchInput.value.trim();

        if (!query) return;

        const searchUrl =
            "https://www.google.com/search?q=" +
            encodeURIComponent(query);

        window.location.href = searchUrl;

    });


    // ==========================================
    // 5. SHORTCUT STORAGE
    // ==========================================

    const savedShortcuts = await MyTabStorage.get("shortcuts");

    if (Array.isArray(savedShortcuts)) {

        shortcuts = savedShortcuts;

    } else {

        shortcuts = MyTabShortcuts.DEFAULT_SHORTCUTS.map(site => ({
            ...site
        }));

        await MyTabStorage.set({ shortcuts });

    }


    // ==========================================
    // 6. SHORTCUT LIMIT
    // ==========================================

    const savedLimit = await MyTabStorage.get("shortcutLimit");

    if ([6, 8, 12, 0].includes(Number(savedLimit))) {

        shortcutLimitValue = Number(savedLimit);

    }

    shortcutLimit.value = String(shortcutLimitValue);


    shortcutLimit.addEventListener("change", async () => {

        shortcutLimitValue = Number(shortcutLimit.value);

        await MyTabStorage.set({
            shortcutLimit: shortcutLimitValue
        });

        renderAllShortcuts();

    });


    // ==========================================
    // 7. RENDER SHORTCUTS
    // ==========================================

    function renderAllShortcuts() {

        MyTabShortcuts.renderShortcuts(shortcuts, {

            limit: shortcutLimitValue,

            onEdit: (index) => {

                openEditDialog(index);

            },

            onDelete: (index) => {

                deleteShortcut(index);

            },

            onReorder: (fromIndex, toIndex) => {

                reorderShortcuts(fromIndex, toIndex);

            }

        });

    }

    renderAllShortcuts();


    // ==========================================
    // 8. OPEN ADD DIALOG
    // ==========================================

    function openAddDialog() {

        editingIndex = null;

        shortcutForm.reset();

        shortcutDialogTitle.textContent = "Add a website";

        saveShortcutButton.textContent = "Add website";

        shortcutDialog.showModal();

        siteNameInput.focus();

    }

    addButton.addEventListener("click", openAddDialog);


    // ==========================================
    // 9. OPEN EDIT DIALOG
    // ==========================================

    function openEditDialog(index) {

        const site = shortcuts[index];

        if (!site) return;

        editingIndex = index;

        siteNameInput.value = site.name;
        siteUrlInput.value = site.url;
        siteIconInput.value = site.icon || "";

        shortcutDialogTitle.textContent = "Edit website";

        saveShortcutButton.textContent = "Save changes";

        shortcutDialog.showModal();

        siteNameInput.focus();

    }


    // ==========================================
    // 10. CLOSE DIALOG
    // ==========================================

    function closeShortcutDialog() {

        shortcutDialog.close();

        shortcutForm.reset();

        editingIndex = null;

    }

    cancelButton.addEventListener("click", closeShortcutDialog);


    // ==========================================
    // 11. VALIDATE WEBSITE URL
    // ==========================================

    function validateWebsiteUrl(value) {

        let url = value.trim();

        if (!/^https?:\/\//i.test(url)) {

            url = "https://" + url;

        }

        const parsed = new URL(url);

        if (!["http:", "https:"].includes(parsed.protocol)) {

            throw new Error("Only HTTP and HTTPS websites are allowed.");

        }

        if (!parsed.hostname.includes(".")) {

            throw new Error("Enter a valid website address.");

        }

        if (parsed.username || parsed.password) {

            throw new Error("Website URLs containing credentials are not allowed.");

        }

        return parsed.href;

    }


    function validateIconUrl(value) {

        if (!value.trim()) return "";

        const parsed = new URL(value.trim());

        if (!["http:", "https:"].includes(parsed.protocol)) {

            throw new Error("Icon URL must use HTTP or HTTPS.");

        }

        return parsed.href;

    }


    // ==========================================
    // 12. ADD OR UPDATE SHORTCUT
    // ==========================================

    shortcutForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = siteNameInput.value.trim();

        if (!name) return;

        let url;
        let icon;

        try {

            url = validateWebsiteUrl(siteUrlInput.value);

            icon = validateIconUrl(siteIconInput.value);

        } catch (error) {

            alert(error.message || "Please enter valid details.");

            return;

        }


        const duplicateIndex = shortcuts.findIndex(
            (site, index) =>
                site.url === url && index !== editingIndex
        );

        if (duplicateIndex !== -1) {

            alert("This website is already added.");

            return;

        }


        const shortcutData = {
            name,
            url,
            icon
        };


        if (editingIndex !== null) {

            const previousSite = shortcuts[editingIndex];

            shortcuts[editingIndex] = shortcutData;

            const saved = await MyTabStorage.set({ shortcuts });

            if (!saved) {

                shortcuts[editingIndex] = previousSite;

                alert("Could not save changes.");

                return;

            }

        } else {

            shortcuts.push(shortcutData);

            const saved = await MyTabStorage.set({ shortcuts });

            if (!saved) {

                shortcuts.pop();

                alert("Could not save this website.");

                return;

            }

        }


        renderAllShortcuts();

        closeShortcutDialog();

    });


    // ==========================================
    // 13. DELETE SHORTCUT
    // ==========================================

    async function deleteShortcut(index) {

        const site = shortcuts[index];

        if (!site) return;

        const confirmed = confirm(
            `Remove ${site.name} from your shortcuts?`
        );

        if (!confirmed) return;

        const removedSite = shortcuts.splice(index, 1)[0];

        const saved = await MyTabStorage.set({ shortcuts });

        if (!saved) {

            shortcuts.splice(index, 0, removedSite);

            alert("Could not delete shortcut.");

            return;

        }

        renderAllShortcuts();

    }


    // ==========================================
    // 14. REORDER SHORTCUTS
    // ==========================================

    async function reorderShortcuts(fromIndex, toIndex) {

        if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= shortcuts.length ||
            toIndex >= shortcuts.length ||
            fromIndex === toIndex
        ) {

            return;

        }

        const previousOrder = [...shortcuts];

        const movedItem = shortcuts.splice(fromIndex, 1)[0];

        shortcuts.splice(toIndex, 0, movedItem);

        const saved = await MyTabStorage.set({ shortcuts });

        if (!saved) {

            shortcuts = previousOrder;

            alert("Could not save the new shortcut order.");

        }

        renderAllShortcuts();

    }


    // ==========================================
    // 15. APPEARANCE SETTINGS
    // ==========================================

    function applySettings() {

        wallpaperLayer.style.filter =
            `brightness(${settings.brightness}%) blur(${settings.blur}px)`;

        backgroundOverlay.style.background =
            `rgba(5, 8, 16, ${settings.overlay / 100})`;

        brightnessSlider.value = settings.brightness;
        blurSlider.value = settings.blur;
        overlaySlider.value = settings.overlay;

        brightnessValue.textContent =
            settings.brightness + "%";

        blurValue.textContent =
            settings.blur + " px";

        overlayValue.textContent =
            settings.overlay + "%";

    }


    async function saveSettings() {

        const saved = await MyTabStorage.set({
            appearanceSettings: settings
        });

        if (!saved) {

            wallpaperStatus.textContent =
                "Settings could not be saved";

        }

    }


    // ==========================================
    // 16. LOAD APPEARANCE SETTINGS
    // ==========================================

    const savedSettings =
        await MyTabStorage.get("appearanceSettings");

    if (savedSettings && typeof savedSettings === "object") {

        settings = {
            brightness: Math.min(
                150,
                Math.max(30,
                    Number(savedSettings.brightness ?? 100)
                )
            ),

            blur: Math.min(
                15,
                Math.max(0,
                    Number(savedSettings.blur ?? 0)
                )
            ),

            overlay: Math.min(
                85,
                Math.max(0,
                    Number(savedSettings.overlay ?? 22)
                )
            )
        };

    }

    applySettings();


    // ==========================================
    // 17. LOAD WALLPAPER
    // ==========================================

    async function loadWallpaper() {

        try {

            const savedImage = await MyTabWallpaper.get();

            if (!savedImage) {

                wallpaperStatus.textContent =
                    "Default background active";

                return;

            }

            if (wallpaperObjectURL) {

                URL.revokeObjectURL(wallpaperObjectURL);

            }

            wallpaperObjectURL =
                URL.createObjectURL(savedImage);

            wallpaperLayer.style.backgroundImage =
                `url("${wallpaperObjectURL}")`;

            wallpaperStatus.textContent =
                "Custom wallpaper active";

        } catch (error) {

            console.error("Wallpaper loading failed:", error);

            wallpaperStatus.textContent =
                "Could not load wallpaper";

        }

    }

    await loadWallpaper();


    // ==========================================
    // 18. UPLOAD WALLPAPER
    // ==========================================

    wallpaperInput.addEventListener("change", async (event) => {

        const file = event.target.files[0];

        if (!file) return;

        if (
            !["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ) {

            alert("Please select a JPG, PNG or WEBP image.");

            wallpaperInput.value = "";

            return;

        }

        if (file.size > 10 * 1024 * 1024) {

            alert("Image size must be below 10 MB.");

            wallpaperInput.value = "";

            return;

        }

        try {

            wallpaperStatus.textContent = "Saving wallpaper...";

            await MyTabWallpaper.save(file);

            if (wallpaperObjectURL) {

                URL.revokeObjectURL(wallpaperObjectURL);

            }

            wallpaperObjectURL = URL.createObjectURL(file);

            wallpaperLayer.style.backgroundImage =
                `url("${wallpaperObjectURL}")`;

            wallpaperStatus.textContent =
                "Custom wallpaper active";

        } catch (error) {

            console.error("Wallpaper upload failed:", error);

            wallpaperStatus.textContent = "Upload failed";

            alert("Could not save wallpaper. Please try another image.");

        }

        wallpaperInput.value = "";

    });


    // ==========================================
    // 19. REMOVE WALLPAPER
    // ==========================================

    removeWallpaper.addEventListener("click", async () => {

        try {

            await MyTabWallpaper.remove();

            wallpaperLayer.style.backgroundImage = "none";

            if (wallpaperObjectURL) {

                URL.revokeObjectURL(wallpaperObjectURL);

                wallpaperObjectURL = null;

            }

            wallpaperStatus.textContent =
                "Default background active";

        } catch (error) {

            console.error("Wallpaper removal failed:", error);

            alert("Could not remove wallpaper.");

        }

    });


    // ==========================================
    // 20. BRIGHTNESS
    // ==========================================

    brightnessSlider.addEventListener("input", () => {

        settings.brightness = Number(brightnessSlider.value);

        applySettings();

    });

    brightnessSlider.addEventListener("change", saveSettings);


    // ==========================================
    // 21. BLUR
    // ==========================================

    blurSlider.addEventListener("input", () => {

        settings.blur = Number(blurSlider.value);

        applySettings();

    });

    blurSlider.addEventListener("change", saveSettings);


    // ==========================================
    // 22. DARK OVERLAY
    // ==========================================

    overlaySlider.addEventListener("input", () => {

        settings.overlay = Number(overlaySlider.value);

        applySettings();

    });

    overlaySlider.addEventListener("change", saveSettings);


    // ==========================================
    // 23. RESET APPEARANCE
    // ==========================================

    resetSettings.addEventListener("click", async () => {

        settings = { ...DEFAULT_SETTINGS };

        applySettings();

        await saveSettings();

    });


    // ==========================================
    // 24. SETTINGS DIALOG
    // ==========================================

    settingsButton.addEventListener("click", () => {

        settingsDialog.showModal();

    });

    closeSettings.addEventListener("click", () => {

        settingsDialog.close();

    });


    // ==========================================
    // 25. KEYBOARD SEARCH
    // ==========================================

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "/" &&
            document.activeElement !== searchInput &&
            !["INPUT", "TEXTAREA", "SELECT"].includes(
                document.activeElement.tagName
            )
        ) {

            event.preventDefault();

            searchInput.focus();

        }

    });

});
