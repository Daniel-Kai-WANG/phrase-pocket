import { Bell, RefreshCw } from "lucide-react";
import type { PhoneReminderControls } from "../types/push";

export function PhoneReminderSettings({
  phone,
}: {
  phone: PhoneReminderControls;
}) {
  return (
    <div className="phone-reminder-settings">
      <p className="quiet">
        Phone notifications work when your pocket is closed. On iPhone, use the
        app added to your home screen and allow notifications.
      </p>
      <div className="button-row">
        <button
          className="secondary-button"
          disabled={phone.busy}
          onClick={phone.connected ? phone.test : phone.enable}
        >
          <Bell size={17} />{" "}
          {phone.busy
            ? "Connecting…"
            : phone.connected
              ? "Send test reminder"
              : "Enable phone notifications"}
        </button>
        {phone.connected && (
          <>
            {phone.error && (
              <button
                className="text-button"
                disabled={phone.busy}
                onClick={phone.enable}
              >
                Reconnect phone notifications
              </button>
            )}
            <button
              className="text-button"
              disabled={phone.busy}
              onClick={phone.sync}
            >
              <RefreshCw size={17} /> Sync now
            </button>
            <button
              className="text-button"
              disabled={phone.busy}
              onClick={phone.disconnect}
            >
              Disconnect this phone
            </button>
          </>
        )}
      </div>
      {phone.message && (
        <p className="quiet" role="status">
          {phone.message}
        </p>
      )}
      {phone.error && (
        <p className="error-message" role="alert">
          {phone.error}
        </p>
      )}
      <p className="quiet">
        Delivery is around your chosen Brisbane time and can be delayed. Counts
        use this device’s last online sync. Open your pocket at least once every
        35 days to keep reminders connected.
      </p>
    </div>
  );
}
