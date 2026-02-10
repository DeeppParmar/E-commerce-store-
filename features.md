# Features & Architecture Documentation

## Project Overview
This project is a modern E-commerce platform with a focus on Auctions. It features a comprehensive Frontend built with React and a rising Backend service.

## Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: React Query, React Context (for Auth)
- **Routing**: React Router DOM
- **Forms**: React Hook Form, Zod
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Bcryptjs
- **Validation**: Zod
- **Security**: Helmet, CORS

## Feature Status

### 1. Authentication (Functional)
- **User Registration & Login**: Fully integrated with the backend API.
- **Protected Routes**: Client-side route protection for authenticated users.
- **Context Management**: Global Auth state managed via `AuthContext`.

### 2. Auctions (Frontend / Mock Data)
- **Live Auctions**: View real-time active auctions.
- **Ending Soon**: Filter for auctions ending shortly.
- **Auction Details**: Detailed view of auction items, bids, and time remaining.
- *Note: Currently powered by static mock data (`mockData.ts`).*

### 3. E-commerce Shopping (Frontend / Mock Data)
- **Product Browsing**: Browse products by categories (Electronics, Fashion, etc.).
- **Product Details**: Detailed product views with images and descriptions.
- **Shopping Cart**: Cart management interface.
- **Checkout**: Checkout flow interface.
- *Note: Product data is currently mock-based.*

### 4. User Dashboards (Frontend UI)
- **User Profile**: Management of user details.
- **Seller Dashboard**: Interface for sellers to manage their listings.
- *Note: These are UI implementations, backend integration is pending for data persistence beyond Auth.*

## Backend API Capabilities
- **Health Check**: `/api/health`
- **Authentication**:
  - `POST /api/auth/register` (Register new user)
  - `POST /api/auth/login` (Login user)
- **User Management**:
  - GET/PUT `/api/users` endpoints (implied by `usersRouter`)

## Summary
The project has a robust Frontend foundation with a modern design system. The Backend is currently set up for Authentication and User management. The next phase of development would typically involve migrating the Product and Auction data from Frontend mocks to the Backend database and creating the corresponding API endpoints.
