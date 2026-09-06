import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OptimizerClient, OptimizationRequestPayload } from './services/optimizerClient';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const optimizerClient = new OptimizerClient();

/**
 * Health check endpoint for Cloud Functions.
 */
export const healthCheck = functions.https.onRequest(async (req, res) => {
  try {
    const optimizerStatus = await optimizerClient.checkHealth();
    res.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'firebase-functions',
      optimizer: optimizerStatus,
    });
  } catch (err: any) {
    res.status(200).send({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      service: 'firebase-functions',
      optimizerError: err.message,
    });
  }
});

/**
 * Cloud Function to trigger CP-SAT optimization on arbitrary or Firestore data.
 */
export const runOptimization = functions.https.onCall(async (data: { scenario?: 'demo' | 'congested' | 'custom'; request?: OptimizationRequestPayload }, context) => {
  try {
    let result: any;

    if (data.scenario === 'congested') {
      result = await optimizerClient.optimizeCongested();
    } else if (data.scenario === 'demo') {
      result = await optimizerClient.optimizeDemo();
    } else if (data.request) {
      result = await optimizerClient.optimize(data.request);
    } else {
      // Gather active block requests, assets, and trains from Firestore
      const assetsSnap = await db.collection('assets').get();
      const trainsSnap = await db.collection('trains').get();
      const blocksSnap = await db.collection('blockRequests').where('status', 'in', ['pending', 'requested']).get();

      const assets = assetsSnap.docs.map(d => d.data());
      const trains = trainsSnap.docs.map(d => d.data());
      const block_requests = blocksSnap.docs.map(d => d.data());

      result = await optimizerClient.optimize({ assets, trains, block_requests });
    }

    // Persist result in Firestore under `schedules`
    if (result && result.id) {
      await db.collection('schedules').doc(result.id).set({
        ...result,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true, schedule: result };
  } catch (error: any) {
    functions.logger.error('Optimization error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Optimization failed');
  }
});

/**
 * Cloud Function to compare Naive Baseline Plan vs CP-SAT Optimized Plan.
 */
export const compareCorridor = functions.https.onCall(async (data: { scenario?: string; request?: OptimizationRequestPayload }, context) => {
  try {
    let comparison: any;
    if (data.request) {
      comparison = await optimizerClient.compare(data.request);
    } else {
      comparison = await optimizerClient.compareCongested();
    }

    // Persist comparison in Firestore under `comparisons`
    await db.collection('comparisons').add({
      ...comparison,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, comparison };
  } catch (error: any) {
    functions.logger.error('Comparison error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Comparison failed');
  }
});
