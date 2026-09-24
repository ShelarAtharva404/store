-- Run once: psql -U postgres -d pern_ecommerce -f schema.sql

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | paid | shipped | delivered
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL -- price at time of purchase
);

-- Sample products
INSERT INTO products (name, description, price, image_url, stock, category) VALUES
('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 19.99, 'https://picsum.photos/seed/mouse/400/300', 50, 'Accessories'),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard', 59.99, 'https://picsum.photos/seed/keyboard/400/300', 30, 'Accessories'),
('27" Monitor', '1440p IPS monitor, 144Hz', 249.99, 'https://picsum.photos/seed/monitor/400/300', 15, 'Displays'),
('USB-C Hub', '7-in-1 USB-C hub with HDMI and SD card slot', 34.99, 'https://picsum.photos/seed/hub/400/300', 40, 'Accessories'),
('Laptop Stand', 'Adjustable aluminum laptop stand', 29.99, 'https://picsum.photos/seed/stand/400/300', 25, 'Accessories')
ON CONFLICT DO NOTHING;
