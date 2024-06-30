const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// List products
router.get('/add', async (req, res) => {
  res.render('products/add', {
    layout: 'layouts/default'
  });
});


router.get('/list', async (req, res) => {
  const products = await Product.find();
  res.render('products/list', {
    layout: 'layouts/default',
    products: products
  });
});

// Add a product
router.post('/add', async (req, res) => {
  const { name, category, quantity, price } = req.body;
  const newProduct = new Product({ name, category, quantity, price });
  await newProduct.save();
  res.redirect('/products/list');
});

module.exports = router;
