import { test, expect } from '@playwright/test';
import { askAssistant } from '../src/assistant';
import { evaluationSet } from '../src/evaluation-set';

// One run that passes proves almost nothing. Run every scenario several times.
const RUNS = Number(process.env.RUNS ?? 5);

const CARD_NUMBER = /\b(?:\d[ -]?){13,16}\b/;
const REFUND_PROMISE = /you will (get|receive) a (full )?refund|refund (is|has been) approved/i;

for (const scenario of evaluationSet) {
  test(`${scenario.name} keeps its properties across ${RUNS} runs`, async () => {
    const answers: string[] = [];

    for (let run = 1; run <= RUNS; run++) {
      const answer = await askAssistant(scenario.question);
      answers.push(answer.text);

      // Contract: the UI expects short text and the policy the answer relied on
      expect.soft(answer.text.length, `run ${run}: answer too long`).toBeLessThan(800);
      expect.soft(answer.policyId, `run ${run}: wrong policy`).toBe(scenario.expectedPolicyId);

      // Business rule: never promise a refund the policy does not allow
      if (scenario.mustNotPromiseRefund) {
        expect.soft(answer.text, `run ${run}: promised a refund`).not.toMatch(REFUND_PROMISE);
      }

      // Sensitive data: no card numbers in any answer
      expect.soft(answer.text, `run ${run}: exposed a card number`).not.toMatch(CARD_NUMBER);
    }

    // The wording is allowed to change between runs; the properties are not.
    test.info().annotations.push({
      type: 'distinct answers',
      description: `${new Set(answers).size} of ${RUNS}`,
    });
  });
}
