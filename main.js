const currFromField = document.getElementById('curr-from');
const currToField = document.getElementById('curr-to');
const amountField = document.getElementById('amount');
const resultDiv = document.getElementById('result');
const currencyForm = document.getElementsByTagName('form')[0];
let currencyListIsLoaded = false;

function convertCurrency(amount, fromCurrency, toCurrency) {
    fromCurrency = encodeURIComponent(fromCurrency);
    toCurrency = encodeURIComponent(toCurrency);
    const query = `${fromCurrency}_${toCurrency}`;

    return fetch(`https://free.currconv.com/api/v7/convert?q=${query}&compact=ultra&apiKey=4947ee23b6d4b2082478`)
        .then(response => response.json())
        .then(data => {
            const val = data[query];
            const total = Math.round(val * amount * 100) / 100;
            return total;
        })
        .catch(err => {
            resultDiv.innerHTML = `<p class="error">An error was encountered while trying to convert currencies. ${err}</p>`;
        });
}

function updateReady(worker) {
    const result = confirm('New Version Available');

    if (!result) return;
    worker.postMessage({action: 'skipWaiting'});
}

function trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
        if (worker.state == 'installed') {
            updateReady(worker);
        }
    });
}

function registerServiceWorker() {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
            console.log('Service Worker registered successfully', reg);

            if (!navigator.serviceWorker.controller) return;

            if (reg.waiting) {
                updateReady(reg.waiting);
                return;
            }

            if (reg.installing) {
                trackInstalling(reg.installing);
                return;
            }

            reg.addEventListener('updatefound', () => {
                trackInstalling(reg.installing);
            });

            let refreshing;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                window.location.reload();
                refreshing = true;
            });
        })
        .catch((err) => {
            console.log('Registration failed', err);
        });
}

function openDatabase() {
    if (!navigator.serviceWorker) return Promise.resolve();

    return idb.openDb('currency-converter', 1, (upgradeDb) => {
        upgradeDb.createObjectStore('currencies', { keyPath: 'id' });
    });
}

const renderListItem = (item) => {
    if(resultDiv.innerHTML === '<p class="working">Loading currency lists...</p>') {
        resultDiv.innerHTML = '';
    }
    currFromField.insertAdjacentHTML('beforeend',
    `<option value="${item.id}">${item.currencyName} - ${item.id}</option>`);
    currToField.insertAdjacentHTML('beforeend',
    `<option value="${item.id}">${item.currencyName} - ${item.id}</option>`);
};

const renderCurrencyList = (data) => {
    const dataArr = Object.entries(data.results);
    dataArr.sort();
    openDatabase().then((db) => {
        if (!db) return;

        const tx = db.transaction('currencies', 'readwrite');
        const store = tx.objectStore('currencies');
        store.clear();
        currFromField.innerHTML = '';
        currToField.innerHTML = '';
        for (let i = 0; i < dataArr.length; i++) {
            store.put(dataArr[i][1]);
            renderListItem(dataArr[i][1]);
        }
        return tx.complete;
    });
}

const renderCurrencyListFromDb = () => {
    openDatabase().then((db) => {
        if (!db || currFromField.innerHTML || currToField.innerHTML) return;

        const store = db.transaction('currencies').objectStore('currencies');
        return store.getAll().then((currencies) => {
            resultDiv.innerHTML = '';
            currencies.forEach((currency) => {
                renderListItem(currency);
            });
            currencyListIsLoaded = true;
        });
    });
};

const renderConversionResult = (result, amount, currFrom, currTo) => {
    if(result !== undefined) {
        resultDiv.innerHTML = `<p class="success"><strong>${amount.toLocaleString()} ${currFrom}</strong> equals <strong>${result.toLocaleString()} ${currTo}</strong></p>`;
    } else {
        resultDiv.innerHTML = `<p class="error">Failed to get conversion rate</p>`;
    }
}

// Work starts here

resultDiv.innerHTML = '<p class="working">Loading currency lists...</p>';

registerServiceWorker();
renderCurrencyListFromDb();

fetch('https://free.currconv.com/api/v7/currencies?apiKey=4947ee23b6d4b2082478')
    .then(response => response.json())
    .then(renderCurrencyList)
    .catch(err => {
        setTimeout(() => {
            if (!currencyListIsLoaded) {
                resultDiv.innerHTML = `<p class="error">An error was encountered while trying to get currency list. ${err}</p>`;
            }
        }, 3000);
    });

currencyForm.addEventListener('submit', function(event) {
    const amount = amountField.value;
    const currFrom = currFromField.value;
    const currTo = currToField.value;
    amountField.value = '';

    resultDiv.innerHTML = `<p class="working">Converting...</p>`;

    event.preventDefault();
    convertCurrency(Number(amount), currFrom, currTo)
        .then((result) => {
            renderConversionResult(result, Number(amount), currFrom, currTo);
        })
        .catch(err => {
            resultDiv.innerHTML = `<p class="error">An error was encountered while trying to convert currencies. ${err}</p>`;
        })
});

amountField.addEventListener('focus', function() {
    resultDiv.innerHTML = '';
});
