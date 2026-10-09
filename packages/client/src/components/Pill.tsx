import type { ReactNode } from "react";
import styles from "./Pill.module.css";

interface PillProps {
  variant?: "secondary" | "success" | "primary" | "neutral";
  children: ReactNode;
}

export function Pill({ variant = "neutral", children }: PillProps) {
  return <span className={`${styles.pill} ${styles[variant]}`}>{children}</span>;
}
