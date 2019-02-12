const currFromField = document.getElementById('curr-from');
const currToField = document.getElementById('curr-to');
const amountField = document.getElementById('amount');
const resultDiv = document.getElementById('result');
const currencyForm = document.getElementsByTagName('form')[0];

function convertCurrency(amount, fromCurrency, toCurrency) {
    fromCurrency = encodeURIComponent(fromCurrency);
    toCurrency = encodeURIComponent(toCurrency);
    const query = `${fromCurrency}_${toCurrency}`;

    return fetch(`https://free.currencyconverterapi.com/api/v6/convert?q=${query}&compact=ultra`)
        .then(response => response.json())
        .then(data => {
            const val = data[query];
            const total = Math.round(val * amount * 100) / 100;
            return total;
        })
        .catch(err => {
            console.log(err);
        });
}

function registerServiceWorker() {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
            console.log('Service Worker registered successfully', reg);
        })
        .catch((err) => {
            console.log('Registration failed', err);
        });
}

registerServiceWorker();

fetch('https://free.currencyconverterapi.com/api/v6/currencies')
    .then(response => response.json())
    .then(data => {
        const dataArr = Object.entries(data.results);
        dataArr.sort();
        for (let i = 0; i < dataArr.length; i++) {
            currFromField.insertAdjacentHTML('beforeend',
            `<option value="${dataArr[i][1].id}">${dataArr[i][1].currencyName} - ${dataArr[i][1].id}</option>`);
            currToField.insertAdjacentHTML('beforeend',
            `<option value="${dataArr[i][1].id}">${dataArr[i][1].currencyName} - ${dataArr[i][1].id}</option>`);
        }
    })
    .catch(err => {
        resultDiv.innerHTML = `<p class="error">An error was encountered while trying to get currency list. ${err}</p>`;
    });

currencyForm.addEventListener('submit', function(event) {
    const amount = amountField.value;
    const currFrom = currFromField.value;
    const currTo = currToField.value;
    amountField.value = '';

    resultDiv.innerHTML = `<p class="working">Converting...</p>`;

    event.preventDefault();
    convertCurrency(Number(amount), currFrom, currTo)
        .then(result => {
            if(result !== undefined) {
                resultDiv.innerHTML = `<p class="success">${amount} ${currFrom} equals ${result} ${currTo}</p>`;
            } else {
                resultDiv.innerHTML = `<p class="error">Failed to get conversion rate</p>`;
            }
        })
        .catch(err => {
            resultDiv.innerHTML = `<p class="error">An error was encountered while trying to convert currencies. ${err}</p>`;
        })
});

amountField.addEventListener('focus', function() {
    resultDiv.innerHTML = '';
});
