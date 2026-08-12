import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ['user', 'guest', 'admin'],
      default: 'user',
    },
    membership: {
      planId: { type: String },
      planName: { type: String, default: 'Free' },
      startDate: { type: Date },
      endDate: { type: Date },
      dailyLimit: { type: Number, default: 2 },
      downloadsToday: { type: Number, default: 0 },
      lastDownloadDate: { type: Date },
    },
    downloadHistory: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productTitle: { type: String },
        downloadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
