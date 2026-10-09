import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "neutral";
  block?: boolean;
}

/** Caramella button: looks like a physical key that sinks when pressed. */
export function Button({ variant = "primary", block, className, ...props }: ButtonProps) {
  const classes = [styles.button, styles[variant], block && styles.block, className];
  return <button type="button" className={classes.filter(Boolean).join(" ")} {...props} />;
}
