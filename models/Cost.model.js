const mongoose = require('mongoose');

const CostSchema = new mongoose.Schema({
  _id: { 
    type: mongoose.Schema.ObjectId,
    default: null 
  },
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['main', 'extra'], 
    required: true 
  },
  cost_type: { 
    type: String, 
    enum: ['material', 'hr', 'place', 'energy'], 
    required: true 
  },
  value: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    required: true 
  },
  unit: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
});

module.exports = mongoose.model('Cost', CostSchema);
