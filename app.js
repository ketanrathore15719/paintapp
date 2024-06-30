const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
//mongoose.connect('mongodb://localhost/paint-shop', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://therealrathore:q94BB11oMAZTHxPc@cluster0.anaamsn.mongodb.net/paint-shop?retryWrites=true&w=majority&appName=Cluster0')
// Middleware
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
const hbs = require('hbs');

hbs.registerHelper('incrementedIndex', function(index) {
  return index + 1;
});

// Routes
const indexRouter = require('./routes/index');
const productsRouter = require('./routes/products');
const stockRouter = require('./routes/stock');
const invoiceRouter = require('./routes/invoice');

app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/stock', stockRouter);
app.use('/invoice', invoiceRouter);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
