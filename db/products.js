const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  ptname: String,
  price: String,
  category: String,
  userId: String,
  company: String,
  quantity: String,
  
});

module.exports = mongoose.model("products", productSchema);
