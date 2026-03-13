/**
 * Itineraries controller
 */

import * as itinerariesService from './itineraries.service.js';

/**
 * Create a new itinerary
 */
export async function createItinerary(req, res, next) {
  try {
    const itinerary = await itinerariesService.createItinerary(req.userId, req.body);
    res.status(201).json({
      success: true,
      data: { itinerary },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's itineraries
 */
export async function getMyItineraries(req, res, next) {
  try {
    const { status, limit, cursor } = req.query;
    const result = await itinerariesService.getUserItineraries(req.userId, { status, limit, cursor });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single itinerary with items
 */
export async function getItinerary(req, res, next) {
  try {
    const itinerary = await itinerariesService.getItineraryWithItems(
      req.params.itineraryId,
      req.userId
    );
    res.json({
      success: true,
      data: { itinerary },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update itinerary
 */
export async function updateItinerary(req, res, next) {
  try {
    const itinerary = await itinerariesService.updateItinerary(
      req.params.itineraryId,
      req.userId,
      req.body
    );
    res.json({
      success: true,
      data: { itinerary },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete itinerary
 */
export async function deleteItinerary(req, res, next) {
  try {
    await itinerariesService.deleteItinerary(req.params.itineraryId, req.userId);
    res.json({
      success: true,
      message: 'Itinerary deleted',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add item to itinerary
 */
export async function addItem(req, res, next) {
  try {
    const item = await itinerariesService.addItem(
      req.params.itineraryId,
      req.userId,
      req.body
    );
    res.status(201).json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update itinerary item
 */
export async function updateItem(req, res, next) {
  try {
    const item = await itinerariesService.updateItem(
      req.params.itineraryId,
      req.params.itemId,
      req.userId,
      req.body
    );
    res.json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete itinerary item
 */
export async function deleteItem(req, res, next) {
  try {
    await itinerariesService.deleteItem(
      req.params.itineraryId,
      req.params.itemId,
      req.userId
    );
    res.json({
      success: true,
      message: 'Item deleted',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get public itineraries
 */
export async function getPublicItineraries(req, res, next) {
  try {
    const { limit, cursor } = req.query;
    const result = await itinerariesService.getPublicItineraries({ limit, cursor });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get nearby itineraries (geospatial query)
 */
export async function getNearbyItineraries(req, res, next) {
  try {
    const { latitude, longitude, radiusKm, limit } = req.query;
    const itineraries = await itinerariesService.getNearbyItineraries(
      latitude,
      longitude,
      radiusKm,
      limit
    );
    res.json({
      success: true,
      data: { itineraries },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Activate itinerary
 */
export async function activateItinerary(req, res, next) {
  try {
    const itinerary = await itinerariesService.updateItineraryStatus(
      req.params.itineraryId,
      req.userId,
      'active'
    );
    res.json({
      success: true,
      data: { itinerary },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Complete itinerary
 */
export async function completeItinerary(req, res, next) {
  try {
    const itinerary = await itinerariesService.updateItineraryStatus(
      req.params.itineraryId,
      req.userId,
      'completed'
    );
    res.json({
      success: true,
      data: { itinerary },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Duplicate itinerary
 */
export async function duplicateItinerary(req, res, next) {
  try {
    const itinerary = await itinerariesService.duplicateItinerary(
      req.params.itineraryId,
      req.userId
    );
    res.status(201).json({
      success: true,
      data: { itinerary },
    });
  } catch (error) {
    next(error);
  }
}
