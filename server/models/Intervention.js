// models/Intervention.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterventionSchema = new Schema({
  interventionTitre: { type: String, required: true },
  nomSociete: { type: String, required: true },
  telSociete: { type: String, required: true },
  email: { type: String, required: true },
  details: { type: String, required: true },
  address: {type:String, required: true},
  ville: {type:String, required: true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Intervention', InterventionSchema);
