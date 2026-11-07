
document.addEventListener("DOMContentLoaded", async () => {

    // ==========================================
    // MYTAB PHASE 4
    // SEARCH ENGINE + NOTES + TODO
    // ==========================================

    const storage = window.MyTabStorage;


    // ==========================================
    // 1. SEARCH ENGINE SELECTOR
    // ==========================================

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const searchEngine = document.getElementById("searchEngine");

    const SEARCH_ENGINES = {
        google: "https://www.google.com/search?q=",
        bing: "https://www.bing.com/search?q=",
        duckduckgo: "https://duckduckgo.com/?q=",
        yahoo: "https://search.yahoo.com/search?p="
    };


    const savedEngine = await storage.get("searchEngine");

    if (SEARCH_ENGINES[savedEngine]) {
        searchEngine.value = savedEngine;
    }


    searchEngine.addEventListener("change", async () => {

        await storage.set({
            searchEngine: searchEngine.value
        });

    });


    // Capture the submit event before the existing Phase 1 handler.
    searchForm.addEventListener("submit", (event) => {

        event.preventDefault();
        event.stopImmediatePropagation();

        const query = searchInput.value.trim();

        if (!query) return;

        const selectedEngine = SEARCH_ENGINES[searchEngine.value]
            ? searchEngine.value
            : "google";

        const destination =
            SEARCH_ENGINES[selectedEngine] +
            encodeURIComponent(query);

        window.location.assign(destination);

    }, true);


    // ==========================================
    // 2. QUICK NOTES
    // ==========================================

    const notesInput = document.getElementById("quickNotes");
    const notesStatus = document.getElementById("notesStatus");
    const notesCount = document.getElementById("notesCount");

    let notesSaveTimer = null;


    function updateNotesCount() {

        notesCount.textContent =
            `${notesInput.value.length} / 10000`;

    }


    const savedNotes = await storage.get("quickNotes");

    if (typeof savedNotes === "string") {

        notesInput.value = savedNotes;

    }

    updateNotesCount();


    notesInput.addEventListener("input", () => {

        updateNotesCount();

        notesStatus.textContent = "Saving...";

        clearTimeout(notesSaveTimer);

        notesSaveTimer = setTimeout(async () => {

            const saved = await storage.set({
                quickNotes: notesInput.value
            });

            notesStatus.textContent = saved
                ? "Saved"
                : "Save failed";

        }, 500);

    });


    // Save pending notes when the page is being hidden.
    document.addEventListener("visibilitychange", () => {

        if (document.visibilityState === "hidden") {

            clearTimeout(notesSaveTimer);

            storage.set({
                quickNotes: notesInput.value
            });

        }

    });


    // ==========================================
    // 3. TODO ELEMENTS
    // ==========================================

    const todoForm = document.getElementById("todoForm");
    const todoInput = document.getElementById("todoInput");
    const todoList = document.getElementById("todoList");

    const todoCount = document.getElementById("todoCount");
    const todoProgress = document.getElementById("todoProgress");

    const clearCompletedButton =
        document.getElementById("clearCompleted");


    let tasks = [];


    // ==========================================
    // 4. LOAD SAVED TASKS
    // ==========================================

    const savedTasks = await storage.get("todoTasks");

    if (Array.isArray(savedTasks)) {

        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );

    }


    // ==========================================
    // 5. SAVE TASKS
    // ==========================================

    async function saveTasks() {

        const saved = await storage.set({
            todoTasks: tasks
        });

        if (!saved) {
            console.error("Could not save todo tasks.");
        }

        return saved;

    }


    // ==========================================
    // 6. RENDER TASKS
    // ==========================================

    function renderTasks() {

        todoList.replaceChildren();

        const completedCount = tasks.filter(
            task => task.completed
        ).length;

        const pendingCount = tasks.length - completedCount;

        todoCount.textContent =
            `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;


        if (tasks.length === 0) {

            const empty = document.createElement("div");

            empty.className = "todo-empty";

            empty.textContent =
                "Nothing on your list. Add your first task!";

            todoList.appendChild(empty);

            todoProgress.textContent = "No tasks yet";

        } else {

            tasks.forEach(task => {

                const item = document.createElement("div");

                item.className = task.completed
                    ? "todo-item completed"
                    : "todo-item";


                // Checkbox

                const checkbox = document.createElement("input");

                checkbox.type = "checkbox";
                checkbox.checked = task.completed;

                checkbox.setAttribute(
                    "aria-label",
                    `Mark ${task.text} as ${task.completed ? "pending" : "completed"}`
                );

                checkbox.addEventListener("change", async () => {

                    task.completed = checkbox.checked;

                    const saved = await saveTasks();

                    if (!saved) {
                        task.completed = !checkbox.checked;
                    }

                    renderTasks();

                });


                // Task text

                const text = document.createElement("span");

                text.className = "todo-text";
                text.textContent = task.text;


                // Delete button

                const deleteButton = document.createElement("button");

                deleteButton.type = "button";
                deleteButton.className = "todo-delete";

                deleteButton.textContent = "×";
                deleteButton.title = "Delete task";

                deleteButton.setAttribute(
                    "aria-label",
                    `Delete ${task.text}`
                );

                deleteButton.addEventListener("click", async () => {

                    const oldTasks = [...tasks];

                    tasks = tasks.filter(
                        item => item.id !== task.id
                    );

                    const saved = await saveTasks();

                    if (!saved) {
                        tasks = oldTasks;
                    }

                    renderTasks();

                });


                item.appendChild(checkbox);
                item.appendChild(text);
                item.appendChild(deleteButton);

                todoList.appendChild(item);

            });


            todoProgress.textContent =
                `${pendingCount} pending · ${completedCount} completed`;

        }


        clearCompletedButton.disabled = completedCount === 0;

    }


    // ==========================================
    // 7. ADD NEW TASK
    // ==========================================

    todoForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const text = todoInput.value.trim();

        if (!text) return;

        if (tasks.length >= 100) {

            alert("You can keep up to 100 tasks.");

            return;

        }

        const newTask = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: Date.now()
        };

        tasks.push(newTask);

        const saved = await saveTasks();

        if (!saved) {

            tasks.pop();

            alert("Could not save your task.");

            return;

        }

        todoInput.value = "";

        renderTasks();

        todoInput.focus();

    });


    // ==========================================
    // 8. CLEAR COMPLETED TASKS
    // ==========================================

    clearCompletedButton.addEventListener("click", async () => {

        const oldTasks = [...tasks];

        tasks = tasks.filter(task => !task.completed);

        const saved = await saveTasks();

        if (!saved) {

            tasks = oldTasks;

            alert("Could not clear completed tasks.");

        }

        renderTasks();

    });


    // ==========================================
    // 9. INITIAL RENDER
    // ==========================================

    renderTasks();


    console.log("MyTab Phase 4 loaded successfully.");

});
