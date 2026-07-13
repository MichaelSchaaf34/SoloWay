import * as adminService from './admin.service.js';

export async function getStats(req, res, next) {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, data: { stats } });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { users, total } = await adminService.listUsers(req.query);
    res.json({ success: true, data: { users, total } });
  } catch (error) {
    next(error);
  }
}

export async function getUserDetail(req, res, next) {
  try {
    const user = await adminService.getUserDetail(req.params.userId);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await adminService.deleteUser(req.userId, req.params.userId);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
}

export async function listWaitlist(req, res, next) {
  try {
    const { entries, total } = await adminService.listWaitlist(req.query);
    res.json({ success: true, data: { entries, total } });
  } catch (error) {
    next(error);
  }
}

export async function listProviders(req, res, next) {
  try {
    const providers = await adminService.listProviders();
    res.json({ success: true, data: { providers } });
  } catch (error) {
    next(error);
  }
}

export async function listExperiences(req, res, next) {
  try {
    const { experiences, total } = await adminService.listExperiences(req.query);
    res.json({ success: true, data: { experiences, total } });
  } catch (error) {
    next(error);
  }
}

export async function updateExperience(req, res, next) {
  try {
    const experience = await adminService.setExperienceActive(
      req.userId,
      req.params.experienceId,
      req.body.isActive
    );
    res.json({ success: true, data: { experience } });
  } catch (error) {
    next(error);
  }
}

export async function listOrders(req, res, next) {
  try {
    const { orders, total } = await adminService.listOrders(req.query);
    res.json({ success: true, data: { orders, total } });
  } catch (error) {
    next(error);
  }
}

export async function getOrderDetail(req, res, next) {
  try {
    const order = await adminService.getOrderDetail(req.params.orderId);
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function refundOrder(req, res, next) {
  try {
    const refund = await adminService.refundOrder(
      req.userId,
      req.params.orderId,
      req.body.reason
    );
    res.json({ success: true, data: { refund } });
  } catch (error) {
    next(error);
  }
}

export async function listReviews(req, res, next) {
  try {
    const { reviews, total } = await adminService.listReviews(req.query);
    res.json({ success: true, data: { reviews, total } });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    await adminService.deleteReview(req.userId, req.params.reviewId);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
}

export async function listAuditLog(req, res, next) {
  try {
    const { entries, total } = await adminService.listAuditLog(req.query);
    res.json({ success: true, data: { entries, total } });
  } catch (error) {
    next(error);
  }
}
