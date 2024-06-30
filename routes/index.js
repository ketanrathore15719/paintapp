const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/home');
  // res.render('index');
});

router.get('/home', (req, res) => {
  res.render('home', {
    layout: 'layouts/default'
  });
});
module.exports = router;
