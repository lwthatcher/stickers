// Get dependencies
const express = require('express');
const np = require('tfjs-npy');
const fs = require('fs');
const path = require('path');
const app = express();

function bufferToArrayBuffer(b) {
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

app.route('/api/data').get(async (req, res) => {
    let _path = path.join(__dirname, 'assets', 'a.npy');
    const b = fs.readFileSync(_path, null);
    const ab = bufferToArrayBuffer(b);
    res.send(await np.parse(ab));
});

app.route('/api/cats').get((req, res) => {
    res.send({cats: [{ name: 'lilly' }, { name: 'lucy' }]});
});

app.listen(3000, () => {
    console.log('Node server listening on port: 3000');
});
