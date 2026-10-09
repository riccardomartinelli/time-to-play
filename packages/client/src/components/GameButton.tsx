import { useEffect, useEffectEvent, useState, type PointerEvent, type ReactNode } from "react";
import { createPressTracker, eventTime } from "../input/pressTracker";
import styles from "./GameButton.module.css";

interface GameButtonProps {
  children: ReactNode;
  disabled?: boolean;
  /** Neutral leaves the screen's colors to the challenge (e.g. the traffic light). */
  variant?: "primary" | "neutral";
  /** Also react to the space bar (desktop). */
  keyboard?: boolean;
  /** `time` is the input event time, comparable with `performance.now()`. */
  onPressStart?: (time: number) => void;
  onPressEnd?: (durationMs: number, time: number) => void;
}

const SPACE = "Space";

/**
 * The big round button every challenge is played with. A press lasts from the first
 * finger down (or space bar) to its release; sliding out of the button does not end it.
 */
export function GameButton({
  children,
  disabled = false,
  variant = "primary",
  keyboard = true,
  onPressStart,
  onPressEnd,
}: GameButtonProps) {
  const [tracker] = useState(createPressTracker);
  const [pressed, setPressed] = useState(false);

  // A press in progress is dropped when the button gets disabled (e.g. the time is up).
  const [wasDisabled, setWasDisabled] = useState(disabled);
  if (wasDisabled !== disabled) {
    setWasDisabled(disabled);
    if (disabled) setPressed(false);
  }
  useEffect(() => {
    if (disabled) tracker.reset();
  }, [disabled, tracker]);

  const start = (source: string, time: number) => {
    if (disabled || !tracker.down(source, time)) return;
    setPressed(true);
    onPressStart?.(time);
  };

  const end = (source: string, time: number) => {
    const duration = tracker.up(source, time);
    if (duration === null) return;
    setPressed(false);
    onPressEnd?.(duration, time);
  };

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== SPACE) return;
    event.preventDefault();
    if (!event.repeat) start("key", eventTime(event));
  });
  const onKeyUp = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== SPACE) return;
    event.preventDefault();
    end("key", eventTime(event));
  });

  useEffect(() => {
    if (!keyboard || disabled) return;
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [keyboard, disabled]);

  const pointerSource = (event: PointerEvent) => `pointer-${event.pointerId}`;

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]}`}
      data-pressed={pressed}
      disabled={disabled}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Capture is only an improvement: without it the press still works.
        }
        start(pointerSource(event), eventTime(event));
      }}
      onPointerUp={(event) => end(pointerSource(event), eventTime(event))}
      onPointerCancel={(event) => end(pointerSource(event), eventTime(event))}
      onLostPointerCapture={(event) => end(pointerSource(event), eventTime(event))}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        // Space is handled globally; Enter would otherwise trigger a click.
        if (event.key === "Enter" || event.code === SPACE) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
