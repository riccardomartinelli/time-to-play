import { COUNTDOWN_MS, type LobbySnapshot } from "@ttp/shared";
import { useEffect } from "react";
import { CHALLENGES } from "../../challenges/registry";
import { ChallengeIcon } from "../../components/ChallengeIcon";
import { Pill } from "../../components/Pill";
import { Screen } from "../../components/Screen";
import { secondsLeft } from "../../format";
import { useRemaining } from "../../hooks/useRemaining";
import { sound } from "../../feedback/sound";
import { useTicks } from "../../feedback/useGameSounds";
import { useT } from "../../i18n";
import { useGameClient } from "../../state/GameClientContext";
import styles from "./Game.module.css";
import { roundLabel } from "./players";

/** Intro, countdown and play of the current round. */
export function RoundScreen({ snapshot }: { snapshot: LobbySnapshot }) {
  const client = useGameClient();
  const round = snapshot.game!.round!;
  const t = useT();
  const challenge = CHALLENGES[round.challenge];
  const texts = t.challenges[round.challenge];
  const remaining = useRemaining(snapshot.phaseEndsAt);
  const playing = round.players.includes(snapshot.you);
  // Never above 3, even for the instant before the remaining time is refreshed.
  const countdown = Math.min(secondsLeft(remaining ?? 0), COUNTDOWN_MS / 1000);

  useTicks(`countdown-${round.id}`, countdown, snapshot.phase === "countdown");
  useEffect(() => {
    // The traffic light plays its own "go" when it turns green.
    if (snapshot.phase === "playing" && round.challenge !== "traffic-light") {
      sound.playOnce(`go-${round.id}`, "go");
    }
  }, [snapshot.phase, round.id, round.challenge]);

  let content;
  if (snapshot.phase === "intro") {
    content = (
      <div className={styles.center}>
        <ChallengeIcon challenge={round.challenge} size={120} className={styles.introIcon} />
        <p className={styles.kicker}>{t.game.nextChallenge}</p>
        <h1 className={styles.title}>{texts.title}</h1>
        <p className={styles.rules}>{texts.instruction}</p>
        {!playing && <p className={styles.muted}>{t.game.watching}</p>}
        <p className={styles.startsIn}>
          {t.game.startsIn} <span className="numeric">{secondsLeft(remaining ?? 0)}</span>...
        </p>
      </div>
    );
  } else if (snapshot.phase === "countdown") {
    content = (
      <div className={styles.center}>
        <ChallengeIcon challenge={round.challenge} size={64} />
        <p className={styles.muted}>{texts.title}</p>
        <div className={`${styles.countdown} numeric`} aria-live="assertive">
          {countdown || t.game.go}
        </div>
      </div>
    );
  } else if (!playing) {
    content = (
      <div className={styles.center}>
        <h1>{texts.title}</h1>
        <p className={styles.muted}>{t.game.othersPlaying}</p>
        <p className={styles.muted}>{t.game.played(round.played.length, round.players.length)}</p>
      </div>
    );
  } else if (challenge.Play) {
    const Play = challenge.Play;
    content = (
      <Play
        key={round.id}
        snapshot={snapshot}
        round={round}
        submit={(submission) => client.submit(round.id, submission)}
      />
    );
  } else {
    content = <p className={styles.muted}>{t.game.notAvailable}</p>;
  }

  return (
    <Screen
      header={<Pill variant="secondary">{roundLabel(snapshot)}</Pill>}
      showThemeToggle={false}
    >
      {content}
    </Screen>
  );
}
