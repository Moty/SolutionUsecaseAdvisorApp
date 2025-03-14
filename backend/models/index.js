/**
 * Models Index
 * 
 * This module exports all Mongoose models for easy importing.
 */

const UseCase = require('./useCase');
const NewUseCase = require('./newUseCase');
const UserData = require('./userData');

module.exports = {
  UseCase,
  NewUseCase,
  UserData
};
