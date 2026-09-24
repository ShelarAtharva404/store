const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

// CHECKOUT: turn cart into an order
router.post("/checkout", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { address_id, payment_method = 'credit_card' } = req.body;
    if (!address_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Shipping address is required" });
    }

    const addressResult = await client.query(
      "SELECT id FROM addresses WHERE id = $1 AND user_id = $2",
      [address_id, req.user.id]
    );
    if (addressResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid shipping address" });
    }

    const cartResult = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }

    for (const item of cartResult.rows) {
      if (item.quantity > item.stock) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Not enough stock for ${item.name}` });
      }
    }

    const subtotal = cartResult.rows.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const tax = Number((subtotal * 0.1).toFixed(2));
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = Number((subtotal + tax + shipping).toFixed(2));

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, address_id, subtotal, tax, shipping, total, status, payment_method, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, 'pending') RETURNING *`,
      [req.user.id, address_id, subtotal, tax, shipping, total, payment_method]
    );
    const order = orderResult.rows[0];

    for (const item of cartResult.rows) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal) VALUES ($1, $2, $3, $4, $5, $6)",
        [order.id, item.product_id, item.name, item.quantity, item.price, Number(item.price) * item.quantity]
      );
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [
        item.quantity,
        item.product_id,
      ]);
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);

    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).json({ error: "Checkout failed" });
  } finally {
    client.release();
  }
});

// GET order history for current user
router.get("/", async (req, res) => {
  try {
    const orders = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(orders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single order with items
router.get("/:id", async (req, res) => {
  try {
    const order = await pool.query("SELECT * FROM orders WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user.id,
    ]);
    if (order.rows.length === 0) return res.status(404).json({ error: "Order not found" });

    const items = await pool.query(
      `SELECT oi.*, p.name,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) AS image_url
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );

    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
