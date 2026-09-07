import { 
  Asset, 
  Station, 
  TrainMovement, 
  BlockRequest, 
  OptimizedSchedule, 
  ScheduleComparison 
} from '../types';
import { STATIONS, ASSETS, CONGESTED_TRAINS, CONGESTED_BLOCKS, STANDARD_TRAINS, STANDARD_BLOCKS, INITIAL_SCHEDULE, INITIAL_COMPARISON } from './mockCorridorData';
import { fetchBackend } from './apiClient';
import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

export interface IRailwayRepository {
  getStations(): Promise<Station[]>;
  getAssets(): Promise<Asset[]>;
  getTrains(): Promise<TrainMovement[]>;
  getBlockRequests(): Promise<BlockRequest[]>;
  createBlockRequest(request: Omit<BlockRequest, 'id'>): Promise<BlockRequest>;
  updateBlockRequest(request: BlockRequest): Promise<BlockRequest>;
  deleteBlockRequest(id: string): Promise<void>;
  runOptimization(scenario?: 'demo' | 'congested' | 'custom'): Promise<OptimizedSchedule>;
  runComparison(): Promise<ScheduleComparison>;
  getLatestSchedule(): Promise<OptimizedSchedule | null>;
  getLatestComparison(): Promise<ScheduleComparison | null>;
  resetToCongestedScenario(): Promise<void>;
  switchScenario(scenario: 'demo' | 'congested'): Promise<{ trains: TrainMovement[]; blocks: BlockRequest[] }>;
}

/**
 * In-Memory Local Demo Repository (Fallback Mode)
 * Used during local development and testing when Firebase credentials are not yet configured.
 */
class InMemoryRailwayRepository implements IRailwayRepository {
  private stations: Station[] = [...STATIONS];
  private assets: Asset[] = [...ASSETS];
  private trains: TrainMovement[] = [...CONGESTED_TRAINS];
  private blockRequests: BlockRequest[] = [...CONGESTED_BLOCKS];
  private latestSchedule: OptimizedSchedule | null = INITIAL_SCHEDULE;
  private latestComparison: ScheduleComparison | null = INITIAL_COMPARISON;

  async getStations(): Promise<Station[]> {
    return [...this.stations];
  }

  async getAssets(): Promise<Asset[]> {
    return [...this.assets];
  }

  async getTrains(): Promise<TrainMovement[]> {
    return [...this.trains];
  }

  async getBlockRequests(): Promise<BlockRequest[]> {
    return [...this.blockRequests];
  }

  async createBlockRequest(request: Omit<BlockRequest, 'id'>): Promise<BlockRequest> {
    const newId = `BR_REQ_${Math.floor(100 + Math.random() * 900)}`;
    const newBlock: BlockRequest = {
      ...request,
      id: newId,
      status: 'pending',
    };
    this.blockRequests.unshift(newBlock);
    return newBlock;
  }

  async updateBlockRequest(request: BlockRequest): Promise<BlockRequest> {
    const index = this.blockRequests.findIndex(b => b.id === request.id);
    if (index !== -1) {
      this.blockRequests[index] = { ...request };
      return this.blockRequests[index];
    }
    throw new Error(`Block request ${request.id} not found`);
  }

  async deleteBlockRequest(id: string): Promise<void> {
    this.blockRequests = this.blockRequests.filter(b => b.id !== id);
  }

  async resetToCongestedScenario(): Promise<void> {
    this.trains = [...CONGESTED_TRAINS];
    this.blockRequests = [...CONGESTED_BLOCKS];
  }

  async switchScenario(scenario: 'demo' | 'congested'): Promise<{ trains: TrainMovement[]; blocks: BlockRequest[] }> {
    if (scenario === 'demo') {
      this.trains = [...STANDARD_TRAINS];
      this.blockRequests = [...STANDARD_BLOCKS];
    } else {
      this.trains = [...CONGESTED_TRAINS];
      this.blockRequests = [...CONGESTED_BLOCKS];
    }
    return { trains: [...this.trains], blocks: [...this.blockRequests] };
  }

  async runOptimization(scenario: 'demo' | 'congested' | 'custom' = 'congested'): Promise<OptimizedSchedule> {
    // Invoke FastAPI /optimize endpoint with the ACTUAL CURRENT assets, trains, and blocks in the repository
    const payload = {
      assets: this.assets,
      trains: this.trains,
      block_requests: this.blockRequests,
      resources: [
        { id: 'CREW_1', name: 'Gang 1', resource_type: 'crew', availability: [{ start: 0, end: 1440 }], capacity: 1 },
        { id: 'CREW_2', name: 'Gang 2', resource_type: 'crew', availability: [{ start: 0, end: 1440 }], capacity: 1 },
      ],
      config: {
        crew_capacity: 2,
        safety_buffer_minutes: 15,
        max_solve_time_seconds: 30.0,
      },
    };

    try {
      const res = await fetchBackend('/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Optimizer returned status ${res.status}: ${res.statusText}`);
      }

      const schedule = await res.json() as OptimizedSchedule;
      this.latestSchedule = schedule;

      // Update block request statuses from actual CP-SAT schedule
      const scheduledIds = new Set(
        schedule.blocks.filter(b => b.is_scheduled).map(b => b.block_request_id)
      );
      this.blockRequests = this.blockRequests.map(b => ({
        ...b,
        status: scheduledIds.has(b.id) ? 'scheduled' : 'rejected'
      }));

      return schedule;
    } catch (err: any) {
      console.warn(`Could not reach FastAPI backend at /optimize or port 8000.`, err);
      throw err;
    }
  }

  async runComparison(): Promise<ScheduleComparison> {
    const payload = {
      assets: this.assets,
      trains: this.trains,
      block_requests: this.blockRequests,
      resources: [
        { id: 'CREW_1', name: 'Gang 1', resource_type: 'crew', availability: [{ start: 0, end: 1440 }], capacity: 1 },
        { id: 'CREW_2', name: 'Gang 2', resource_type: 'crew', availability: [{ start: 0, end: 1440 }], capacity: 1 },
      ],
      config: {
        crew_capacity: 2,
        safety_buffer_minutes: 15,
        max_solve_time_seconds: 30.0,
      },
    };

    try {
      const res = await fetchBackend('/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback to /compare/congested
        const res2 = await fetchBackend('/compare/congested', { method: 'POST' });
        if (!res2.ok) throw new Error(`Comparison endpoint returned ${res2.status}: ${res2.statusText}`);
        const comparison = await res2.json() as ScheduleComparison;
        this.latestComparison = comparison;
        return comparison;
      }

      const comparison = await res.json() as ScheduleComparison;
      this.latestComparison = comparison;
      return comparison;
    } catch (err) {
      console.error('Comparison error:', err);
      throw err;
    }
  }

  async getLatestSchedule(): Promise<OptimizedSchedule | null> {
    return this.latestSchedule;
  }

  async getLatestComparison(): Promise<ScheduleComparison | null> {
    return this.latestComparison;
  }
}

/**
 * Firestore Repository (Intended Production Data Layer)
 * Implements the identical IRailwayRepository interface.
 */
class FirestoreRailwayRepository implements IRailwayRepository {
  private fallback = new InMemoryRailwayRepository();

  async getStations(): Promise<Station[]> {
    try {
      const snap = await getDocs(collection(db, 'stations'));
      if (snap.empty) return this.fallback.getStations();
      return snap.docs.map(d => d.data() as Station);
    } catch {
      return this.fallback.getStations();
    }
  }

  async getAssets(): Promise<Asset[]> {
    try {
      const snap = await getDocs(collection(db, 'assets'));
      if (snap.empty) return this.fallback.getAssets();
      return snap.docs.map(d => d.data() as Asset);
    } catch {
      return this.fallback.getAssets();
    }
  }

  async getTrains(): Promise<TrainMovement[]> {
    try {
      const snap = await getDocs(collection(db, 'trains'));
      if (snap.empty) return this.fallback.getTrains();
      return snap.docs.map(d => d.data() as TrainMovement);
    } catch {
      return this.fallback.getTrains();
    }
  }

  async getBlockRequests(): Promise<BlockRequest[]> {
    try {
      const snap = await getDocs(collection(db, 'blockRequests'));
      if (snap.empty) return this.fallback.getBlockRequests();
      return snap.docs.map(d => d.data() as BlockRequest);
    } catch {
      return this.fallback.getBlockRequests();
    }
  }

  async createBlockRequest(request: Omit<BlockRequest, 'id'>): Promise<BlockRequest> {
    const newId = `BR_${Date.now()}`;
    const newBlock: BlockRequest = { ...request, id: newId, status: 'pending' };
    try {
      await setDoc(doc(db, 'blockRequests', newId), newBlock);
      return newBlock;
    } catch {
      return this.fallback.createBlockRequest(request);
    }
  }

  async updateBlockRequest(request: BlockRequest): Promise<BlockRequest> {
    try {
      await setDoc(doc(db, 'blockRequests', request.id), request, { merge: true });
      return request;
    } catch {
      return this.fallback.updateBlockRequest(request);
    }
  }

  async deleteBlockRequest(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'blockRequests', id));
    } catch {
      await this.fallback.deleteBlockRequest(id);
    }
  }

  async resetToCongestedScenario(): Promise<void> {
    return this.fallback.resetToCongestedScenario();
  }

  async switchScenario(scenario: 'demo' | 'congested'): Promise<{ trains: TrainMovement[]; blocks: BlockRequest[] }> {
    return this.fallback.switchScenario(scenario);
  }

  async runOptimization(scenario: 'demo' | 'congested' | 'custom' = 'congested'): Promise<OptimizedSchedule> {
    const schedule = await this.fallback.runOptimization(scenario);
    try {
      if (schedule?.id) {
        await setDoc(doc(db, 'schedules', schedule.id), schedule);
      }
    } catch (e) {
      console.warn('Could not persist schedule to Firestore:', e);
    }
    return schedule;
  }

  async runComparison(): Promise<ScheduleComparison> {
    const comparison = await this.fallback.runComparison();
    try {
      await setDoc(doc(db, 'comparisons', `comp_${Date.now()}`), comparison);
    } catch (e) {
      console.warn('Could not persist comparison to Firestore:', e);
    }
    return comparison;
  }

  async getLatestSchedule(): Promise<OptimizedSchedule | null> {
    try {
      const q = query(collection(db, 'schedules'), orderBy('created_at', 'desc'), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as OptimizedSchedule;
      }
    } catch (e) {
      console.warn('Could not query Firestore schedules:', e);
    }
    return this.fallback.getLatestSchedule();
  }

  async getLatestComparison(): Promise<ScheduleComparison | null> {
    try {
      const q = query(collection(db, 'comparisons'), orderBy('created_at', 'desc'), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as ScheduleComparison;
      }
    } catch (e) {
      console.warn('Could not query Firestore comparisons:', e);
    }
    return this.fallback.getLatestComparison();
  }
}

/**
 * Singleton instance of the repository.
 * Uses Firestore repository when Firebase is configured with real credentials,
 * otherwise falls back cleanly to the in-memory repository.
 */
export const railwayRepository: IRailwayRepository = isFirebaseConfigured
  ? new FirestoreRailwayRepository()
  : new InMemoryRailwayRepository();
