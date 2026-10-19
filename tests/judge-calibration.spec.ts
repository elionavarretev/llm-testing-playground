import { test, expect } from '@playwright/test';
import { judge } from '../src/judge';
import { calibrationSet } from '../src/calibration-set';
import { askAssistant } from '../src/assistant';
import { evaluationSet } from '../src/evaluation-set';

// The judge is also non-deterministic. Trust it only if it agrees with people.
const MIN_AGREEMENT = 0.9;

test('the judge agrees with human labels before we trust it', async () => {
  let agreements = 0;
  let checks = 0;
  for (const item of calibrationSet) {
    const verdict = await judge(item.question, item.answer);
    for (const key of ['addressesQuestion', 'appropriateTone'] as const) {
      checks++;
      if (verdict[key] === item.human[key]) agreements++;
      else test.info().annotations.push({ type: 'disagreement', description: `${key}: "${item.answer}"` });
    }
  }
  const agreement = agreements / checks;
  test.info().annotations.push({ type: 'agreement', description: `${agreements}/${checks}` });
  expect(agreement, `judge agreed on ${agreements} of ${checks} labels`).toBeGreaterThanOrEqual(MIN_AGREEMENT);
});

for (const scenario of evaluationSet) {
  test(`${scenario.name}: the judge approves tone and relevance`, async () => {
    const answer = await askAssistant(scenario.question);
    const verdict = await judge(scenario.question, answer.text);
    expect.soft(verdict.addressesQuestion, verdict.reason).toBe(true);
    expect.soft(verdict.appropriateTone, verdict.reason).toBe(true);
  });
}
