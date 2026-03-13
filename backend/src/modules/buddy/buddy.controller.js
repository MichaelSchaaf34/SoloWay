import * as buddyService from './buddy.service.js';

export async function createInvite(req, res, next) {
  try {
    const result = await buddyService.createInvite(
      req.userId,
      req.body.itinerary_item_id,
      {
        party_size_cap: req.body.party_size_cap,
        token_ttl_minutes: req.body.token_ttl_minutes,
      }
    );
    const statusCode = result.already_exists ? 200 : 201;
    res.status(statusCode).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getInviteDetails(req, res, next) {
  try {
    const result = await buddyService.getInviteByToken(req.params.token);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function cancelInvite(req, res, next) {
  try {
    const result = await buddyService.cancelInvite(req.params.token, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function closeLink(req, res, next) {
  try {
    const result = await buddyService.closeLink(req.params.linkId, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const result = await buddyService.getUserHistory(req.userId, {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getHistoryDetail(req, res, next) {
  try {
    const result = await buddyService.getLinkDetail(req.params.linkId, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function joinPreview(req, res, next) {
  try {
    const result = await buddyService.getInviteByToken(req.params.token);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }
    res.json({
      valid: true,
      event_title: result.event?.title,
      event_location: result.event?.location_name,
      event_time: result.event?.start_time,
      host_name: result.host_name,
      spots_remaining: result.spots_remaining,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyPhone(req, res, next) {
  try {
    const result = await buddyService.initiateGuestVerification(
      req.params.token,
      req.body.phone_number,
      req.body.display_name
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function confirmCode(req, res, next) {
  try {
    const result = await buddyService.confirmGuestAndActivate(
      req.params.token,
      req.body.phone_number,
      req.body.code
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function requestConnection(req, res, next) {
  try {
    const result = await buddyService.requestConnection(req.params.linkId, req.userId);
    const statusCode = result.already_exists ? 200 : 201;
    res.status(statusCode).json(result);
  } catch (err) {
    next(err);
  }
}

export async function respondToConnection(req, res, next) {
  try {
    const result = await buddyService.respondToConnection(
      req.params.connectionId,
      req.userId,
      req.body.action
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
