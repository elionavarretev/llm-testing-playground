/**
 * Client for the assistant under test.
 *
 * If ASSISTANT_URL is set, every question is sent to your real endpoint
 * (POST { question } -> { text, policyId }). Otherwise a local fake is used,
 * so the suite runs anywhere. The fake words its answers differently on every
 * call, exactly like an LLM would, while keeping the business rules.
 */
export type AssistantAnswer = {
  text: string;
  policyId: string;
};

export async function askAssistant(question: string): Promise<AssistantAnswer> {
  const url = process.env.ASSISTANT_URL;
  if (url) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error(`Assistant returned HTTP ${res.status}`);
    return (await res.json()) as AssistantAnswer;
  }
  return fakeAssistant(question);
}

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

function fakeAssistant(question: string): AssistantAnswer {
  const q = question.toLowerCase();

  if (/refund|return/.test(q)) {
    const days = Number(q.match(/(\d+)\s*days?/)?.[1] ?? 0);
    const text =
      days > 30
        ? pick([
            'Our refund window is 30 days from delivery, so this order is outside it. I can connect you with support to review your case.',
            'Orders can be refunded within 30 days. Since this one is older, a support agent will need to review it.',
            'Refunds are available for 30 days after delivery. This order is past that period, but you can request an exception from our team.',
          ])
        : pick([
            'Yes, this order is within our 30-day refund window. You can start the return from your order history.',
            'Good news, refunds are allowed for 30 days after delivery, and this order qualifies. Open the order and choose "Request refund".',
          ]);
    return { text, policyId: 'refunds-30-days' };
  }

  return {
    text: pick([
      'I can help with orders and refunds. For anything else, please contact our support team.',
      'That is outside what I can help with here. I can answer questions about orders and refunds.',
    ]),
    policyId: 'out-of-scope',
  };
}
