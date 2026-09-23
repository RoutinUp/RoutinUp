import React, { useState, useEffect } from 'react';

interface FlexibleNumericInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  placeholder?: string;
  className?: string;
  fallbackValue?: number;
  onBlurCommit?: (val: number) => void;
  id?: string;
  title?: string;
  autoSelectOnFocus?: boolean;
}

/**
 * FlexibleNumericInput
 * Input numérico con estado desacoplado que permite edición fluida:
 * - Permite dejar el campo vacío ("") mientras el usuario borra con Backspace para tipear un nuevo número.
 * - Soporta números decimales aceptando comas y puntos (ej. 22,5 o 22.5) reemplazando comas por puntos en onChange.
 * - Protegido contra re-renderizados del padre mientras el campo tiene el foco (isFocused).
 * - Validación suave con parseFloat: Aplica límites (min, max) y valor fallback ÚNICAMENTE en onBlur.
 */
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
  id,
  title,
  autoSelectOnFocus = false,
}) => {
  const [textValue, setTextValue] = useState<string>(
    value !== undefined && value !== null && !isNaN(value) ? value.toString() : ''
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const isDecimal =
    step === 'any' ||
    step === 0.5 ||
    (typeof step === 'string' && step.includes('.')) ||
    (typeof step === 'number' && step % 1 !== 0);

  // Sincronizar estado local ÚNICAMENTE cuando el input NO tiene el foco.
  useEffect(() => {
    if (!isFocused) {
      setTextValue(
        value !== undefined && value !== null && !isNaN(value) ? value.toString() : ''
      );
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reemplaza comas por puntos para aceptar tanto teclado con coma como con punto
    const raw = e.target.value.replace(',', '.');
    if (isDecimal && !/^-?[0-9]*\.?[0-9]*$/.test(raw)) return;
    setTextValue(raw);

    // Si el usuario ingresó un valor numérico real, actualizar al padre usando parseFloat
    if (raw.trim() !== '' && raw !== '-' && raw !== '.') {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (autoSelectOnFocus) {
      e.target.select();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const sanitized = textValue.replace(',', '.');
    let parsed = parseFloat(sanitized);

    // Validación suave en onBlur:
    if (isNaN(parsed) || sanitized.trim() === '') {
      parsed = fallbackValue !== undefined ? fallbackValue : (min !== undefined ? min : 0);
    }

    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;

    if (isDecimal) {
      parsed = Math.round(parsed * 100) / 100;
    }

    setTextValue(parsed.toString());
    onChange(parsed);
    onBlurCommit?.(parsed);
  };

  return (
    <input
      type={isDecimal ? 'text' : 'number'}
      inputMode={isDecimal ? 'decimal' : 'numeric'}
      id={id}
      title={title}
      value={textValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={step ?? (isDecimal ? '0.5' : 1)}
      placeholder={placeholder}
      className={className}
    />
  );
};
