# Solana PayAI

Effortless Solana Payments, Optimized by AI.

## Overview

Solana PayAI is a web application that simplifies accepting and sending payments on the Solana blockchain, with AI-powered fraud detection and fee optimization for businesses.

## Features

- **Simple Payment API Gateway**: Easily integrate Solana payments into your applications
- **AI-Powered Fraud Detection**: Protect your business with real-time transaction analysis
- **Automated Payouts**: Schedule and manage batch payments to multiple recipients
- **Smart Fee Management**: Optimize transaction fees with AI-driven recommendations

## Tech Stack

### Frontend
- React with Vite
- Tailwind CSS for styling
- Context API for state management

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Solana Web3.js for blockchain integration
- OpenAI API for AI features

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Solana CLI (for development)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/solana-payai.git
   cd solana-payai
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Backend (.env file in server directory)
   cp server/.env.example server/.env

   # Frontend (.env file in root directory)
   cp .env.example .env
   ```

4. Update the environment variables with your own values:
   - MongoDB connection string
   - JWT secret
   - Solana RPC URL
   - OpenAI API key

5. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # In a separate terminal, start frontend
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## API Documentation

API documentation is available at `/api-docs` when the server is running.

### Key Endpoints

- `POST /api/payments`: Create a new payment
- `GET /api/payments/{id}`: Get payment details
- `POST /api/payouts/batch`: Create a batch payout
- `GET /api/network/fees`: Get fee recommendations

## Subscription Plans

- **Free**: 100 transactions/month, basic API access
- **Basic**: 1,000 transactions/month, basic fraud detection
- **Pro**: 5,000 transactions/month, advanced AI features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Solana Foundation
- OpenAI
- All contributors to this project

