import { sound } from "../feedback/sound";
import { useT } from "../i18n";
import { useSoundEnabled } from "../feedback/useGameSounds";
import styles from "./SoundToggle.module.css";

export function SoundToggle() {
  const t = useT();
  const enabled = useSoundEnabled();
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={enabled}
      aria-label={enabled ? t.settings.soundOn : t.settings.soundOff}
      onClick={() => {
        sound.setEnabled(!enabled);
        sound.unlock();
        if (!enabled) sound.play("tick");
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {enabled ? (
          <>
            <path d="M16.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 6a8.5 8.5 0 0 1 0 12" />
          </>
        ) : (
          <path d="M17 9l5 6M22 9l-5 6" />
        )}
      </svg>
    </button>
  );
}
