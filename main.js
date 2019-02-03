const currFrom = document.getElementById('curr-from');
const currTo = document.getElementById('curr-to');

fetch('https://free.currencyconverterapi.com/api/v6/currencies')
    .then(response => response.json())
    .then(data => {
        const dataArr = Object.entries(data.results);
        for (let i = 0; i < dataArr.length; i++) {
            currFrom.insertAdjacentHTML('beforeend',
            `<option value="${dataArr[i][1].id}">${dataArr[i][1].currencyName} - ${dataArr[i][1].id}</option>`);
            currTo.insertAdjacentHTML('beforeend',
            `<option value="${dataArr[i][1].id}">${dataArr[i][1].currencyName} - ${dataArr[i][1].id}</option>`);
        }
    })