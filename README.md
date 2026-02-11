# E-Commerce Auction Store

A modern e-commerce platform with live auction functionality, built with React, Supabase, and Vercel serverless functions.

## ✨ Features

- 🔐 **User Authentication** - Secure login/signup with auto-registration
- 🏷️ **Live Auctions** - Real-time bidding with anti-sniping protection
- 🛒 **Shopping Cart** - Traditional e-commerce functionality
- 👤 **User Profiles** - Manage bids, watchlist, and seller dashboard
- 🔔 **Notifications** - Get notified when outbid or auction ends
- ⭐ **Watchlist** - Save favorite auctions
- 📊 **Seller Dashboard** - Manage your listings and view analytics

## 🏗️ Architecture

```
User Browser
     ↓
Frontend (React SPA on Vercel)
     ↓
Vercel Rewrites/Proxy Layer
     ↓
Backend API (Vercel Serverless Functions)
     ↓
Supabase (PostgreSQL Database + Auth)
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DeeppParmar/E-commerce-store-.git
   cd E-commerce-store-
   ```

2. **Set up Supabase**
   - Create a project at [database.new](https://database.new)
   - Run `SUPABASE_MIGRATION.sql` in SQL Editor
   - Create `auctions` storage bucket

3. **Install dependencies**
   ```bash
   # Backend
   npm install
   
   # Frontend
   cd Frontend
   npm install
   ```

4. **Configure environment variables**
   
   Create `.env` in root:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   SUPABASE_ANON_KEY=your_anon_key
   ```
   
   Create `Frontend/.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_BASE_URL=/api
   ```

5. **Run locally**
   ```bash
   # Using Vercel dev (recommended)
   npm run dev
   
   # Or frontend only
   cd Frontend && npm run dev
   ```

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Complete setup instructions
- **[Deployment Guide](API_DEPLOYMENT.md)** - Deploy to Vercel
- **[Features](features.md)** - Detailed feature list

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Query** - Data fetching

### Backend
- **Vercel Serverless Functions** - API endpoints
- **Supabase** - Database and authentication
- **PostgreSQL** - Relational database
- **TypeScript** - Type safety

## 📁 Project Structure

```
├── api/                    # Backend serverless functions
│   ├── auth/              # Authentication endpoints
│   ├── auctions/          # Auction management
│   ├── bids/              # Bidding functionality
│   └── profile/           # User profile
├── Frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities and API client
│   │   └── auth/         # Auth context
│   └── public/           # Static assets
├── SUPABASE_MIGRATION.sql # Database schema
└── vercel.json           # Vercel configuration
```

## 🔐 Security

- **Service key** only used in backend functions
- **Row Level Security (RLS)** enabled on all tables
- **JWT tokens** for authentication
- **CORS** configured properly
- **Environment variables** for sensitive data

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/login` - Login or auto-register
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

### Auctions
- `GET /api/auctions/index` - List active auctions
- `GET /api/auctions/[id]` - Get auction details
- `POST /api/auctions/create` - Create new auction

### Bids
- `POST /api/bids/place` - Place a bid

### Profile
- `GET /api/profile/me` - Get user profile

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**Need help?** Check out the [Setup Guide](SETUP_GUIDE.md) or create an issue.