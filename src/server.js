// Get dependencies
const express = require('express');
const bodyParser = require('body-parser');
const np = require('tfjs-npy');
const fs = require('fs');
const path = require('path');
const cors = require('cors')

const app = express();

var corsOptions = {
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions))
app.use(bodyParser.json());


function bufferToArrayBuffer(b) {
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

app.route('/api/data').get(async (req, res) => {
    let _path = path.join(__dirname, '..', 'data', 'pills-blue.npy');
    const b = fs.readFileSync(_path, null);
    res.write(b, 'binary');
    res.end(null, 'binary');
});

app.listen(3000, () => {
    console.log('Node server listening on port: 3000');
});
