const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Show stock
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.render('stock', { products });
});

module.exports = router;
