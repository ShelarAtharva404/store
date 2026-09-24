const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");

// GET all addresses for user
router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
    [req.user.id]
  );

  res.json(result.rows);
}));

// GET single address
router.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Address not found' });
  }

  res.json(result.rows[0]);
}));

// POST create address
router.post("/", requireAuth, validate(schemas.address), asyncHandler(async (req, res) => {
  const { full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;

  // If setting as default, unset other defaults
  if (is_default) {
    await pool.query(
      'UPDATE addresses SET is_default = false WHERE user_id = $1',
      [req.user.id]
    );
  }

  const result = await pool.query(
    `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [req.user.id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default]
  );

  res.status(201).json(result.rows[0]);
}));

// PUT update address
router.put("/:id", requireAuth, validate(schemas.address), asyncHandler(async (req, res) => {
  const { full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;

  // If setting as default, unset other defaults
  if (is_default) {
    await pool.query(
      'UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2',
      [req.user.id, req.params.id]
    );
  }

  const result = await pool.query(
    `UPDATE addresses SET
      full_name = $1, phone = $2, address_line1 = $3, address_line2 = $4,
      city = $5, state = $6, postal_code = $7, country = $8, is_default = $9
     WHERE id = $10 AND user_id = $11
     RETURNING *`,
    [full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default, req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Address not found' });
  }

  res.json(result.rows[0]);
}));

// DELETE address
router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *',
    [req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Address not found' });
  }

  res.json({ message: 'Address deleted' });
}));

module.exports = router;
