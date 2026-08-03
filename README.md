# LeaseWorks

LeaseWorks is a smart, efficient property and tenant management application. It is designed to help landlords and property managers track rental payments, organize leases, manage maintenance requests, and streamline communication with tenants.

## Design Philosophy

The application features a custom double-ledger design identity, drawing inspiration from physical ledger books and editorial paper layout systems:
- Grid Dividers: Double-border lines resembling vintage paper ledgers.
- Typography: Serif typefaces for headers and structured sans-serif typefaces for records, lists, badges, and user inputs.
- Color Palette: Warm parchment backgrounds combined with emerald greens for success/primary actions and ledger red for overdue statuses or alerts.
- Corners & Borders: Sharp edges with minimal border radii to maintain a physical-folder aesthetic.

## Technology Stack

- Framework: SvelteKit (Svelte 5, Vite)
- Styling: Tailwind CSS v4
- Database & ORM: SQLite with Prisma ORM
- Authentication: Cookie-based sessions validated using JSON Web Tokens (JWT) and passwords encrypted using bcrypt

## Key Features

- Landlord Dashboard: Centralized view of property tables, financial aggregates, and priority alerts.
- Tenant Portal: Portal for tenants to review rent obligations, view lease terms, and report issues.
- Rental Payments: Financial tracker for payments with statuses such as paid, pending, and overdue.
- Lease Management: Structured contracts binding tenants to apartments with specified rents and active dates.
- Maintenance Requests: Trouble ticket submission and status tracking (urgencies: low, medium, high, emergency; statuses: pending, in progress, resolved).
- Metadata-Driven CRUD Grids: Administrative tables for addresses, buildings, apartments, meters, costs, and tenant profiles.

## Repository Structure

- src/lib/entities.ts: Contains FormFieldSchemas and TypeScript type definitions.
- src/routes: SvelteKit page routes and UI views.
- src/routes/api: REST API controllers handling authentication, dashboard statistics, and database CRUD.
- prisma: Database schema definitions and seeding scripts.

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

2. Open your browser and navigate to http://localhost:5173.

## Roadmap & Upcoming Features

- Tenant Utility Billing: Interactive grids displaying utility costs and water/electricity usage trackers using SVG/CSS chart structures.
- Dynamic Invoicing Generator: Automated PDF invoice templates matching the double-ledger aesthetic for lease agreements and monthly payments.
- Form Actions Refactor: Conversion of administrative CRUD paths from client-side requests to SvelteKit Form Actions for robust transaction validation.
- Enhanced Validation: Database constraint enforcement using middleware layers before transaction execution.

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
