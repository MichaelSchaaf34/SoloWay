import * as eventsService from './events.service.js';

export async function list(req, res, next) {
  try {
    const events = await eventsService.listDestinationEvents(req.query);
    res.json({ success: true, data: { events } });
  } catch (error) {
    next(error);
  }
}
