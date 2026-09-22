import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';

interface SkipExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  exerciseName: string;
}

export const SkipExerciseModal: React.FC<SkipExerciseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  exerciseName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¿Saltar ejercicio?">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <p className="text-sm text-gray-300">
            Vas a omitir todas las series restantes de:
          </p>
          <p className="text-lg font-black text-white mt-1">
            {exerciseName}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Este ejercicio quedará registrado en tu historial como omitido sin afectar las series previas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} size="md">
            CANCELAR
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            size="md"
          >
            SALTAR
          </Button>
        </div>
      </div>
    </Modal>
  );
};