import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
    },
    subcategory: { type: String },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    isFreeForVIP: { type: Boolean, default: true },
    demoUrl: { type: String, default: '#' },
    fileUrl: { type: String, default: '#' },
    version: { type: String, default: 'v1.0.0' },
    changelog: [
      {
        version: { type: String },
        date: { type: Date, default: Date.now },
        notes: { type: String },
      },
    ],
    thumbnail: { type: String },
    screenshots: [{ type: String }],
    tags: [{ type: String }],
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    downloadCount: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
