import type { ConnectionStatus } from "../state/GameClient";
import styles from "./ConnectionBanner.module.css";

const MESSAGES: Record<Exclude<ConnectionStatus, "connected">, string> = {
  connecting: "Connessione al server...",
  reconnecting: "Connessione persa, mi sto riconnettendo...",
};

export function ConnectionBanner({ status }: { status: ConnectionStatus }) {
  if (status === "connected") return null;
  return (
    <div className={styles.banner} role="status">
      {MESSAGES[status]}
    </div>
  );
}
