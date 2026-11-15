import type { Assessment } from "../types/learning";
import type { DailyQuestion } from "../utils/dailyQuiz";

export function DailyQuizFeedback({
  question,
  clueShown,
  referenceShown,
  extension,
  assessment,
}: {
  question: DailyQuestion;
  clueShown: boolean;
  referenceShown: boolean;
  extension: boolean;
  assessment: Assessment | null;
}) {
  const correct = assessment?.meaning === "correct";
  return (
    <>
      {clueShown && !referenceShown && (
        <div className="hint-box">{question.phrase.meaning}</div>
      )}
      {referenceShown && (
        <div className="hint-box">
          <strong>{question.phrase.expression}</strong>
          <p>{question.scenario?.sample}</p>
          <p>{question.phrase.register}</p>
          <p>{question.phrase.note}</p>
          <p className="quiet">
            One possible reply, not the only answer.{" "}
            {extension
              ? "Add your own relevant question or next step for this round. "
              : ""}
            Using this reference counts as supported practice.
          </p>
        </div>
      )}
      {assessment && (
        <div className={`feedback ${correct ? "positive" : ""}`} role="status">
          <strong>
            {correct
              ? assessment.targetUsed
                ? "Your reply fits."
                : "A natural alternative."
              : assessment.meaning === "uncertain"
                ? "This needs another look."
                : "Try adjusting your reply."}
          </strong>
          <p>{assessment.feedback}</p>
          {assessment.nextHint && <p>{assessment.nextHint}</p>}
        </div>
      )}
    </>
  );
}
