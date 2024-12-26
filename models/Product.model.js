const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  _id: { 
    type: mongoose.Schema.ObjectId,
    default: null 
  },
  name: { 
    type: String, 
    required: true 
  },
  base_quantity : { 
    type: Number, 
    required: true 
  },
  costs: [
    {
      cost: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cost', 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true 
      },
      unit: { 
        type: String, 
        required: true 
      }
    }
  ], // Array of objects containing reference to cost_element, quantity, and unit. The cost element can be grouped by category or cost_type (later).
  unit_total_cost: { 
    type: Number, 
    required: true,
    default: 0 
  },
  unit_price: { 
    type: Number, 
    required: true 
  },
  imageUrl:{
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Product', ProductSchema);
