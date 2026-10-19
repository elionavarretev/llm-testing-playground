import { test, expect } from '@playwright/test';
import { askAssistant, type AssistantAnswer } from '../src/assistant';
import { evaluationSet } from '../src/evaluation-set';
import { passRates } from '../src/properties';

// A pass rate per property is more useful than a single green or red result.
const RUNS = Number(process.env.RUNS ?? 10);

for (const scenario of evaluationSet) {
  test(`${scenario.name}: pass rate per property over ${RUNS} runs`, async () => {
    const answers: AssistantAnswer[] = [];
    for (let run = 0; run < RUNS; run++) answers.push(await askAssistant(scenario.question));

    for (const { property, passed, total, rate } of passRates(answers, scenario)) {
      test.info().annotations.push({ type: property.name, description: `${passed}/${total}` });
      expect
        .soft(rate, `${property.name}: ${passed}/${total} runs passed`)
        .toBeGreaterThanOrEqual(property.requiredPassRate);
    }
  });
}
