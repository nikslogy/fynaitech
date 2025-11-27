# Fynai.tech

Live demo: https://fynai.tech

Fynai is a market analytics platform focused on options and derivatives data for traders and analysts. This repository contains the next.js web app powering the platform and the user-facing dashboards and components used to surface data, visualizations, and trading indicators.

## Key features
- Option chain visualization, strike-wise open interest (OI), and option chain analytics
- PCR intraday and options-related indicators for short-term trading insights
- Max Pain visualization and intraday tracking
- FII/DII flow analytics and historical data visualizations
- Open Interest (OI) analytics, build-up, and historical / filing analysis
- Stock/index spot & futures data pages
- Gann strategy live views and other trading signals

## Tech stack
- Next.js 14
- React 18 + TypeScript
- Tailwind CSS and Radix UI for components
- Recharts + other charting libraries

## Quick start (Local dev)
Recommended package manager: pnpm (pnpm preferred due to the lock file included). If you use npm or yarn, adapt commands accordingly.

1. Install dependencies:

```powershell
pnpm install
```

2. Run the app in development mode:

```powershell
pnpm dev
```

3. Build for production:

```powershell
pnpm build
pnpm start
```

## Environment
This project uses environment variables for configuration. Review `next.config.mjs` and server-side code to determine required environment variables before running in production.

## Contributing
If you'd like to contribute or request features, please open a GitHub issue or contact the project owner. Some parts of the project are private or require access tokens to test; reach out if you need access.

## Access & Contact
If you need an access code to use the deployed platform or require support, contact the owner at: nikitpotdar@gmail.com

## Notes
- This repository powers the front-end of Fynai. If you need further help running or deploying the project, please contact the owner.

