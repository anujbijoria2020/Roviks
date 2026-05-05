**Roviks**

Roviks is a two-part web application (client + server) for a dropshipping / marketplace-style platform. The frontend is built with React + Vite + TypeScript and Tailwind; the backend is an Express + TypeScript API using MongoDB.

**Quick Start**

Prerequisites:
- Node.js (v18+ recommended)
- npm (or pnpm/yarn)
- MongoDB (local or Atlas)

1. Clone the repository

   ```bash
   git clone <repo-url>
   cd roviks
   ```

2. Server setup

   - Create a `.env` file in the `server/` folder. Example entries this project expects (adjust as needed):

     ```env
     PORT=4000
     MONGO_URI=mongodb://localhost:27017/roviks
     JWT_SECRET=your_jwt_secret
     ```

   - Install dependencies and run in development:

     ```bash
     cd server
     npm install
     npm run dev    # uses nodemon + ts-node
     ```

   - Useful npm scripts (from `server/package.json`):

     - `npm run dev` — start server in development (nodemon + ts-node)
     - `npm run build` — compile TypeScript to `dist`
     - `npm run start` — run compiled production server (`node dist/server.js`)
     - `npm run seed` — run the seed script (populates sample data)

3. Client setup

   - Install dependencies and run in development:
     ```bash
     cd client
     npm install
     npm run dev    # starts Vite dev server
     ```

   - Useful npm scripts (from `client/package.json`):

     - `npm run dev` — start Vite dev server
     - `npm run build` — build production assets
     - `npm run preview` — preview production build
     - `npm run lint` — run ESLint

**Project Structure**

- `client/` - React front-end (Vite + TypeScript)
- `server/` - Express API (TypeScript)
- `uploads/` - file upload storage used by the server

**Environment & Storage**

- The server expects a MongoDB connection. Set `MONGO_URI` in `server/.env` or use an Atlas connection string.
- Uploaded files (images, product media) are stored in the `uploads/` folder by default.

**Seeding Data**

- To populate demo data, run from the `server/` directory:

  ```bash
  npm run seed
  ```

**Build & Deploy**

- Build client for production:

  ```bash
  cd client
  npm run build
  ```

- Build server (compile TypeScript) and run:

  ```bash
  cd server
  npm run build
  npm run start
  ```

**Notes & Next Steps**

- Update `server/.env` before running the server.
- If deploying to a platform (Vercel, Heroku, Render), adapt environment variables and static hosting accordingly.

**Contributing**

- Feel free to open issues or PRs. Run linters and follow repository coding style.

**License**

- (Add license information here)
