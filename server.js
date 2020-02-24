const express = require('express');

const app = express();

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.status(200).sendFile('/index.html');
});

app.listen(5000, () => {
    console.log('Currency Converter app listening on port 5000');
});