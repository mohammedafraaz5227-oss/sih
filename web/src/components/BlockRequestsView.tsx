import React, { useState } from 'react';
import { BlockRequest, Asset, MaintenanceType, BlockPriority } from '../types';
import { PixelWrench, PixelAlert } from './PixelIcons';

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
      setFormError(`Preferred start must fit in [${earliestStart}, ${latestEnd - durationMinutes}] min window.`);
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
        return <span className="px-2 py-0.5 bg-red-950 border border-red-600 text-red-400 font-pixel text-[8px]">P5 EMERGENCY</span>;
      case 4:
        return <span className="px-2 py-0.5 bg-orange-950 border border-orange-600 text-orange-400 font-pixel text-[8px]">P4 CRITICAL</span>;
      case 3:
        return <span className="px-2 py-0.5 bg-yellow-950 border border-yellow-600 text-yellow-400 font-pixel text-[8px]">P3 HIGH</span>;
      case 2:
        return <span className="px-2 py-0.5 bg-blue-950 border border-blue-600 text-cyan-400 font-pixel text-[8px]">P2 MEDIUM</span>;
      case 1:
        return <span className="px-2 py-0.5 bg-slate-900 border border-slate-600 text-slate-400 font-pixel text-[8px]">P1 LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-[#1e293b] border-2 border-black shadow-pixel p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <PixelWrench size={20} color="#facc15" />
          <h2 className="font-pixel text-xs text-yellow-400 uppercase">
            Maintenance Block Demand Registry ({blocks.length} Tasks)
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onResetDemo}
            className="pixel-btn bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-[10px] px-3 py-2"
          >
            RESET TO BENCHMARK SET
          </button>
          <button
            onClick={openCreateModal}
            className="pixel-btn bg-[#7B1113] hover:bg-red-800 text-yellow-300 font-pixel text-[10px] px-3.5 py-2"
          >
            + NEW BLOCK REQUEST
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="pixel-card overflow-x-auto bg-[#111827]">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="bg-black text-slate-400 border-b-2 border-slate-700 text-[10px] font-pixel">
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">SECTION</th>
              <th className="py-2.5 px-3">MAINTENANCE TYPE</th>
              <th className="py-2.5 px-3">PRIORITY</th>
              <th className="py-2.5 px-3">DURATION</th>
              <th className="py-2.5 px-3">WINDOW (IST)</th>
              <th className="py-2.5 px-3">PREFERRED</th>
              <th className="py-2.5 px-3">CREW</th>
              <th className="py-2.5 px-3">POWER BLOCK</th>
              <th className="py-2.5 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {blocks.map((block) => {
              const startH = Math.floor(block.earliest_start / 60);
              const startM = block.earliest_start % 60;
              const endH = Math.floor(block.latest_end / 60);
              const endM = block.latest_end % 60;
              const prefH = Math.floor(block.preferred_start / 60);
              const prefM = block.preferred_start % 60;

              return (
                <tr key={block.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-pixel text-[10px] text-cyan-400 whitespace-nowrap">
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
                  <td className="py-3 px-3 font-digital text-base text-yellow-300 whitespace-nowrap">
                    {block.duration_minutes}m
                  </td>
                  <td className="py-3 px-3 font-digital text-base text-slate-300 whitespace-nowrap">
                    {String(startH).padStart(2, '0')}:{String(startM).padStart(2, '0')} - {String(endH).padStart(2, '0')}:{String(endM).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-3 font-digital text-base text-cyan-300 whitespace-nowrap">
                    {String(prefH).padStart(2, '0')}:{String(prefM).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-black border border-slate-700 text-yellow-300 font-pixel text-[9px]">
                      {block.crew_required} CREW
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {block.requires_power_block ? (
                      <span className="text-red-400 font-pixel text-[9px]">⚡ REQUIRED</span>
                    ) : (
                      <span className="text-slate-500 font-pixel text-[9px]">NONE</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => openEditModal(block)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-black text-[9px] font-pixel"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => onDeleteBlock(block.id)}
                      className="px-2 py-1 bg-red-950 hover:bg-red-800 text-red-300 border border-black text-[9px] font-pixel"
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

      {/* Retro Modal Form for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="pixel-card bg-[#111827] border-4 border-black max-w-lg w-full p-5 shadow-pixel-lg">
            <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
              <h3 className="font-pixel text-xs text-yellow-400 uppercase flex items-center space-x-2">
                <PixelWrench size={16} color="#facc15" />
                <span>{editingBlock ? 'EDIT BLOCK REQUEST' : 'NEW MAINTENANCE BLOCK REQUEST'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                [X]
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-950 border-2 border-red-700 p-2 text-xs font-mono text-red-300 flex items-center space-x-2">
                <PixelAlert size={16} color="#ef4444" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[10px] font-pixel text-slate-400 mb-1">TARGET TRACK SECTION</label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-black border-2 border-slate-700 p-2 text-white font-mono text-xs focus:border-yellow-400 outline-none"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} — {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-pixel text-slate-400 mb-1">MAINTENANCE TYPE</label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
                    className="w-full bg-black border-2 border-slate-700 p-2 text-white font-mono text-xs focus:border-yellow-400 outline-none"
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
                  <label className="block text-[10px] font-pixel text-slate-400 mb-1">PRIORITY TIER</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value) as BlockPriority)}
                    className="w-full bg-black border-2 border-slate-700 p-2 text-white font-mono text-xs focus:border-yellow-400 outline-none"
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
                  <label className="block text-[10px] font-pixel text-slate-400 mb-1">DURATION (MIN)</label>
                  <input
                    type="number"
                    min={15}
                    max={720}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-black border-2 border-slate-700 p-2 text-yellow-300 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-pixel text-slate-400 mb-1">EARLIEST (MIN)</label>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    step={15}
                    value={earliestStart}
                    onChange={(e) => setEarliestStart(Number(e.target.value))}
                    className="w-full bg-black border-2 border-slate-700 p-2 text-white font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-pixel text-slate-400 mb-1">LATEST (MIN)</label>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    step={15}
                    value={latestEnd}
                    onChange={(e) => setLatestEnd(Number(e.target.value))}
                    className="w-full bg-black border-2 border-slate-700 p-2 text-white font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-pixel text-slate-400 mb-1">PREFERRED START (MIN)</label>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    step={15}
                    value={preferredStart}
                    onChange={(e) => setPreferredStart(Number(e.target.value))}
                    className="w-full bg-black border-2 border-slate-700 p-2 text-cyan-300 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-pixel text-slate-400 mb-1">CREW REQUIRED</label>
                  <select
                    value={crewRequired}
                    onChange={(e) => setCrewRequired(Number(e.target.value))}
                    className="w-full bg-black border-2 border-slate-700 p-2 text-white font-mono text-xs"
                  >
                    <option value={1}>1 Crew Team</option>
                    <option value={2}>2 Crew Teams</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-slate-400 mb-1">REQUESTED BY DIVISION</label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="w-full bg-black border-2 border-slate-700 p-2 text-white font-mono text-xs"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="powerBlockCheck"
                  checked={requiresPowerBlock}
                  onChange={(e) => setRequiresPowerBlock(e.target.checked)}
                  className="w-4 h-4 bg-black border border-slate-600 accent-[#7B1113]"
                />
                <label htmlFor="powerBlockCheck" className="text-[11px] text-slate-300 font-mono cursor-pointer">
                  Requires 25kV OHE Catenary Power De-energization (Power Block)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="pixel-btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 font-pixel text-[10px]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="pixel-btn bg-[#7B1113] hover:bg-red-800 text-yellow-300 px-5 py-2 font-pixel text-[10px]"
                >
                  {editingBlock ? 'SAVE CHANGES' : 'CREATE REQUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
