# Stickers
Experimental framework for testing various annotation schemes and quick-labeling techniques.
This is the UI front end app, used in conjunction with the backend python module [_tcm_](https://github.com/byuhci/tcm).

## Setup
As of version `2.0.0` _Stickers_ now uses _tcm_ as the primary backend for its REST API.
To get _tcm_ and its dependencies running properly, please refer to its [documentation](https://github.com/byuhci/tcm/blob/master/README.md).

### UI Dependencies
```
Angular:      ^5.2.0
Angular CLI:  ~1.7.0
Typescript:   ~2.5.3
Node:         ^8.3.0
npm:          ^5.3.0
```

## Project Structure
The main application code is housed in the `/src/app/` directory.
This is further broken down into several 
[Angular modules](https://angular.io/guide/ngmodules#angular-modularity) 
for convenience and modularity.

The main module for the user interface is located in the `/src/app/dataview` module.
Further details on it can be viewed in its corresponding [README](https://github.com/lwthatcher/stickers/tree/master/src/app/dataview).

## Running the Server
This app uses a _proxy-sever_ to handle setup and two custom REST APIs,
so subsequently it launches _**three**_ different servers to run:

- the main _application-server_ which hosts and runs the Angular application
- the proxied _flask-server_ which runs a python `Flask` server, which handles the majority of the REST API
- the proxied _node-sever_ which runs a `Node.JS` server for handling the rest of the REST API

### Starting the _Application-Server_
Run the following command to start the main web-server:
```
ng serve
```

### Starting the _Node-Server_
Run the following command to start the `Node.JS` REST API server:
```
node server.js
```

### Starting the _Flask-Server_
Assuming you have _tcm_ installed and configured for global usage, 
you can use the following command to start the `Flask` REST API server:
```
tcm serve api
```
