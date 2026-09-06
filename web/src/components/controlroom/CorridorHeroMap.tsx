import React, { useState } from 'react';
import { Station, Asset, TrainMovement, ScheduledBlock } from '../../types';
import {
  PixelIndiaGate,
  PixelTajMahal,
  PixelYamunaBridge,
  PixelWap7,
  PixelVandeBharat,
  PixelOheMast,
} from './PixelScenery';
import { PixelStation, PixelTrack, PixelSignal, PixelWrench, PixelTrain } from '../PixelIcons';

interface CorridorHeroMapProps {
  stations: Station[];
  assets: Asset[];
  trains: TrainMovement[];
  scheduledBlocks: ScheduledBlock[];
  selectedId: string;
  onSelectTrack: (trackId: string) => void;
  onSelectStation: (stationId: string) => void;
}

export const CorridorHeroMap: React.FC<CorridorHeroMapProps> = ({
  stations,
  assets,
  trains,
  scheduledBlocks,
  selectedId,
  onSelectTrack,
  onSelectStation,
}) => {
  return (
    <div className="pixel-card-light p-4 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] relative overflow-hidden">
      {/* 1. Header Bar of Centerpiece */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#0f172a] pb-3 mb-4 gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#0284c7] border-2 border-[#0f172a] shadow-pixel-sm">
            <PixelTrack size={20} color="#ffffff" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-pixel text-xs md:text-sm text-slate-900 uppercase tracking-wide">
                DELHI–AGRA HIGH-SPEED CORRIDOR CENTERPIECE
              </h2>
              <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-500 text-emerald-800 text-[8px] font-pixel shadow-sm">
                LIVE TOPOLOGY
              </span>
            </div>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              6 Stations • 5 Double-Line Sections • 265 KM • 25kV AC OHE • Interlocked Absolute Block Signaling
            </p>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center space-x-3 text-[9px] font-pixel text-slate-700 bg-white p-1.5 border border-slate-300 shadow-sm">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 border border-black inline-block"></span>
            <span>CLEAR (GREEN)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-amber-500 border border-black inline-block"></span>
            <span>MAINTENANCE POSSESSION</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-cyan-600 border border-black inline-block"></span>
            <span>TRAIN TRAVERSAL</span>
          </span>
        </div>
      </div>

      {/* 2. Panoramic Scenery Tier (India Gate -> Yamuna -> OHE -> Taj Mahal) */}
      <div className="relative min-w-[760px] pb-6 pt-2 overflow-x-auto">
        {/* Landmark Row Above Stations */}
        <div className="flex justify-between items-end px-6 mb-2">
          {/* Delhi Landmark: India Gate */}
          <div className="flex flex-col items-center">
            <PixelIndiaGate size={40} className="hover:scale-110 transition-transform" />
            <span className="font-pixel text-[8px] text-amber-800 mt-1 bg-amber-100 px-1.5 py-0.5 border border-amber-300">
              INDIA GATE (NDLS)
            </span>
          </div>

          {/* Yamuna River Bridge */}
          <div className="flex flex-col items-center -ml-16">
            <PixelYamunaBridge size={36} />
            <span className="font-pixel text-[7px] text-cyan-800 mt-0.5 bg-cyan-100 px-1 py-0.5 border border-cyan-300">
              YAMUNA RIVER BRIDGE
            </span>
          </div>

          {/* Center Electric Locomotive: Vande Bharat */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <PixelOheMast size={20} />
              <PixelVandeBharat size={50} className="hover:scale-105 transition-transform" />
              <PixelOheMast size={20} />
            </div>
            <span className="font-pixel text-[7px] text-blue-900 mt-0.5 bg-blue-100 px-1 py-0.5 border border-blue-300">
              VANDE BHARAT 130 KM/H
            </span>
          </div>

          {/* WAP-7 Loco on Central Section */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <PixelOheMast size={20} />
              <PixelWap7 size={46} className="hover:scale-105 transition-transform" />
            </div>
            <span className="font-pixel text-[7px] text-red-900 mt-0.5 bg-red-100 px-1 py-0.5 border border-red-300">
              WAP-7 TRICOLOR LOCO
            </span>
          </div>

          {/* Agra Landmark: Taj Mahal */}
          <div className="flex flex-col items-center">
            <PixelTajMahal size={42} className="hover:scale-110 transition-transform" />
            <span className="font-pixel text-[8px] text-slate-800 mt-1 bg-slate-100 px-1.5 py-0.5 border border-slate-300">
              TAJ MAHAL (AGRA)
            </span>
          </div>
        </div>

        {/* Main Railway Double-Track Trunk Line (Physical Visual Bed) */}
        <div className="relative my-4 px-4">
          {/* Ballast Bed */}
          <div className="h-5 w-full bg-[#334155] border-y-2 border-[#0f172a] relative flex items-center shadow-inner">
            {/* Railroad Sleepers Pattern */}
            <div className="w-full h-full opacity-60 bg-[repeating-linear-gradient(90deg,#1e293b,#1e293b_4px,#475569_4px,#475569_14px)]"></div>
            {/* Top Steel Rail */}
            <div className="absolute top-1 left-0 right-0 h-0.5 bg-[#94a3b8] border-b border-black"></div>
            {/* Bottom Steel Rail */}
            <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-[#94a3b8] border-t border-black"></div>
          </div>
        </div>

        {/* 6 Stations and 5 Connecting Section Hubs */}
        <div className="relative flex justify-between items-start px-3 z-10 -mt-7">
          {stations.map((stn, index) => {
            const nextStation = stations[index + 1];
            const section = nextStation
              ? assets.find((a) => a.id === `SEC_${stn.code}_${nextStation.code}`)
              : null;

            const isStnSelected = selectedId === stn.id;
            const isSecSelected = section && selectedId === section.id;

            // Station active train count
            const stnTrains = trains.filter((t) =>
              t.sections.some((s) => s.asset_id.includes(stn.code))
            );

            // Block count on section
            const hasSectionBlock = section && scheduledBlocks.some((b) => b.asset_id === section.id);
            const sectionTrains = section
              ? trains.filter((t) => t.sections.some((s) => s.asset_id === section.id))
              : [];

            return (
              <React.Fragment key={stn.id}>
                {/* Station Node Card */}
                <div
                  onClick={() => onSelectStation(stn.id)}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-150 z-20 ${
                    isStnSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div
                    className={`w-16 p-2 border-2 flex flex-col items-center justify-center transition-all ${
                      isStnSelected
                        ? 'bg-[#fef08a] border-black shadow-pixel'
                        : 'bg-white border-[#0f172a] shadow-pixel hover:border-blue-600'
                    }`}
                  >
                    <PixelStation size={22} color={isStnSelected ? '#b45309' : '#0284c7'} />
                    <span className="font-pixel text-[9px] font-bold text-slate-900 mt-1">
                      {stn.code}
                    </span>
                    <div className="mt-1">
                      <PixelSignal aspect={stnTrains.length > 0 ? 'amber' : 'green'} size={14} />
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    <div className="font-pixel text-[9px] text-slate-900 font-bold whitespace-nowrap">
                      {stn.name}
                    </div>
                    <div className="text-[10px] text-blue-700 font-mono font-bold">
                      KM {stn.km.toFixed(1)}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      {stn.platforms} PFs
                    </div>
                  </div>
                </div>

                {/* Connecting Track Section Button & Badge */}
                {section && (
                  <div className="flex-1 flex flex-col items-center justify-center px-1 z-20 mt-1">
                    <button
                      onClick={() => onSelectTrack(section.id)}
                      className={`px-2.5 py-1.5 border-2 text-[9px] font-pixel transition-all duration-150 ${
                        isSecSelected
                          ? 'bg-[#0f172a] text-yellow-300 border-black shadow-pixel scale-105'
                          : hasSectionBlock
                          ? 'bg-[#fffbeb] text-amber-800 border-amber-500 shadow-pixel hover:bg-amber-100'
                          : 'bg-white text-slate-800 border-[#0f172a] shadow-pixel hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        {hasSectionBlock ? (
                          <PixelWrench size={12} color="#d97706" />
                        ) : sectionTrains.length > 0 ? (
                          <PixelTrain size={12} color="#0284c7" />
                        ) : (
                          <PixelTrack size={12} color="#475569" />
                        )}
                        <span>{section.end_km - section.start_km} KM</span>
                      </div>
                    </button>

                    <div className="mt-1 text-[8px] font-mono text-slate-600 text-center whitespace-nowrap font-bold">
                      {section.max_speed_kmph} km/h • {hasSectionBlock ? '⚠️ BLOCKED' : 'CLEAR'}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
