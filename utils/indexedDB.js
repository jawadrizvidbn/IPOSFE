export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('myDatabase', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Change the keyPath to 'StockCode'
            db.createObjectStore('products', { keyPath: 'StockCode' });
        };

        request.onerror = (event) => {
            reject('Database error: ' + event.target.errorCode);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
};
