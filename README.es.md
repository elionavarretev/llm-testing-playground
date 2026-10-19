# LLM Testing Playground

[Read in English](README.md)

Ejemplos prácticos de cómo probar funcionalidades basadas en modelos de lenguaje (LLM), donde la misma pregunta puede recibir una respuesta distinta cada vez.

Es el código que acompaña al artículo [Cómo probar una IA que nunca responde igual dos veces](https://elionavarrete.com/blog/es/testing-non-deterministic-ai).

## Qué muestra

En vez de comparar la respuesta con una frase fija, las pruebas revisan las propiedades que toda respuesta debe cumplir, y lo hacen en varias ejecuciones de la misma pregunta.

- **Conjunto de evaluación** (`src/evaluation-set.ts`): escenarios versionados, incluidos casos límite e intentos de manipular al asistente.
- **Pruebas de propiedades** (`tests/refund-assistant.spec.ts`): ejecutan cada escenario varias veces y revisan el contrato, la política de reembolsos y que no aparezcan números de tarjeta.
- **Consistencia** (`tests/consistency.spec.ts` y `src/properties.ts`): reporta el porcentaje de aprobación de cada propiedad en N ejecuciones y exige un mínimo por propiedad (100% para las reglas de seguridad).
- **LLM-as-a-judge** (`tests/judge-calibration.spec.ts`, `src/judge.ts` y `src/calibration-set.ts`): un revisor evalúa el tono y si la respuesta atiende la pregunta, y antes de confiar en él se calibra contra respuestas etiquetadas por personas. Usa Claude si defines `ANTHROPIC_API_KEY` y un revisor por reglas si no.
- **Asistente de prueba** (`src/assistant.ts`): redacta distinto en cada llamada, como un LLM real. Con la variable `ASSISTANT_URL` puedes conectar tu propio asistente.

## Cómo ejecutarlo

```bash
npm install
npx playwright test
```

Más ejecuciones por escenario:

```bash
RUNS=20 npx playwright test
```

Con tu propio asistente (POST `{ question }`, que devuelva `{ text, policyId }`):

```bash
ASSISTANT_URL=https://tu-api.example.com/assistant npx playwright test
```

Con Claude como revisor (el modelo se cambia con `JUDGE_MODEL`):

```bash
ANTHROPIC_API_KEY=tu-key npx playwright test tests/judge-calibration.spec.ts
```

Las pruebas corren en GitHub Actions en cada push y en cada pull request.

## Licencia

MIT
