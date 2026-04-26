---
name: gherkin-test-campaign
description: Execute functional test campaigns from Gherkin scenarios with end-user UI validation, ordered scenario-by-scenario verdicts, screenshots, PDF reporting, and Azure DevOps-ready bug reports. Use when Codex is asked to run, launch, execute, validate, or report tests from Gherkin/BDD scenarios, especially prompts mentioning scenarios, features, CONSIGNES_TESTS.md, captures d'écran, rapport PDF, bugs Azure DevOps, or functional UI test campaigns.
---

# Gherkin Test Campaign

## Core Standard

Apply this skill for test prompts that provide Gherkin scenarios or ask to execute functional tests. Treat the application as a user would: use the visible UI, avoid internal shortcuts unless they are only used to gather evidence, and keep the scenario order exactly as provided.

If the prompt references a local standards file such as `CONSIGNES_TESTS.md`, read it first and let it override this skill only when it is more specific.

## Execution Workflow

1. Identify the application name, target URL or environment, and all Gherkin features/scenarios.
2. Execute scenarios one by one, in the order supplied.
3. Do not group several scenarios into one validation.
4. After each scenario, report the result in the chat before continuing:
   - scenario name;
   - status: `Réussi` or `Échoué`;
   - test data used, with passwords and secrets masked;
   - expected result;
   - observed result;
   - screenshot path.
5. Test through the user interface. Use browser automation only to act like a user and to capture evidence.
6. Record any difference between expected and actual behavior as a failure, even if the application behavior seems coherent.

## Screenshots

Take at least one screenshot per scenario.

Use screenshots to prove the final expected state or the observed failure. If a scenario has several important states, capture each important state.

Name screenshot files explicitly with:

```text
scenario-<number>-<short-behavior>.png
```

Store screenshots in a dedicated report/evidence folder near the working project when possible, for example:

```text
rapports-tests-<application-slug>/
```

## Verdict Rules

For each scenario, determine the status strictly from the written expectations:

- `Réussi`: all expected results are observed.
- `Échoué`: at least one expected result is missing, different, incorrectly styled, or ambiguous.

When color, text, wording, visibility, redirect, or access state is part of the expected result, verify it visually or through an equivalent reliable UI signal. If a text differs by prefix, suffix, punctuation, ellipsis, or color from the scenario, mention the difference.

## Final PDF Report

At the end of the campaign, generate a complete PDF report.

The report must include:

- tested application name;
- tested URL or environment;
- execution date;
- global summary;
- number of executed scenarios;
- number of passed scenarios;
- number of failed scenarios;
- details for every scenario;
- executed Gherkin steps;
- expected result;
- observed result;
- embedded screenshots;
- bug reports when needed.

An HTML report may be generated as an intermediate artifact, but the final deliverable must include a PDF.

## Bug Reports

If a scenario fails, include a bug ready to enter in Azure DevOps.

Use this structure:

```text
Titre :
[Module] Description courte du problème

Type :
Bug

Sévérité :
Mineure / Majeure / Critique

Area Path :
Nom application > Module > Fonctionnalité

Étapes de reproduction :
1. Ouvrir l'application.
2. Exécuter l'action utilisateur.
3. Observer le résultat.

Résultat attendu :
Décrire le comportement attendu.

Résultat actuel :
Décrire le comportement constaté.

Pièce jointe :
Capture d'écran du scénario échoué.

Scénario lié :
Nom du scénario Gherkin échoué.
```

Choose severity pragmatically:

- `Mineure`: cosmetic, wording, color, or low-impact mismatch.
- `Majeure`: blocked workflow, wrong access state, incorrect functional behavior.
- `Critique`: severe data loss, security, payment, destructive, or fully blocking behavior.

## Data Handling

Mask passwords, secrets, magic words, tokens, and API keys in reports unless the user explicitly asks otherwise.

Do not mask test emails unless the user asks for masking.

Do not invent missing credentials or sensitive data. If a scenario requires credentials that were not provided, execute only the reachable steps and report the blocker.

## Suggested Artifacts

Prefer these output paths when the user has not specified names:

```text
rapports-tests-<application-slug>/scenario-01-....png
rapports-tests-<application-slug>/resultats-tests-<application-slug>.json
rapport-tests-<application-slug>.html
rapport-tests-<application-slug>.pdf
```

In the final answer, summarize:

- total scenarios;
- passed count;
- failed count;
- failed scenario names and bug titles;
- PDF path;
- evidence folder path.
