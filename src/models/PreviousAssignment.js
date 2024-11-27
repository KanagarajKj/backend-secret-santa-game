const mongoose = require('mongoose');

// Previous Assignment Schema
const previousAssignmentSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear() - 1
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  secretName: {
    type: String,
    required: true,
    trim: true
  },
  secretEmail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  }
}, {
  timestamps: true
});

const createPreviousAssignmentModel = () => mongoose.model('PreviousAssignment', previousAssignmentSchema);

module.exports = {
  createPreviousAssignmentModel
};