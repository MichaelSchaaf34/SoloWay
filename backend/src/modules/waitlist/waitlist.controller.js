/**
 * Waitlist controller
 */

import * as waitlistService from './waitlist.service.js';

export async function joinWaitlist(req, res, next) {
  try {
    const result = await waitlistService.joinWaitlist(req.body.email);
    res.status(result.alreadyJoined ? 200 : 201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
