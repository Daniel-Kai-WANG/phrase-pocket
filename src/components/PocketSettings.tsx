import { useState } from "react";
import type { ReactNode } from "react";
import { Download, Upload } from "lucide-react";
import { Modal } from "./Modal";
import {
  downloadBackup,
  downloadRecovery,
  parseBackup,
} from "../utils/storage";
import { CoachConnection } from "./CoachConnection";
import type { LearningStore } from "../types/storage";
import type { ReminderPreferences } from "../types/dailyTasks";
import { ReminderSettings } from "./ReminderSettings";
import type { PhoneReminderControls } from "../types/push";

export function PocketSettings({
  data,
  offlineReady,
  offlineError,
  recoveryText,
  contentSync,
  onRestore,
  onClose,
  onReminderChange,
  phoneReminders,
}: {
  data: LearningStore;
  offlineReady: boolean;
  offlineError: string;
  recoveryText: string | null;
  contentSync: ReactNode;
  onRestore: (data: LearningStore) => string | null | undefined;
  onClose: () => void;
  onReminderChange: (preferences: ReminderPreferences) => void;
  phoneReminders: PhoneReminderControls;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<LearningStore | null>(null);
  return (
    <Modal title="Pocket settings" onClose={onClose}>
      <div className="settings-body">
        <ReminderSettings
          preferences={data.reminderPreferences}
          onChange={onReminderChange}
          phone={phoneReminders}
        />
        <CoachConnection />
        {contentSync}
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
