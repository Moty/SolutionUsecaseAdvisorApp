/**
 * MongoDB Repositories Index
 * 
 * This module exports all MongoDB repository implementations for easy importing.
 */

const BaseMongoRepository = require('./baseRepository');
const UseCaseMongoRepository = require('./useCaseRepository');
const NewUseCaseMongoRepository = require('./newUseCaseRepository');
const UserDataMongoRepository = require('./userDataRepository');

module.exports = {
  BaseMongoRepository,
  UseCaseMongoRepository,
  NewUseCaseMongoRepository,
  UserDataMongoRepository
};
