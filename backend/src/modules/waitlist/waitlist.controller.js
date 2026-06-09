import * as waitlistService from './waitlist.service.js';

export async function join(req, res, next) {
  try {
    const { email, referralCode } = req.body;
    const result = await waitlistService.joinWaitlist({ email, referralCode });
    res.status(result.alreadyJoined ? 200 : 201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
