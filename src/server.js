// #region [Imports]
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
// #endregion

// #region [Variables]
const WORKSPACES_PATH = path.join('/users', 'data', 'workspaces');
const pjson = require('../package.json');
const FgCyan = "\x1b[36m%s\x1b[0m";
// #endregion

// #region [Express Setup]
const app = express();

var corsOptions = {
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
// CORS and body-parser
app.use(cors(corsOptions));
app.use(bodyParser.json());
// setup serving static files
app.use(express.static(WORKSPACES_PATH));
// #endregion

// #region [API Routes]
app.route('/api/version').get((req, res) => {
    res.send(pjson.version);
});
// #endregion

// #region [Server]
app.listen(3000, () => {
    console.info(FgCyan, 'version (' + pjson.version + ')');
    console.log('Node server listening on port: 3000');
});
// #endregion
