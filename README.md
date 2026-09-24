# PERN E-Commerce v2.0 🚀

**P**ostgreSQL + **E**xpress + **R**eact + **N**ode.js

A modern, full-featured e-commerce platform with advanced features including product reviews, wishlist, multiple addresses, and a beautiful UI powered by Tailwind CSS.

## ✨ Features

### Customer Features
- 🛍️ **Advanced Product Browsing** - Filter by category, brand, price range, search, and sort
- ⭐ **Product Reviews & Ratings** - Rate and review products (1-5 stars)
- 💝 **Wishlist** - Save products for later
- 🛒 **Smart Cart** - Real-time updates with quantity management
- 📍 **Multiple Addresses** - Save and manage multiple shipping addresses
- 📦 **Order Tracking** - View order history with detailed status
- 🔐 **Secure Authentication** - JWT-based auth with persistent sessions
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🎨 **Modern UI** - Tailwind CSS with smooth animations

### Admin Features
- ➕ **Product Management** - Create, update, delete products
- 🏷️ **Product Variants** - Size, color options support
- 📸 **Multiple Images** - Upload multiple product images
- 🎯 **Featured Products** - Highlight special products
- 🏷️ **SKU & Inventory** - Track stock and product codes
- 💰 **Pricing** - Regular and compare prices for discounts

### Technical Features
- 🔒 **Security** - Helmet.js, rate limiting, input validation
- 🚀 **Performance** - React Query caching, database indexes
- 📊 **State Management** - Zustand for client state
- 🎯 **Data Fetching** - React Query for server state
- 🔔 **Notifications** - Toast notifications for user feedback
- 🎨 **CSS Framework** - Tailwind CSS for rapid development

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Security**: Helmet, rate limiting, CORS, Joi validation
- **Database**: PostgreSQL with optimized indexes
- **Authentication**: JWT with bcrypt password hashing
- **Error Handling**: Global error handler with detailed logging
- **Logging**: Morgan for HTTP request logging

### Frontend (React + Vite)
- **State Management**: Zustand for global state
- **Data Fetching**: React Query for server state
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 📦 Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### 1. Database Setup
```bash
# Create database
createdb pern_ecommerce

# Run migrations
psql -d pern_ecommerce -f backend/schema-upgraded.sql
psql -d pern_ecommerce -f backend/migrations/add-missing-columns.sql
```

This will:
- Create all required tables
- Set up indexes and triggers
- Seed 8 sample products with images
- Add sample coupons

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev  # Runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev  # Runs on http://localhost:5174
```

### 4. Create Admin Account (Optional)
```bash
# First register an account through the UI, then:
psql -d pern_ecommerce -c "UPDATE users SET is_admin = true WHERE email = 'your@email.com';"
```

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=pern_ecommerce
JWT_SECRET=your_secure_random_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and receive JWT token

### Products
- `GET /api/products` - List products with filters & pagination
  - Query params: `search`, `category`, `brand`, `minPrice`, `maxPrice`, `featured`, `sort`, `page`, `limit`
- `GET /api/products/:id` - Get single product with images, variants, reviews
- `GET /api/products/meta/categories` - Get all categories with counts
- `GET /api/products/meta/brands` - Get all brands with counts
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews with pagination
- `POST /api/reviews` - Create/update review (requires purchase)
- `PUT /api/reviews/:id/helpful` - Mark review as helpful
- `DELETE /api/reviews/:id` - Delete own review

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add product to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist
- `GET /api/wishlist/check/:productId` - Check if product is in wishlist

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item

### Orders
- `POST /api/orders/checkout` - Create order from cart
- `GET /api/orders` - Get user's order history
- `GET /api/orders/:id` - Get single order details

### Addresses
- `GET /api/addresses` - Get user's saved addresses
- `POST /api/addresses` - Add new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with admin flag
- **products** - Products with SKU, brand, tags, pricing
- **product_images** - Multiple images per product
- **product_variants** - Size/color variants
- **reviews** - Customer reviews with ratings
- **wishlist** - User wishlists
- **addresses** - User shipping addresses
- **cart_items** - Shopping cart items
- **orders** - Order headers with status tracking
- **order_items** - Order line items
- **coupons** - Discount codes
- **coupon_usage** - Coupon usage tracking

## 📂 Project Structure

```
pern-ecommerce/
├── backend/
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validator.js         # Joi validation schemas
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── products.js          # Product CRUD
│   │   ├── cart.js              # Cart management
│   │   ├── orders.js            # Order processing
│   │   ├── reviews.js           # Product reviews
│   │   ├── wishlist.js          # Wishlist management
│   │   └── addresses.js         # Address management
│   ├── utils/
│   │   └── pagination.js        # Pagination helpers
│   ├── migrations/
│   │   └── add-missing-columns.sql
│   ├── db.js                    # Database connection
│   ├── server.js                # Express server
│   ├── schema-upgraded.sql      # Database schema
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.js        # Axios instance
    │   │   └── hooks.js         # React Query hooks
    │   ├── components/
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── StarRating.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ProductCard.jsx
    │   ├── pages/
    │   │   ├── Shop.jsx         # Product listing
    │   │   ├── ProductDetail.jsx # Product details
    │   │   ├── Cart.jsx         # Shopping cart
    │   │   ├── Wishlist.jsx     # Wishlist
    │   │   ├── Orders.jsx       # Order history
    │   │   ├── Profile.jsx      # User profile
    │   │   ├── Login.jsx        # Login page
    │   │   └── Register.jsx     # Registration
    │   ├── store/
    │   │   ├── useAuthStore.js  # Auth state
    │   │   └── useCartStore.js  # Cart state
    │   ├── lib/
    │   │   └── queryClient.js   # React Query config
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css            # Tailwind CSS
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## 🎨 UI Components

### Reusable Components
- **LoadingSpinner** - Configurable loading indicator
- **StarRating** - Interactive star rating (readonly & editable)
- **ProductCard** - Product display with wishlist, add to cart
- **Navbar** - Responsive navigation with cart count

### Tailwind Utility Classes
- `.btn` - Base button styles
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outlined button
- `.input` - Form input styles
- `.card` - Card container
- `.badge` - Status badges

## 🚀 Deployment

### Backend
```bash
cd backend
npm run build  # If needed
npm start      # Production mode
```

### Frontend
```bash
cd frontend
npm run build  # Creates dist/ folder
npm run preview # Preview production build
```

Deploy `dist/` to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

## 🔐 Security Features

1. **Helmet.js** - Sets secure HTTP headers
2. **Rate Limiting** - Prevents API abuse (100 req/15min general, 5 req/15min auth)
3. **CORS** - Configured for frontend origin only
4. **Input Validation** - Joi schemas for all requests
5. **JWT** - Secure token-based authentication
6. **Password Hashing** - bcrypt with salt rounds
7. **SQL Injection Prevention** - Parameterized queries
8. **XSS Protection** - Input sanitization

## 📊 Performance Optimizations

1. **Database Indexes** - Optimized queries on frequently accessed columns
2. **React Query Caching** - Reduces unnecessary API calls
3. **Pagination** - Efficient data loading
4. **Compression** - Response compression middleware
5. **Code Splitting** - Lazy loading with React.lazy
6. **Image Optimization** - Responsive images

## 🧪 Testing the Application

1. **Register** an account at http://localhost:5174/register
2. **Browse products** with filters (category, brand, price)
3. **View product details** - see images, reviews, variants
4. **Add to wishlist** ❤️
5. **Add to cart** 🛒
6. **Manage addresses** in Profile page
7. **Checkout** - select address and payment method
8. **View orders** - see order history and status
9. **Write reviews** - rate products you've purchased

## 🎯 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Admin dashboard UI
- [ ] Email notifications
- [ ] Product search with autocomplete
- [ ] Product recommendations
- [ ] Image upload functionality
- [ ] Order tracking with shipment updates
- [ ] Social login (Google, Facebook)
- [ ] Product comparison
- [ ] Gift cards & coupons UI
- [ ] Chat support
- [ ] Multi-language support
- [ ] Dark mode

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check connection
psql -d pern_ecommerce -c "SELECT 1"
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5174
lsof -ti:5174 | xargs kill -9
```

### Frontend Not Loading
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

## 📝 License

MIT

## 🙏 Acknowledgments

Built with modern web technologies:
- React + Vite
- Tailwind CSS
- React Query
- Zustand
- Express.js
- PostgreSQL

---

**Version:** 2.0.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready

## Deploy with Coolify

This repository is ready for a Git-based Coolify deployment using the root `Dockerfile`.

1. Install Coolify on a fresh Linux VPS, then open its dashboard on port `8000`.
2. Create a project and add a PostgreSQL resource in the same environment.
3. Create an Application resource from your Git repository and choose the `Dockerfile` build pack.
4. Set the application port to `3000` and its health-check path to `/health`.
5. Add the values from `backend/.env.example` as Coolify secrets. Paste the full PostgreSQL **Internal URL** into a runtime-only `DATABASE_URL` secret.

Coolify builds the React client and serves it together with the Express API in one container. Keep PostgreSQL private on the Coolify network; do not publish port `5432`.

### Production operations

The root `Dockerfile` provides a multi-stage production image and a `/health` Docker health check.

- Application port: `3000`
- Health check: `/health`
- Database: Coolify-managed PostgreSQL over private networking
- Secrets: configure only in Coolify; never commit `.env` files

### Backups and SSL

Use Coolify's PostgreSQL scheduled backups with an S3-compatible destination, retention policy, and periodic restore tests. Back up Coolify's own `/data/coolify/source/.env` separately.

For HTTPS, point an A/AAAA record for your domain at the VPS, add `https://your-domain` in the application Domains field, and let Coolify issue and renew the certificate.

