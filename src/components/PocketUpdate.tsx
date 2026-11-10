export function PocketUpdate({
  busy,
  onReload,
}: {
  busy: boolean;
  onReload: () => void;
}) {
  return (
    <div className="notice" role="status">
      <p>A fresh pocket is ready. Your saved progress stays with you.</p>
      {busy ? (
        <p>Finish or close your practice before updating.</p>
      ) : (
        <button className="secondary-button" onClick={onReload}>
          Update and reload
        </button>
      )}
    </div>
  );
}
