# RAVI Learning Platform

A modern Progressive Web Application (PWA) designed for native-like performance. It focuses on video-based learning in languages, coding, and professional skills.

## Deploy to Render

The application is structured to be deployed easily as a **Web Service** on **Render.com**. Follow these configurations when setting up the service in the Render Dashboard:

- **Service Type**: Web Service
- **Environment**: Node
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Required Environment Variables
Configure the following Environment Variables in the Render Dashboard settings under the **Environment** tab:
- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A secure random string for signing access tokens.
- `JWT_REFRESH_SECRET`: A secure random string for signing refresh tokens.

### MongoDB Atlas Access
Ensure that your MongoDB Atlas cluster allows inbound database connections from Render:
- Since Render's free tier uses dynamic outbound IP addresses, you should add `0.0.0.0/0` (allow access from anywhere) in the **Network Access** tab of your MongoDB Atlas dashboard.
- If you are on a paid Render plan with static outbound IPs, you can alternatively whitelist Render's specific outbound IP addresses.

## Run Locally

To set up and run the application in your local development environment, follow these steps:

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, pnpm, or bun

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file in the root directory and add any necessary environment variables as outlined in `.env.example`.

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   This will boot up the Express server (wrapping Vite in development mode) and run the app on port `3000`.

4. **Build for Production**:
   To compile both the React client-side assets and the custom Express server:
   ```bash
   npm run build
   ```

5. **Start Production Server**:
   Once the build completes, start the production server:
   ```bash
   npm run start
   ```
