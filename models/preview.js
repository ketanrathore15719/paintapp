const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const previewInvoiceSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  customerAddress: String,
  customerPhone: String,
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number,
      total: Number
    }
  ],
  gstPercentage: Number,
  total: Number,
  totalWithGst: Number,
  gst: Number,
  invoiceNumber: String,
  customerGSTNumber: String,
  billingDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

previewInvoiceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('preview_invoice', previewInvoiceSchema);
