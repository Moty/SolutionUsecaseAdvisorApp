/**
 * Repository Interfaces Index
 * 
 * This module exports all repository interfaces for easy importing.
 */

const Repository = require('./repository');
const UseCaseRepository = require('./useCaseRepository');
const NewUseCaseRepository = require('./newUseCaseRepository');
const UserDataRepository = require('./userDataRepository');

module.exports = {
  Repository,
  UseCaseRepository,
  NewUseCaseRepository,
  UserDataRepository
};
