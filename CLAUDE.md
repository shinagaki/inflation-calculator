# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (use `--host` flag in WSL environments)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint checks
- `npm run check` - Run Biome checks for formatting and linting
- `npm run check:fix` - Auto-fix Biome issues

### Data Management
- `npm run convert-cpi` - Convert CPI data from CSV to JSON format
  - Input: `src/data/cpi_all.csv`
  - Output: `src/data/cpi_all.json`

### Type Checking
- `npx tsc --noEmit` - TypeScript type checking without build

## Architecture

### Core Application Structure
This is a React + TypeScript inflation calculator that converts historical currency values to current Japanese yen using Consumer Price Index (CPI) data.

**Main Data Flow:**
1. URL routing captures year/currency/amount parameters via Wouter
2. `useInflationCalculation` hook fetches exchange rates and performs CPI calculations
3. Results are displayed with social sharing functionality

### Key Components Architecture

**TopPage** (Main container)
- Handles URL routing and parameter validation
- Orchestrates form input and result display
- Delegates actual calculation logic to custom hooks

**InflationForm** 
- Isolated form component for year/currency/amount input
- Handles validation and formatting of user input
- Communicates changes via callback props

**InflationResult**
- Displays calculation results and social sharing buttons
- Handles loading states and error display

### Custom Hooks

**useInflationCalculation**
- Encapsulates the core inflation calculation logic
- Combines CPI data lookup, exchange rate fetching, and mathematical calculations
- Returns formatted results ready for display

**useExchangeRates**
- Fetches current exchange rates from CoinGecko API
- Provides loading states and error handling

### Data Sources
- **CPI Data**: Static JSON file (`src/data/cpi_all.json`) containing historical Consumer Price Index data for multiple countries
- **Exchange Rates**: Live data from CoinGecko API for currency conversion
- **Supported Currencies**: JPY, USD, GBP, EUR

### Routing
Uses Wouter for client-side routing with URL pattern: `/:year/:currency/:amount`
- Example: `/1980/usd/100` represents $100 from 1980
- Invalid parameters redirect to home page

### Styling
- Tailwind CSS for styling with responsive design
- Background image and glassmorphism effects
- Mobile-first responsive approach