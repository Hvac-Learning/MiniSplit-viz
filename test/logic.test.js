const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SPEC, SCENARIOS, NOT_CALCULATED, evaluatePiping, getModeState } = require('../logic.js');

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} is not close to ${b}`);
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('manufacturer specification values match the documents', () => {
  assert.equal(SPEC.minSuggestedFt, 10);
  assert.equal(SPEC.maxTotalFt, 65.625);
  assert.equal(SPEC.maxVerticalFt, 49.25);
  assert.equal(SPEC.factoryChargePipingFt, 49.25);
  assert.equal(SPEC.additionalOzPerFt, 0.22);
  assert.equal(SPEC.ratedPipingFt, 25);
  assert.equal(SPEC.factoryChargeLb, 1.74);
  assert.equal(SPEC.liquidLineOdIn, 0.25);
  assert.equal(SPEC.gasLineOdIn, 0.375);
  assert.throws(() => { 'use strict'; SPEC.maxTotalFt = 99; }, TypeError);
});

test('8 ft: below suggested minimum, zero additional charge by length', () => {
  const r = evaluatePiping(8);
  assert.equal(r.status, 'below-minimum');
  assert.equal(r.valid, true);
  assert.equal(r.belowSuggestedMinimum, true);
  assert.equal(r.withinManufacturerRange, false);
  assert.equal(r.additionalChargeOz, 0);
  assert.equal(r.additionalChargeDisplay, 'None for piping length');
});

test('25 ft: compliant, zero additional charge', () => {
  const r = evaluatePiping(25);
  assert.equal(r.status, 'compliant');
  assert.equal(r.withinManufacturerRange, true);
  assert.equal(r.additionalChargeOz, 0);
});

test('10 ft is the first compliant length', () => {
  assert.equal(evaluatePiping(10).status, 'compliant');
  assert.equal(evaluatePiping(9.99).status, 'below-minimum');
});

test('49.25 ft: still zero additional charge', () => {
  const r = evaluatePiping(49.25);
  assert.equal(r.status, 'compliant');
  assert.equal(r.additionalChargeOz, 0);
});

test('50.25 ft: 1 ft over the allowance adds 0.22 oz', () => {
  const r = evaluatePiping(50.25);
  near(r.additionalChargeOz, 0.22);
  assert.equal(r.additionalChargeDisplay, '0.22 oz');
});

test('65.625 ft: maximum boundary is still permitted', () => {
  const r = evaluatePiping(65.625);
  assert.equal(r.status, 'compliant');
  near(r.additionalChargeOz, (65.625 - 49.25) * 0.22);
  assert.equal(r.additionalChargeDisplay, '3.60 oz');
});

test('just over the maximum is rejected with no charge', () => {
  const r = evaluatePiping(65.6251);
  assert.equal(r.status, 'over-maximum');
  assert.equal(r.additionalChargeOz, null);
});

test('75 ft: noncompliant and no charge calculation', () => {
  const r = evaluatePiping(75);
  assert.equal(r.status, 'over-maximum');
  assert.equal(r.valid, true);
  assert.equal(r.overMaximum, true);
  assert.equal(r.withinManufacturerRange, false);
  assert.equal(r.additionalChargeOz, null);
  assert.equal(r.additionalChargeDisplay, NOT_CALCULATED);
});

test('numeric strings are accepted, other types are rejected', () => {
  assert.equal(evaluatePiping('25').status, 'compliant');
  assert.equal(evaluatePiping(' 50.25 ').additionalChargeDisplay, '0.22 oz');
  for (const bad of [-1, -0.001, 0, '', '   ', 'abc', '12abc', NaN, Infinity, -Infinity,
    null, undefined, true, false, [], [25], {}, () => 25, Symbol('x'), 10n]) {
    const r = evaluatePiping(bad);
    assert.equal(r.status, 'invalid', `expected invalid for ${String(typeof bad === 'symbol' ? 'symbol' : bad)}`);
    assert.equal(r.valid, false);
    assert.equal(r.additionalChargeOz, null);
    assert.equal(r.withinManufacturerRange, false);
  }
});

test('charge is never negative and never offered for invalid or overlength input', () => {
  for (let ft = 0.5; ft <= 120; ft += 0.5) {
    const r = evaluatePiping(ft);
    if (r.status === 'over-maximum') assert.equal(r.additionalChargeOz, null);
    else assert.ok(r.additionalChargeOz >= 0);
  }
});

test('scenario lengths are 8, 25 and 75 ft and map to the expected statuses', () => {
  assert.deepEqual(Object.values(SCENARIOS).map(s => s.lengthFt), [8, 25, 75]);
  assert.equal(evaluatePiping(SCENARIOS.short.lengthFt).status, 'below-minimum');
  assert.equal(evaluatePiping(SCENARIOS.good.lengthFt).status, 'compliant');
  assert.equal(evaluatePiping(SCENARIOS.long.lengthFt).status, 'over-maximum');
});

test('cooling: indoor coil evaporates, outdoor coil condenses', () => {
  const m = getModeState('cool');
  assert.equal(m.indoorCoilRole, 'evaporator');
  assert.equal(m.outdoorCoilRole, 'condenser');
  assert.equal(m.gasLineFunction, 'suction line');
  assert.equal(m.liquidLineState, 'low-pressure liquid-vapor mixture');
});

test('heating: indoor coil condenses, outdoor coil evaporates', () => {
  const m = getModeState('heat');
  assert.equal(m.indoorCoilRole, 'condenser');
  assert.equal(m.outdoorCoilRole, 'evaporator');
  assert.equal(m.gasLineFunction, 'discharge line');
  assert.equal(m.liquidLineState, 'high-pressure liquid');
});

test('compressor discharge and suction keep their identity in both modes', () => {
  const c = getModeState('cool'), h = getModeState('heat');
  for (const m of [c, h]) {
    assert.equal(m.compressorDischarge, 'high side');
    assert.equal(m.compressorSuction, 'low side');
  }
  assert.notEqual(c.reversingValve, h.reversingValve);
  assert.notEqual(c.indoorCoilRole, h.indoorCoilRole);
  assert.notEqual(c.outdoorCoilRole, h.outdoorCoilRole);
});

test('coil sides follow roles: condenser is high side, evaporator is low side', () => {
  for (const key of ['cool', 'heat']) {
    const m = getModeState(key);
    assert.equal(m.indoorCoilSide, m.indoorCoilRole === 'condenser' ? 'high' : 'low');
    assert.equal(m.outdoorCoilSide, m.outdoorCoilRole === 'condenser' ? 'high' : 'low');
  }
});

test('unknown modes return null', () => {
  for (const bad of ['', 'auto', 'toString', '__proto__', null, undefined, 5]) assert.equal(getModeState(bad), null);
});

test('index.html: button labels match the scenario lengths', () => {
  const labels = [...html.matchAll(/<button data-sc="(\w+)"[^>]*>([^<]*)<\/button>/g)];
  assert.equal(labels.length, 3);
  for (const [, key, text] of labels) {
    assert.ok(text.includes(`${SCENARIOS[key].lengthFt} ft`), `${key}: "${text}"`);
    assert.ok(text.includes(SCENARIOS[key].name), `${key}: "${text}"`);
  }
});

test('index.html: no fabricated pressure, pressure-drop or capacity numbers', () => {
  assert.doesNotMatch(html, /\d+(\.\d+)?\s*psi/i);
  assert.doesNotMatch(html, /(capacity|loss)[^<>.]{0,60}\d+(\.\d+)?\s*%/i);
  assert.doesNotMatch(html, /\b(COP|mass flow rate)\s*[:=]?\s*\d/i);
});

test('index.html: overlength warning, rated-capacity wording and the logic.js link are present', () => {
  assert.match(html, /OUTSIDE MANUFACTURER SPECIFICATIONS/);
  assert.match(html, /DO NOT INSTALL AS SHOWN/);
  assert.match(html, /Manufacturer rating, not a live value/);
  assert.match(html, /<script src="logic\.js"><\/script>/);
  assert.match(html, /Not modeled/);
});

test('index.html: calls the shared calculation instead of duplicating it', () => {
  assert.match(html, /evaluatePiping\(/);
  assert.doesNotMatch(html, /0\.22\s*\*|\*\s*0\.22/);
  assert.doesNotMatch(html, /49\.25\b[^"<]*\*/);
});
