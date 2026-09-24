const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

// GET user's wishlist
router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT w.*, p.*, 
      (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as image_url,
      (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
     FROM wishlist w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [req.user.id]
  );

  res.json(result.rows);
}));

// POST add to wishlist
router.post("/", requireAuth, asyncHandler(async (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }

  const result = await pool.query(
    `INSERT INTO wishlist (user_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING
     RETURNING *`,
    [req.user.id, product_id]
  );

  res.status(201).json(result.rows[0] || { message: 'Already in wishlist' });
}));

// DELETE remove from wishlist
router.delete("/:productId", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING *',
    [req.user.id, req.params.productId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Item not in wishlist' });
  }

  res.json({ message: 'Removed from wishlist' });
}));

// Check if product is in wishlist
router.get("/check/:productId", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT 1 FROM wishlist WHERE user_id = $1 AND product_id = $2',
    [req.user.id, req.params.productId]
  );

  res.json({ inWishlist: result.rows.length > 0 });
}));

module.exports = router;
