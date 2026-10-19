# LLM Testing Playground

[![Tests](https://github.com/elionavarretev/llm-testing-playground/actions/workflows/tests.yml/badge.svg)](https://github.com/elionavarretev/llm-testing-playground/actions/workflows/tests.yml)

Practical examples of how to test features built on large language models (LLMs), where the same question can return a different answer every time.

Companion code for the article [How to Test AI That Never Answers the Same Way Twice](https://elionavarrete.com/blog/testing-non-deterministic-ai) ([Spanish version](https://elionavarrete.com/blog/es/testing-non-deterministic-ai)).

## What it shows

Instead of comparing the answer with a fixed sentence, the tests check the properties every answer must keep, and they check them on several runs of the same question.

| File | What it does |
|---|---|
| `src/evaluation-set.ts` | Versioned scenarios: refunds inside, outside and exactly at the 30-day limit, two adversarial prompts (ignoring the policy and asking for another customer data) and an out-of-scope question |
| `tests/refund-assistant.spec.ts` | Runs each scenario 5 times and checks the contract, the refund policy and that no card number is exposed |
| `tests/consistency.spec.ts` and `src/properties.ts` | Reports the pass rate of each property over N runs and enforces a required rate per property (100% for safety rules) |
| `src/assistant.ts` | Client for the assistant under test, with a local fake whose wording changes on every call |

## Setup

```bash
npm install
npx playwright test
```

Run more times per scenario:

```bash
RUNS=20 npx playwright test
```

Point it at your own assistant (POST `{ question }`, returns `{ text, policyId }`):

```bash
ASSISTANT_URL=https://your-api.example.com/assistant npx playwright test
```

## License

MIT
