document.addEventListener("DOMContentLoaded", async () => {
    // ==========================================
    // MYTAB PHASE 6.1 - DRAG & DROP LAYOUT
    // ==========================================

    const storage = window.MyTabStorage;
    if (!storage) {
        console.error("MyTab Phase 6: storage is unavailable.");
        return;
    }

    if (!document.querySelector("#phase6Stylesheet")) {
        const stylesheet = document.createElement("link");
        stylesheet.id = "phase6Stylesheet";
        stylesheet.rel = "stylesheet";
        stylesheet.href = "css/phase6.css";
        document.head.appendChild(stylesheet);
    }

    const zones = [
        {
            id: "hero",
            selector: ".hero",
            items: [
                ["clock", ".greeting"],
                ["search", ".search-container"],
                ["shortcuts", ".shortcuts-section"],
                ["productivity", "#productivitySection"],
                ["weatherCalendar", ".weather-calendar-section"]
            ]
        },
        {
            id: "productivity",
            selector: ".productivity-grid",
            items: [
                ["notes", ".notes-card"],
                ["todo", ".todo-card"]
            ]
        },
        {
            id: "weatherCalendar",
            selector: ".weather-calendar-grid",
            items: [
                ["weather", ".wc-card:first-child"],
                ["calendar", ".wc-card:last-child"]
            ]
        }
    ];

    const saved = await storage.get("phase6Layout");
    const layout = saved && typeof saved === "object" ? saved : {};
    let draggedItem = null;
    let draggedZone = null;

    function getZoneItems(zone) {
        const parent = document.querySelector(zone.selector);
        if (!parent) return [];
        return zone.items
            .map(([id, selector]) => {
                const element = parent.querySelector(selector);
                if (!element || element.parentElement !== parent) return null;
                return { id, element };
            })
            .filter(Boolean);
    }

    function saveLayout() {
        const current = {};
        zones.forEach(zone => {
            current[zone.id] = getZoneItems(zone).map(item => item.id);
        });
        storage.set({ phase6Layout: current }).catch(error => {
            console.error("MyTab Phase 6: unable to save layout.", error);
        });
    }

    function restoreLayout() {
        zones.forEach(zone => {
            const items = getZoneItems(zone);
            const order = Array.isArray(layout[zone.id]) ? layout[zone.id] : [];
            const parent = document.querySelector(zone.selector);
            if (!parent || !order.length) return;

            order.forEach(id => {
                const item = items.find(entry => entry.id === id);
                if (item) parent.appendChild(item.element);
            });
        });
    }

    function addHandle(item, zone) {
        const { id, element } = item;
        if (element.querySelector(":scope > .mytab-drag-handle")) return;

        element.classList.add("mytab-sortable-item");
        element.dataset.mytabLayoutId = id;

        const handle = document.createElement("button");
        handle.type = "button";
        handle.className = "mytab-drag-handle";
        handle.textContent = "⠿";
        handle.title = "Drag to rearrange";
        handle.setAttribute("aria-label", `Drag to rearrange ${id}`);
        handle.draggable = true;

        handle.addEventListener("dragstart", event => {
            draggedItem = element;
            draggedZone = zone.id;
            element.classList.add("mytab-is-dragging");
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", id);
        });

        handle.addEventListener("dragend", () => {
            document.querySelectorAll(".mytab-sortable-item").forEach(node => {
                node.classList.remove("mytab-is-dragging", "mytab-drop-target");
            });
            draggedItem = null;
            draggedZone = null;
        });

        element.addEventListener("dragover", event => {
            if (!draggedItem || draggedZone !== zone.id || draggedItem === element) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            element.classList.add("mytab-drop-target");
        });

        element.addEventListener("dragleave", event => {
            if (!element.contains(event.relatedTarget)) {
                element.classList.remove("mytab-drop-target");
            }
        });

        element.addEventListener("drop", event => {
            if (!draggedItem || draggedZone !== zone.id || draggedItem === element) return;
            event.preventDefault();
            event.stopPropagation();

            const rect = element.getBoundingClientRect();
            const isGrid = zone.id !== "hero";
            const insertAfter = isGrid
                ? event.clientX > rect.left + rect.width / 2
                : event.clientY > rect.top + rect.height / 2;

            const parent = element.parentElement;
            if (insertAfter) {
                parent.insertBefore(draggedItem, element.nextSibling);
            } else {
                parent.insertBefore(draggedItem, element);
            }

            element.classList.remove("mytab-drop-target");
            document.querySelectorAll(".mytab-sortable-item").forEach(node => {
                node.classList.remove("mytab-drop-target", "mytab-is-dragging");
            });
            draggedItem = null;
            draggedZone = null;
            saveLayout();
        });

        element.insertBefore(handle, element.firstChild);
    }

    // Phase 4.2 creates the weather/calendar zone before this script runs.
    restoreLayout();
    zones.forEach(zone => getZoneItems(zone).forEach(item => addHandle(item, zone)));

    const settingsContent = document.querySelector("#settingsDialog .settings-content");
    if (settingsContent) {
        const help = document.createElement("div");
        help.className = "mytab-layout-help";
        help.innerHTML = `
            <span class="mytab-layout-help-icon">⠿</span>
            <div>
                <strong>Rearrange your dashboard</strong>
                <p>Drag the dotted handle on a section or card to change its position. Your layout is saved automatically.</p>
            </div>
        `;
        const phase5Panel = settingsContent.querySelector(".personalisation-section");
        if (phase5Panel) phase5Panel.insertAdjacentElement("afterend", help);
        else settingsContent.appendChild(help);
    }

    console.info("MyTab Phase 6.1: drag-and-drop layout is ready.");
});
