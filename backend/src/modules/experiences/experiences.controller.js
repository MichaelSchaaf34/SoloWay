import * as experiencesService from './experiences.service.js';

export async function list(req, res, next) {
  try {
    const experiences = await experiencesService.listExperiences(req.query);
    res.json({ success: true, data: { experiences } });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const experience = await experiencesService.createExperience(req.userId, req.body);
    res.status(201).json({ success: true, data: { experience } });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const experience = await experiencesService.updateExperience(
      req.userId,
      req.params.experienceId,
      req.body
    );
    res.json({ success: true, data: { experience } });
  } catch (error) {
    next(error);
  }
}
