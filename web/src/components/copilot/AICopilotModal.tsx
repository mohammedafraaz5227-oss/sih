import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  parseFieldRequisition, 
  generateOfficialCircular, 
  getXAIExplanation 
} from '../../services/aiCopilotService';
import { 
  BlockRequest, 
  OptimizedSchedule, 
  NLPParsingResponse, 
  OfficialCircularData 
} from '../../types';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: OptimizedSchedule | null;
  onCreateBlock: (block: Omit<BlockRequest, 'id'>) => Promise<void>;
  onRunOptimization: () => Promise<void>;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onCreateBlock,
  onRunOptimization,
}) => {
  const [activeTab, setActiveTab] = useState<'nlp' | 'circular' | 'xai'>('nlp');

  // Tab 1: NLP Requisition State
  const [inputText, setInputText] = useState<string>(
    'Need 3 hours near Aligarh for urgent rail grinding tomorrow afternoon at 2 PM with 2 crews'
  );
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<NLPParsingResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Tab 2: Circular State
  const [circularData] = useState<OfficialCircularData>(() =>
    generateOfficialCircular(schedule)
  );

  // Tab 3: XAI State
  const [xaiQuestion, setXaiQuestion] = useState<string>(
    'How did the CP-SAT engine guarantee zero conflicts for Rajdhani Express 12301?'
  );
  const [xaiResponse, setXaiResponse] = useState<string>(() =>
    getXAIExplanation('rajdhani', schedule)
  );

  const samplePrompts = [
    'Need 3 hours near Aligarh for urgent rail grinding tomorrow afternoon at 2 PM with 2 crews',
    'Mathura mein OHE catenary wire repair ke liye 2 ghante chahiye subah 8 baje',
    'Emergency rail fracture reported near Tundla, need immediate 2-hour track block with 2 teams',
    'Routine sleeper and track renewal between Ghaziabad and Aligarh for 4 hours',
  ];

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setIsParsing(true);
    setSubmitSuccess(false);
    try {
      const res = await parseFieldRequisition(inputText);
      setParsedResult(res);
    } catch (err) {
      console.error('NLP Parse error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmitParsedBlock = async () => {
    if (!parsedResult?.parsed_block) return;
    setIsSubmitting(true);
    try {
      const { id, ...blockData } = parsedResult.parsed_block as BlockRequest;
      await onCreateBlock(blockData);
      await onRunOptimization();
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Submit parsed block error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskXAI = (q: string) => {
    setXaiQuestion(q);
    const ans = getXAIExplanation(q, schedule);
    setXaiResponse(ans);
  };

  const handlePrintCircular = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-[#121214] border border-slate-300 dark:border-[#27272a] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#27272a] flex items-center justify-between bg-slate-50/80 dark:bg-[#18181b]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-amber-500/40 flex items-center justify-center shadow-md">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-wide">
                  COGNITIVE AI DISPATCHER CO-PILOT
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  HYBRID AI LAYER
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Field Voice/NLP Requisitions • Official Form T/409 Circulars • Explainable AI (XAI)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors font-mono font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-[#27272a] bg-slate-100/60 dark:bg-[#09090b] px-4 pt-2 gap-2 text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab('nlp')}
            className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'nlp'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-[#121214] font-bold shadow-xs'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>🎙️</span>
            <span>NLP FIELD REQUISITION</span>
          </button>
          <button
            onClick={() => setActiveTab('circular')}
            className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'circular'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-[#121214] font-bold shadow-xs'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>📜</span>
            <span>OFFICIAL FORM T/409 CIRCULAR</span>
          </button>
          <button
            onClick={() => setActiveTab('xai')}
            className={`px-4 py-2.5 rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'xai'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#121214] font-bold shadow-xs'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>💡</span>
            <span>DISPATCHER CO-PILOT (XAI)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* TAB 1: NLP Field Requisition */}
          {activeTab === 'nlp' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">Natural Language Ingestion:</span> Field engineers, gangmen, and permanent way inspectors (PWI) can type or voice-dictate requisitions in plain English, Hindi, or Hinglish. The AI parses the request into strict mathematical constraints.
              </div>

              {/* Sample Prompts */}
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Sample Field Audio/Text Notes (Click to Test):
                </label>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(prompt)}
                      className="text-left text-xs bg-slate-100 dark:bg-zinc-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-[#27272a] px-3 py-1.5 rounded-lg transition-all duration-150"
                    >
                      💬 {prompt.substring(0, 55)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold font-mono">
                  FIELD NOTE TRANSCRIPT / REQUISITION INPUT:
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={3}
                  placeholder="Enter maintenance block requisition text in English or Hindi..."
                  className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-300 dark:border-[#27272a] rounded-xl p-3 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleParse}
                  disabled={isParsing || !inputText.trim()}
                  className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isParsing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>EXTRACTING CONSTRAINTS...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>AI PARSE & EXTRACT PARAMETERS</span>
                    </>
                  )}
                </button>
              </div>

              {/* Parsed Output Card */}
              {parsedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-amber-200 dark:border-[#27272a] bg-amber-50/40 dark:bg-[#18181b] rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">✅</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 dark:text-amber-200">
                        Extracted Railway Constraint Payload
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                      Confidence: {(parsedResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {parsedResult.natural_explanation}
                  </p>

                  {/* Entity Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    {Object.entries(parsedResult.extracted_entities).map(([k, v]) => (
                      <div
                        key={k}
                        className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#27272a] rounded-lg p-2"
                      >
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          {k.replace('_', ' ')}
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {String(v)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Target Engine: Google OR-Tools CP-SAT (8 Parallel Workers)
                    </div>
                    <button
                      onClick={handleSubmitParsedBlock}
                      disabled={isSubmitting || submitSuccess}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs ${
                        submitSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#7B1113] hover:bg-[#921416] text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <span>ADDING TO SOLVER QUEUE...</span>
                      ) : submitSuccess ? (
                        <span>✓ SCHEDULED INTO CORRIDOR TIMETABLE</span>
                      ) : (
                        <span>SUBMIT TO CP-SAT & RE-OPTIMIZE →</span>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 2: Official Form T/409 Circular */}
          {activeTab === 'circular' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Authentic bilingual Indian Railways official notice generated from current CP-SAT schedule.
                </p>
                <button
                  onClick={handlePrintCircular}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>🖨️</span>
                  <span>PRINT / EXPORT FORM T/409</span>
                </button>
              </div>

              {/* Authentic Indian Railways Form T/409 Layout */}
              <div className="bg-[#fffdf7] dark:bg-[#070d18] border-2 border-[#7B1113]/30 dark:border-[#d97706]/40 rounded-xl p-5 text-slate-900 dark:text-slate-100 shadow-inner font-serif">
                {/* Government of India Crest Header */}
                <div className="text-center border-b-2 border-[#7B1113]/40 pb-3 mb-4 space-y-1">
                  <div className="flex items-center justify-center gap-2 text-[#7B1113] dark:text-amber-400 font-bold text-sm tracking-wider font-sans">
                    <span>🇮🇳</span>
                    <span>GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#7B1113] dark:text-amber-400">
                    {circularData.zone}
                  </h3>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans">
                    {circularData.division} • OPERATING DEPARTMENT (OCC)
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1">
                    CIRCULAR REF: <span className="font-bold text-black dark:text-white">{circularData.circular_number}</span> | DATE: {circularData.date_ist}
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-4 text-center">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-amber-300 uppercase tracking-wide">
                    {circularData.subject}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {circularData.subject_hindi}
                  </div>
                </div>

                {/* Table of Approved Possessions */}
                <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg mb-4 font-sans text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#7B1113] text-white text-[10px] uppercase font-mono tracking-wider">
                      <tr>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">S.No</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Section</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Line</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Work Type</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Approved Slot (IST)</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Caution Speed</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Official In-Charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {circularData.blocks.map((b) => (
                        <tr key={b.serial} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-2 font-mono font-bold text-center">{b.serial}</td>
                          <td className="p-2 font-semibold">
                            <div>{b.section_name}</div>
                            <div className="font-mono text-[10px] text-slate-500">{b.section_code}</div>
                          </td>
                          <td className="p-2 font-mono">{b.line_affected}</td>
                          <td className="p-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {b.maintenance_type}
                            </span>
                            <div className="text-[10px] text-slate-500">{b.duration_str}</div>
                          </td>
                          <td className="p-2 font-mono font-bold text-amber-800 dark:text-amber-300">
                            {b.time_window_ist}
                          </td>
                          <td className="p-2 font-mono font-bold text-rose-700 dark:text-rose-400">
                            {b.caution_order_speed}
                          </td>
                          <td className="p-2 text-[10px] text-slate-600 dark:text-slate-400">
                            {b.supervising_official}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Operating Instructions */}
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mb-4 font-sans">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Mandatory Safety Instructions (SR 4.09 & G&SR):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    {circularData.general_instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ul>
                </div>

                {/* Sign-Off Footer */}
                <div className="pt-4 border-t border-slate-300 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[10px] font-bold uppercase text-slate-500">
                      Station Master Electronic Acknowledgment:
                    </div>
                    <div className="text-[10px] italic text-slate-600 dark:text-slate-400 mt-1">
                      "{circularData.station_master_acknowledgment}"
                    </div>
                    <div className="mt-2 text-[10px] font-mono font-bold text-emerald-600">
                      ● ACKNOWLEDGED (NDLS, GZB, ALG, TDK, MTJ, AGC)
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-end">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      Sr. Divisional Operations Manager (Sr. DOM)
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Divisional Control Office, Agra Division
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">
                      [DIGITALLY SIGNED VIA CP-SAT OCC DISPATCH CONSOLE]
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Explainable AI (XAI) */}
          {activeTab === 'xai' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-bold">Explainable AI (XAI):</span> Demystifies why the mathematical CP-SAT solver placed, shifted, or deferred specific blocks, referencing safety headway buffers, conflicting trains, and crew limits.
              </div>

              {/* Quick Questions */}
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Frequently Asked Dispatcher Queries:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'How did the CP-SAT engine guarantee zero conflicts for Rajdhani Express 12301?',
                    'Why was Block #4 shifted from its preferred start time?',
                    'How were maintenance crew capacity constraints managed?',
                    'Why does the solver run in under 10 milliseconds?',
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskXAI(q)}
                      className="text-left text-xs bg-slate-100 dark:bg-zinc-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:border-emerald-400 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-[#27272a] p-2.5 rounded-xl transition-all"
                    >
                      💡 {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Question & AI Response */}
              <div className="bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="text-emerald-600 dark:text-emerald-400">❓ Controller Query:</span>
                  <span>{xaiQuestion}</span>
                </div>

                <div className="border-t border-slate-200 dark:border-[#27272a] pt-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      AI
                    </div>
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                      {xaiResponse}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-[#27272a] bg-slate-50 dark:bg-[#18181b] flex items-center justify-between text-xs font-mono">
          <div className="text-slate-500 dark:text-slate-400">
            Indian Railways Smart Operations Co-Pilot • SIH-1608
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold rounded-lg transition-colors"
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </div>
  );
};
