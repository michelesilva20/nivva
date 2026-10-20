# Case study: keeping contributions within a goal target

## Problem and context

Two concurrent contributions can each pass a remaining-amount check and together exceed a financial goal. Nivva stores the target and contribution records separately, deriving progress from the records. Contributions do not move money between accounts. Goals belong to a user.

## Options

Possible approaches include an optimistic version check with retry, a database lock around validation/insertion, or an atomic stored aggregate. These are explanatory alternatives, not a claim that a historical design review compared all three.

## Decision and implementation

The code uses a pessimistic write lock on the user-owned goal:

1. `GoalService.contribute` starts a transaction.
2. `GoalRepository.findByIdAndUserIdForUpdate` selects the owned goal with `PESSIMISTIC_WRITE`.
3. The service sums contributions, validates a positive amount against remaining progress, and saves the contribution.
4. A competing transaction acquires the same goal lock before reading the new total.

Goal target updates use the same locking lookup. Reads use ownership-aware queries. This describes the contribution/update path, not a guarantee for every future write path.

## Validation

[`GoalConcurrencyIT`](../nivva-api/src/test/java/com/nivva/api/goal/GoalConcurrencyIT.java) starts two contributions of 15,000 cents against a 20,000-cent target. It expects one success, one semantic rejection, no unexpected exception, and a final total of 15,000 cents. Ownership, API and repository tests add coverage.

Run `./mvnw test` from `nivva-api/` with Docker available. The PostgreSQL tests use Testcontainers and are conditionally skipped without Docker. During the portfolio audit on 20 October 2026, Maven reported 83 tests, 45 skipped, zero failures/errors: 38 executed successfully. The concurrency test was skipped, so that run did **not** validate database concurrency.

A follow-up [GitHub Actions run](https://github.com/michelesilva20/nivva/actions/runs/39421116641) on the CI branch executed all 83 Java tests with zero failures, errors or skips, including the concurrency test. Its final report guard confirmed 19 suites with zero skipped tests. This is evidence for that commit and test environment; the [workflow PR](https://github.com/michelesilva20/nivva/pull/3) has since been merged into main.

## Tradeoffs and lessons

The lock serializes writes to one goal. Keep the transaction short and route future contribution paths through the same consistency boundary. A green build with skipped database tests is insufficient evidence for this invariant. No throughput benchmark or production reliability claim is made here.

## Code references

- [GoalService](../nivva-api/src/main/java/com/nivva/api/goal/GoalService.java)
- [GoalRepository](../nivva-api/src/main/java/com/nivva/api/goal/GoalRepository.java)
- [GoalRules](../nivva-api/src/main/java/com/nivva/api/goal/GoalRules.java)
- [Existing goal ADR](adr/0007-server-backed-user-owned-goals.md)
