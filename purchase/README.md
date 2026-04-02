# :credit_card: Purchase Application
Application to support the purchase and checkout process for InsureMyTrip.com. Application is built using [VueJS](https://vuejs.org/), [Vite](https://vitejs.dev/), and [Pinia](https://pinia.vuejs.org/).
## Prerequisites

The front-end application requires [Node.js](https://nodejs.org/en/) and NPM to be installed locally.

It may also be helpful to install a node.js version management tool such as [nvm](https://github.com/nvm-sh/nvm) to allow you to easily switch between versions locally.

## :wrench: Build Setup

```bash
# Install dependencies
$ npm install

# Serve with hot reload
$ npm run dev

# Build for production and preview
$ npm run build
$ npm run preview
```

## :white_check_mark: Testing
Cypress is used for both e2e and component (spec) testing. Component spec tests should reside `/tests/` directory and follow the same directory structure as the components themselves.

### Running Tests

```bash
# Run all component unit tests
npm run test:unit

# Run tests in Cypress UI
npm run test:ui
```

## :globe_with_meridians: Environment Variables
Vite supports environment variables out of the box. Included in this project are files for local development and production, however more can be added as needed. More information on Vite and environment variables can be reviewed [in the official documentation](https://vitejs.dev/guide/env-and-mode.html).

### How to Set Up Debugger on VSCode
** Note: Before running debugger, you will need to force quit any instances of Google Chrome as it is not possible to put a running Chrome user profile into debug mode. ** 
Add the following `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
      {
          "type": "chrome",
          "request": "launch",
          "name": "Launch Chrome with Profile",
          "url": "http://localhost:5173",
          "webRoot": "{workspace directory}/src",
          "userDataDir": false,
      }
  ]
}