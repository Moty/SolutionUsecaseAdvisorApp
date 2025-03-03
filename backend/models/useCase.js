/**
 * Use Case Model
 * 
 * This module defines the Mongoose schema for use cases.
 * It represents the global use cases that are available to all users.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Use Case Schema
 */
const useCaseSchema = new Schema({
  useCaseId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  useCaseName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true,
    index: true
  },
  challenge: {
    type: String,
    required: true
  },
  valueDrivers: {
    type: String,
    default: ''
  },
  enablers: {
    type: String,
    default: ''
  },
  baselineWithoutAI: {
    type: String,
    default: ''
  },
  newWorldWithAI: {
    type: String,
    default: ''
  },
  mappedSolution: {
    type: String,
    required: true
  },
  keyBenefits: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Pre-save middleware to extract module from useCaseId
 */
useCaseSchema.pre('save', function(next) {
  if (this.isModified('useCaseId') || !this.module) {
    // Extract module from useCaseId (e.g., "ERP_01" -> "ERP")
    this.module = this.useCaseId.split('_')[0];
  }
  next();
});

/**
 * Create text indexes for keyword search
 */
useCaseSchema.index({
  useCaseName: 'text',
  challenge: 'text',
  keyBenefits: 'text',
  mappedSolution: 'text'
});

/**
 * Use Case Model
 */
const UseCase = mongoose.model('UseCase', useCaseSchema);

module.exports = UseCase;
