# Stickers
The practical interface for interactive temporal data annotation used for my Thesis proposal.

## Dependencies
> COMING SOON!

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
