import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  NodeMouseHandler,
  EdgeMouseHandler,
} from 'reactflow';
import { Station, Asset, OptimizedSchedule, BlockRequest, TrainMovement } from '../types';
import { StationNode, StationNodeData } from './corridor/StationNode';
import { TrackEdge, TrackEdgeData } from './corridor/TrackEdge';
import { PixelStation, PixelTrack, PixelSignal, PixelTrain, PixelWrench, PixelAlert } from './PixelIcons';

interface RailwayNetworkProps {
  stations: Station[];
  assets: Asset[];
  schedule: OptimizedSchedule | null;
  blocks: BlockRequest[];
  trains: TrainMovement[];
}

const nodeTypes = {
  station: StationNode,
};

const edgeTypes = {
  track: TrackEdge,
};

export const RailwayNetwork: React.FC<RailwayNetworkProps> = ({
  stations,
  assets,
  schedule,
  blocks,
  trains,
}) => {
  const [selectedType, setSelectedType] = useState<'track' | 'station'>('track');
  const [selectedId, setSelectedId] = useState<string>('SEC_NDLS_GZB');

  // Handle Edge Selection
  const handleSelectTrack = useCallback((trackId: string) => {
    setSelectedType('track');
    setSelectedId(trackId);
  }, []);

  // Prepare React Flow Nodes
  const initialNodes: Node<StationNodeData>[] = useMemo(() => {
    const spacing = 240;
    return stations.map((stn, index) => {
      // Find active trains at or passing near this station
      const stnTrains = trains.filter(t =>
        t.sections.some(s => s.asset_id.includes(stn.code))
      );

      // Find active maintenance blocks connected to this station
      const stnBlocks = schedule?.blocks.filter(
        b => b.is_scheduled && b.asset_id.includes(stn.code)
      ) || [];

      return {
        id: stn.id,
        type: 'station',
        position: { x: 30 + index * spacing, y: 70 },
        data: {
          id: stn.id,
          code: stn.code,
          name: stn.name,
          km: stn.km,
          platforms: stn.platforms,
          division: stn.division,
          zone: stn.zone,
          activeTrainsCount: stnTrains.length,
          activeBlocksCount: stnBlocks.length,
          isSelected: selectedType === 'station' && selectedId === stn.id,
        },
      };
    });
  }, [stations, trains, schedule, selectedType, selectedId]);

  // Prepare React Flow Edges
  const initialEdges: Edge<TrackEdgeData>[] = useMemo(() => {
    const edgesList: Edge<TrackEdgeData>[] = [];
    for (let i = 0; i < stations.length - 1; i++) {
      const source = stations[i];
      const target = stations[i + 1];
      const assetId = `SEC_${source.code}_${target.code}`;
      const asset = assets.find(a => a.id === assetId);

      const distanceKm = asset ? asset.end_km - asset.start_km : target.km - source.km;
      const maxSpeedKmph = asset?.max_speed_kmph ?? 130;

      const scheduledBlocksCount = schedule?.blocks.filter(
        b => b.asset_id === assetId && b.is_scheduled
      ).length || 0;

      const activeTrainsCount = trains.filter(t =>
        t.sections.some(s => s.asset_id === assetId)
      ).length;

      edgesList.push({
        id: assetId,
        source: source.id,
        target: target.id,
        type: 'track',
        data: {
          id: assetId,
          name: asset?.name || `${source.name} - ${target.name}`,
          distanceKm,
          maxSpeedKmph,
          status: scheduledBlocksCount > 0 ? 'under_maintenance' : 'operational',
          activeTrainsCount,
          scheduledBlocksCount,
          isSelected: selectedType === 'track' && selectedId === assetId,
          onSelect: handleSelectTrack,
        },
      });
    }
    return edgesList;
  }, [stations, assets, schedule, trains, selectedType, selectedId, handleSelectTrack]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Sync state if props change
  React.useEffect(() => {
    // Keep selection valid
    if (selectedType === 'track' && !assets.some(a => a.id === selectedId)) {
      setSelectedId(assets[0]?.id || 'SEC_NDLS_GZB');
    }
  }, [assets, selectedId, selectedType]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedType('station');
    setSelectedId(node.id);
  }, []);

  const onEdgeClick: EdgeMouseHandler = useCallback((_, edge) => {
    setSelectedType('track');
    setSelectedId(edge.id);
  }, []);

  // Selected Data Resolvers
  const selectedTrack = assets.find(a => a.id === selectedId) || assets[0];
  const selectedStation = stations.find(s => s.id === selectedId) || stations[0];

  const scheduledBlocksOnTrack = schedule?.blocks.filter(
    b => b.asset_id === selectedTrack?.id && b.is_scheduled
  ) || [];

  const trainsOnTrack = trains.filter(t =>
    t.sections.some(s => s.asset_id === selectedTrack?.id)
  );

  const trainsAtStation = trains.filter(t =>
    t.sections.some(s => s.asset_id.includes(selectedStation?.code))
  );

  return (
    <div className="space-y-6">
      {/* 1. Control Room Header Bar */}
      <div className="bg-white dark:bg-[#0a101d] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm relative overflow-hidden transition-colors duration-200">
        <div className="flex items-center space-x-3 z-10">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 rounded-xl">
            <PixelTrack size={22} color="#0284c7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-pixel text-xs text-blue-700 dark:text-cyan-400 tracking-wider">
                DELHI–AGRA HIGH-DENSITY CORRIDOR
              </span>
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-cyan-950/80 border border-blue-200 dark:border-cyan-700 text-blue-900 dark:text-cyan-300 text-[8px] font-pixel rounded">
                LIVE SCHEMATIC
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              6 Stations • 5 Track Sections • 265 KM • 25kV AC 50Hz Electrified Trunk Route
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[9px] font-pixel z-10">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
            <span className="text-slate-700 dark:text-slate-300">CLEAR (GREEN)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">MAINTENANCE (AMBER)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">TRAIN IN TRANSIT</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive React Flow Corridor Map */}
      <div className="relative h-[290px] w-full bg-slate-900/95 dark:bg-[#060a12] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 bg-control-grid opacity-30 pointer-events-none" />

        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.4}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!bg-slate-800 !border !border-slate-700 !shadow-sm !rounded-xl [&>button]:!border-slate-700 [&>button]:!fill-slate-300 hover:[&>button]:!bg-slate-700"
          />
        </ReactFlow>

        {/* Map Tip Banner */}
        <div className="absolute bottom-3 left-4 pointer-events-none bg-slate-900/90 text-white rounded-xl shadow-md border border-slate-700/70 px-3 py-1.5 text-[9px] font-mono">
          💡 Click any station node or track badge to inspect timetable, signals, and maintenance windows.
        </div>
      </div>

      {/* 3. Detailed Inspector Card (Track Section or Station) */}
      <div className="bg-white dark:bg-[#0a101d] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative transition-colors duration-200">
        {/* Toggle Inspector Subject */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${selectedType === 'track' ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800'}`}>
              {selectedType === 'track' ? (
                <PixelTrack size={22} color="#d97706" />
              ) : (
                <PixelStation size={22} color="#0284c7" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[8px] font-pixel text-slate-500 dark:text-slate-400 uppercase">
                  {selectedType === 'track' ? 'TRACK SECTION INSPECTION' : 'STATION JUNCTION INSPECTION'}
                </span>
                <span className="font-pixel text-[8px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 font-bold">
                  {selectedType === 'track' ? selectedTrack?.id : selectedStation?.code}
                </span>
              </div>
              <h3 className="font-pixel text-xs sm:text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                {selectedType === 'track' ? selectedTrack?.name : selectedStation?.name}
              </h3>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[8px] font-pixel text-slate-500 mr-1 uppercase">QUICK JUMP:</span>
            {assets.map(asset => (
              <button
                key={asset.id}
                onClick={() => {
                  setSelectedType('track');
                  setSelectedId(asset.id);
                }}
                className={`px-2.5 py-1 text-[7.5px] font-pixel rounded-lg border transition-all ${
                  selectedType === 'track' && selectedId === asset.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {asset.id.replace('SEC_', '').replace('_', '⇄')}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Detail Body */}
        {selectedType === 'track' && selectedTrack && (
          <div className="mt-5 space-y-5">
            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-pixel uppercase">SECTION LENGTH</span>
                <span className="text-slate-900 dark:text-slate-100 text-base font-digital font-bold mt-0.5 block">
                  {selectedTrack.end_km - selectedTrack.start_km} KM
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  KM {selectedTrack.start_km} → {selectedTrack.end_km}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-pixel uppercase">PERMISSIBLE SPEED</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base font-digital font-bold mt-0.5 block">
                  {selectedTrack.max_speed_kmph} KM/H
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Broad Gauge Trunk</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-pixel uppercase">TRACTION SYSTEM</span>
                <span className="text-blue-700 dark:text-cyan-300 text-base font-digital font-bold mt-0.5 block">25 kV AC OHE</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Electrified Overhead</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-pixel uppercase">SECTION STATUS</span>
                <div className="mt-1 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full inline-block ${scheduledBlocksOnTrack.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  <span className={`text-[9px] font-pixel ${scheduledBlocksOnTrack.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {scheduledBlocksOnTrack.length > 0 ? 'MAINTENANCE RESERVED' : 'OPERATIONAL CLEAR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Columns: Maintenance Blocks vs Timetabled Trains */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Scheduled Blocks */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                  <h4 className="font-pixel text-[9px] text-amber-700 dark:text-yellow-400 flex items-center space-x-2">
                    <PixelWrench size={14} color="#f59e0b" />
                    <span>SCHEDULED MAINTENANCE POSSESSIONS ({scheduledBlocksOnTrack.length})</span>
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">Zero Conflict</span>
                </div>

                {scheduledBlocksOnTrack.length === 0 ? (
                  <div className="p-5 text-center text-xs font-mono text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-lg">
                    No maintenance windows currently booked for this section.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {scheduledBlocksOnTrack.map(block => (
                      <div
                        key={block.block_request_id}
                        className="p-3 bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:border-amber-500/50 transition-colors shadow-xs"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-pixel text-[10px] text-yellow-400">
                              {block.block_request_id}
                            </span>
                            <span className="px-1.5 py-0.2 bg-red-950 border border-red-800 text-red-300 text-[7px] font-pixel">
                              P{block.priority}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 capitalize">
                              {block.maintenance_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 mt-1">
                            Duration: <span className="text-slate-200">{block.duration_minutes}m</span> | Deviation: <span className="text-cyan-300">{block.deviation_minutes}m</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-digital text-base text-emerald-400 tracking-wider">
                            {String(Math.floor(block.scheduled_start / 60)).padStart(2, '0')}:
                            {String(block.scheduled_start % 60).padStart(2, '0')} -{' '}
                            {String(Math.floor(block.scheduled_end / 60)).padStart(2, '0')}:
                            {String(block.scheduled_end % 60).padStart(2, '0')}
                          </div>
                          <span className="text-[8px] font-pixel text-emerald-400/80 uppercase">
                            SOLVER VERIFIED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timetabled Trains */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                  <h4 className="font-pixel text-[9px] text-blue-700 dark:text-cyan-400 flex items-center space-x-2">
                    <PixelTrain size={14} color="#0284c7" />
                    <span>TIMETABLED TRAIN MOVEMENTS ({trainsOnTrack.length})</span>
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">Safety Buffer: ±15m</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {trainsOnTrack.map(train => {
                    const sec = train.sections.find(s => s.asset_id === selectedTrack.id)!;
                    return (
                      <div
                        key={train.id}
                        className="p-2.5 bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between hover:border-cyan-500/50 transition-colors shadow-xs"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-pixel text-[10px] text-slate-900 dark:text-white">
                              {train.train_number}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 font-mono text-xs font-bold truncate max-w-[140px]">
                              {train.name}
                            </span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                            Priority: P{train.priority} • Type: {train.train_type}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-digital text-base text-blue-700 dark:text-cyan-300 tracking-wider font-bold">
                            {String(Math.floor(sec.entry_time / 60)).padStart(2, '0')}:
                            {String(sec.entry_time % 60).padStart(2, '0')} -{' '}
                            {String(Math.floor(sec.exit_time / 60)).padStart(2, '0')}:
                            {String(sec.exit_time % 60).padStart(2, '0')}
                          </div>
                          <span className="text-[8px] font-mono text-slate-400">
                            Transit: {sec.exit_time - sec.entry_time} mins
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Station Inspector Body */}
        {selectedType === 'station' && selectedStation && (
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-pixel uppercase">CORRIDOR LOCATION</span>
                <span className="text-amber-600 dark:text-yellow-400 text-base font-digital font-bold mt-0.5 block">
                  KM {selectedStation.km.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">From NDLS Zero Datum</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-pixel uppercase">PLATFORM CAPACITY</span>
                <span className="text-slate-900 dark:text-white text-base font-digital font-bold mt-0.5 block">
                  {selectedStation.platforms} RUNNING PFS
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Interlocked Track Circuits</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-pixel uppercase">ZONE & DIVISION</span>
                <span className="text-blue-700 dark:text-cyan-300 text-base font-digital font-bold mt-0.5 block">
                  {selectedStation.zone} / {selectedStation.division}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Control Division</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-pixel uppercase">STATION SIGNAL</span>
                <div className="mt-1 flex items-center space-x-2">
                  <PixelSignal aspect="green" size={14} />
                  <span className="text-emerald-600 dark:text-emerald-400 font-pixel text-[9px]">ALL CLEAR</span>
                </div>
              </div>
            </div>

            {/* Arriving/Departing Trains at this Station */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                <h4 className="font-pixel text-[9px] text-blue-700 dark:text-cyan-400 flex items-center space-x-2">
                  <PixelTrain size={14} color="#0284c7" />
                  <span>TRAINS DISPATCHING THROUGH {selectedStation.name.toUpperCase()} ({trainsAtStation.length})</span>
                </h4>
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">Real-time Timetable</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {trainsAtStation.map(train => (
                  <div
                    key={train.id}
                    className="p-2.5 bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="font-pixel text-[10px] text-slate-900 dark:text-white">
                        {train.train_number} • {train.name}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                        {train.train_type} (Priority: P{train.priority})
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 dark:bg-[#060a12] border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-cyan-300 text-[8px] font-pixel rounded">
                      SCHEDULED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
