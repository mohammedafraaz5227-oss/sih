import React, { useState, useMemo } from 'react';
import { BlockRequest, Asset, MaintenanceType, BlockPriority } from '../types';
import { PixelWrench, PixelAlert, PixelTrack } from './PixelIcons';

interface BlockRequestsViewProps {
  blocks: BlockRequest[];
  assets: Asset[];
  onCreateBlock: (block: Omit<BlockRequest, 'id'>) => Promise<void>;
  onUpdateBlock: (block: BlockRequest) => Promise<void>;
  onDeleteBlock: (id: string) => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export const BlockRequestsView: React.FC<BlockRequestsViewProps> = ({
  blocks,
  assets,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
  onResetDemo,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockRequest | null>(null);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Form State
  const [assetId, setAssetId] = useState(assets[0]?.id || 'SEC_NDLS_GZB');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('routine_inspection');
  const [priority, setPriority] = useState<BlockPriority>(3);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [earliestStart, setEarliestStart] = useState(360); // 06:00
  const [latestEnd, setLatestEnd] = useState(720);        // 12:00
  const [preferredStart, setPreferredStart] = useState(480); // 08:00
  const [requestedBy, setRequestedBy] = useState('Civil Engineering Division');
  const [crewRequired, setCrewRequired] = useState(1);
  const [requiresPowerBlock, setRequiresPowerBlock] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingBlock(null);
    setAssetId(assets[0]?.id || 'SEC_NDLS_GZB');
    setMaintenanceType('routine_inspection');
    setPriority(3);
    setDurationMinutes(90);
    setEarliestStart(360);
    setLatestEnd(720);
    setPreferredStart(480);
    setRequestedBy('Civil Engineering Division');
    setCrewRequired(1);
    setRequiresPowerBlock(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: BlockRequest) => {
    setEditingBlock(b);
    setAssetId(b.asset_id);
    setMaintenanceType(b.maintenance_type);
    setPriority(b.priority);
    setDurationMinutes(b.duration_minutes);
    setEarliestStart(b.earliest_start);
    setLatestEnd(b.latest_end);
    setPreferredStart(b.preferred_start);
    setRequestedBy(b.requested_by);
    setCrewRequired(b.crew_required);
    setRequiresPowerBlock(b.requires_power_block);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (latestEnd <= earliestStart) {
      setFormError('Latest end must be after earliest start time.');
      return;
    }
    if (durationMinutes > (latestEnd - earliestStart)) {
      setFormError('Duration exceeds available time window.');
      return;
    }
    if (preferredStart < earliestStart || preferredStart > (latestEnd - durationMinutes)) {
      setFormError(`Preferred start must fit within [${earliestStart}, ${latestEnd - durationMinutes}] min window.`);
      return;
    }

    try {
      if (editingBlock) {
        await onUpdateBlock({
          ...editingBlock,
          asset_id: assetId,
          maintenance_type: maintenanceType,
          priority,
          duration_minutes: Number(durationMinutes),
          earliest_start: Number(earliestStart),
          latest_end: Number(latestEnd),
          preferred_start: Number(preferredStart),
          requested_by: requestedBy,
          crew_required: Number(crewRequired),
          requires_power_block: requiresPowerBlock,
        });
      } else {
        await onCreateBlock({
          asset_id: assetId,
          maintenance_type: maintenanceType,
          priority,
          duration_minutes: Number(durationMinutes),
          earliest_start: Number(earliestStart),
          latest_end: Number(latestEnd),
          preferred_start: Number(preferredStart),
          requested_by: requestedBy,
          crew_required: Number(crewRequired),
          requires_power_block: requiresPowerBlock,
          status: 'pending',
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save block request.');
    }
  };

  const getPriorityBadge = (p: BlockPriority) => {
    switch (p) {
      case 5:
        return <span className="px-2 py-0.5 bg-rose-950 border border-rose-600 text-rose-300 font-pixel text-[8px] shadow-glow-red">P5 EMERGENCY</span>;
      case 4:
        return <span className="px-2 py-0.5 bg-orange-950 border border-orange-600 text-orange-300 font-pixel text-[8px]">P4 CRITICAL</span>;
      case 3:
        return <span className="px-2 py-0.5 bg-amber-950 border border-amber-600 text-yellow-300 font-pixel text-[8px]">P3 HIGH</span>;
      case 2:
        return <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-600 text-cyan-300 font-pixel text-[8px]">P2 MEDIUM</span>;
      case 1:
        return <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-400 font-pixel text-[8px]">P1 LOW</span>;
    }
  };

  // Filtered blocks list
  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      const matchSection = filterSection === 'all' || b.asset_id === filterSection;
      const matchPriority = filterPriority === 'all' || b.priority.toString() === filterPriority;
      return matchSection && matchPriority;
    });
  }, [blocks, filterSection, filterPriority]);

  return (
    <div className="space-y-4 pb-6 select-none">
      {/* 1. Top Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 text-xl shadow-xs">
            🔧
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-pixel text-xs md:text-sm text-slate-900 uppercase tracking-wide">
                Maintenance Block Demand Registry ({blocks.length} Tasks)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-pixel text-[7px] uppercase">
                CORRIDOR QUEUE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Engineer requests submitted for track renewal, catenary OHE, signaling, and inspections
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onResetDemo}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-pixel text-[8px] transition-all"
          >
            RESET BENCHMARK SET
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-pixel text-[8px] tracking-wide transition-all shadow-sm"
          >
            + NEW BLOCK REQUEST
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <span className="text-[8px] font-pixel text-slate-500 uppercase">FILTER BY SECTION:</span>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:border-blue-500 outline-none"
          >
            <option value="all">All 5 Track Sections</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id.replace('SEC_', '')} ({a.name})
              </option>
            ))}
          </select>

          <span className="text-[8px] font-pixel text-slate-500 uppercase ml-2">PRIORITY:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:border-blue-500 outline-none"
          >
            <option value="all">All Priorities (P1-P5)</option>
            <option value="5">P5 - Emergency</option>
            <option value="4">P4 - Critical</option>
            <option value="3">P3 - High</option>
            <option value="2">P2 - Medium</option>
            <option value="1">P1 - Low</option>
          </select>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          Showing <strong className="text-blue-700">{filteredBlocks.length}</strong> of {blocks.length} requests
        </div>
      </div>

      {/* 3. Main Demands Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-[8px] font-pixel uppercase">
              <th className="py-2.5 px-3">BLOCK ID</th>
              <th className="py-2.5 px-3">SECTION</th>
              <th className="py-2.5 px-3">MAINTENANCE TYPE</th>
              <th className="py-2.5 px-3">PRIORITY</th>
              <th className="py-2.5 px-3">DURATION</th>
              <th className="py-2.5 px-3">TIME WINDOW (IST)</th>
              <th className="py-2.5 px-3">PREFERRED</th>
              <th className="py-2.5 px-3">CREWS</th>
              <th className="py-2.5 px-3">OHE POWER</th>
              <th className="py-2.5 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBlocks.map((block) => {
              const startH = Math.floor(block.earliest_start / 60);
              const startM = block.earliest_start % 60;
              const endH = Math.floor(block.latest_end / 60);
              const endM = block.latest_end % 60;
              const prefH = Math.floor(block.preferred_start / 60);
              const prefM = block.preferred_start % 60;

              return (
                <tr key={block.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-pixel text-[10px] text-electric-cyan whitespace-nowrap">
                    {block.id}
                  </td>
                  <td className="py-3 px-3 text-slate-200 whitespace-nowrap">
                    {block.asset_id.replace('SEC_', '')}
                  </td>
                  <td className="py-3 px-3 capitalize text-slate-300 whitespace-nowrap">
                    {block.maintenance_type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getPriorityBadge(block.priority)}
                  </td>
                  <td className="py-3 px-3 font-digital text-base text-yellow-400 whitespace-nowrap">
                    {block.duration_minutes}m
                  </td>
                  <td className="py-3 px-3 font-digital text-base text-slate-300 whitespace-nowrap">
                    {String(startH).padStart(2, '0')}:{String(startM).padStart(2, '0')} - {String(endH).padStart(2, '0')}:{String(endM).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-3 font-digital text-base text-cyan-300 whitespace-nowrap">
                    {String(prefH).padStart(2, '0')}:{String(prefM).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-[#060a12] border border-slate-700 text-yellow-300 font-pixel text-[8px]">
                      {block.crew_required} CREW
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {block.requires_power_block ? (
                      <span className="px-1.5 py-0.5 bg-rose-950/80 border border-rose-700 text-rose-300 font-pixel text-[8px]">
                        ⚡ 25kV OHE
                      </span>
                    ) : (
                      <span className="text-slate-500 font-pixel text-[8px]">NONE</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => openEditModal(block)}
                      className="px-2 py-1 bg-[#0c1424] hover:bg-[#15233c] text-yellow-400 border border-slate-700 text-[8px] font-pixel transition-colors"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => onDeleteBlock(block.id)}
                      className="px-2 py-1 bg-rose-950 hover:bg-rose-800 text-rose-300 border border-rose-800 text-[8px] font-pixel transition-colors"
                    >
                      DEL
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Modal Form for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-pixel text-xs text-slate-900 uppercase flex items-center space-x-2">
                <span>🔧</span>
                <span>{editingBlock ? 'EDIT BLOCK REQUEST' : 'NEW MAINTENANCE BLOCK REQUEST'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-pixel text-xs px-1.5 py-0.5"
              >
                [X]
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-rose-50 border border-rose-300 rounded-xl p-2.5 text-xs font-mono text-rose-800 flex items-center space-x-2">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[8px] font-pixel text-slate-500 mb-1">TARGET TRACK SECTION</label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono text-xs focus:border-blue-500 outline-none"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} — {a.name} ({a.end_km - a.start_km} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-pixel text-slate-500 mb-1">MAINTENANCE TYPE</label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono text-xs focus:border-blue-500 outline-none"
                  >
                    <option value="routine_inspection">Routine Inspection</option>
                    <option value="emergency_repair">Emergency Repair</option>
                    <option value="track_renewal">Track Renewal</option>
                    <option value="ohe_maintenance">OHE Maintenance</option>
                    <option value="signal_maintenance">Signal Maintenance</option>
                    <option value="bridge_inspection">Bridge Inspection</option>
                    <option value="ballast_cleaning">Ballast Cleaning</option>
                    <option value="rail_grinding">Rail Grinding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-pixel text-slate-500 mb-1">PRIORITY TIER</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value) as BlockPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono text-xs focus:border-blue-500 outline-none"
                  >
                    <option value={5}>P5 - Emergency (Immediate)</option>
                    <option value={4}>P4 - Critical Safety</option>
                    <option value={3}>P3 - High Priority</option>
                    <option value={2}>P2 - Medium Routine</option>
                    <option value={1}>P1 - Low / Deferrable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[8px] font-pixel text-slate-500 mb-1">DURATION (MIN)</label>
                  <input
                    type="number"
                    min={15}
                    max={720}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono text-xs focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-pixel text-slate-500 mb-1">EARLIEST (MIN)</label>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    step={15}
                    value={earliestStart}
                    onChange={(e) => setEarliestStart(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono text-xs focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-pixel text-slate-500 mb-1">LATEST (MIN)</label>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    step={15}
                    value={latestEnd}
                    onChange={(e) => setLatestEnd(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono text-xs focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-pixel text-slate-500 mb-1">PREFERRED START (MIN)</label>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    step={15}
                    value={preferredStart}
                    onChange={(e) => setPreferredStart(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-blue-700 font-mono text-xs focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-pixel text-slate-500 mb-1">CREW TEAMS</label>
                  <select
                    value={crewRequired}
                    onChange={(e) => setCrewRequired(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono text-xs focus:border-blue-500 outline-none"
                  >
                    <option value={1}>1 Crew Team</option>
                    <option value={2}>2 Crew Teams (Max Limit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-pixel text-slate-500 mb-1">REQUESTED BY DIVISION</label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono text-xs focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="powerBlockCheck"
                  checked={requiresPowerBlock}
                  onChange={(e) => setRequiresPowerBlock(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="powerBlockCheck" className="text-[11px] text-slate-600 font-mono cursor-pointer">
                  Requires 25kV OHE Catenary Power De-energization (Power Block)
                </label>
              </div>

              <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-pixel text-[8px]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-pixel text-[8px] shadow-sm"
                >
                  {editingBlock ? 'SAVE CHANGES' : 'CREATE DEMAND'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
