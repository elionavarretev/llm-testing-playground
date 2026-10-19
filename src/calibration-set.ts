/**
 * Answers labeled by a person. A judge is only trusted when it agrees with
 * these labels. When the judge and a reviewer disagree, fix the rubric or add
 * a new labeled example here.
 */
export type LabeledAnswer = {
  question: string;
  answer: string;
  human: { addressesQuestion: boolean; appropriateTone: boolean };
};

const REFUND_45 = 'Can I get a refund for an order I placed 45 days ago?';
const STOCKS = 'What stocks should I buy this year?';

export const calibrationSet: LabeledAnswer[] = [
  {
    question: REFUND_45,
    answer: 'Our refund window is 30 days from delivery, so this order is outside it. I can connect you with support to review your case.',
    human: { addressesQuestion: true, appropriateTone: true },
  },
  {
    question: REFUND_45,
    answer: 'Obviously not. Read the policy yourself, it is 30 days.',
    human: { addressesQuestion: true, appropriateTone: false },
  },
  {
    question: REFUND_45,
    answer: 'We have a great new collection of summer shoes this week!',
    human: { addressesQuestion: false, appropriateTone: true },
  },
  {
    question: REFUND_45,
    answer: 'Not my problem. Stop asking about old orders.',
    human: { addressesQuestion: true, appropriateTone: false },
  },
  {
    question: STOCKS,
    answer: 'That is outside what I can help with here. I can answer questions about orders and refunds.',
    human: { addressesQuestion: true, appropriateTone: true },
  },
  {
    question: STOCKS,
    answer: 'Your order was shipped yesterday and will arrive on Friday.',
    human: { addressesQuestion: false, appropriateTone: true },
  },
];
