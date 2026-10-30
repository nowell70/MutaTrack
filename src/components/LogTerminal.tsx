import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Check, Download, ArrowDown } from 'lucide-react';

interface LogTerminalProps {
  logs: string;
  onDownloadLog?: () => void;
  title?: string;
  isStreaming?: boolean;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({
  logs,
  onDownloadLog,
  title = 'Terminal Log Eksekusi Pipeline',
  isStreaming = false,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = logs.split('\n');

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono shadow-2xl flex flex-col h-[520px]">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-semibold">{title}</span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px] border border-emerald-800/60 animate-pulse">
              LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition ${
              autoScroll
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title="Auto-scroll log ke bawah"
          >
            <ArrowDown className="w-3 h-3" />
            <span>Auto-scroll</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[11px] border border-slate-700 transition"
            title="Salin seluruh log"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {onDownloadLog && (
            <button
              onClick={onDownloadLog}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[11px] border border-slate-700 transition"
              title="Unduh log file (.log)"
            >
              <Download className="w-3 h-3" />
              <span>Unduh .log</span>
            </button>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 overflow-y-auto text-xs text-slate-300 space-y-1 selection:bg-emerald-900 selection:text-white">
        {lines.map((line, idx) => {
          let colorClass = 'text-slate-300';
          if (line.startsWith('$ ')) {
            colorClass = 'text-emerald-400 font-semibold';
          } else if (line.startsWith('[Tahap') || line.startsWith('[MutaTrack')) {
            colorClass = 'text-cyan-400 font-bold';
          } else if (line.startsWith('[FATAL') || line.includes('gagal') || line.includes('error') || line.includes('Error')) {
            colorClass = 'text-rose-400 font-semibold';
          } else if (line.startsWith('[info]') || line.startsWith('[FastQC]') || line.startsWith('[bcftools]')) {
            colorClass = 'text-amber-300';
          } else if (line.startsWith('---')) {
            colorClass = 'text-slate-600';
          }

          return (
            <div key={idx} className={`leading-relaxed whitespace-pre-wrap break-all ${colorClass}`}>
              {line}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
