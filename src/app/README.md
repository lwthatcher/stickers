# _Stickers_ Application Module
The _app_ module is the root level application module for running _Stickers_.
The module is defined and setup in `app.module.ts`.

This application has been split up into several _sub-modules_ for convenience.
Most of these sub-modules are for providing the framework and backing for the application itself,
however the main code for running the ui is in the [dataview](https://github.com/lwthatcher/stickers/tree/master/src/app/dataview) module.

## Sub-Modules
- **`app-routing` module:** a single file for handling routing and URL navigation
- **`data-loader` module:** a service module for interacting with the API server
- **`dataview` module:** the main ui part of the application
- **`settings` module:** provides support for declaring global settings throughout the application

Any other immediate directories are _not_ their own modules, 
but are components used directly in the `app` module itself.