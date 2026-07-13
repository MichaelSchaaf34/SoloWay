import * as reviewsService from './reviews.service.js';

export async function list(req, res, next) {
  try {
    const { reviews, stats } = await reviewsService.listReviews(req.query);
    res.json({ success: true, data: { reviews, stats } });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const review = await reviewsService.createReview(req.userId, req.body);
    res.status(201).json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await reviewsService.deleteReview(req.userId, req.params.reviewId);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
}
