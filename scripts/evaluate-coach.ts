import { mkdir, writeFile } from "node:fs/promises";
import { assessAnswer } from "../server/assessment";
import { readConfig } from "../server/config";
import { initialPhrases } from "../src/data/catalog";
import { assessmentCases } from "../tests/fixtures/assessment-cases";

const config = readConfig();
if (!config.apiKey) {
  console.error(
    "Configure OPENAI_API_KEY before running live coach evaluation.",
  );
  process.exit(1);
}

const results = [];
for (let repeat = 1; repeat <= 2; repeat++) {
  for (const item of assessmentCases) {
    const phrase = initialPhrases.find(
      (candidate) => candidate.id === item.phraseId,
    );
    if (!phrase) throw new Error(`Missing evaluation phrase: ${item.phraseId}`);
    try {
      const assessment = await assessAnswer(config, {
        phrase,
        scenario: phrase.scenarios[item.scenarioIndex].prompt,
        answer: item.answer,
        hintLevel: 0,
        attemptNumber: 1,
      });
      const passed =
        item.meanings.includes(assessment.meaning) &&
        (item.targetUsed === undefined ||
          item.targetUsed === assessment.targetUsed) &&
        assessment.feedback.trim().length > 0 &&
        !/[\u3400-\u9fff]/.test(JSON.stringify(assessment));
      results.push({ name: item.name, repeat, passed, assessment });
      console.log(`${passed ? "PASS" : "FAIL"} ${repeat}: ${item.name}`);
    } catch (error) {
      results.push({
        name: item.name,
        repeat,
        passed: false,
        error: error instanceof Error ? error.message : "Evaluation failed",
      });
      console.error(`ERROR ${repeat}: ${item.name}`);
    }
  }
}

await mkdir("data/private", { recursive: true });
await writeFile(
  "data/private/coach-evaluation.json",
  `${JSON.stringify({ checkedAt: new Date().toISOString(), model: config.textModel, results }, null, 2)}\n`,
);
console.log(
  `${results.filter((result) => result.passed).length}/${results.length} live cases passed.`,
);
if (results.some((result) => !result.passed)) process.exitCode = 1;
