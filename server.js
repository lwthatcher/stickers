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
app.route('/api/data/:workspace/:dataset').get((req, res) => {
    // parse params
    const workspace = req.params['workspace'];
    const dataset = req.params['dataset'];
    // load data path/format
    let data = parse_workspace(ws_path(workspace))['data'][dataset];
    let _path = path.join(WORKSPACES_PATH, data.path);
    let _format = data.format;
    // send response based on format
    switch (_format) {
        case 'csv':
            const csv = fs.readFileSync(_path, 'utf8');
            res.send(csv);
            break;
        case 'tensor':
            const tensor = fs.readFileSync(_path, null);
            res.write(tensor, 'binary');
            res.end(null, 'binary');
            break;
        case 'bdl':
            const bdl = fs.readFileSync(_path, 'utf8');
            res.send(bdl);
            break;
        default:
            res.status(400).send('Bad Request: unrecognized format "' + _format + '"')
    }
});

app.route('/api/list-workspaces').get((req, res) => {
    const files = list_workspaces();
    res.send(files);
});

app.route('/api/version').get((req, res) => {
    res.send(pjson.version);
});
// #endregion

// #region [Helper Methods]
function list_workspaces(dir, filelist=[]) {
    // paths relative to workspaces directory
    let _path;
    if (dir) _path = path.join(WORKSPACES_PATH, dir);
    else _path = WORKSPACES_PATH;
    // recursively look in each directory
    fs.readdirSync(_path).forEach(file => {
        let dirFile;
        if (dir) dirFile = path.join(dir, file);
        else dirFile = file;
        // if file is a directory
        try { filelist = list_workspaces(dirFile, filelist) }
        // if it is not a directory
        catch (err) {
            if (err.code === 'ENOTDIR' || err.code === 'EBUSY') {
                if (file.endsWith('.workspace.json')) {
                    let ws = dir.split(path.sep).join('.');
                    filelist = [...filelist, parse_workspace(dirFile)];
                }
            }
            else throw err;
        }
    });
    // return result
    return filelist;
}

function parse_workspace(file) {
    let ws_path = path.join(WORKSPACES_PATH, file);
    return JSON.parse(fs.readFileSync(ws_path, 'utf8'));
}

function ws_path(workspace) {
    let ws = workspace.split('.');
    let ws_file = ws[ws.length-1] + '.workspace.json'
    return path.join(...ws, ws_file);
}
// #endregion

// #region [Server]
app.listen(3000, () => {
    console.info(FgCyan, 'version (' + pjson.version + ')');
    console.log('Node server listening on port: 3000');
});
// #endregion
