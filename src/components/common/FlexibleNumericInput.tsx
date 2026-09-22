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
  id?: string;
  title?: string;
  autoSelectOnFocus?: boolean;
}

/**
 * FlexibleNumericInput
 * Input numérico con estado desacoplado que permite edición fluida:
 * - Permite dejar el campo vacío ("") mientras el usuario borra con Backspace para tipear un nuevo número.
 * - Protegido contra re-renderizados del padre mientras el campo tiene el foco (isFocused).
 * - Validación suave: Aplica límites (min, max) y valor fallback ÚNICAMENTE en onBlur.
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

  // Sincronizar estado local ÚNICAMENTE cuando el input NO tiene el foco.
  // Esto evita que si el usuario borró todo (""), una re-renderización del padre fuerce el valor anterior.
  useEffect(() => {
    if (!isFocused) {
      setTextValue(
        value !== undefined && value !== null && !isNaN(value) ? value.toString() : ''
      );
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextValue(raw);

    // Si el usuario ingresó un valor numérico real, actualizar al padre
    if (raw.trim() !== '') {
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
    let parsed = parseFloat(textValue);

    // Validación suave en onBlur:
    // Si el campo quedó vacío ("") o es NaN, asignar el fallback o el mínimo permitido
    if (isNaN(parsed) || textValue.trim() === '') {
      parsed = fallbackValue !== undefined ? fallbackValue : (min !== undefined ? min : 1);
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
      id={id}
      title={title}
      value={textValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className={className}
    />
  );
};
