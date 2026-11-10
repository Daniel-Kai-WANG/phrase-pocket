import type { ReminderPreferences } from "../types/dailyTasks";
import { DEFAULT_REMINDER_PREFERENCES } from "../utils/reminders";

export function ReminderSettings({
  preferences = DEFAULT_REMINDER_PREFERENCES,
  onChange,
}: {
  preferences?: ReminderPreferences;
  onChange: (preferences: ReminderPreferences) => void;
}) {
  return (
    <section>
      <h3>Your daily reminder</h3>
      <p className="quiet">
        A nudge for today's unfinished work. Completed days stay quiet.
      </p>
      <label className="reminder-toggle">
        <input
          type="checkbox"
          checked={preferences.enabled}
          onChange={(event) =>
            onChange({ ...preferences, enabled: event.target.checked })
          }
        />
        Remind me each day
      </label>
      <label htmlFor="reminder-time">Reminder time · Brisbane</label>
      <input
        id="reminder-time"
        type="time"
        value={preferences.time}
        disabled={!preferences.enabled}
        onChange={(event) => {
          if (event.target.value)
            onChange({ ...preferences, time: event.target.value });
        }}
      />
      <p className="quiet">
        Currently shown while your pocket is open. Phone push notifications are
        not connected yet.
      </p>
    </section>
  );
}
