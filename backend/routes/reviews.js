const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");
const { paginate, paginateResponse } = require("../utils/pagination");

// GET reviews for a product
router.get("/product/:productId", asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'recent' } = req.query;
  const { productId } = req.params;
  const { limit: queryLimit, offset } = paginate(page, limit);

  let orderBy = 'r.created_at DESC';
  if (sort === 'helpful') orderBy = 'r.helpful_count DESC, r.created_at DESC';
  else if (sort === 'rating_high') orderBy = 'r.rating DESC, r.created_at DESC';
  else if (sort === 'rating_low') orderBy = 'r.rating ASC, r.created_at DESC';

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM reviews WHERE product_id = $1',
    [productId]
  );

  const result = await pool.query(
    `SELECT r.*, u.name as user_name, u.avatar_url
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = $1
     ORDER BY ${orderBy}
     LIMIT $2 OFFSET $3`,
    [productId, queryLimit, offset]
  );

  // Get rating summary
  const summaryResult = await pool.query(
    `SELECT 
      AVG(rating)::numeric(3,2) as average_rating,
      COUNT(*) as total_reviews,
      COUNT(*) FILTER (WHERE rating = 5) as five_star,
      COUNT(*) FILTER (WHERE rating = 4) as four_star,
      COUNT(*) FILTER (WHERE rating = 3) as three_star,
      COUNT(*) FILTER (WHERE rating = 2) as two_star,
      COUNT(*) FILTER (WHERE rating = 1) as one_star
     FROM reviews
     WHERE product_id = $1`,
    [productId]
  );

  res.json({
    reviews: paginateResponse(result.rows, page, queryLimit, countResult.rows[0].count),
    summary: summaryResult.rows[0]
  });
}));

// POST create review
router.post("/", requireAuth, validate(schemas.review), asyncHandler(async (req, res) => {
  const { product_id, rating, title, comment } = req.body;
  const userId = req.user.id;

  // Check if user has purchased this product
  const purchaseCheck = await pool.query(
    `SELECT 1 FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE o.user_id = $1 AND oi.product_id = $2 AND o.payment_status = 'paid'
     LIMIT 1`,
    [userId, product_id]
  );

  const isVerifiedPurchase = purchaseCheck.rows.length > 0;

  const result = await pool.query(
    `INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (product_id, user_id) 
     DO UPDATE SET rating = $3, title = $4, comment = $5, updated_at = NOW()
     RETURNING *`,
    [product_id, userId, rating, title, comment, isVerifiedPurchase]
  );

  res.status(201).json(result.rows[0]);
}));

// PUT update review helpful count
router.put("/:id/helpful", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING *',
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Review not found' });
  }

  res.json(result.rows[0]);
}));

// DELETE review
router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *',
    [req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Review not found or unauthorized' });
  }

  res.json({ message: 'Review deleted' });
}));

module.exports = router;
