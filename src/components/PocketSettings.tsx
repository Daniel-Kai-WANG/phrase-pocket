import { useState } from "react";
import type { ReactNode } from "react";
import { Download, Upload, Link } from "lucide-react";
import { Modal } from "./Modal";
import {
  downloadBackup,
  downloadRecovery,
  parseBackup,
} from "../utils/storage";
import { setCoachToken } from "../api/client";
import type { LearningStore } from "../types/storage";

export function PocketSettings({
  data,
  offlineReady,
  offlineError,
  recoveryText,
  contentSync,
  onRestore,
  onClose,
}: {
  data: LearningStore;
  offlineReady: boolean;
  offlineError: string;
  recoveryText: string | null;
  contentSync: ReactNode;
  onRestore: (data: LearningStore) => string | null | undefined;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<LearningStore | null>(null);
  return (
    <Modal title="Pocket settings" onClose={onClose}>
      <div className="settings-body">
        {contentSync}
        <section>
          <h3>Your online coach</h3>
          <p className="quiet">
            Use your private access code to connect on this device. It stays
            here for this browser session.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setCoachToken(code);
              setMessage(
                "Access code saved for this session. Your next practice reply will use it.",
              );
              setCode("");
            }}
          >
            <label htmlFor="coach-code">Coach access code</label>
            <div className="input-button-row">
              <input
                id="coach-code"
                type="password"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="off"
              />
              <button className="secondary-button" disabled={!code.trim()}>
                <Link size={17} /> Connect
              </button>
            </div>
          </form>
        </section>
        <section>
          <h3>Keep your memories</h3>
          <p className="quiet">
            Progress is saved on this device. A backup lets you move it to
            another browser or phone.
          </p>
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={() =>
                recoveryText !== null
                  ? downloadRecovery(recoveryText)
                  : downloadBackup(data)
              }
            >
              <Download size={17} />{" "}
              {recoveryText !== null ? "Export recovery file" : "Export backup"}
            </button>
            <label className="secondary-button file-button">
              <Upload size={17} /> Choose backup
              <input
                type="file"
                accept="application/json,.json"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setError("");
                  try {
                    setPending(parseBackup(await file.text()));
                  } catch (issue) {
                    setError((issue as Error).message);
                  }
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {pending && (
            <div className="notice">
              <p>
                Replace this device’s progress with{" "}
                {Object.keys(pending.progress).length} phrase records and{" "}
                {pending.stamps.length} scene stamps from this backup?
              </p>
              <div className="button-row">
                <button
                  className="primary-button"
                  onClick={() => {
                    const issue = onRestore(pending);
                    if (issue) {
                      setError(issue);
                      return;
                    }
                    setPending(null);
                    setError("");
                    setMessage("Backup restored.");
                  }}
                >
                  Restore this backup
                </button>
                <button
                  className="text-button"
                  onClick={() => setPending(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
        <section>
          <h3>A home for your pocket</h3>
          <p>
            On iPhone, open this site in Safari, tap Share, then Add to Home
            Screen.
          </p>
          <p className="quiet">
            {offlineReady
              ? "Your cards are saved for offline use on this browser."
              : "Open the published app online once to prepare offline cards."}{" "}
            Online coaching and new content need a connection.
          </p>
          {offlineError && (
            <p className="error-message" role="alert">
              {offlineError}
            </p>
          )}
        </section>
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
