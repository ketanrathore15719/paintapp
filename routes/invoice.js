// const express = require('express');
// const router = express.Router();
// const Product = require('../models/product');

// // Create invoice
// router.get('/', async (req, res) => {
//   const products = await Product.find();
//   res.render('invoice', { products });
// });

// router.post('/create', async (req, res) => {
//   const { productId, quantity } = req.body;
//   const product = await Product.findById(productId);
//   const total = product.price * quantity;
//   const gst = total * 0.18; // Assuming 18% GST
//   const totalWithGst = total + gst;

//   // Here you would save the invoice to the database and/or print it

//   res.send(`Invoice created. Total: ${totalWithGst}`);
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Product = require('../models/product');
// const Invoice = require('../models/invoice');
// const PDFDocument = require('pdfkit');
// const path = require('path');
// const fs = require('fs');

// // Create invoice
// router.get('/', async (req, res) => {
//   const products = await Product.find();
//   res.render('invoice', { products });
// });

// router.post('/create', async (req, res) => {
//   const { customerName, customerEmail, customerAddress, productId, quantity, gstPercentage } = req.body;
//   const product = await Product.findById(productId);
//   const total = product.price * quantity;
//   const gst = total * (gstPercentage / 100);
//   const totalWithGst = total + gst;

//   const newInvoice = new Invoice({
//     customerName,
//     customerEmail,
//     customerAddress,
//     products: [{ productId, quantity, price: product.price }],
//     gstPercentage,
//     total,
//     totalWithGst
//   });

//   await newInvoice.save();

//   res.redirect(`/invoice/${newInvoice._id}`);
// });

// // List invoices
// router.get('/list', async (req, res) => {
//   const invoices = await Invoice.find().populate('products.productId');
//   res.render('invoices', { invoices });
// });

// // View invoice
// router.get('/:id', async (req, res) => {
//   const invoice = await Invoice.findById(req.params.id).populate('products.productId');
//   res.render('view-invoice', { invoice });
// });

// // Generate PDF
// router.get('/:id/pdf', async (req, res) => {
//   const invoice = await Invoice.findById(req.params.id).populate('products.productId');

//   const doc = new PDFDocument();
//   const filePath = path.join(__dirname, `../public/invoices/invoice-${invoice._id}.pdf`);
//   doc.pipe(fs.createWriteStream(filePath));

//   doc.text(`Invoice ID: ${invoice._id}`);
//   doc.text(`Customer Name: ${invoice.customerName}`);
//   doc.text(`Customer Email: ${invoice.customerEmail}`);
//   doc.text(`Customer Address: ${invoice.customerAddress}`);
//   doc.text(`GST Percentage: ${invoice.gstPercentage}%`);
//   doc.text(`Total: $${invoice.total}`);
//   doc.text(`Total with GST: $${invoice.totalWithGst}`);
  
//   doc.end();

//   res.download(filePath);
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Invoice = require('../models/invoice');
const PreviewInvoice = require('../models/preview');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const moment = require('moment');


// Ensure the invoices directory exists
const invoicesDir = path.join(__dirname, '../public/invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir);
}

// Create invoice
router.get('/create', async (req, res) => {
  const products = await Product.find();
  res.render('invoice/create', {
    layout: 'layouts/default',
    products: products
  });
});

router.get('/preview/:id', async (req, res) => {
  console.log(req.query, req.params)
  let invoice = await PreviewInvoice.findById(req.params.id).populate('products.productId').lean();
  
  invoice.billingDate = moment(invoice.billingDate || invoice.createdAt).format('DD/MM/YYYY hh:mm:ss a')
  console.log(invoice)
  res.render('invoice/preview', {
    layout: 'layouts/default',
    invoice: invoice
  });
});


router.post('/create', async (req, res) => {
  const { customerName, customerEmail, customerAddress, customerGSTNumber, customerPhone, productId, quantity, gstPercentage } = req.body;
  const product = await Product.findById(productId);
  const total = product.price * quantity;
  const gst = total * (gstPercentage / 100);
  const totalWithGst = total + gst;

  let lastInvoiceNumber = 0; // This could be fetched from a database or another persistent storage

  function generateInvoiceNumber() {
      lastInvoiceNumber++; // Increment the last invoice number
      return `INV-${lastInvoiceNumber.toString().padStart(5, '0')}`; // Format the invoice number
  }

  // Example usage
  let invoiceNumber = generateInvoiceNumber();

  const newInvoice = new PreviewInvoice({
    customerName,
    customerEmail,
    customerAddress,
    customerPhone,
    customerGSTNumber,
    products: [{ productId, quantity, price: product.price, total: total }],
    gstPercentage,
    total,
    totalWithGst,
    gst,
    invoiceNumber
  });

  // let preview = {
  //   customerName,
  //   customerEmail,
  //   customerAddress,
  //   products: [{ productId, quantity, price: product.price }],
  //   gstPercentage,
  //   total,
  //   totalWithGst,
  //   invoiceNumber
  // }

    // Convert preview object to query string
    // let queryString = querystring.stringify(preview);

    // res.redirect(`/invoice/preview?${queryString}`);
  await newInvoice.save();

  res.redirect(`/invoice/preview/${newInvoice._id}`);
});

// List invoices
router.get('/list', async (req, res) => {
  const invoices = await Invoice.find().populate('products.productId');
  res.render('invoice/list', {
    layout: 'layouts/default',
    invoices: invoices
  });
});

// View invoice
router.get('/:id', async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('products.productId');
  res.render('view-invoice', { invoice });
});

// Generate PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('products.productId');

    const doc = new PDFDocument();
    const filePath = path.join(invoicesDir, `invoice-${invoice._id}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text(`Invoice ID: ${invoice._id}`, { align: 'center' });
    doc.fontSize(16).text(`Customer Name: ${invoice.customerName}`, { align: 'left' });
    doc.text(`Customer Email: ${invoice.customerEmail}`, { align: 'left' });
    doc.text(`Customer Address: ${invoice.customerAddress}`, { align: 'left' });
    doc.text(`GST Percentage: ${invoice.gstPercentage}%`, { align: 'left' });
    doc.moveDown();

    doc.text('Products:', { underline: true });
    invoice.products.forEach(item => {
      doc.text(`${item.productId.name} - Quantity: ${item.quantity} - Price: $${item.price}`);
    });
  
    doc.moveDown();
    doc.text(`Total: $${invoice.total}`);
    doc.text(`Total with GST: $${invoice.totalWithGst}`);

    doc.end();
  
    var fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    // console.log("okokkooookok")
    // res.download(filePath)
    
    // doc.on('finish', () => {
    //   console.log("done")
      // var fileStream = fs.createReadStream(filePath);
      // fileStream.pipe(res);
      // res.download(filePath);
    // });
    
  } catch (error) {
    res.send("not download")
  }
});

module.exports = router;
