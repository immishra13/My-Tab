
const MyTabStorage = {

    async get(key) {
        try {
            const result = await chrome.storage.local.get(key);
            return result[key];

        } catch (error) {
            console.error("Storage read error:", error);
            return undefined;
        }
    },

    async set(data) {
        try {
            await chrome.storage.local.set(data);
            return true;

        } catch (error) {
            console.error("Storage save error:", error);
            return false;
        }
    }

};


// IndexedDB wallpaper storage

const MyTabWallpaper = {

    dbName: "MyTabDatabase",
    storeName: "wallpapers",

    async openDatabase() {

        return new Promise((resolve, reject) => {

            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {

                const db = event.target.result;

                if (!db.objectStoreNames.contains(this.storeName)) {

                    db.createObjectStore(this.storeName);

                }

            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };

        });

    },

    async save(imageBlob) {

        const db = await this.openDatabase();

        return new Promise((resolve, reject) => {

            const transaction = db.transaction(
                this.storeName,
                "readwrite"
            );

            const store = transaction.objectStore(this.storeName);

            store.put(imageBlob, "customWallpaper");

            transaction.oncomplete = () => {
                db.close();
                resolve(true);
            };

            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };

            transaction.onabort = () => {
                db.close();
                reject(transaction.error);
            };

        });

    },

    async get() {

        const db = await this.openDatabase();

        return new Promise((resolve, reject) => {

            const transaction = db.transaction(
                this.storeName,
                "readonly"
            );

            const request = transaction
                .objectStore(this.storeName)
                .get("customWallpaper");

            request.onsuccess = () => {
                const result = request.result || null;
                db.close();
                resolve(result);
            };

            request.onerror = () => {
                db.close();
                reject(request.error);
            };

        });

    },

    async remove() {

        const db = await this.openDatabase();

        return new Promise((resolve, reject) => {

            const transaction = db.transaction(
                this.storeName,
                "readwrite"
            );

            transaction
                .objectStore(this.storeName)
                .delete("customWallpaper");

            transaction.oncomplete = () => {
                db.close();
                resolve(true);
            };

            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };

        });

    }

};


window.MyTabStorage = MyTabStorage;
window.MyTabWallpaper = MyTabWallpaper;
