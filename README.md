# LeaseWorks

LeaseWorks is a smart, efficient property and tenant management application. It is designed to help landlords and property managers track rental payments, organize leases, manage maintenance requests, and streamline communication with tenants.

## Design Philosophy

The application features a custom double-ledger design identity (Classic Estate), drawing inspiration from physical ledger books and editorial paper layout systems:
- **Clean Editorial Layouts**: Generous spacing, large readable typography, and structured grids to reduce cognitive load and visual noise.
- **Grid Dividers**: Double-border lines resembling vintage paper ledgers.
- **Typography**: Serif typefaces (Lora, Domine) for headers and structured sans-serif typefaces (Libre Franklin, Work Sans) for records, lists, badges, and user inputs.
- **Color Palette**: Warm parchment backgrounds (`#FAF9F6`) combined with emerald greens for success/primary actions and ledger red for overdue statuses or alerts.
- **Corners & Borders**: Sharp edges with minimal border radii to maintain a physical-folder aesthetic.

## Technology Stack

- **Framework**: SvelteKit (Svelte 5, Svelte compiler)
- **Styling**: Tailwind CSS v4
- **Database & ORM**: SQLite with Prisma ORM
- **Authentication**: Cookie-based sessions validated using JSON Web Tokens (JWT) and passwords encrypted using bcrypt

## Key Features & Core Infrastructure

### 1. Reusable Design Components
* **Card**: Composable, bordered, elevated, and clickable panel containers.
* **Button**: Premium styled buttons supporting Primary, Secondary, Outline, Ghost, Danger, and Success states, along with sizes (xs-xl), icons, and loading states.
* **Table**: Styled tabular grids featuring compact, default, and comfortable densities.

### 2. Service-Driven Architecture (`src/lib/server/services/`)
Separated core database logic from HTTP routing. Reusable transactional services exist for all 9 domain entities:
* `address`, `building`, `apartment`, `tenant`, `lease`, `payment`, `maintenance`, `cost`, and `meter`.

### 3. Unified Validation & Error Layers (`src/lib/server/validation/`)
* **Authoritative Request Validation**: Enforces database requirements, type correctness, and mutual exclusions.
* **Unified Error Mapping**: Centralized domain error types (`ValidationError`, `NotFoundError`, `AuthorizationError`) converted dynamically to standard JSON status responses.

### 4. Centralized Authorization Policies (`src/lib/server/auth/`)
* Enforces role capability assertions (e.g., `canManageBuilding`, `canViewApartment`) inside the service layer, keeping endpoints thin and protecting landlord boundaries.

### 5. Premium Landlord Workspace
* **Collapsible App Shell**: Collapsible sticky sidebar navigation persisting preferences in local storage, responsive tablet modes, and mobile burger drawers.
* **Dashboard alert banner**: Automatically pulls active urgent requests to display a golden top-bar.
* **Dashboard Portfolio Overview**: Borderless key stats (Total Revenue, Vacant, Active Requests) and a tabular unit index with soft status badges.
* **Apartment Details**: Replicates a premium printed document, laying out rent history ledgers, active complaints dropdowns, current lease details, and upcoming bills.

## Repository Structure

- `src/lib/components/`: Reusable design system component library (cards, buttons, tables).
- `src/lib/server/services/`: Database transactions and business logic controllers.
- `src/lib/server/auth/policies.ts`: Centralized authorization policy definitions.
- `src/lib/server/validation/`: Request verification schemas.
- `src/routes/`: SvelteKit presentation pages and routing.
- `src/routes/api/`: SvelteKit REST controllers calling validation and service layers.
- `prisma/`: Database schemas and seeding scripts.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/kaustubh-28/LeaseWorks.git
   ```

2. Navigate to the project directory:
   ```sh
   cd LeaseWorks
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

4. Run the Prisma migrations to set up the database and apply the seed:
   ```sh
   npx prisma migrate dev --name init
   ```
   If seeding does not run automatically, seed the database with:
   ```sh
   npx prisma db seed
   ```

### Running the Application

1. Start the development server:
   ```sh
   npm run dev
   ```

2. Open your browser and navigate to the dev server link.

### Default Credentials

The database seeding script creates the following default accounts for local testing:

#### Landlord Profiles
* **Landlord One**:
  * Email: `user123@example.com`
  * Password: `password1`
* **Landlord Two**:
  * Email: `user210@example.com`
  * Password: `password2`

#### Tenant Profiles
* **John Tenant**:
  * Email: `tenant111@example.com`
  * Password: `password1`
* **Jane Tenant**:
  * Email: `tenant210@example.com`
  * Password: `password2`

## Roadmap & Upcoming Features

- **Tenant Utility Billing**: Interactive grids displaying utility costs and water/electricity usage trackers using SVG/CSS chart structures.
- **Dynamic Invoicing Generator**: Automated PDF invoice templates matching the double-ledger aesthetic for lease agreements and monthly payments.
- **Form Actions Refactor**: Progressive enhancement of administrative CRUD pathways from client-side REST calls to standard SvelteKit Form Actions with validation middleware.

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
