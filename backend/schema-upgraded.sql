-- Enhanced Schema with Reviews, Wishlist, Addresses, and More

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Products table (enhanced)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_price NUMERIC(10, 2), -- for showing discounts
    cost_price NUMERIC(10, 2), -- for profit tracking
    sku VARCHAR(100) UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    brand VARCHAR(100),
    weight NUMERIC(10, 2), -- in kg
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[], -- array of tags
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Product Images (multiple per product)
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Product Variants (size, color, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Small/Red"
    sku VARCHAR(100) UNIQUE,
    price_adjustment NUMERIC(10, 2) DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    options JSONB, -- {"size": "M", "color": "Red"}
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reviews and Ratings
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, user_id) -- one review per user per product
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cart items (enhanced)
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id, variant_id)
);

-- Orders (enhanced)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) DEFAULT 0,
    shipping NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | paid | processing | shipped | delivered | cancelled
    payment_method VARCHAR(50), -- credit_card | paypal | stripe | etc
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending | paid | failed | refunded
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Order items (enhanced)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL, -- snapshot at time of order
    variant_name VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL, -- price at time of purchase
    subtotal NUMERIC(10, 2) NOT NULL -- quantity * price
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- percentage | fixed
    discount_value NUMERIC(10, 2) NOT NULL,
    min_purchase NUMERIC(10, 2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    used_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (coupon_id, user_id, order_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_default_variant ON cart_items(user_id, product_id) WHERE variant_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_selected_variant ON cart_items(user_id, product_id, variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced sample products with more data
INSERT INTO products (name, description, price, compare_price, sku, stock, category, brand, is_featured, tags) VALUES
('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver. 2.4GHz wireless technology with 10m range. Adjustable DPI up to 1600.', 19.99, 29.99, 'WM-001', 50, 'Accessories', 'TechPro', true, ARRAY['wireless', 'ergonomic', 'office']),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches. N-key rollover and anti-ghosting. Durable aluminum frame.', 59.99, 79.99, 'KB-001', 30, 'Accessories', 'TechPro', true, ARRAY['rgb', 'mechanical', 'gaming']),
('27" Monitor', '1440p IPS monitor, 144Hz refresh rate. HDR10 support, 1ms response time. Perfect for gaming and productivity.', 249.99, 299.99, 'MON-001', 15, 'Displays', 'ViewMax', true, ARRAY['monitor', '144hz', 'gaming', 'ips']),
('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader. 4K@30Hz output. Compact aluminum design.', 34.99, 44.99, 'HUB-001', 40, 'Accessories', 'ConnectPlus', false, ARRAY['usb-c', 'hub', 'adapter']),
('Laptop Stand', 'Adjustable aluminum laptop stand. Ergonomic design with heat dissipation. Supports up to 17" laptops.', 29.99, 39.99, 'LS-001', 25, 'Accessories', 'ErgoDesk', false, ARRAY['stand', 'aluminum', 'ergonomic']),
('Wireless Headphones', 'Premium noise-cancelling wireless headphones. 30-hour battery life, Bluetooth 5.0. Premium audio quality.', 149.99, 199.99, 'WH-001', 20, 'Audio', 'SoundWave', true, ARRAY['wireless', 'noise-cancelling', 'bluetooth']),
('Webcam 4K', '4K ultra HD webcam with autofocus. Built-in dual microphones. Perfect for streaming and video calls.', 89.99, 119.99, 'WC-001', 35, 'Accessories', 'VisionCam', false, ARRAY['4k', 'webcam', 'streaming']),
('Gaming Chair', 'Ergonomic gaming chair with lumbar support. Adjustable armrests and reclining back. Premium PU leather.', 199.99, 249.99, 'GC-001', 10, 'Furniture', 'ComfortZone', true, ARRAY['gaming', 'chair', 'ergonomic'])
ON CONFLICT (sku) DO NOTHING;

-- Add product images
INSERT INTO product_images (product_id, image_url, alt_text, position) VALUES
(1, 'https://picsum.photos/seed/mouse1/800/600', 'Wireless Mouse - Front View', 1),
(1, 'https://picsum.photos/seed/mouse2/800/600', 'Wireless Mouse - Side View', 2),
(2, 'https://picsum.photos/seed/keyboard1/800/600', 'Mechanical Keyboard - Top View', 1),
(2, 'https://picsum.photos/seed/keyboard2/800/600', 'Mechanical Keyboard - RGB Lighting', 2),
(3, 'https://picsum.photos/seed/monitor1/800/600', '27 Monitor - Front', 1),
(3, 'https://picsum.photos/seed/monitor2/800/600', '27 Monitor - Side Profile', 2),
(4, 'https://picsum.photos/seed/hub1/800/600', 'USB-C Hub - Top View', 1),
(5, 'https://picsum.photos/seed/stand1/800/600', 'Laptop Stand - With Laptop', 1),
(6, 'https://picsum.photos/seed/headphones1/800/600', 'Wireless Headphones - Product Shot', 1),
(6, 'https://picsum.photos/seed/headphones2/800/600', 'Wireless Headphones - Worn', 2),
(7, 'https://picsum.photos/seed/webcam1/800/600', '4K Webcam - Front View', 1),
(8, 'https://picsum.photos/seed/chair1/800/600', 'Gaming Chair - Front', 1),
(8, 'https://picsum.photos/seed/chair2/800/600', 'Gaming Chair - Reclined', 2);

-- Sample users required by the review seed data below.
INSERT INTO users (name, email, password_hash) VALUES
('Demo Customer', 'demo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('Sample Shopper', 'shopper@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (email) DO NOTHING;

-- Sample reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase) VALUES
(1, 1, 5, 'Excellent mouse!', 'Very comfortable and responsive. Battery lasts forever!', true),
(1, 2, 4, 'Good value', 'Works great for the price. Only wish it had more buttons.', true),
(2, 1, 5, 'Best keyboard ever', 'The mechanical switches feel amazing. RGB is beautiful!', true),
(3, 2, 5, 'Perfect monitor', 'Colors are vibrant, no dead pixels. 144Hz is smooth!', true)
ON CONFLICT DO NOTHING;

-- Sample coupon
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_uses, valid_until) VALUES
('WELCOME10', 'Welcome discount - 10% off your first order', 'percentage', 10, 0, 1000, NOW() + INTERVAL '30 days'),
('SAVE20', 'Save $20 on orders over $100', 'fixed', 20, 100, 500, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;
