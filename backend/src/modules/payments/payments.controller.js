import * as paymentsService from './payments.service.js';

export async function createCheckout(req, res, next) {
  try {
    const result = await paymentsService.createCheckout(req.userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await paymentsService.getOrder(req.userId, req.params.orderId);
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function refundOrder(req, res, next) {
  try {
    const refund = await paymentsService.refundOrder(
      req.userId,
      req.params.orderId,
      req.body.reason
    );
    res.status(202).json({ success: true, data: { refund } });
  } catch (error) {
    next(error);
  }
}
