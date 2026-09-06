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
      <div className="bg-[#0c1424] border-2 border-[#1e293b] p-4 flex flex-wrap items-center justify-between gap-3 shadow-pixel relative overflow-hidden">
        <div className="flex items-center space-x-3 z-10">
          <div className="p-2.5 bg-[#060a12] border-2 border-slate-700">
            <PixelTrack size={22} color="#00f0ff" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-pixel text-xs text-electric-cyan tracking-wider">
                DELHI–AGRA HIGH-DENSITY CORRIDOR
              </span>
              <span className="px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-[8px] font-pixel">
                LIVE SCHEMATIC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              6 Stations • 5 Track Sections • 265 KM • 25kV AC 50Hz Electrified Trunk Route
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[9px] font-pixel z-10">
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#060a12] border border-slate-800">
            <span className="w-2 h-2 bg-emerald-400 inline-block shadow-glow-emerald animate-pulse"></span>
            <span className="text-slate-300">CLEAR (GREEN)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#060a12] border border-slate-800">
            <span className="w-2 h-2 bg-amber-400 inline-block shadow-glow-amber"></span>
            <span className="text-slate-300">MAINTENANCE (AMBER)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#060a12] border border-slate-800">
            <span className="w-2 h-2 bg-electric-cyan inline-block shadow-glow-cyan"></span>
            <span className="text-slate-300">TRAIN IN TRANSIT</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive React Flow Corridor Map */}
      <div className="relative h-[290px] w-full bg-[#060a12] border-2 border-[#1e293b] shadow-pixel overflow-hidden">
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
            className="!bg-[#0c1424] !border-2 !border-slate-700 !shadow-pixel !rounded-none [&>button]:!border-slate-800 [&>button]:!fill-slate-300 hover:[&>button]:!bg-[#1a263e]"
          />
        </ReactFlow>

        {/* Map Tip Banner */}
        <div className="absolute bottom-2 left-3 pointer-events-none bg-[#0a101d]/90 border border-slate-800 px-2 py-1 text-[8px] font-mono text-slate-400">
          💡 Click any station node or track badge to inspect timetable, signals, and maintenance windows.
        </div>
      </div>

      {/* 3. Detailed Inspector Card (Track Section or Station) */}
      <div className="bg-[#0a101d] border-2 border-[#1e293b] shadow-pixel p-5 relative">
        {/* Toggle Inspector Subject */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 border-2 ${selectedType === 'track' ? 'bg-[#1a1405] border-amber-500/80' : 'bg-[#0b213b] border-cyan-500/80'}`}>
              {selectedType === 'track' ? (
                <PixelTrack size={22} color="#f59e0b" />
              ) : (
                <PixelStation size={22} color="#38bdf8" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-pixel text-slate-400">
                  {selectedType === 'track' ? 'TRACK SECTION INSPECTION' : 'STATION JUNCTION INSPECTION'}
                </span>
                <span className="font-pixel text-[8px] px-1.5 py-0.5 bg-slate-800 text-yellow-400">
                  {selectedType === 'track' ? selectedTrack?.id : selectedStation?.code}
                </span>
              </div>
              <h3 className="font-pixel text-sm text-white mt-0.5">
                {selectedType === 'track' ? selectedTrack?.name : selectedStation?.name}
              </h3>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[9px] font-pixel text-slate-400 mr-1">QUICK JUMP:</span>
            {assets.map(asset => (
              <button
                key={asset.id}
                onClick={() => {
                  setSelectedType('track');
                  setSelectedId(asset.id);
                }}
                className={`px-2 py-1 text-[8px] font-pixel border transition-all ${
                  selectedType === 'track' && selectedId === asset.id
                    ? 'bg-electric-cyan text-black border-white shadow-glow-cyan'
                    : 'bg-[#0c1424] text-slate-400 border-slate-800 hover:border-slate-600'
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
              <div className="bg-[#060a12] border border-slate-800 p-2.5">
                <span className="text-[9px] text-slate-400 block font-pixel">SECTION LENGTH</span>
                <span className="text-white text-sm font-bold mt-0.5 block">
                  {selectedTrack.end_km - selectedTrack.start_km} KM
                </span>
                <span className="text-[10px] text-slate-400">
                  KM {selectedTrack.start_km} → {selectedTrack.end_km}
                </span>
              </div>

              <div className="bg-[#060a12] border border-slate-800 p-2.5">
                <span className="text-[9px] text-slate-400 block font-pixel">PERMISSIBLE SPEED</span>
                <span className="text-emerald-400 text-sm font-bold mt-0.5 block">
                  {selectedTrack.max_speed_kmph} KM/H
                </span>
                <span className="text-[10px] text-slate-400">Broad Gauge Trunk</span>
              </div>

              <div className="bg-[#060a12] border border-slate-800 p-2.5">
                <span className="text-[9px] text-slate-400 block font-pixel">TRACTION SYSTEM</span>
                <span className="text-cyan-300 text-sm font-bold mt-0.5 block">25 kV AC OHE</span>
                <span className="text-[10px] text-slate-400">Electrified Overhead</span>
              </div>

              <div className="bg-[#060a12] border border-slate-800 p-2.5">
                <span className="text-[9px] text-slate-400 block font-pixel">SECTION STATUS</span>
                <div className="mt-1 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 inline-block ${scheduledBlocksOnTrack.length > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                  <span className={`text-[10px] font-pixel ${scheduledBlocksOnTrack.length > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                    {scheduledBlocksOnTrack.length > 0 ? 'MAINTENANCE RESERVED' : 'OPERATIONAL CLEAR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Columns: Maintenance Blocks vs Timetabled Trains */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Scheduled Blocks */}
              <div className="bg-[#060a12] border border-slate-800 p-3.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                  <h4 className="font-pixel text-[10px] text-yellow-400 flex items-center space-x-2">
                    <PixelWrench size={14} color="#facc15" />
                    <span>SCHEDULED MAINTENANCE POSSESSIONS ({scheduledBlocksOnTrack.length})</span>
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400">Zero Conflict</span>
                </div>

                {scheduledBlocksOnTrack.length === 0 ? (
                  <div className="p-5 text-center text-xs font-mono text-slate-400 bg-black/30 border border-slate-800/50">
                    No maintenance windows currently booked for this section.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {scheduledBlocksOnTrack.map(block => (
                      <div
                        key={block.block_request_id}
                        className="p-3 bg-[#0d1527] border border-slate-800 flex items-center justify-between hover:border-amber-500/50 transition-colors"
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
              <div className="bg-[#060a12] border border-slate-800 p-3.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                  <h4 className="font-pixel text-[10px] text-cyan-400 flex items-center space-x-2">
                    <PixelTrain size={14} color="#00f0ff" />
                    <span>TIMETABLED TRAIN MOVEMENTS ({trainsOnTrack.length})</span>
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400">Safety Buffer: ±15m</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {trainsOnTrack.map(train => {
                    const sec = train.sections.find(s => s.asset_id === selectedTrack.id)!;
                    return (
                      <div
                        key={train.id}
                        className="p-2.5 bg-[#0d1527] border border-slate-800 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-pixel text-[10px] text-white">
                              {train.train_number}
                            </span>
                            <span className="text-slate-300 font-mono text-xs font-bold truncate max-w-[140px]">
                              {train.name}
                            </span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                            Priority: {train.priority} • Type: {train.train_type}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-digital text-base text-cyan-300 tracking-wider">
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
              <div className="bg-[#060a12] border border-slate-800 p-2.5">
                <span className="text-[9px] text-slate-400 block font-pixel">CORRIDOR LOCATION</span>
                <span className="text-yellow-400 text-sm font-bold mt-0.5 block font-pixel">
                  KM {selectedStation.km.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">From NDLS Zero Datum</span>
              </div>

              <div className="bg-[#060a12] border border-slate-800 p-2.5">
                <span className="text-[9px] text-slate-400 block font-pixel">PLATFORM CAPACITY</span>
                <span className="text-white text-sm font-bold mt-0.5 block font-pixel">
                  {selectedStation.platforms} RUNNING PFS
                </span>
                <span className="text-[10px] text-slate-400">Interlocked Track Circuits</span>
              </div>

              <div className="bg-[#060a12] border border-slate-800 p-2.5">
                <span className="text-[9px] text-slate-400 block font-pixel">ZONE & DIVISION</span>
                <span className="text-cyan-300 text-xs font-bold mt-0.5 block font-mono">
                  {selectedStation.zone} / {selectedStation.division}
                </span>
                <span className="text-[10px] text-slate-400">Control Division</span>
              </div>

              <div className="bg-[#060a12] border border-slate-800 p-2.5">
                <span className="text-[9px] text-slate-400 block font-pixel">STATION SIGNAL</span>
                <div className="mt-1 flex items-center space-x-2">
                  <PixelSignal aspect="green" size={14} />
                  <span className="text-emerald-400 font-pixel text-[10px]">ALL CLEAR</span>
                </div>
              </div>
            </div>

            {/* Arriving/Departing Trains at this Station */}
            <div className="bg-[#060a12] border border-slate-800 p-3.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                <h4 className="font-pixel text-[10px] text-cyan-400 flex items-center space-x-2">
                  <PixelTrain size={14} color="#00f0ff" />
                  <span>TRAINS DISPATCHING THROUGH {selectedStation.name.toUpperCase()} ({trainsAtStation.length})</span>
                </h4>
                <span className="text-[9px] font-mono text-slate-400">Real-time Timetable</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {trainsAtStation.map(train => (
                  <div
                    key={train.id}
                    className="p-2.5 bg-[#0d1527] border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-pixel text-[10px] text-white">
                        {train.train_number} • {train.name}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                        {train.train_type} (Priority: {train.priority})
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-[#060a12] border border-slate-700 text-cyan-300 text-[8px] font-pixel">
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
