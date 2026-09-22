import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuickNumberStepperProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number;
  min?: number;
  max?: number;
  quickIncrements?: number[];
  unit?: string;
}

export const QuickNumberStepper: React.FC<QuickNumberStepperProps> = ({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  quickIncrements = [],
  unit = '',
}) => {
  const [localText, setLocalText] = useState<string>(value !== undefined && value !== null ? value.toString() : '');

  useEffect(() => {
    const parsed = parseFloat(localText);
    if (isNaN(parsed) || parsed !== value) {
      setLocalText(value !== undefined && value !== null ? value.toString() : '');
    }
  }, [value]);
  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(next);
  };

  const handleQuickAdd = (inc: number) => {
    const next = Math.min(max, Math.round((value + inc) * 10) / 10);
    onChange(next);
  };

  return (
    <div className="flex flex-col bg-gym-cardLighter/70 border border-gym-border/80 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
        {unit && <span className="text-xs font-semibold text-emerald-400">{unit}</span>}
      </div>

      {/* Input principal y botones +/- principales */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          className="w-12 h-12 rounded-xl bg-gym-card hover:bg-slate-700 active:scale-95 border border-gym-border flex items-center justify-center text-white transition-all select-none"
        >
          <Minus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex-1 text-center">
          <input
            type="number"
            value={localText}
            onChange={(e) => {
              setLocalText(e.target.value);
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) {
                onChange(val);
              }
            }}
            onBlur={() => {
              let parsed = parseFloat(localText);
              if (isNaN(parsed) || localText.trim() === '') {
                parsed = min;
              }
              if (parsed < min) parsed = min;
              if (parsed > max) parsed = max;
              setLocalText(parsed.toString());
              onChange(parsed);
            }}
            className="w-full text-center text-2xl font-black bg-transparent text-white focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          className="w-12 h-12 rounded-xl bg-gym-card hover:bg-slate-700 active:scale-95 border border-gym-border flex items-center justify-center text-white transition-all select-none"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Atajos de incremento rápido con 1 toque */}
      {quickIncrements.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5 pt-2 border-t border-gym-border/50">
          {quickIncrements.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => handleQuickAdd(inc)}
              className="flex-1 py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-gray-300 active:scale-95 transition-all"
            >
              +{inc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};