/**
 * User Data Model
 * 
 * This module defines the Mongoose schema for user data.
 * User data includes favorites, annotations, ratings, and filter history.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Rating Schema
 */
const ratingSchema = new Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/**
 * Filter History Item Schema
 */
const filterHistoryItemSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  filters: {
    type: Object,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/**
 * User Data Schema
 */
const userDataSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  favorites: {
    type: [String],
    default: []
  },
  annotations: {
    type: Map,
    of: String,
    default: () => new Map()
  },
  ratings: {
    type: Map,
    of: ratingSchema,
    default: () => new Map()
  },
  filterHistory: {
    type: [filterHistoryItemSchema],
    default: []
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
 * User Data Model
 */
const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;
