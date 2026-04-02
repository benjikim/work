# Quote Results Application
Application to display Quote Results to users for InsureMyTrip.com. Application is built using [VueJS](https://vuejs.org/), [Vite](https://vitejs.dev/), and [Pinia](https://pinia.vuejs.org/).
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

## Local Development: Vite Proxy Configuration

When running the project in local development mode, Vite is configured to proxy certain API requests to our QA environment. This allows you to work locally while still interacting with real backend services, without needing to run the backend locally.

### How it Works

In `vite.config.ts`, the following proxy rules are set up:
Ensure you update these urls to whatever you need whether it's insuremytrip or soventure.

- **/quote**: Proxies to the QA quote API (`https://api.insuremytrip.com.imtqa.us/api/quote/v1`)
- **/order**: Proxies to the QA order API (`https://api.insuremytrip.com.imtqa.us/api/order/v1`)
- **/modules**: Proxies to the QA modules API for quote results (`https://api.insuremytrip.com.imtqa.us/api/modules/v1/quote-results`). The `/modules` prefix is stripped from the request path.
- **/wp-json/imt-blocks/v1/quote-results-content**: Proxies to the Soventure QA WordPress endpoint (`https://soventure.com.imtqa.us`)
- **/wp-json/plans/v1/content**: Proxies to the Soventure QA WordPress endpoint (`https://soventure.com.imtqa.us`)

### Why is this useful?
- **No need to run backend services locally**: You can develop and test the frontend against real QA APIs.
- **Consistent data**: You get the same data as the QA environment, which helps with debugging and testing.
- **CORS issues avoided**: The proxy handles CORS for you, so you don't need to worry about cross-origin errors during development.

### How to use
Just run the development server as usual:

```
npm run dev
```

All requests to the above endpoints will be automatically proxied to the QA environment.

If you need to change the proxy targets, edit the relevant section in `vite.config.ts`.
