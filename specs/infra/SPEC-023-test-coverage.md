# SPEC-023: Test Coverage & Quality Gates

**Criticidade**: 🟡 ALTO  
**Módulo**: `tests/`, `jest.config.js`, `.nycrc.json`  
**Linhas**: ~500 tests

---

## O que é

Cobertura mínima de testes para cada módulo. Harnesses por SPEC validam contrato. Quality gates na CI.

---

## Coverage Requirements

| Módulo | Type | Mínimo | Target |
|--------|------|--------|--------|
| Engine (core) | Unit + Integration | 85% | 95% |
| Data layer | Unit | 80% | 90% |
| UI/components | Component | 75% | 85% |
| Infra (deploy) | Integration | 60% | 80% |
| **Total** | **Blended** | **80%** | **90%** |

---

## Test Pyramid

```
       E2E (5%)
      /    \
    Integration (20%)
    /          \
  Unit (75%)
```

---

## Input

```typescript
// Run all tests
npm test

// With coverage report
npm run coverage

// Specific test file
npm test -- tests/engine/SPEC-001.test.js

// Watch mode
npm test -- --watch
```

---

## Output

```typescript
// Test run
{
  tests: {
    total: number,
    passed: number,
    failed: number,
    skipped: number
  },
  coverage: {
    statements: number (0-100),
    branches: number (0-100),
    functions: number (0-100),
    lines: number (0-100),
    byFile: [
      { file: string, statements, branches, functions, lines }
    ]
  },
  duration: number (ms)
}
```

---

## Test Structure

```
tests/
├── engine/
│   ├── SPEC-001-match-engine-simulation.test.js (8+ tests)
│   ├── SPEC-002-match-events-deck.test.js (8+ tests)
│   ├── SPEC-003-player-development.test.js (8+ tests)
│   ├── ...
│   └── integration/ (cross-spec)
│       └── tournament-flow.test.js
├── data/
│   └── SPEC-020-database-schema.test.js
├── infra/
│   ├── SPEC-021-ci-cd.test.js
│   └── SPEC-022-deploy.test.js
├── fixtures/
│   ├── teams.json (test data)
│   ├── players.json
│   └── matches.json
└── setup.js
```

---

## Harness Pattern (SPEC-XXX.test.js)

```javascript
describe('SPEC-001: Match Engine Simulation', () => {
  // 1. Setup
  beforeEach(() => {
    engine = new Engine();
    homeTeam = engine.createTeam('Home');
    awayTeam = engine.createTeam('Away');
  });

  // 2. Validations from spec
  test('Input validation: valid formations', () => {
    const result = engine.simulateMatch({
      homeTeamId: homeTeam.id,
      formation: '4-4-2'  // Valid
    });
    expect(result).toBeDefined();
  });

  test('Forbidden: invalid formation rejected', () => {
    const result = engine.simulateMatch({
      formation: '0-0-0'  // Invalid
    });
    expect(result).toBe(null);
  });

  // 3. Output contract
  test('Output: contains required fields', () => {
    const result = engine.simulateMatch(...);
    expect(result).toHaveProperty('scoreline');
    expect(result).toHaveProperty('events');
    expect(result).toHaveProperty('mvp');
    expect(result).toHaveProperty('narration');
  });
});
```

---

## Validações

- [ ] Coverage ≥ 80% total (statements)
- [ ] Cada SPEC tem ≥ 8 tests
- [ ] Unit tests isolados (mocking/fixtures)
- [ ] Integration tests com DB real
- [ ] E2E tests navegam fluxos críticos
- [ ] Harness valida Input/Output/Forbidden
- [ ] Tests determinísticos (não flaky)
- [ ] CI rejeita se coverage < 80%

---

## Forbidden

- [ ] Skip tests (`it.skip`) sem comentário
- [ ] Flaky tests (timing-dependent)
- [ ] Coverage < 80% em main branch
- [ ] Test que passa mas não valida spec
- [ ] Mocking demais (perde integração)
- [ ] Test timeout > 5s (exceto E2E)

---

## Testes

```javascript
test('Coverage report generated', () => {
  const report = fs.readFileSync('coverage/coverage-final.json');
  const data = JSON.parse(report);
  
  expect(data.total.statements.pct).toBeGreaterThanOrEqual(80);
});

test('Each SPEC file has ≥ 8 tests', async () => {
  const specTests = glob.sync('tests/engine/SPEC-*.test.js');
  
  specTests.forEach(testFile => {
    const content = fs.readFileSync(testFile, 'utf8');
    const testCount = (content.match(/test\(/g) || []).length;
    
    expect(testCount).toBeGreaterThanOrEqual(8);
  });
});

test('All tests pass', async () => {
  const result = await jest.run();
  
  expect(result.numFailedTests).toBe(0);
  expect(result.numPassedTests).toBeGreaterThan(50);
});

test('No skipped tests without reason', async () => {
  const testFiles = glob.sync('tests/**/*.test.js');
  
  testFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const skipped = content.match(/it\.skip\(([^,]+)/g) || [];
    
    skipped.forEach(skip => {
      const comment = content.substring(
        content.indexOf(skip) - 500,
        content.indexOf(skip)
      );
      expect(comment).toContain('TODO') || expect(comment).toContain('FIXME');
    });
  });
});

test('Harness validates Input/Output/Forbidden', async () => {
  const harness = require('tests/engine/SPEC-001.test.js');
  
  expect(harness).toHaveProperty('validations');
  expect(harness.validations).toContain('Input validation');
  expect(harness.validations).toContain('Output contract');
  expect(harness.validations).toContain('Forbidden cases');
});
```

---

## Jest Configuration

```json
{
  "testEnvironment": "node",
  "collectCoverageFrom": [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/index.js"
  ],
  "coverageThreshold": {
    "global": {
      "statements": 80,
      "branches": 75,
      "functions": 80,
      "lines": 80
    }
  },
  "testMatch": ["**/tests/**/*.test.js"],
  "setupFiles": ["tests/setup.js"],
  "testTimeout": 5000
}
```

---

## CI Gate

```yaml
# .github/workflows/ci.yml
- name: Test coverage gate
  run: |
    npm run coverage
    if [ $(grep -oP 'statements.*?(?=%)' coverage/index.html | tail -1) -lt 80 ]; then
      echo "❌ Coverage < 80%"
      exit 1
    fi
```

---
