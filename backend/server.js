const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { errorHandler } = require("./middleware/errorHandler");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const reviewRoutes = require("./routes/reviews");
const wishlistRoutes = require("./routes/wishlist");
const addressRoutes = require("./routes/addresses");

const app = express();
const PORT = process.env.PORT || 5000;
app.set("trust proxy", 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: { upgradeInsecureRequests: null },
  },
}));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.'
});

// Body parsing & compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);

// Root endpoint for local API discovery.
// The production container serves the React app at this path instead.
if (process.env.NODE_ENV !== "production") {
app.get("/", (req, res) => {
  res.json({ 
    message: "PERN E-Commerce API v2.0",
    docs: "/api/docs",
    health: "/health"
  });
});
}

// Serve the compiled React single-page app from the production container.
if (process.env.NODE_ENV === "production") {
  const publicDir = path.join(__dirname, "public");
  app.use(express.static(publicDir));
  app.get("*", (req, res) => res.sendFile(path.join(publicDir, "index.html")));
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
