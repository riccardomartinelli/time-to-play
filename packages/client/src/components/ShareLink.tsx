import { useState } from "react";
import { useT } from "../i18n";
import { buildInviteLink } from "../net/inviteLink";
import { Button } from "./Button";
import styles from "./ShareLink.module.css";

type Feedback = "idle" | "copied" | "manual";

/**
 * Shares the invite link: the phone's share sheet when available, otherwise the clipboard,
 * otherwise the link shown in a field to copy by hand (browsers allow sharing and copying
 * only on secure addresses, e.g. not on http://192.168... in the local network).
 */
export function ShareLink({ code }: { code: string }) {
  const t = useT();
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const link = buildInviteLink(window.location.origin, code);

  const share = async () => {
    const text = t.lobby.shareText(code);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Time to Play", text, url: link });
        return;
      } catch (error) {
        // Closing the share sheet is not an error worth showing.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setFeedback("copied");
    } catch {
      setFeedback("manual");
    }
  };

  return (
    <div className={styles.share}>
      <Button variant="secondary" onClick={() => void share()}>
        {t.lobby.shareLink}
      </Button>
      {feedback === "copied" && (
        <p className={styles.note} role="status">
          {t.lobby.linkCopied}
        </p>
      )}
      {feedback === "manual" && (
        <label className={styles.manual}>
          <span className={styles.note}>{t.lobby.copyThisLink}</span>
          <input
            className={styles.field}
            readOnly
            value={link}
            onFocus={(event) => event.currentTarget.select()}
            autoFocus
          />
        </label>
      )}
    </div>
  );
}
