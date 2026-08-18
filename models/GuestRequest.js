import mongoose from 'mongoose';

const GuestRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userImage: { type: String },
    userCreatedAt: { type: Date },
    
    status: {
      type: String,
      enum: ['REQUESTED', 'COUPON_SENT', 'COUPON_SUBMITTED', 'APPROVED', 'REJECTED', 'DELETED'],
      default: 'REQUESTED',
    },
    couponCode: { type: String },
    
    requestedAt: { type: Date, default: Date.now },
    couponSentAt: { type: Date },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    deletedAt: { type: Date },

    isReadByAdmin: { type: Boolean, default: false },
    isReadByUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.GuestRequest) {
  delete mongoose.models.GuestRequest;
}

const GuestRequest = mongoose.model('GuestRequest', GuestRequestSchema);

export default GuestRequest;
