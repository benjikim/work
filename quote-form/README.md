# Quote Form Application

A Vue 3 application for collecting travel insurance quote information. This application is designed to be embedded in WordPress sites and supports multiple themes (InsureMyTrip and Soventure) with various form modes (default, edu, annual, cruise).

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Pinia** - State management
- **PrimeVue** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Zod** - Schema validation
- **Vitest** - Unit testing framework

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

## Getting Started

### Installation

## Required Step to Install Private NPM Packages
When designing this application, we made a decision to install an npm package for our Internally API requests. This package is called imt-com-apps API Client.

To `npm install` with this package, you need to first ensure you have an access token.

You will need to get one here: https://gitlab.imtdevops.us/-/user_settings/personal_access_tokens

You will then need to configure it in your terminal:

```bash
npm config set @insuremytrip:registry https://gitlab.imtdevops.us/api/v4/packages/npm/
npm config set -- '//gitlab.imtdevops.us/api/v4/packages/npm/:_authToken' "<your_token>"
```

You should now be able to `npm install` and Start the development server.

Start the development server:
npm run dev
The application will be available at `http://localhost:5173` (or the port Vite assigns).

### Building

Build for production:
npm run buildBuild for specific environments:
npm run build:qa          # QA environment
npm run build:qa2         # QA2 environment
npm run build:qa-gantry   # QA Gantry environment
npm run build:staging     # Staging environment
npm run build-local       # WordPress/local environmentThe build output will be in the `dist/` directory:
- `assets/quote-form-app.js` - Main application bundle
- `assets/quote-form-app.css` - Stylesheet

## Project Structure


2. Install dependencies:
npm install
bles

Brand colors and theme variables are defined in `src/assets/theme/variables.less`. This file contains:
- InsureMyTrip brand colors
- Soventure brand colors
- Color variations (tints, shades)
- Progress indicator colors
- Other theme-specific variables

### Supported Themes

- **InsureMyTrip** (`insuremytrip`)
  - Modes: `default`, `edu`, `annual`, `cruise`
- **Soventure** (`soventure`)
  - Modes: `default`

### Theme Modes

Each theme can have different form configurations:
- **default**: Full form with all sections enabled
- **edu**: Educational mode (single traveler)
- **annual**: Annual travel insurance (minimal form fields)
- **cruise**: Cruise-specific mode

Theme configuration is managed in `src/config/index.ts` and controlled via the `useThemeStore` Pinia store.

The application is designed to be embedded in WordPress sites. Styles are scoped to `#quote-form-v2` to prevent conflicts with WordPress theme styles. The build outputs an IIFE format to avoid polluting the global namespace.

## Development Workflow

### Code Quality

**Linting**: Run ESLint to check code quality 
```bash
npm run lint
```
**Formatting**: Format code with Prettier
```bash
npm run format
```

### Testing

Run unit tests:ash
npm testRun tests with UI:
npm run test:ui### Type Checking

Type checking is performed during the build process. To check types manually:
vue-tsc -b## Form Fields

The quote form collects the following information:

- **Destination**: Country and state selection
- **Travel Dates**: Departure and return dates
- **Number of Travelers**: 1-10 (configurable per mode)
- **Citizenship**: Country of legal citizenship
- **Residence**: Country and state of residence
- **Trip Cost**: Total trip cost
- **Initial Trip Payment Date**: Date of first payment

Form validation is handled using Zod schemas defined in `QuoteForm.vue`.

## WordPress Integration

The application is built as an IIFE bundle that can be embedded in WordPress pages. The mount point is `#quote-form-v2`.

To embed in WordPress:
1. Include the built CSS and JS files
2. Add a container element with id `quote-form-v2`
3. Optionally set a `data-mode` attribute for theme mode selection

Example:
<div id="quote-form-v2" data-mode="edu"></div>
<script src="/path/to/quote-form-app.js"></script>
<link rel="stylesheet" href="/path/to/quote-form-app.css">## Contributing

### Making Changes

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass: `npm test`
4. Run linting: `npm run lint`
5. Format code: `npm run format`
6. Submit a merge request

### Code Style

- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns with `<script setup>`
- Use Pinia stores for state management
- Follow existing code formatting (Prettier)
- Unit Tests should be written to cover all of our Pinia Store Methods and Util functions

### Adding New Theme Variables

1. Add variables to `src/assets/theme/variables.less`
2. Use CSS custom properties (e.g., `var(--brand-primary)`)
3. Document the variable in this README if it's a new category

### Adding New Form Modes

1. Update `ThemeMode` type in `src/types/index.ts`
2. Add mode configuration in `src/config/index.ts`
3. Update theme store logic in `src/store/theme.ts` if needed
4. Test the new mode with different themes
