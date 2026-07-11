import express, { Router } from 'express';
import { stripeWebhook } from './webhooks.controller.js';

const router = Router();

router.post('/stripe', express.raw({ type: 'application/json', limit: '256kb' }), stripeWebhook);

export default router;
