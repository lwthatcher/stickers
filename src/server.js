// Get dependencies
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors')

const app = express();

var corsOptions = {
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.route('/api/data/tensors/:dataset').get(async (req, res) => {
    const dataset = req.params['dataset'];
    const _path = path.join(__dirname, '..', 'data', dataset + '.npy');
    const b = fs.readFileSync(_path, null);
    res.write(b, 'binary');
    res.end(null, 'binary');
});

app.listen(3000, () => {
    console.log('Node server listening on port: 3000');
});
