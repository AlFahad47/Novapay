# 🚀 Nova Pay - Modern Fintech Platform

**A comprehensive financial services platform built with Next.js, featuring loans, wallets, savings, payments, and real-time chat.**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://novapay-ten.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Overview

Nova Pay is a modern fintech platform that empowers users with financial tools including:
- **Personal Wallets** - Secure digital wallets for managing funds
- **Loan Management** - Apply for and manage loans with easy tracking
- **Micro-Savings** - Flexible savings plans for financial goals
- **Peer-to-Peer Transfers** - Send money directly to other users
- **Bill Splitting** - Split expenses with friends and colleagues
- **Real-time Chat** - Communicate with support and other users
- **Admin Dashboard** - Comprehensive management interface
- **Multi-language Support** - Localized experience for global users

**Live Demo:** [https://novapay-ten.vercel.app](https://novapay-ten.vercel.app)

---

## 🎯 Key Features

### 🔐 Authentication & Security
- ✅ NextAuth.js integration with Credentials and OAuth providers
- ✅ JWT-based session management
- ✅ KYC (Know Your Customer) verification system
- ✅ Password encryption with bcryptjs
- ✅ Forgot password & reset password flows
- ✅ Email verification

### 💰 Financial Features
- ✅ **Wallet Management** - Create and manage multiple wallets
- ✅ **Loan Management** - Apply, track, and manage loans
- ✅ **Micro-Savings** - Set savings goals with flexible plans
- ✅ **Money Transfer** - P2P transfers between users
- ✅ **Bill Splitting** - Split expenses with multiple friends
- ✅ **Subscription Management** - Recurring payment plans
- ✅ **Transaction History** - Complete transaction tracking
- ✅ **Exchange Rate Conversion** - Real-time currency conversion

### 💬 Communication
- ✅ **Real-time Chat** - Powered by Pusher for instant messaging
- ✅ **Support Tickets** - Direct communication with support team
- ✅ **Direct Messages** - Peer-to-peer messaging
- ✅ **Notifications** - Real-time push notifications

### 📊 Dashboard & Analytics
- ✅ **User Dashboard** - Personal finance overview
- ✅ **Admin Dashboard** - Complete admin management interface
- ✅ **Analytics** - Charts, graphs, and financial insights
- ✅ **Campaign Management** - Marketing campaign controls
- ✅ **Fraud Detection** - Anomaly detection system
- ✅ **User Management** - Admin user controls
- ✅ **Request Management** - Handle user requests

### 🌐 Additional Features
- ✅ **Multi-language Support** - i18n with next-intl
- ✅ **Dark/Light Theme** - Theme switching with next-themes
- ✅ **AI Chatbot** - Groq-powered AI assistant
- ✅ **Donation System** - Support charitable causes
- ✅ **Reviews & Ratings** - Community feedback
- ✅ **Blog** - Educational content
- ✅ **FAQ** - Help and support information
- ✅ **Bank Card Integration** - Connect bank cards
- ✅ **International Transfers** - Cashout and top-up features
- ✅ **PDF Export** - Generate transaction PDFs

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + PostCSS 4
- **UI Components:** Shadcn UI, Radix UI, Lucide Icons
- **Authentication:** NextAuth.js 4.24.13
- **State Management:** React Hook Form
- **Animation:** Framer Motion, GSAP
- **Charts:** Chart.js, Recharts
- **Real-time:** Pusher.js

### Backend
- **Runtime:** Node.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** bcryptjs, JWT
- **API:** RESTful endpoints

### Services & Integrations
- **Cloud Storage:** Cloudinary (image uploads)
- **Real-time Messaging:** Pusher
- **AI:** Groq SDK (chatbot)
- **PDF Generation:** jsPDF with autotable
- **Deployment:** Vercel

### Development Tools
- **Linting:** ESLint 9
- **Build Tool:** Next.js built-in
- **Package Manager:** npm

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/novapay.git
   cd novapay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Setup](#environment-setup))
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

```bash
# Development
npm run dev          # Start development server on port 3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint checks
```

---

## 📁 Project Structure

```
novapay/
├── public/                    # Static assets
│   ├── manifest.json         # PWA manifest
│   └── [images & media]
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API routes
│   │   │   ├── admin/       # Admin endpoints
│   │   │   ├── auth/        # Authentication
│   │   │   ├── ai-chatbot/  # AI features
│   │   │   ├── transactions/# Transaction APIs
│   │   │   ├── wallet/      # Wallet management
│   │   │   ├── loan/        # Loan services
│   │   │   └── [other APIs]
│   │   ├── dashboard/       # User dashboard
│   │   │   └── [dashboard pages]
│   │   ├── adminDashboard/  # Admin interface
│   │   │   └── [admin pages]
│   │   └── [public pages]
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Base UI components
│   │   ├── auth/           # Auth-related components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── layout/         # Layout components
│   │   └── modals/         # Modal components
│   ├── lib/                # Utility functions
│   │   ├── auth.ts         # Authentication helpers
│   │   ├── mongodb.ts      # MongoDB connection
│   │   ├── pusher.ts       # Pusher configuration
│   │   └── utils.ts        # General utilities
│   ├── models/             # Mongoose schemas
│   │   └── User.ts         # User model
│   ├── i18n/               # Internationalization
│   │   ├── locales.ts      # Supported locales
│   │   └── messages/       # Translation files
│   ├── middleware.ts       # Next.js middleware
│   ├── types/              # TypeScript type definitions
│   └── providers/          # Context providers
├── scripts/                 # Utility scripts
├── tsconfig.json           # TypeScript config
├── next.config.ts          # Next.js config
├── tailwind.config.ts      # Tailwind config
├── eslint.config.mjs       # ESLint config
└── package.json            # Dependencies
```

---

## 🔧 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/novapay

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (Optional)
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Cloudinary (Image Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Pusher (Real-time Chat)
NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-cluster

# Groq AI
GROQ_API_KEY=your-groq-api-key

# Email Service (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password

# Stripe/Payment (Optional)
STRIPE_PUBLIC_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret

# Other Services
API_BASE_URL=http://localhost:3000
```

### Setting Up MongoDB

1. **Create a MongoDB Atlas account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a cluster** and database named `novapay`
3. **Get connection string:** `mongodb+srv://username:password@cluster.mongodb.net/novapay`
4. **Add `MONGODB_URI`** to `.env.local`

### Generating NextAuth Secret

```bash
openssl rand -base64 32
```

---

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (NextAuth)
- `POST /api/forgot-password` - Forgot password request
- `POST /api/reset-password` - Reset password

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/update` - Update profile
- `POST /api/user/upload` - Upload profile picture

### Wallet Endpoints
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/transfer` - Transfer money
- `GET /api/wallet/history` - Transaction history

### Loan Endpoints
- `POST /api/loan/apply` - Apply for loan
- `GET /api/loan/status` - Check loan status
- `GET /api/loan/history` - Loan history

### Chat Endpoints
- `GET /api/chat/messages` - Get chat messages
- `POST /api/chat/send` - Send message
- `GET /api/notifications` - Get notifications

---

## 💾 Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  location: String,
  bio: String,
  profileImage: String,
  role: "user" | "admin",
  kycStatus: "pending" | "verified" | "rejected",
  walletBalance: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment

### Deploy on Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create a Vercel account** at [vercel.com](https://vercel.com)

3. **Import project**
   - Connect your GitHub repository
   - Select the project
   - Configure environment variables

4. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Redeploy

5. **Deploy**
   ```
   Vercel will automatically deploy on every push to main
   ```

### Deploy Elsewhere

**Docker Deployment:**
```bash
docker build -t novapay .
docker run -p 3000:3000 --env-file .env.local novapay
```

**Traditional Server:**
```bash
npm run build
npm run start
```

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for complex functions

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Contact

- **Website:** [https://novapay-ten.vercel.app](https://novapay-ten.vercel.app)
- **Issues:** Create an issue on GitHub
- **Email:** support@novapay.com

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Real-time features by [Pusher](https://pusher.com)
- AI powered by [Groq](https://groq.com)
- Deployed on [Vercel](https://vercel.com)

---

**Last Updated:** April 2, 2026
