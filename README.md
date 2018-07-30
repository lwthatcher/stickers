# Stickers-2
This fork is being used as a placeholder for the update of [_stickers_](https://github.com/lwthatcher/stickers) to its `2.0` version release.
For various purposes I felt like some reorganization was in order, as well as including various features left out originally when initially creating the project in minimal mode. 
This plan hopes to reintigrate some of these features by creating a fresh project using the Angular CLI.
Here's to hoping!

## Dependencies
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
This app uses a _proxy-sever_ to handle setup and a custom REST API,
so subsequently it launches _**two**_ different servers to run:

- the main _application-server_ which hosts and runs the Angular application
- the proxied _node-sever_ which runs a `Node.JS` server for the REST API

### Starting the _Application-Server_
Run the following command to start the main web-server:
```
ng serve
```

### Starting the _Node-Server_
Run the following command to start the REST API server:
```
node server.js
```
