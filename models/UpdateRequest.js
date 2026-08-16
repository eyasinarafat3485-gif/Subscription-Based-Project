import mongoose from 'mongoose';

const UpdateRequestSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productSlug: {
      type: String,
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    requestedVersion: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.UpdateRequest || mongoose.model('UpdateRequest', UpdateRequestSchema);
