import React, { useState, useEffect } from 'react';
import { Activity, X, CheckCircle2, XCircle, Play, RefreshCw } from 'lucide-react';
import { UnitTestResult } from '../types/comic';
import { runAutomatedTestSuite } from '../utils/testRunner';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [results, setResults] = useState<UnitTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    const testResults = await runAutomatedTestSuite();
    setResults(testResults);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isOpen && results.length === 0) {
      handleRunTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalTests = results.length;
  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Automated QA & Unit Test Suite
              </h3>
              <p className="text-[11px] text-slate-400">
                Verifies natural sorting, path filtering, LRU eviction, and spread alignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-300">
                Test Summary Status
              </span>
              <div className="text-sm font-bold text-white mt-0.5">
                {passedCount} / {totalTests} Passed
              </div>
            </div>

            <button
              disabled={isRunning}
              onClick={handleRunTests}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRunning ? 'animate-spin' : ''} />
              <span>{isRunning ? 'Running...' : 'Rerun Suite'}</span>
            </button>
          </div>

          {/* Individual Test Cases */}
          <div className="space-y-2">
            {results.map((test, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border text-xs flex items-start justify-between space-x-3 transition-all ${
                  test.passed
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-red-950/20 border-red-500/30 text-red-200'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2 font-semibold">
                    {test.passed ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-red-400 shrink-0" />
                    )}
                    <span>{test.name}</span>
                  </div>
                  {test.message && (
                    <p className="text-[11px] opacity-80 pl-6 font-mono">
                      {test.message}
                    </p>
                  )}
                </div>

                <span className="text-[10px] font-mono opacity-60 shrink-0">
                  {test.durationMs} ms
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>macOS Sonoma Unit Test Pipeline</span>
          <span>Swift 5.9 / SPM Test Spec Compatible</span>
        </div>
      </div>
    </div>
  );
};
