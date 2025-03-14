/**
 * New Use Case Model
 * 
 * This module defines the Mongoose schema for new use cases.
 * New use cases are user-specific and can be created from unmatched PDFs.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Extracted Fields Schema
 */
const extractedFieldsSchema = new Schema({
  focusArea: {
    type: String,
    default: ''
  },
  process: {
    type: String,
    default: ''
  },
  affected: {
    type: String,
    default: ''
  },
  improvement: {
    type: String,
    default: ''
  },
  howToImprove: {
    type: String,
    default: ''
  }
}, { _id: false });

/**
 * Mapped Fields Schema
 */
const mappedFieldsSchema = new Schema({
  UseCaseName: {
    type: String,
    required: true
  },
  UserRole: {
    type: String,
    required: true
  },
  Challenge: {
    type: String,
    required: true
  },
  Enablers: {
    type: String,
    default: ''
  },
  KeyBenefits: {
    type: String,
    default: ''
  },
  MappedSolution: {
    type: String,
    default: ''
  },
  UseCaseID: {
    type: String,
    required: true
  }
}, { _id: false });

/**
 * New Use Case Schema
 */
const newUseCaseSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  extractedFields: {
    type: extractedFieldsSchema,
    required: true
  },
  mappedFields: {
    type: mappedFieldsSchema,
    required: true
  },
  pdfFileName: {
    type: String,
    default: 'unknown.pdf'
  },
  notes: {
    type: String,
    default: ''
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
 * Create text indexes for keyword search
 */
newUseCaseSchema.index({
  'mappedFields.UseCaseName': 'text',
  'mappedFields.Challenge': 'text',
  'mappedFields.KeyBenefits': 'text',
  'mappedFields.MappedSolution': 'text',
  'extractedFields.process': 'text',
  'extractedFields.howToImprove': 'text',
  notes: 'text'
});

/**
 * New Use Case Model
 */
const NewUseCase = mongoose.model('NewUseCase', newUseCaseSchema);

module.exports = NewUseCase;
