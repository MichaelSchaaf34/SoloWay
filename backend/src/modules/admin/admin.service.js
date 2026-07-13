/**
 * Admin service — cross-user reads and moderation actions.
 * Every route using this service sits behind authenticate + requireAdmin.
 * Mutating actions are recorded in admin_audit_log.
 */

import { query } from '../../shared/database/index.js';
import {
  ConflictError,
  NotFoundError,
} from '../../shared/middleware/errorHandler.js';
import * as usersService from '../users/users.service.js';
import * as paymentsService from '../payments/payments.service.js';

async function logAdminAction(adminUserId, action, targetType, targetId, metadata = null) {
  await query(
    `INSERT INTO admin_audit_log (admin_user_id, action, target_type, target_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [adminUserId, action, targetType, targetId ? String(targetId) : null, metadata]
  );
}

// ============================================
// Dashboard
// ============================================

export async function getStats() {
  const totalsResult = await query(
    `SELECT
       (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_7d,
       (SELECT COUNT(*) FROM waitlist) AS waitlist_count,
       (SELECT COUNT(*) FROM itineraries) AS itinerary_count,
       (SELECT COUNT(*) FROM providers) AS provider_count,
       (SELECT COUNT(*) FROM experiences WHERE is_active) AS active_experience_count,
       (SELECT COUNT(*) FROM reviews) AS review_count,
       (SELECT COUNT(*) FROM orders) AS order_count,
       (SELECT COALESCE(SUM(total_cents), 0) FROM orders WHERE status IN ('paid', 'fulfilled')) AS gross_revenue_cents,
       (SELECT COALESCE(SUM(commission_cents), 0) FROM orders WHERE status IN ('paid', 'fulfilled')) AS commission_revenue_cents`
  );
  const totals = totalsResult.rows[0];

  const ordersByStatusResult = await query(
    `SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC`
  );

  return {
    totalUsers: Number(totals.total_users),
    newUsers7d: Number(totals.new_users_7d),
    waitlistCount: Number(totals.waitlist_count),
    itineraryCount: Number(totals.itinerary_count),
    providerCount: Number(totals.provider_count),
    activeExperienceCount: Number(totals.active_experience_count),
    reviewCount: Number(totals.review_count),
    orderCount: Number(totals.order_count),
    grossRevenueCents: Number(totals.gross_revenue_cents),
    commissionRevenueCents: Number(totals.commission_revenue_cents),
    ordersByStatus: ordersByStatusResult.rows.map(row => ({
      status: row.status,
      count: Number(row.count),
    })),
  };
}

// ============================================
// Users
// ============================================

function formatAdminUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    isAdmin: row.is_admin,
    emailVerified: Boolean(row.email_verified_at),
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
  };
}

export async function listUsers({ search = null, limit = 25, offset = 0 }) {
  const result = await query(
    `SELECT id, email, display_name, is_admin, email_verified_at, last_seen_at, created_at,
            COUNT(*) OVER() AS total_count
     FROM users
     WHERE ($1::text IS NULL OR $1 = ''
            OR email ILIKE '%' || $1 || '%'
            OR display_name ILIKE '%' || $1 || '%')
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [search, limit, offset]
  );

  return {
    users: result.rows.map(formatAdminUser),
    total: result.rows.length ? Number(result.rows[0].total_count) : 0,
  };
}

export async function getUserDetail(userId) {
  const userResult = await query(
    `SELECT id, email, display_name, avatar_url, visibility_mode, is_admin,
            email_verified_at, last_seen_at, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) throw new NotFoundError('User');

  const countsResult = await query(
    `SELECT
       (SELECT COUNT(*) FROM itineraries WHERE user_id = $1) AS itinerary_count,
       (SELECT COUNT(*) FROM orders WHERE user_id = $1) AS order_count,
       (SELECT COUNT(*) FROM reviews WHERE user_id = $1) AS review_count`,
    [userId]
  );
  const counts = countsResult.rows[0];

  const recentOrdersResult = await query(
    `SELECT id, reference, status, trip_destination, total_cents, currency, created_at
     FROM orders WHERE user_id = $1
     ORDER BY created_at DESC LIMIT 10`,
    [userId]
  );

  return {
    ...formatAdminUser(user),
    avatarUrl: user.avatar_url,
    visibilityMode: user.visibility_mode,
    itineraryCount: Number(counts.itinerary_count),
    orderCount: Number(counts.order_count),
    reviewCount: Number(counts.review_count),
    recentOrders: recentOrdersResult.rows.map(order => ({
      id: order.id,
      reference: order.reference,
      status: order.status,
      destination: order.trip_destination,
      totalCents: order.total_cents,
      currency: order.currency,
      createdAt: order.created_at,
    })),
  };
}

export async function deleteUser(adminUserId, userId) {
  if (userId === adminUserId) {
    throw new ConflictError('You cannot delete your own account from the admin portal');
  }

  const userResult = await query(
    `SELECT id, email FROM users WHERE id = $1`,
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) throw new NotFoundError('User');

  await usersService.deleteAccount(userId);
  await logAdminAction(adminUserId, 'user.delete', 'user', userId, { email: user.email });
}

// ============================================
// Waitlist
// ============================================

export async function listWaitlist({ limit = 25, offset = 0 }) {
  const result = await query(
    `SELECT id, email, referral_code, position, created_at,
            COUNT(*) OVER() AS total_count
     FROM waitlist
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    entries: result.rows.map(row => ({
      id: row.id,
      email: row.email,
      referralCode: row.referral_code,
      position: row.position,
      createdAt: row.created_at,
    })),
    total: result.rows.length ? Number(result.rows[0].total_count) : 0,
  };
}

// ============================================
// Providers & Experiences
// ============================================

export async function listProviders() {
  const result = await query(
    `SELECT p.id, p.display_name, p.onboarding_status, p.charges_enabled,
            p.payouts_enabled, p.default_commission_bps, p.default_currency,
            p.created_at, u.email AS user_email,
            (SELECT COUNT(*) FROM experiences e WHERE e.provider_id = p.id) AS experience_count
     FROM providers p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC`
  );

  return result.rows.map(row => ({
    id: row.id,
    displayName: row.display_name,
    userEmail: row.user_email,
    onboardingStatus: row.onboarding_status,
    chargesEnabled: row.charges_enabled,
    payoutsEnabled: row.payouts_enabled,
    defaultCommissionBps: row.default_commission_bps,
    defaultCurrency: row.default_currency,
    experienceCount: Number(row.experience_count),
    createdAt: row.created_at,
  }));
}

export async function listExperiences({ providerId = null, limit = 25, offset = 0 }) {
  const result = await query(
    `SELECT e.id, e.title, e.destination_slug, e.category, e.location_name,
            e.price_cents, e.currency, e.is_active, e.created_at,
            p.display_name AS provider_name, p.id AS provider_id,
            COUNT(*) OVER() AS total_count
     FROM experiences e
     JOIN providers p ON p.id = e.provider_id
     WHERE ($1::uuid IS NULL OR e.provider_id = $1)
     ORDER BY e.created_at DESC
     LIMIT $2 OFFSET $3`,
    [providerId, limit, offset]
  );

  return {
    experiences: result.rows.map(row => ({
      id: row.id,
      title: row.title,
      destinationSlug: row.destination_slug,
      category: row.category,
      locationName: row.location_name,
      priceCents: row.price_cents,
      currency: row.currency,
      isActive: row.is_active,
      providerId: row.provider_id,
      providerName: row.provider_name,
      createdAt: row.created_at,
    })),
    total: result.rows.length ? Number(result.rows[0].total_count) : 0,
  };
}

export async function setExperienceActive(adminUserId, experienceId, isActive) {
  const result = await query(
    `UPDATE experiences SET is_active = $2 WHERE id = $1
     RETURNING id, title, is_active`,
    [experienceId, isActive]
  );
  const experience = result.rows[0];
  if (!experience) throw new NotFoundError('Experience');

  await logAdminAction(
    adminUserId,
    isActive ? 'experience.activate' : 'experience.deactivate',
    'experience',
    experienceId,
    { title: experience.title }
  );

  return { id: experience.id, title: experience.title, isActive: experience.is_active };
}

// ============================================
// Orders & Refunds
// ============================================

function formatAdminOrder(row) {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    userEmail: row.user_email,
    providerName: row.provider_name,
    destination: row.trip_destination,
    tripStartDate: row.trip_start_date,
    tripEndDate: row.trip_end_date,
    currency: row.currency,
    subtotalCents: row.subtotal_cents,
    commissionCents: row.commission_cents,
    totalCents: row.total_cents,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

export async function listOrders({ status = null, limit = 25, offset = 0 }) {
  const result = await query(
    `SELECT o.*, u.email AS user_email, p.display_name AS provider_name,
            COUNT(*) OVER() AS total_count
     FROM orders o
     JOIN users u ON u.id = o.user_id
     JOIN providers p ON p.id = o.provider_id
     WHERE ($1::text IS NULL OR o.status = $1)
     ORDER BY o.created_at DESC
     LIMIT $2 OFFSET $3`,
    [status, limit, offset]
  );

  return {
    orders: result.rows.map(formatAdminOrder),
    total: result.rows.length ? Number(result.rows[0].total_count) : 0,
  };
}

export async function getOrderDetail(orderId) {
  const orderResult = await query(
    `SELECT o.*, u.email AS user_email, p.display_name AS provider_name
     FROM orders o
     JOIN users u ON u.id = o.user_id
     JOIN providers p ON p.id = o.provider_id
     WHERE o.id = $1`,
    [orderId]
  );
  const order = orderResult.rows[0];
  if (!order) throw new NotFoundError('Order');

  const itemsResult = await query(
    `SELECT * FROM order_line_items WHERE order_id = $1 ORDER BY created_at`,
    [orderId]
  );
  const refundsResult = await query(
    `SELECT id, amount_cents, reason, status, stripe_refund_id, created_at
     FROM refunds WHERE order_id = $1 ORDER BY created_at DESC`,
    [orderId]
  );

  return {
    ...formatAdminOrder(order),
    items: itemsResult.rows.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      locationName: item.location_name,
      scheduledDate: item.scheduled_date,
      scheduledTime: item.scheduled_time,
      quantity: item.quantity,
      lineTotalCents: item.line_total_cents,
      currency: item.currency,
    })),
    refunds: refundsResult.rows.map(refund => ({
      id: refund.id,
      amountCents: refund.amount_cents,
      reason: refund.reason,
      status: refund.status,
      stripeRefundId: refund.stripe_refund_id,
      createdAt: refund.created_at,
    })),
  };
}

export async function refundOrder(adminUserId, orderId, reason) {
  const refund = await paymentsService.refundOrderAsAdmin(adminUserId, orderId, reason);
  await logAdminAction(adminUserId, 'order.refund', 'order', orderId, {
    amountCents: refund.amountCents,
    reason: reason || null,
  });
  return refund;
}

// ============================================
// Reviews
// ============================================

export async function listReviews({ destination = null, limit = 25, offset = 0 }) {
  const result = await query(
    `SELECT r.*, u.email AS user_email, u.display_name,
            COUNT(*) OVER() AS total_count
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE ($1::text IS NULL OR r.destination_slug = $1)
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [destination, limit, offset]
  );

  return {
    reviews: result.rows.map(row => ({
      id: row.id,
      userEmail: row.user_email,
      reviewerName: row.display_name || 'SoloWay traveler',
      destinationSlug: row.destination_slug,
      rating: row.rating,
      title: row.title,
      body: row.body,
      travelStyle: row.travel_style,
      createdAt: row.created_at,
    })),
    total: result.rows.length ? Number(result.rows[0].total_count) : 0,
  };
}

export async function deleteReview(adminUserId, reviewId) {
  const result = await query(
    `DELETE FROM reviews WHERE id = $1 RETURNING id, destination_slug, user_id`,
    [reviewId]
  );
  const review = result.rows[0];
  if (!review) throw new NotFoundError('Review');

  await logAdminAction(adminUserId, 'review.delete', 'review', reviewId, {
    destinationSlug: review.destination_slug,
    authorUserId: review.user_id,
  });
}

// ============================================
// Audit log
// ============================================

export async function listAuditLog({ limit = 25, offset = 0 }) {
  const result = await query(
    `SELECT a.id, a.action, a.target_type, a.target_id, a.metadata, a.created_at,
            u.email AS admin_email,
            COUNT(*) OVER() AS total_count
     FROM admin_audit_log a
     JOIN users u ON u.id = a.admin_user_id
     ORDER BY a.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    entries: result.rows.map(row => ({
      id: row.id,
      adminEmail: row.admin_email,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      metadata: row.metadata,
      createdAt: row.created_at,
    })),
    total: result.rows.length ? Number(result.rows[0].total_count) : 0,
  };
}
