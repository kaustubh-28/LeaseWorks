# Contributing Guide

Welcome and thank you for your interest in contributing to LeaseWorks. To ensure a smooth contribution process, please follow the guidelines below.

## Setting Up the Project

1. Fork the Repository:
   Create your own copy of the repository on GitHub.

2. Clone Your Fork:
   ```sh
   git clone https://github.com/your-username/LeaseWorks.git
   ```

3. Navigate to the Project Directory:
   ```sh
   cd LeaseWorks
   ```

4. Add the Upstream Repository:
   Set the original repository as your upstream remote to stay updated:
   ```sh
   git remote add upstream https://github.com/kaustubh-28/LeaseWorks.git
   ```

5. Install Dependencies:
   ```sh
   npm install
   ```

6. Run the Project Locally:
   ```sh
   npm run dev
   ```
   Open http://localhost:5173 in your browser to view the application.

## Contribution Workflow

1. Sync with the Upstream Repository:
   Before starting any work, pull the latest updates from the main repository:
   ```sh
   git checkout main
   ```
   ```sh
   git pull upstream main
   ```
   ```sh
   git push origin main
   ```

2. Create a Branch:
   Create a dedicated branch for your changes:
   ```sh
   git checkout -b feature/your-feature-name
   ```
   Use descriptive branch names prefixing the type of change, such as:
   - `fix/issue-description`
   - `feature/new-feature-name`
   - `docs/documentation-update`

3. Code Standards & Architecture Guidelines:
   Adhere to the repository rules and architectural guidelines when writing code:
   - Respect the Prisma singleton client and route protection hook patterns.
   - Separate server logic (e.g. database transactions, authentication) from Svelte UI components.
   - Maintain the double-ledger design aesthetic (sharp corners, Lora/Work Sans typography hierarchy, double-border grid dividers, and the defined palette).
   - Use Prettier for consistent formatting.

4. Committing Changes:
   Write clear and descriptive commit messages following the conventional commit structure:
   - `feat: add payment reporting dashboard`
   - `fix: resolve session expiration redirect`
   - `docs: update setup instructions`

   ```sh
   git add .
   ```
   ```sh
   git commit -m "commit message"
   ```

5. Push Your Changes:
   ```sh
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request:
   Go to the LeaseWorks repository on GitHub, navigate to the pull requests tab, and create a new pull request from your feature branch. Please describe the changes you've made and why they are necessary. A maintainer will review the code before merging.
