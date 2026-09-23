import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuickNumberStepperProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number | string;
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
  const isWeight = label.toLowerCase().includes('peso');
  const numericStep = typeof step === 'string' ? (parseFloat(step) || (isWeight ? 0.5 : 1)) : step;
  const effectiveStep = isWeight ? 0.5 : numericStep;

  const [localText, setLocalText] = useState<string>(
    value !== undefined && value !== null ? value.toString() : ''
  );

  useEffect(() => {
    const parsed = parseFloat(localText.replace(',', '.'));
    if (isNaN(parsed) || parsed !== value) {
      setLocalText(value !== undefined && value !== null ? value.toString() : '');
    }
  }, [value]);

  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - effectiveStep) * 10) / 10);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + effectiveStep) * 10) / 10);
    onChange(next);
  };

  const handleQuickAdd = (inc: number) => {
    const next = Math.min(max, Math.round((value + inc) * 10) / 10);
    onChange(next);
  };

  return (
    <div className="flex flex-col bg-gym-cardLighter/70 border border-gym-border/80 rounded-2xl p-2.5 sm:p-3">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
        {unit && <span className="text-[11px] font-semibold text-emerald-400">{unit}</span>}
      </div>

      {/* Input principal y botones +/- principales */}
      <div className="flex items-center justify-between gap-1.5 w-full">
        <button
          type="button"
          onClick={handleDecrement}
          className="w-10 h-10 rounded-xl bg-gym-card hover:bg-slate-700 active:scale-95 border border-gym-border flex items-center justify-center text-white transition-all select-none flex-shrink-0"
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="flex-1 min-w-0 text-center flex items-center justify-center">
          <input
            type={isWeight ? 'text' : 'number'}
            inputMode={isWeight ? 'decimal' : 'numeric'}
            step={isWeight ? '0.5' : step}
            value={localText}
            onChange={(e) => {
              const raw = e.target.value.replace(',', '.');
              if (isWeight && !/^-?[0-9]*\.?[0-9]*$/.test(raw)) return;
              setLocalText(raw);
              const val = parseFloat(raw);
              if (!isNaN(val)) {
                onChange(val);
              }
            }}
            onBlur={() => {
              const sanitized = localText.replace(',', '.');
              let parsed = parseFloat(sanitized);
              if (isNaN(parsed) || sanitized.trim() === '') {
                parsed = min;
              }
              if (parsed < min) parsed = min;
              if (parsed > max) parsed = max;
              if (isWeight) {
                parsed = Math.round(parsed * 100) / 100;
              }
              setLocalText(parsed.toString());
              onChange(parsed);
            }}
            onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
            className="w-full min-h-[40px] px-1 py-1 text-center text-lg sm:text-xl font-black bg-slate-900/90 border border-gym-border/90 focus:border-emerald-500 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 [appearance:none] [-webkit-appearance:none] overflow-visible transition-colors touch-manipulation m-0"
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              width: '100%',
              textAlign: 'center',
              padding: '0 4px',
              fontSize: '1.25rem',
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          className="w-10 h-10 rounded-xl bg-gym-card hover:bg-slate-700 active:scale-95 border border-gym-border flex items-center justify-center text-white transition-all select-none flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Atajos de incremento rápido con 1 toque */}
      {quickIncrements.length > 0 && (
        <div className="flex items-center justify-center gap-1 mt-2 pt-1.5 border-t border-gym-border/50">
          {quickIncrements.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => handleQuickAdd(inc)}
              className="flex-1 py-1 px-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] sm:text-[11px] font-bold text-gray-300 active:scale-95 transition-all text-center"
            >
              +{inc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};