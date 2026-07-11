import * as providersService from './providers.service.js';

export async function getMine(req, res, next) {
  try {
    const provider = await providersService.getProviderForUser(req.userId);
    res.json({ success: true, data: { provider } });
  } catch (error) {
    next(error);
  }
}

export async function createOnboardingLink(req, res, next) {
  try {
    const result = await providersService.createOnboardingLink(
      req.userId,
      req.body.displayName
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
