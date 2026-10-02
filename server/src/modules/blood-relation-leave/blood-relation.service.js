import * as bloodRelRepo from './blood-relation.repository.js';
import * as userService from '../user/user.service.js';
import { NotFoundError, ConflictError } from '../../shared/errors/app-error.js';
import { BLOOD_RELATIONS, EVENTS } from '../../config/constants.js';
import eventBus from '../../shared/event-bus.js';

// Every employee is entitled to all relations, so create the records on first access
export async function getRelationsByUser(userId) {
  const relations = await bloodRelRepo.findByUser(userId);
  if (relations.length === BLOOD_RELATIONS.length) return relations;

  await bloodRelRepo.initialize(userId, BLOOD_RELATIONS);
  return bloodRelRepo.findByUser(userId);
}

export async function initializeRelations(userId) {
  await bloodRelRepo.initialize(userId, BLOOD_RELATIONS);
  return bloodRelRepo.findByUser(userId);
}

export async function useRelationLeave(userId, data) {
  await getRelationsByUser(userId);

  const record = await bloodRelRepo.findOne(userId, data.relation);
  if (!record) {
    throw new NotFoundError('Blood relation leave not found');
  }

  if (record.isUsed) {
    throw new ConflictError(`Blood relation leave for ${data.relation} has already been used`);
  }

  const consumed = await bloodRelRepo.markUsed(record.id, null);
  if (!consumed) {
    throw new ConflictError(`Blood relation leave for ${data.relation} has already been used`);
  }

  const user = await userService.getUserById(userId).catch(() => null);
  eventBus.emit(EVENTS.BLOOD_RELATION_USED, {
    userId,
    relation: data.relation,
    recordId: consumed.id,
    employeeName: user ? `${user.firstName} ${user.lastName}` : 'An employee',
    managerId: user?.manager?.id || null
  });

  return consumed;
}
