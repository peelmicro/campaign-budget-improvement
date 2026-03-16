# Campaign Budget Distribution (Improvement Version)

> [!IMPORTANT]
> **This repository is a refactored "improvement version" of the original solution.** 
> It introduces production-ready features like true Observability (Correlation IDs, JSON logs), database schema normalization (Soft Deletes, foreign keys), stateless RxJS/Signal patterns, and Atomic Database Transactions.
> 
> 👉 **[Read the full breakdown of improvements here](./doc/applied-changes-for-improvement.md)**

A full-stack application that distributes advertising campaign budgets across channels (Video, Display, Social) based on optimization goals. This version has been significantly refactored to demonstrate modern, enterprise-grade NestJS and Angular 21 patterns.

## Technology Stack

| Technology | Version | Notes |
|------------|---------|-------|
| NestJS | 11 | Backend framework with TypeORM |
| Angular | 21 | Signals, Standalone components, Zoneless + RxJS Observables |
| TypeORM | latest | `synchronize: true` for dev |
| MySQL | 8.4 | Isolated Docker container `campaign_budget_interview` |
| NestJS Plugins | | `nestjs-pino` (Logging), `nestjs-cls` (Correlation IDs), `@nestjs/terminus` (Health Probes), `@nestjs/axios` (3rd Party Integrations) |
| Tailwind CSS | v4 | Utility-first styling |
| Vitest | 4.x | Test runner for both API and Web |
| Nx | latest | Monorepo build system |
| pnpm | latest | Package manager |
| Docker Compose | latest | Full-stack containerized setup |

## Prerequisites

- **Node.js** 24.x
- **pnpm** — `npm install -g pnpm`
- **Docker** and **Docker Compose** — for MySQL (and optional full-stack setup)
- **Nx** is included as a dev dependency — no global install needed

## How to Run

```bash
# Clone the repository
git clone https://github.com/peelmicro/campaign-budget.git
cd campaign-budget

# Install dependencies
pnpm install

# Option 1: Docker (recommended) 
pnpm dc:up:all # Starts the isolated MySQL and builds API + Web containers natively
# API: http://localhost:3000/api
# Web: http://localhost:80

# Option 2: Local development
pnpm dc:up                 # Start MySQL via Docker Compose
pnpm api                   # Start API (http://localhost:3000/api)
pnpm web                   # Start Angular (http://localhost:4200)
```

The application starts with standard catalog data pre-seeded. Feel free to interrogate the `/api/health` endpoint!

## Convenience Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `pnpm api` | `nx serve api` | Start NestJS API |
| `pnpm web` | `nx serve web` | Start Angular frontend |
| `pnpm api:test` | `nx test api` | Run API unit tests (Vitest) |
| `pnpm web:test` | `nx test web` | Run Web unit tests (Vitest) |
| `pnpm api:lint` | `nx lint api` | Lint API |
| `pnpm web:lint` | `nx lint web` | Lint Web |
| `pnpm dc:up` | `docker-compose up -d mysql` | Start MySQL only (for local dev) |
| `pnpm dc:down` | `docker-compose down` | Stop all Docker services |
| `pnpm dc:ps` | `docker-compose ps` | Check running containers |
| `pnpm dc:clean` | `docker-compose down -v` | Stop all services and remove volumes |
| `pnpm dc:build` | `docker-compose build` | Build all Docker images |
| `pnpm dc:up:all` | `docker-compose up --build -d` | Build + start all services |

## Budget Distribution Algorithm

### Objective

Given a campaign with budget `B`, duration `D` days, and goal `G`, distribute the budget across available channels to optimize for the selected goal.

### Core Formula

```
impressions = (allocated_budget / channel.cpm) * 1000
reach = impressions / FREQUENCY_CAP   (FREQUENCY_CAP = 3)
```

### Distribution Logic by Goal

**REACH — Maximize unique users reached:**
- Weight by inverse CPM (cheaper channels get more budget)
- `channel_weight = (1 / channel.cpm) / sum(1 / cpm for all channels)`

**ENGAGEMENT — Maximize high-quality interactions:**
- Weight by CPM (expensive channels get more budget)
- `channel_weight = channel.cpm / sum(cpm for all channels)`

**BALANCED — Equal distribution:**
- `channel_weight = 1 / number_of_channels`

### Calculation Steps

```
For each channel:
  1. allocated_budget = round(campaign.budget * channel_weight, currency.decimalPoints)
  2. estimated_impressions = floor((allocated_budget / channel.cpm) * 1000)
  3. estimated_reach = floor(estimated_impressions / FREQUENCY_CAP)
  4. days = campaign.days  (all channels run for the full campaign duration)
  5. schedule = generate dates from campaign.fromDate to campaign.toDate

Rounding adjustment:
  - Sum all allocated_budgets
  - If total != campaign.budget due to rounding, add/subtract the difference to the last channel
```

### Example: $10,000 / 30 days / REACH goal

```
Channel weights (REACH = inverse CPM):
  Video:   (1/15) / (1/15 + 1/10 + 1/3) = 0.067 / 0.500 = 0.133  ->  13.3%
  Display: (1/10) / 0.500                = 0.100 / 0.500 = 0.200  ->  20.0%
  Social:  (1/3)  / 0.500                = 0.333 / 0.500 = 0.667  ->  66.7%

Budget allocation:
  Video:   $10,000 x 0.133 = $1,333.33  ->  88,889 impressions  ->  ~29,630 reach
  Display: $10,000 x 0.200 = $2,000.00  ->  200,000 impressions  ->  ~66,667 reach
  Social:  $10,000 x 0.667 = $6,666.67  ->  2,222,222 impressions  ->  ~740,741 reach

Total estimated reach: ~837,038 unique users
```

### Example: $10,000 / 30 days / ENGAGEMENT goal

```
Channel weights (ENGAGEMENT = direct CPM):
  Video:   15 / (15 + 10 + 3) = 15/28 = 0.536  ->  53.6%
  Display: 10 / 28             = 0.357  ->  35.7%
  Social:  3  / 28             = 0.107  ->  10.7%

Budget allocation:
  Video:   $10,000 x 0.536 = $5,357.14  ->  357,143 impressions  ->  ~119,048 reach
  Display: $10,000 x 0.357 = $3,571.43  ->  357,143 impressions  ->  ~119,048 reach
  Social:  $10,000 x 0.107 = $1,071.43  ->  357,143 impressions  ->  ~119,048 reach

Total estimated reach: ~357,143 unique users (less reach, but higher engagement quality)
```

## API Endpoints

```
# Infrastructure
GET    /api/health                  - TypeORM Database Readiness ping

# Clients
GET    /api/clients                 - List all catalog clients
GET    /api/clients/:id             - Get specific client

# Currencies
GET    /api/currencies              - List all currencies
GET    /api/currencies/:id          - Get currency by ID
GET    /api/currencies/code/:code   - Get currency by ISO code (case-insensitive)
GET    /api/currencies/rates/:base  - Fetch Live Exchange Rates (via Frankfurter API)

# Channels
GET    /api/channels                - List all channels
GET    /api/channels/:id            - Get channel by ID
GET    /api/channels/code/:code     - Get channel by code (case-insensitive)

# Campaigns
POST   /api/campaigns               - Create campaign + auto-distribute budget
GET    /api/campaigns                - List all campaigns
GET    /api/campaigns/:id            - Get campaign with distribution details
PATCH  /api/campaigns/:id            - Partial update campaign + re-distribute budget
DELETE /api/campaigns/:id            - Delete campaign

# Distribution
POST   /api/campaigns/:id/distribute - Re-calculate distribution for existing campaign
```

### Key Design Decisions

- **Creating a campaign automatically triggers budget distribution.** Campaign managers get immediate results without a separate distribution step.
- **Updating a campaign automatically re-distributes the budget.** Changing budget, days, or goal recalculates the distribution.
- **PATCH over PUT:** Campaign managers typically change one or two fields (e.g., goal, budget). PATCH allows partial updates.
- **Re-distribution endpoint exists separately** for recalculating without changing campaign parameters.
- **No authentication.** In production, this would use JWT or session-based auth with role-based access control.

## Testing

**66 total tests** — all passing, zero lint errors.

```bash
pnpm api:test    # 53 API tests (7 files)
pnpm web:test    # 13 Web tests (4 files)
pnpm api:lint    # Lint API
pnpm web:lint    # Lint Web
```

API test breakdown:
- `currency.service.spec.ts` (5) + `currency.controller.spec.ts` (5)
- `channel.service.spec.ts` (5) + `channel.controller.spec.ts` (5)
- `campaign.service.spec.ts` (10) + `campaign.controller.spec.ts` (7)
- `distribution.service.spec.ts` (16) — algorithm weights, budget ordering, formulas, rounding, date generation, edge cases

Web test breakdown:
- `app.spec.ts` (2), `campaign-list.component.spec.ts` (4), `campaign-form.component.spec.ts` (4), `campaign-detail.component.spec.ts` (3)

## Project Structure

```
campaign-budget/
├── apps/
│   └── api/                          # NestJS backend
│       ├── Dockerfile                       # Multi-stage: deps -> build -> Node production
│       └── src/
│           ├── main.ts                      # Pino Logger, GlobalExceptionFilter mapping
│           ├── app/
│           │   └── app.module.ts            # TypeORM.forRoot + module imports
│           ├── common/                      # interceptors/ (Tracking IDs), filters/ (Error Masking)
│           ├── health/                      # Terminus Node readiness and liveness checks
│           ├── client/                      # Normalized Client entity catalog
│           ├── currency/                    # Currency entity + ExchangeRateService (Frankfurter API)
│           ├── channel/                     # Channel entity + EngagementRank enum
│           ├── campaign/                    # Campaign entity (Normalized relationships, Soft Deletes)
│           ├── distribution/                # Core budget distribution algorithm
│           │   ├── constants.ts             # FREQUENCY_CAP = 3
│           │   ├── distribution.service.ts  # distribute(), calculateWeights()
│           │   └── distribution.service.spec.ts  # 16 algorithm tests
│           └── seed/                        # Auto-seeds currencies, channels, demo campaigns
├── web/                              # Angular frontend
│   ├── Dockerfile                           # Multi-stage: deps -> build -> Nginx
│   ├── nginx.conf                           # Reverse-proxy /api + SPA fallback
│   └── src/app/
│       ├── models/                          # TypeScript interfaces
│       ├── services/
│       │   └── campaign.service.ts          # Signals-based (signal, computed)
│       └── pages/
│           ├── campaign-list/               # Campaign table with goal badges
│           ├── campaign-form/               # Create + Edit (shared component)
│           └── campaign-detail/             # Distribution chart, table, schedule modal
├── docker-compose.yml                # MySQL + API + Web (3 services)
├── .dockerignore
└── package.json                      # Single shared package.json (Nx monorepo)
```

## Assumptions

- CPM values are static and seeded (Video $15, Display $10, Social $3). In production, these would come from real-time bidding APIs.
- Frequency cap is hardcoded at 3 impressions per user. In production, this should be configurable per campaign.
- No audience overlap between channels. Real-world reach would be lower due to users seeing ads across multiple channels.
- No authentication or authorization. In production, JWT/session auth with RBAC.

## Decisions Postponed or Left Flexible

- Per-channel day scheduling (all channels run every day of the campaign)
- Historical performance data influencing distribution weights
- Budget caps per channel (minimum/maximum spend)
- Calendar/timeline view for channel scheduling — the `schedule` data is calculated and stored per channel, but a visual calendar component showing which channels run on which days would make it more intuitive for campaign managers

## What I Would Do Differently with More Time

- Add Docker Compose hot reloading (volume mounts + watch mode) so code changes are reflected without rebuilding images
- Add e2e tests (Cypress or Playwright) for the full user flow
- Separate `package.json` per app for better dependency isolation and smaller Docker images
- Add a chart library (e.g., Chart.js or D3) for richer visualizations
- Implement user authentication and role-based access
- Add an audit trail for distribution changes
- Use Prisma instead of TypeORM for better type safety and migration management
- Implement proper database migrations instead of `synchronize: true`
- Add API documentation with Swagger/OpenAPI
- Internationalization (i18n) for international campaign teams
- Use TypeScript path aliases (e.g., `@app/currency`) or Nx libraries instead of relative imports between modules for cleaner imports and better encapsulation

## How to Extend for Production (GCP-Oriented)

- Replace static CPMs with real-time bidding API integration (e.g., Google DV360 API for programmatic CPM data)
- Add audience overlap modeling using third-party audience data to avoid overestimating total unique reach across channels
- Implement A/B testing for distribution strategies — split campaign budget across strategy variants, compare conversion rates, and reallocate based on actual performance data
- Add campaign performance tracking with a feedback loop (actual vs estimated reach) to continuously improve distribution accuracy
- Scale with Cloud SQL read replicas for reporting queries and Memorystore (Redis) for caching channel/currency data that rarely changes
- Add event sourcing for full audit trail on budget changes — store every campaign event (created, redistributed, updated) as immutable records, enabling state reconstruction at any point in time (critical for political ad compliance)
- Deploy on GCP: Cloud Run for API + Web containers, Cloud SQL (MySQL) for persistence, Cloud Build for CI/CD, Artifact Registry for Docker images, Cloud Logging + Cloud Monitoring for observability

## Trade-offs

- **Single shared `package.json` for the entire monorepo.** Nx manages all dependencies in one root `package.json`. This simplifies dependency management but means backend and frontend dependencies are mixed. In production, separate `package.json` files per app would provide better isolation and smaller Docker images.
- **TypeORM with `synchronize: true` instead of migrations.** Auto-creates/updates tables on startup, which is convenient for development but unsafe for production. Proper migrations would prevent accidental data loss on schema changes.
- **Relative imports between modules instead of path aliases.** Modules import from each other using relative paths (e.g., `../currency/currency.entity`). In production, TypeScript path aliases or Nx libraries would provide cleaner imports, better encapsulation, and easier refactoring.
- **All channels run for the full campaign duration.** A more sophisticated system would allow per-channel scheduling (e.g., video only on weekdays, social on weekends). The `schedule` JSON column is designed to support this extension.
- **No separate `campaign_channel_day` table.** Day-by-day schedules are stored as JSON arrays instead of a normalized table. This reduces complexity but limits date-range querying and cross-campaign reporting by date.
