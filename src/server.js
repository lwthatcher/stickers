// Get dependencies
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors')

// #region [Variables]
const WORKSPACES_PATH = path.join('/users', 'data', 'workspaces');
// #endregion

// #region [Express Setup]
const app = express();

var corsOptions = {
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
// #endregion


// #region [Helper Methods]
function listWorkspaces(dir, filelist={}) {
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
        try { filelist = listWorkspaces(dirFile, filelist) }
        // if it is not a directory
        catch (err) {
            if (err.code === 'ENOTDIR' || err.code === 'EBUSY') {
                if (file.endsWith('.workspace.json')) {
                    let ws = dir.split(path.sep).join('.');
                    filelist[ws] = workspaceInfo(path.join(WORKSPACES_PATH, dirFile));
                }
            }
            else throw err;
        }
    });
    // return result
    return filelist;
}

function workspaceInfo(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
// #endregion

// #region [API Routes]
app.route('/api/data/tensors/:dataset').get((req, res) => {
    const dataset = req.params['dataset'];
    const _path = path.join(__dirname, '..', 'data', dataset + '.npy');
    const b = fs.readFileSync(_path, null);
    res.write(b, 'binary');
    res.end(null, 'binary');
});

app.route('/api/data/csv/:dataset').get((req, res) => {
    const dataset = req.params['dataset'];
    const _path = path.join(__dirname, '..', 'data', dataset + '.csv');
    const b = fs.readFileSync(_path, 'utf8');
    res.send(b);
});

app.route('/api/list-workspaces').get((req, res) => {
    const files = listWorkspaces();
    res.send(files);
});
// #endregion


app.listen(3000, () => {
    console.log('Node server listening on port: 3000');
});
