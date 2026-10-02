import * as bloodRelService from './blood-relation.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export async function getMyRelations(req, res, next) {
  try {
    const relations = await bloodRelService.getRelationsByUser(req.user.id);
    sendSuccess(res, 'Blood relation leaves fetched', relations);
  } catch (err) {
    next(err);
  }
}

export async function getUserRelations(req, res, next) {
  try {
    const relations = await bloodRelService.getRelationsByUser(req.params.userId);
    sendSuccess(res, 'Blood relation leaves fetched', relations);
  } catch (err) {
    next(err);
  }
}

export async function initializeRelations(req, res, next) {
  try {
    const relations = await bloodRelService.initializeRelations(req.body.userId);
    sendSuccess(res, 'Blood relation leaves initialized', relations, 201);
  } catch (err) {
    next(err);
  }
}

export async function useRelationLeave(req, res, next) {
  try {
    const result = await bloodRelService.useRelationLeave(req.user.id, req.body);
    sendSuccess(res, 'Blood relation leave consumed', result);
  } catch (err) {
    next(err);
  }
}
