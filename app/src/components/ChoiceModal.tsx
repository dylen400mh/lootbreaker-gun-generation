import { useCallback, useEffect, useState } from 'react';
import type { AskChoice, ChoicePrompt } from '../generation/procedure';
import './ChoiceModal.css';

interface OpenPrompt {
  prompt: ChoicePrompt<unknown>;
  resolve: (value: unknown) => void;
}

export function useChoiceModal(): { askChoice: AskChoice; modal: React.ReactNode } {
  const [open, setOpen] = useState<OpenPrompt | null>(null);

  const askChoice: AskChoice = useCallback(<T,>(prompt: ChoicePrompt<T>) => {
    return new Promise<T>((resolve) => {
      setOpen({
        prompt: prompt as ChoicePrompt<unknown>,
        resolve: resolve as (v: unknown) => void,
      });
    });
  }, []);

  const handlePick = useCallback((value: unknown) => {
    if (!open) return;
    open.resolve(value);
    setOpen(null);
  }, [open]);

  const modal = open ? (
    <ChoiceDialog prompt={open.prompt} onPick={handlePick} />
  ) : null;

  return { askChoice, modal };
}

interface DialogProps {
  prompt: ChoicePrompt<unknown>;
  onPick: (value: unknown) => void;
}

function ChoiceDialog({ prompt, onPick }: DialogProps) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="choice-modal" role="dialog" aria-modal="true" aria-labelledby="choice-title">
      <div className="choice-modal__backdrop" />
      <div className="choice-modal__sheet">
        <h2 id="choice-title" className="choice-modal__title">
          {prompt.title}
        </h2>
        {prompt.description && (
          <p className="choice-modal__desc">{prompt.description}</p>
        )}
        <div className="choice-modal__options">
          {prompt.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              className="choice-modal__option"
              onClick={() => onPick(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
