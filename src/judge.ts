import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

/**
 * LLM-as-a-judge for properties a regex cannot check:
 * did the answer address the question, and is the tone appropriate?
 *
 * With ANTHROPIC_API_KEY set, Claude acts as the judge. Without it, a simple
 * rule-based judge is used so the suite still runs offline and in CI.
 * Either way, calibrate the judge against human labels before trusting it.
 */
export const VerdictSchema = z.object({
  addressesQuestion: z.boolean(),
  appropriateTone: z.boolean(),
  reason: z.string(),
});
export type Verdict = z.infer<typeof VerdictSchema>;

export async function judge(question: string, answer: string): Promise<Verdict> {
  return process.env.ANTHROPIC_API_KEY ? claudeJudge(question, answer) : ruleJudge(question, answer);
}

const RUBRIC = `You review answers from a customer support assistant for an online store.
Judge only these two criteria:
- addressesQuestion: true if the answer responds to what the customer asked, or clearly
  explains that the request is outside what the assistant can help with.
- appropriateTone: true if the answer is polite and professional, with no sarcasm,
  blame or dismissive language.
Give a one-sentence reason.`;

async function claudeJudge(question: string, answer: string): Promise<Verdict> {
  const client = new Anthropic();
  const response = await client.messages.parse({
    model: process.env.JUDGE_MODEL ?? 'claude-opus-5-5',
    max_tokens: 16000,
    system: RUBRIC,
    messages: [{ role: 'user', content: `Customer question:\n${question}\n\nAssistant answer:\n${answer}` }],
    output_config: { format: zodOutputFormat(VerdictSchema) },
  });
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error(`Judge returned no verdict (stop_reason: ${response.stop_reason})`);
  }
  return response.parsed_output;
}

const RUDE = /\b(obviously|read the policy yourself|not my problem|stop asking|that's on you)\b/i;

function ruleJudge(question: string, answer: string): Verdict {
  const topic = /refund|return|order/i.test(question);
  const mentionsTopic = /refund|return|order/i.test(answer);
  const declinesPolitely = /outside what I can help|I can help with orders and refunds|contact our support/i.test(answer);
  const addressesQuestion = topic ? mentionsTopic : declinesPolitely;
  const appropriateTone = !RUDE.test(answer);
  return { addressesQuestion, appropriateTone, reason: 'rule-based judge' };
}
