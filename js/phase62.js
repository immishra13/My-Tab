document.addEventListener("DOMContentLoaded", async () => {
    // MYTAB PHASE 6.2 — CUSTOM BACKGROUND STUDIO
    const storage = window.MyTabStorage;
    if (!storage) {
        console.error("MyTab Phase 6.2: storage is unavailable.");
        return;
    }

    if (!document.querySelector("#phase62Stylesheet")) {
        const link = document.createElement("link");
        link.id = "phase62Stylesheet";
        link.rel = "stylesheet";
        link.href = "css/phase62.css";
        document.head.appendChild(link);
    }

    const defaults = {
        mode: "wallpaper",
        color1: "#283b66",
        color2: "#171d2d",
        angle: 135
    };

    let settings = { ...defaults };
    const saved = await storage.get("phase62Background");
    if (saved && typeof saved === "object") {
        settings = {
            mode: saved.mode === "gradient" ? "gradient" : "wallpaper",
            color1: /^#[0-9a-fA-F]{6}$/.test(saved.color1 || "") ? saved.color1 : defaults.color1,
            color2: /^#[0-9a-fA-F]{6}$/.test(saved.color2 || "") ? saved.color2 : defaults.color2,
            angle: Number.isFinite(Number(saved.angle)) ? Math.min(360, Math.max(0, Number(saved.angle))) : defaults.angle
        };
    }

    const settingsContent = document.querySelector("#settingsDialog .settings-content");
    if (!settingsContent) return;

    const presets = [
        { name: "Midnight", first: "#0f172a", second: "#312e81", angle: 135 },
        { name: "Ocean", first: "#082f49", second: "#0f766e", angle: 120 },
        { name: "Sunset", first: "#7c2d12", second: "#be185d", angle: 135 },
        { name: "Aurora", first: "#134e4a", second: "#4c1d95", angle: 145 },
        { name: "Graphite", first: "#111827", second: "#374151", angle: 160 },
        { name: "Peach", first: "#7c2d12", second: "#f59e0b", angle: 115 }
    ];

    const panel = document.createElement("section");
    panel.className = "setting-section mytab-gradient-studio";
    panel.innerHTML = `
        <div class="setting-title">
            <div>
                <h3>Custom Background Studio</h3>
                <p>Build a gradient that matches your mood.</p>
            </div>
            <span class="setting-icon">◒</span>
        </div>
        <div class="mytab-gradient-preview" id="mytabGradientPreview" aria-label="Gradient preview"></div>
        <div class="mytab-gradient-presets" id="mytabGradientPresets" aria-label="Gradient presets"></div>
        <div class="mytab-gradient-controls">
            <label class="mytab-gradient-colour">
                <span>First colour</span>
                <input type="color" id="mytabGradientColor1" value="#283b66">
            </label>
            <label class="mytab-gradient-colour">
                <span>Second colour</span>
                <input type="color" id="mytabGradientColor2" value="#171d2d">
            </label>
        </div>
        <div class="mytab-gradient-angle-row">
            <label for="mytabGradientAngle">Gradient angle</label>
            <output id="mytabGradientAngleValue">135°</output>
        </div>
        <input type="range" id="mytabGradientAngle" min="0" max="360" value="135" class="custom-slider mytab-gradient-angle">
        <div class="mytab-gradient-actions">
            <button type="button" class="primary-button" id="mytabApplyGradient">Use this gradient</button>
            <button type="button" class="text-button" id="mytabUseWallpaper">Use wallpaper / default</button>
        </div>
        <p class="mytab-gradient-note">Your uploaded wallpaper stays saved. Switching back restores it.</p>
    `;
    settingsContent.appendChild(panel);

    const color1 = panel.querySelector("#mytabGradientColor1");
    const color2 = panel.querySelector("#mytabGradientColor2");
    const angle = panel.querySelector("#mytabGradientAngle");
    const angleValue = panel.querySelector("#mytabGradientAngleValue");
    const preview = panel.querySelector("#mytabGradientPreview");
    const presetsContainer = panel.querySelector("#mytabGradientPresets");
    const wallpaperLayer = document.getElementById("wallpaperLayer");

    function gradientValue() {
        return `linear-gradient(${settings.angle}deg, ${settings.color1}, ${settings.color2})`;
    }

    function render() {
        color1.value = settings.color1;
        color2.value = settings.color2;
        angle.value = String(settings.angle);
        angleValue.textContent = `${settings.angle}°`;
        preview.style.background = gradientValue();
        document.body.classList.toggle("mytab-gradient-active", settings.mode === "gradient");
        if (settings.mode === "gradient") {
            document.body.style.backgroundImage = gradientValue();
            document.body.style.backgroundAttachment = "fixed";
            if (wallpaperLayer) wallpaperLayer.style.visibility = "hidden";
        } else {
            document.body.style.removeProperty("background-image");
            document.body.style.removeProperty("background-attachment");
            if (wallpaperLayer) wallpaperLayer.style.visibility = "";
        }
        panel.querySelectorAll(".mytab-gradient-preset").forEach(button => {
            const selected = button.dataset.preset === `${settings.color1}|${settings.color2}|${settings.angle}`;
            button.classList.toggle("is-selected", selected);
        });
    }

    async function save() {
        const ok = await storage.set({ phase62Background: { ...settings } });
        if (!ok) console.error("MyTab Phase 6.2: background settings could not be saved.");
    }

    function updateFromControls() {
        settings.color1 = color1.value;
        settings.color2 = color2.value;
        settings.angle = Number(angle.value);
        render();
    }

    presets.forEach((preset, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mytab-gradient-preset";
        button.dataset.preset = `${preset.first}|${preset.second}|${preset.angle}`;
        button.innerHTML = `<span class="mytab-preset-swatch" style="background:linear-gradient(${preset.angle}deg, ${preset.first}, ${preset.second})"></span><span>${preset.name}</span>`;
        button.addEventListener("click", async () => {
            settings.color1 = preset.first;
            settings.color2 = preset.second;
            settings.angle = preset.angle;
            settings.mode = "gradient";
            render();
            await save();
        });
        presetsContainer.appendChild(button);
    });

    [color1, color2, angle].forEach(input => {
        input.addEventListener("input", updateFromControls);
        input.addEventListener("change", async () => {
            updateFromControls();
            await save();
        });
    });

    panel.querySelector("#mytabApplyGradient").addEventListener("click", async () => {
        updateFromControls();
        settings.mode = "gradient";
        render();
        await save();
    });

    panel.querySelector("#mytabUseWallpaper").addEventListener("click", async () => {
        settings.mode = "wallpaper";
        render();
        await save();
    });

    render();
    console.info("MyTab Phase 6.2: Custom Background Studio is ready.");
});
