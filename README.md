# Pricing Strategy Sandbox

Interactive playground for founders and product managers to explore SaaS pricing scenarios, revenue projections, and unit economics in real time. Built with Bun, SvelteKit, Tailwind CSS, and Chart.js.

## Features

- Live pricing tier editor with instant updates to a shared store
- KPI dashboard covering ARPU, LTV, CAC payback, ROI, margin, and blended ticket
- Animated revenue projection and tier contribution charts powered by Chart.js
- Elasticity slider to model discount sensitivity versus conversion lift
- Micro-interactions, glassmorphism cards, and responsive layout optimized for desktop and tablet

## Tech Stack

- **Runtime:** Bun
- **Framework:** SvelteKit (Svelte 5 runes)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom design tokens
- **Charts:** Chart.js 4
- **Tooling:** ESLint, Prettier, TypeScript strict mode

## Getting Started

```bash
bun install
bun run dev
```

The dev server runs at `http://localhost:5173`. Edits hot-reload instantly.

### Quality checks

```bash
bun run lint      # ESLint + Svelte
bun run check     # svelte-check with strict TypeScript
bun run build     # Production build using Vite
```

## Project Structure

```
src/
├─ lib/
│  ├─ components/        # Header, PricingForm, MetricsCard, Charts, Results
│  ├─ stores/            # pricingStore.ts (global state + derived metrics)
│  └─ utils/             # formulas.ts business logic helpers
├─ routes/
│  ├─ +layout.svelte     # Global styles + favicon
│  └─ +page.svelte       # Main sandbox layout
└─ app.css               # Tailwind base layers and custom utilities
```

## Pricing Model Logic

- Tiers are normalized so conversion share always totals 100%
- Elasticity adjusts price and conversion rate multipliers
- Formulas cover ARPU, gross margin, LTV, CAC payback, ROI, and revenue projections
- Results view surfaces tier-level revenue tables and cumulative revenue charts

## Deployment

The project ships adapter-auto and is Vercel-ready:

```bash
bun run build
# Deploy .svelte-kit/output or connect the repo to Vercel for CI/CD
```

## License

MIT © 2025
