import { useT } from "../i18n";
import type { ConnectionStatus } from "../state/GameClient";
import styles from "./ConnectionBanner.module.css";

export function ConnectionBanner({ status }: { status: ConnectionStatus }) {
  const t = useT();
  if (status === "connected") return null;
  return (
    <div className={styles.banner} role="status">
      {t.connection[status]}
    </div>
  );
}
