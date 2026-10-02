import * as bloodRelRepo from './blood-relation.repository.js';
import { NotFoundError, ConflictError } from '../../shared/errors/app-error.js';
import { BLOOD_RELATIONS } from '../../config/constants.js';

export async function getRelationsByUser(userId) {
  return bloodRelRepo.findByUser(userId);
}

export async function initializeRelations(userId) {
  await bloodRelRepo.initialize(userId, BLOOD_RELATIONS);
  return bloodRelRepo.findByUser(userId);
}

export async function useRelationLeave(userId, data) {
  const record = await bloodRelRepo.findOne(userId, data.relation);
  if (!record) {
    throw new NotFoundError('Blood relation leave not initialized. Contact admin.');
  }

  if (record.isUsed) {
    throw new ConflictError(`Blood relation leave for ${data.relation} has already been used`);
  }

  await bloodRelRepo.markUsed(record.id, null);

  return {
    relation: data.relation,
    status: 'CONSUMED',
    usedDate: new Date().toISOString()
  };
}
