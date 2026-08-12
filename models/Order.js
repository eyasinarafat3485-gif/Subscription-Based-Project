import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderType: { type: String, enum: ['single_product', 'membership'], required: true },
    planId: { type: String },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['bkash', 'nagad', 'sslcommerz', 'stripe'], required: true },
    transactionId: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
