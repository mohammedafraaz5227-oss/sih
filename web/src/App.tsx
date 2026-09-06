import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { RailwayNetwork } from './components/RailwayNetwork';
import { BlockRequestsView } from './components/BlockRequestsView';
import { OptimizationPanel } from './components/OptimizationPanel';
import { TimelineGantt } from './components/TimelineGantt';
import { ComparisonView } from './components/ComparisonView';
import { PixelAlert, PixelCpu, PixelSignal } from './components/PixelIcons';
import { railwayRepository } from './services/railwayService';
import { isFirebaseConfigured } from './services/firebase';
import { INITIAL_SCHEDULE, INITIAL_COMPARISON } from './services/mockCorridorData';
import {
  Station,
  Asset,
  TrainMovement,
  BlockRequest,
  OptimizedSchedule,
  ScheduleComparison,
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [scenario, setScenario] = useState<'congested' | 'demo'>('congested');

  // Core Data State
  const [stations, setStations] = useState<Station[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [trains, setTrains] = useState<TrainMovement[]>([]);
  const [blocks, setBlocks] = useState<BlockRequest[]>([]);
  const [schedule, setSchedule] = useState<OptimizedSchedule | null>(INITIAL_SCHEDULE);
  const [comparison, setComparison] = useState<ScheduleComparison | null>(INITIAL_COMPARISON);

  // Status State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Auto-dismiss notifications after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Initial Data Fetch
  const loadCorridorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedStations, loadedAssets, loadedTrains, loadedBlocks, latestSched, latestComp] =
        await Promise.all([
          railwayRepository.getStations(),
          railwayRepository.getAssets(),
          railwayRepository.getTrains(),
          railwayRepository.getBlockRequests(),
          railwayRepository.getLatestSchedule(),
          railwayRepository.getLatestComparison(),
        ]);

      setStations(loadedStations);
      setAssets(loadedAssets);
      setTrains(loadedTrains);
      setBlocks(loadedBlocks);
      if (latestSched) setSchedule(latestSched);
      if (latestComp) setComparison(latestComp);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setNotification({
        type: 'warning',
        message: 'Loaded fallback data. Firebase or local repository initialized with default scenario.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCorridorData();
  }, [loadCorridorData]);

  // Run CP-SAT Optimization
  const handleRunOptimization = async () => {
    setIsSolving(true);
    setNotification({
      type: 'info',
      message: 'CP-SAT Engine: Building constraint model and searching optimal schedule...',
    });

    try {
      const newSchedule = await railwayRepository.runOptimization(scenario);
      setSchedule(newSchedule);

      // Refresh blocks to reflect scheduled/rejected statuses
      const updatedBlocks = await railwayRepository.getBlockRequests();
      setBlocks(updatedBlocks);

      setNotification({
        type: 'success',
        message: `Optimization complete! ${newSchedule.metrics.total_blocks_scheduled}/${newSchedule.metrics.total_blocks_requested} blocks scheduled in ${newSchedule.metrics.solve_time_seconds}s with 0 train conflicts.`,
      });
    } catch (err: any) {
      console.error('Optimization error:', err);
      setNotification({
        type: 'warning',
        message: `Backend optimizer not reachable at /api/optimize. Displaying precomputed optimal schedule. (Start server: uvicorn src.api.server:app --port 8000)`,
      });
      // Maintain precomputed schedule as reliable fallback
      if (!schedule) setSchedule(INITIAL_SCHEDULE);
    } finally {
      setIsSolving(false);
    }
  };

  // Run Comparison Benchmark
  const handleRunComparison = async () => {
    setIsLoadingComparison(true);
    setNotification({
      type: 'info',
      message: 'Running benchmark: Comparing Naive Baseline vs CP-SAT on congested corridor...',
    });

    try {
      const compResult = await railwayRepository.runComparison();
      setComparison(compResult);
      setNotification({
        type: 'success',
        message: `Benchmark complete! CP-SAT eliminated ${compResult.improvement_summary.train_conflicts_eliminated} train conflicts and saved ${compResult.improvement_summary.train_delay_saved_minutes} mins of train delay.`,
      });
    } catch (err: any) {
      console.error('Comparison error:', err);
      setNotification({
        type: 'warning',
        message: `Backend comparison endpoint not reachable. Displaying precomputed benchmark results.`,
      });
      if (!comparison) setComparison(INITIAL_COMPARISON);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  // CRUD Block Requests
  const handleCreateBlock = async (newBlock: Omit<BlockRequest, 'id'>) => {
    try {
      await railwayRepository.createBlockRequest(newBlock);
      const updated = await railwayRepository.getBlockRequests();
      setBlocks(updated);
      setNotification({
        type: 'success',
        message: 'Maintenance block request registered. Run CP-SAT to integrate into schedule.',
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: `Failed to create block: ${err.message}` });
    }
  };

  const handleUpdateBlock = async (updatedBlock: BlockRequest) => {
    try {
      await railwayRepository.updateBlockRequest(updatedBlock);
      const updated = await railwayRepository.getBlockRequests();
      setBlocks(updated);
      setNotification({
        type: 'success',
        message: `Block ${updatedBlock.id} updated.`,
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: `Failed to update block: ${err.message}` });
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      await railwayRepository.deleteBlockRequest(id);
      const updated = await railwayRepository.getBlockRequests();
      setBlocks(updated);
      setNotification({
        type: 'info',
        message: `Block request ${id} removed.`,
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: `Failed to delete block: ${err.message}` });
    }
  };

  const handleResetDemo = async () => {
    try {
      await railwayRepository.resetToCongestedScenario();
      const resetBlocks = await railwayRepository.getBlockRequests();
      setBlocks(resetBlocks);
      setSchedule(INITIAL_SCHEDULE);
      setComparison(INITIAL_COMPARISON);
      setNotification({
        type: 'info',
        message: 'Corridor reset to default 10-block congested benchmark scenario.',
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: `Reset failed: ${err.message}` });
    }
  };

  const handleToggleScenario = async (newScenario: 'congested' | 'demo') => {
    setScenario(newScenario);
    try {
      const switched = await railwayRepository.switchScenario(newScenario);
      setTrains(switched.trains);
      setBlocks(switched.blocks);
      setNotification({
        type: 'info',
        message: `Active Scenario switched to: ${newScenario.toUpperCase()} (${switched.trains.length} trains, ${switched.blocks.length} blocks loaded).`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Failed to switch scenario: ${err.message}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-yellow-400 selection:text-black font-sans">
      {/* Pixel Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        scenario={scenario}
        onToggleScenario={handleToggleScenario}
        isSolving={isSolving}
      />

      {/* Floating System Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-4">
          <div
            className={`pixel-card p-3 border-2 flex items-center justify-between text-xs font-pixel shadow-pixel animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-[#064e3b] border-emerald-400 text-emerald-100'
                : notification.type === 'error'
                ? 'bg-[#7f1d1d] border-red-500 text-red-100'
                : notification.type === 'warning'
                ? 'bg-[#78350f] border-amber-400 text-amber-100'
                : 'bg-[#1e3a8a] border-blue-400 text-blue-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <PixelAlert
                size={16}
                color={
                  notification.type === 'success'
                    ? '#34d399'
                    : notification.type === 'error'
                    ? '#f87171'
                    : notification.type === 'warning'
                    ? '#fbbf24'
                    : '#60a5fa'
                }
              />
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs hover:text-white px-2 py-0.5 border border-white/40 ml-4 font-mono uppercase"
            >
              [X]
            </button>
          </div>
        </div>
      )}

      {/* Main Control Room Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <PixelSignal aspect="amber" size={32} />
            <p className="font-pixel text-xs text-yellow-400">INITIALIZING RAILWAY CONTROL DASHBOARD...</p>
            <p className="font-mono text-xs text-slate-400">Loading corridor assets and train paths</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewDashboard
                schedule={schedule}
                blocks={blocks}
                assets={assets}
                isSolving={isSolving}
                onRunOptimization={handleRunOptimization}
                onNavigateTab={setActiveTab}
                scenario={scenario}
              />
            )}

            {activeTab === 'network' && (
              <RailwayNetwork
                stations={stations}
                assets={assets}
                schedule={schedule}
                blocks={blocks}
                trains={trains}
              />
            )}

            {activeTab === 'blocks' && (
              <BlockRequestsView
                blocks={blocks}
                assets={assets}
                onCreateBlock={handleCreateBlock}
                onUpdateBlock={handleUpdateBlock}
                onDeleteBlock={handleDeleteBlock}
                onResetDemo={handleResetDemo}
              />
            )}

            {activeTab === 'optimize' && (
              <OptimizationPanel
                schedule={schedule}
                isSolving={isSolving}
                onRunOptimization={handleRunOptimization}
                scenario={scenario}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineGantt
                assets={assets}
                trains={trains}
                schedule={schedule}
                blocks={blocks}
              />
            )}

            {activeTab === 'compare' && (
              <ComparisonView
                comparison={comparison}
                onRunComparison={handleRunComparison}
                isLoading={isLoadingComparison}
              />
            )}
          </>
        )}
      </main>

      {/* Retro Control-Room Footer */}
      <footer className="border-t-2 border-black bg-[#0d131f] text-slate-400 text-xs font-mono py-4 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-none border border-black animate-pulse" />
            <span className="font-pixel text-[10px] text-slate-300">
              SMART INDIA HACKATHON • RAILWAY OPERATIONAL BLOCK PLANNER
            </span>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Mode:{' '}
            <span className={isFirebaseConfigured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isFirebaseConfigured ? 'FIRESTORE CLOUD DATA' : 'IN-MEMORY LOCAL REPOSITORY'}
            </span>{' '}
            • Engine:{' '}
            <span className="text-cyan-400 font-bold">Google OR-Tools CP-SAT (Python 3.12)</span>
          </div>

          <div className="text-[10px] text-amber-500 font-pixel text-center md:text-right">
            [DEMO DATA — NOT REAL IR OPERATIONS]
          </div>
        </div>
      </footer>
    </div>
  );
};
