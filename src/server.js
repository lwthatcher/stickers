// #region [Imports]
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
// #endregion

// #region [Variables]
const WORKSPACES_PATH = path.join('/users', 'data', 'workspaces');
const pjson = require('../package.json');
const FgCyan = "\x1b[36m%s\x1b[0m";
const DEFAULT_PORT = 3000;
// #endregion

// #region [Express Setup]
const app = express();
// set port
app.set('port', (process.env.PORT || DEFAULT_PORT));
// CORS and body-parser
var corsOptions = {
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
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
app.listen(app.get('port'), () => {
    console.info(FgCyan, 'version (' + pjson.version + ')');
    console.log('Node server listening on port:', app.get('port'));
});
// #endregion
