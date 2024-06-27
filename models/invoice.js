const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const invoiceSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  customerAddress: String,
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number
    }
  ],
  gstPercentage: Number,
  total: Number,
  totalWithGst: Number,
  createdAt: { type: Date, default: Date.now }
});

invoiceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Invoice', invoiceSchema);
