/**
 * Users controller
 */

import * as usersService from './users.service.js';

/**
 * Get current user's profile
 */
export async function getProfile(req, res, next) {
  try {
    const user = await usersService.getUserProfile(req.userId);
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req, res, next) {
  try {
    const user = await usersService.updateProfile(req.userId, req.body);
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(req, res, next) {
  try {
    await usersService.deleteAccount(req.userId);
    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user location
 */
export async function updateLocation(req, res, next) {
  try {
    const { latitude, longitude } = req.body;
    await usersService.updateLocation(req.userId, latitude, longitude);
    res.json({
      success: true,
      message: 'Location updated',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update visibility mode
 */
export async function updateVisibility(req, res, next) {
  try {
    const { visibilityMode } = req.body;
    await usersService.updateVisibility(req.userId, visibilityMode);
    res.json({
      success: true,
      message: 'Visibility updated',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get trusted contacts
 */
export async function getTrustedContacts(req, res, next) {
  try {
    const contacts = await usersService.getTrustedContacts(req.userId);
    res.json({
      success: true,
      data: { contacts },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add trusted contact
 */
export async function addTrustedContact(req, res, next) {
  try {
    const contact = await usersService.addTrustedContact(req.userId, req.body);
    res.status(201).json({
      success: true,
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove trusted contact
 */
export async function removeTrustedContact(req, res, next) {
  try {
    await usersService.removeTrustedContact(req.userId, req.params.contactId);
    res.json({
      success: true,
      message: 'Contact removed',
    });
  } catch (error) {
    next(error);
  }
}
