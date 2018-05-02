// Get dependencies
const express = require('express');
const np = require('tfjs-npy');
const fs = require('fs');
const app = express();

app.route('/api/data').get((req, res) => {
    let path = __dirname + '/assets/a.npy';
    res.send(path);
});

app.route('/api/cats').get((req, res) => {
    res.send({
      cats: [{ name: 'lilly' }, { name: 'lucy' }]
    });
  });

app.listen(3000, () => {
    console.log('Node server listening on port: 3000');
  });
