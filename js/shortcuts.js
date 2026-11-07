
const DEFAULT_SHORTCUTS = [
    { name: "YouTube", url: "https://www.youtube.com" },
    { name: "Google", url: "https://www.google.com" },
    { name: "ChatGPT", url: "https://chatgpt.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "Instagram", url: "https://www.instagram.com" }
];

function getDomain(url) {
    return new URL(url).hostname;
}

function createIcon(site) {

    const icon = document.createElement("img");

    icon.className = "shortcut-icon";
    icon.alt = "";
    icon.loading = "lazy";

    const fallback = document.createElement("div");

    fallback.className = "fallback-icon";
    fallback.textContent = site.name.charAt(0).toUpperCase();

    icon.onerror = () => {
        if (icon.isConnected) {
            icon.replaceWith(fallback);
        }
    };

    icon.src = site.icon
        ? site.icon
        : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(getDomain(site.url))}&sz=128`;

    return icon;
}


function renderShortcuts(shortcuts, options = {}) {

    const container = document.getElementById("shortcutsContainer");

    const countElement = document.getElementById("shortcutCount");

    const limit = Number(options.limit ?? 6);

    container.replaceChildren();

    const indexedShortcuts = shortcuts.map((site, index) => ({
        site,
        originalIndex: index
    }));

    const visibleShortcuts = limit === 0
        ? indexedShortcuts
        : indexedShortcuts.slice(0, limit);

    countElement.textContent =
        `${shortcuts.length} ${shortcuts.length === 1 ? "website" : "websites"}`;


    visibleShortcuts.forEach(({ site, originalIndex }) => {

        const card = document.createElement("div");

        card.className = "shortcut-card";
        card.draggable = true;

        card.dataset.index = originalIndex;


        // WEBSITE LINK

        const link = document.createElement("a");

        link.className = "shortcut";
        link.href = site.url;
        link.title = site.name;

        const icon = createIcon(site);

        const label = document.createElement("span");

        label.textContent = site.name;

        link.appendChild(icon);
        link.appendChild(label);


        // EDIT BUTTON

        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "shortcut-action edit-action";
        editButton.textContent = "✎";
        editButton.title = "Edit shortcut";
        editButton.setAttribute("aria-label", `Edit ${site.name}`);

        editButton.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            options.onEdit?.(originalIndex);

        });


        // DELETE BUTTON

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "shortcut-action delete-action";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete shortcut";
        deleteButton.setAttribute("aria-label", `Delete ${site.name}`);

        deleteButton.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            options.onDelete?.(originalIndex);

        });


        // DRAG START

        card.addEventListener("dragstart", (event) => {

            card.classList.add("dragging");

            event.dataTransfer.effectAllowed = "move";

            event.dataTransfer.setData(
                "text/plain",
                String(originalIndex)
            );

        });


        // DRAG END

        card.addEventListener("dragend", () => {

            card.classList.remove("dragging");

            document.querySelectorAll(".shortcut-card").forEach(item => {
                item.classList.remove("drag-over");
            });

        });


        // DRAG OVER

        card.addEventListener("dragover", (event) => {

            event.preventDefault();

            event.dataTransfer.dropEffect = "move";

            card.classList.add("drag-over");

        });


        // DRAG LEAVE

        card.addEventListener("dragleave", () => {

            card.classList.remove("drag-over");

        });


        // DROP

        card.addEventListener("drop", (event) => {

            event.preventDefault();

            card.classList.remove("drag-over");

            const fromIndex = Number(
                event.dataTransfer.getData("text/plain")
            );

            const toIndex = originalIndex;

            if (
                Number.isInteger(fromIndex) &&
                fromIndex !== toIndex &&
                fromIndex >= 0 &&
                fromIndex < shortcuts.length
            ) {

                options.onReorder?.(fromIndex, toIndex);

            }

        });


        card.appendChild(link);
        card.appendChild(editButton);
        card.appendChild(deleteButton);

        container.appendChild(card);

    });


    // EMPTY STATE

    if (shortcuts.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-shortcuts";

        empty.textContent =
            "No websites yet. Click + Add to get started.";

        container.appendChild(empty);

    }


    // HINT

    const hint = document.getElementById("shortcutHint");

    if (hint) {

        hint.textContent = shortcuts.length > 1
            ? "Drag shortcuts to rearrange them."
            : "Add your favourite websites here.";

    }

}


window.MyTabShortcuts = {
    DEFAULT_SHORTCUTS,
    renderShortcuts
};
