import { LOBBY_CODE_LENGTH, NICKNAME_MAX_LENGTH, normalizeNickname } from "@ttp/shared";
import { useState, type FormEvent } from "react";
import { Button } from "../components/Button";
import { CodeInput } from "../components/CodeInput";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { errorMessage } from "../errors";
import { loadNickname, saveNickname } from "../net/nickname";
import type { ClientResult } from "../state/GameClient";
import { useGameClient } from "../state/GameClientContext";
import styles from "./HomeScreen.module.css";

type Step = "start" | "create" | "join";

interface FieldErrors {
  code?: string;
  nickname?: string;
  form?: string;
}

const CODE_ERRORS = new Set(["LOBBY_NOT_FOUND", "LOBBY_FULL", "GAME_ALREADY_STARTED"]);
const NICKNAME_ERRORS = new Set(["NICKNAME_INVALID", "NICKNAME_TAKEN"]);

/** Shows each server error next to the field it is about. */
function toFieldErrors(result: ClientResult): FieldErrors {
  if (result.ok) return {};
  const message = errorMessage(result.error);
  if (CODE_ERRORS.has(result.error)) return { code: message };
  if (NICKNAME_ERRORS.has(result.error)) return { nickname: message };
  return { form: message };
}

export function HomeScreen() {
  const client = useGameClient();
  const [step, setStep] = useState<Step>("start");
  const [nickname, setNickname] = useState(loadNickname);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const goTo = (next: Step) => {
    setErrors({});
    setStep(next);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const name = normalizeNickname(nickname);
    const local: FieldErrors = {};
    if (!name) local.nickname = "Scegli un nickname.";
    if (step === "join" && code.length !== LOBBY_CODE_LENGTH)
      local.code = "Il codice ha 4 lettere.";
    if (local.nickname || local.code) return setErrors(local);

    setBusy(true);
    const result = step === "create" ? await client.create(name) : await client.join(code, name);
    setBusy(false);
    if (result.ok) saveNickname(name);
    else setErrors(toFieldErrors(result));
  };

  if (step === "start") {
    return (
      <Screen>
        <div className={styles.hero}>
          <div className={styles.clock} aria-hidden="true" />
          <h1 className={styles.title}>Time to Play</h1>
          <p className={styles.tagline}>Sfide a tempo tra amici, ognuno dal suo telefono</p>
        </div>
        <div className={styles.actions}>
          <Button block onClick={() => goTo("create")}>
            Crea partita
          </Button>
          <Button variant="secondary" block onClick={() => goTo("join")}>
            Entra con codice
          </Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <h1>{step === "create" ? "Crea partita" : "Entra in partita"}</h1>
      <form className={styles.form} onSubmit={submit} noValidate>
        {step === "join" && (
          <div>
            <div className={styles.fieldLabel}>Codice partita</div>
            <CodeInput value={code} onChange={setCode} autoFocus />
            {errors.code && (
              <p className={styles.formError} role="alert">
                {errors.code}
              </p>
            )}
          </div>
        )}
        <TextField
          label="Il tuo nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={NICKNAME_MAX_LENGTH}
          autoComplete="nickname"
          autoFocus={step === "create"}
          enterKeyHint="go"
          error={errors.nickname}
        />
        {errors.form && (
          <p className={styles.formError} role="alert">
            {errors.form}
          </p>
        )}
        <div className={styles.actions}>
          <Button type="submit" block disabled={busy}>
            {step === "create" ? "Crea" : "Entra"}
          </Button>
          <Button variant="neutral" block onClick={() => goTo("start")}>
            Indietro
          </Button>
        </div>
      </form>
    </Screen>
  );
}
