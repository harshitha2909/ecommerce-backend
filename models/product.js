var mongoose = require('mongoose');
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const ProductSchema = new mongoose.Schema({
    id: Number,
    name: String,
    description: String,
    category: [String],
    price: Number,
    site: String,
    url: String
});

ProductSchema.plugin(mongoose_fuzzy_searching, { fields: [{
    name: 'name',
    weight: 1,
    minSize: 3
  },{
    name: 'category',
    weight: 10,
    minSize: 3
  }]});

const Product = mongoose.model('Product', ProductSchema);



module.exports = { Product };