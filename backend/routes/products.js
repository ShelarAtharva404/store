const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");
const { paginate, paginateResponse } = require("../utils/pagination");

// GET all products with filters, search, and pagination
router.get("/", asyncHandler(async (req, res) => {
  const { 
    category, 
    search, 
    brand,
    minPrice, 
    maxPrice,
    featured,
    sort = 'newest',
    page = 1,
    limit = 12
  } = req.query;

  const { limit: queryLimit, offset } = paginate(page, limit);
  let query = `
    SELECT p.*,
      (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as image_url,
      (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.image_url, 'alt', pi.alt_text) ORDER BY pi.position)
       FROM product_images pi WHERE pi.product_id = p.id) as images,
      (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
    FROM products p
    WHERE p.is_active = true
  `;
  const params = [];

  if (category) {
    params.push(category);
    query += ` AND p.category = $${params.length}`;
  }
  if (brand) {
    params.push(brand);
    query += ` AND p.brand = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
  }
  if (minPrice) {
    params.push(minPrice);
    query += ` AND p.price >= $${params.length}`;
  }
  if (maxPrice) {
    params.push(maxPrice);
    query += ` AND p.price <= $${params.length}`;
  }
  if (featured === 'true') {
    query += ` AND p.is_featured = true`;
  }

  // Sorting
  let orderBy = 'p.created_at DESC';
  if (sort === 'price_low') orderBy = 'p.price ASC';
  else if (sort === 'price_high') orderBy = 'p.price DESC';
  else if (sort === 'name') orderBy = 'p.name ASC';
  else if (sort === 'popular') orderBy = '(SELECT COUNT(*) FROM reviews WHERE product_id = p.id) DESC';

  query += ` ORDER BY ${orderBy}`;

  // Get total count
  const countQuery = query.replace(/^[\s\S]*?FROM products p/, 'SELECT COUNT(*) FROM products p').split('ORDER BY')[0];
  const countResult = await pool.query(countQuery, params);

  // Add pagination
  params.push(queryLimit);
  query += ` LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const result = await pool.query(query, params);

  res.json(paginateResponse(result.rows, page, queryLimit, countResult.rows[0].count));
}));

// GET single product with all details
router.get("/:id", asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT p.*,
      (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.image_url, 'alt', pi.alt_text, 'position', pi.position) ORDER BY pi.position)
       FROM product_images pi WHERE pi.product_id = p.id) as images,
      (SELECT json_agg(json_build_object('id', pv.id, 'name', pv.name, 'sku', pv.sku, 'price_adjustment', pv.price_adjustment, 'stock', pv.stock, 'options', pv.options))
       FROM product_variants pv WHERE pv.product_id = p.id) as variants,
      (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count,
      (SELECT COUNT(*) FROM wishlist WHERE product_id = p.id) as wishlist_count
     FROM products p
     WHERE p.id = $1`,
    [req.params.id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  
  res.json(result.rows[0]);
}));

// CREATE product (admin only)
router.post("/", requireAuth, requireAdmin, validate(schemas.product), asyncHandler(async (req, res) => {
  const { name, description, price, compare_price, sku, stock, category, brand, weight, is_active, is_featured, tags } = req.body;
  
  const result = await pool.query(
    `INSERT INTO products (name, description, price, compare_price, sku, stock, category, brand, weight, is_active, is_featured, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [name, description, price, compare_price, sku, stock || 0, category, brand, weight, is_active !== false, is_featured || false, tags]
  );
  
  res.status(201).json(result.rows[0]);
}));

// UPDATE product (admin only)
router.put("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { name, description, price, compare_price, sku, stock, category, brand, weight, is_active, is_featured, tags } = req.body;
  
  const result = await pool.query(
    `UPDATE products SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       price = COALESCE($3, price),
       compare_price = COALESCE($4, compare_price),
       sku = COALESCE($5, sku),
       stock = COALESCE($6, stock),
       category = COALESCE($7, category),
       brand = COALESCE($8, brand),
       weight = COALESCE($9, weight),
       is_active = COALESCE($10, is_active),
       is_featured = COALESCE($11, is_featured),
       tags = COALESCE($12, tags),
       updated_at = NOW()
     WHERE id = $13 RETURNING *`,
    [name, description, price, compare_price, sku, stock, category, brand, weight, is_active, is_featured, tags, req.params.id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  
  res.json(result.rows[0]);
}));

// DELETE product (admin only)
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [req.params.id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  
  res.json({ message: "Product deleted" });
}));

// GET categories (with product counts)
router.get("/meta/categories", asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT category, COUNT(*) as count
     FROM products
     WHERE is_active = true AND category IS NOT NULL
     GROUP BY category
     ORDER BY count DESC`
  );
  
  res.json(result.rows);
}));

// GET brands (with product counts)
router.get("/meta/brands", asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT brand, COUNT(*) as count
     FROM products
     WHERE is_active = true AND brand IS NOT NULL
     GROUP BY brand
     ORDER BY count DESC`
  );
  
  res.json(result.rows);
}));

module.exports = router;
