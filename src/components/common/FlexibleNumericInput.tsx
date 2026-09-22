import React, { useState, useEffect } from 'react';

interface FlexibleNumericInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  fallbackValue?: number;
  onBlurCommit?: (val: number) => void;
}

export const FlexibleNumericInput: React.FC<FlexibleNumericInputProps> = ({
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
  className = '',
  fallbackValue,
  onBlurCommit,
}) => {
  const [textValue, setTextValue] = useState<string>(
    value !== undefined && value !== null ? value.toString() : ''
  );

  // Sincronizar estado local cuando el valor exterior cambia legítimamente
  useEffect(() => {
    const parsed = parseFloat(textValue);
    if (isNaN(parsed) || parsed !== value) {
      setTextValue(value !== undefined && value !== null ? value.toString() : '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextValue(raw);

    // Si es un número válido, emitir el cambio al padre en tiempo real sin bloquear el borrado
    if (raw.trim() !== '') {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    let parsed = parseFloat(textValue);
    if (isNaN(parsed) || textValue.trim() === '') {
      parsed = fallbackValue ?? min ?? 0;
    }

    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;

    setTextValue(parsed.toString());
    onChange(parsed);
    onBlurCommit?.(parsed);
  };

  return (
    <input
      type="number"
      value={textValue}
      onChange={handleChange}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className={className}
    />
  );
};
