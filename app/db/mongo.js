const config = require('../config');
const mongoose = require('mongoose');


// mongodb connection
mongoose.connect(config.mongodb.uri);


const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String
  },
  brand_name: {
    type: String
  },
  category_slug: {
    type: String
  },
  highlights: {
    type: [String]
  },
  price: {
    type: Object
  },
  enablePriceDrop: {
    type: Boolean,
    default: false
  }
})


const ProductHighlightSchema = new mongoose.Schema({
  company_id:  {
    type: String,
  },
  application_id: {
    type: String,
  },
  product_item_code: {
    type: Number,
    unique: true,
    index: true
  },
  product_slug: {
    type: String,
    unique: true,
    index: true
  },
  product: {
    type: ProductSchema
  },
  is_active: {
    type: Boolean,
    default: false
  }
})


const ProxySchema = new mongoose.Schema({
  company_id: {
    type: String,
    required: true
  },
  application_id: {
    type: String,
    required: true
  },
  attached_path: {
    type: String
  },
  proxy_url:{
    type: String
  },
})


const PriceDropSchema = new mongoose.Schema({
  product_slug: {
    type: String,
    require: true,
    index: true,
    unique: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})
PriceDropSchema.pre('save', function(next) {
  let now = Date.now();
  this.updatedAt = now;
  next();
})
PriceDropSchema.path('updatedAt').index({expires: 172800}) // 172800 seconds == 2 days


const ProductHighlightRecord = mongoose.model("productHighlight", ProductHighlightSchema);
const ProxyRecord = mongoose.model("Proxy", ProxySchema);
const PriceDropRecord = mongoose.model("PriceDrop", PriceDropSchema);


module.exports = { ProductHighlightRecord, ProxyRecord, PriceDropRecord }