import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DRONES, LOOP_SECONDS, PAINT_END, droneFrame, dronePathPosition, paintProgressFor, stampsFor, beamArrivalU } from '../public/reference-spray.js';

// Golden values captured by executing Tines module239964 itself, not by the port.
// This test deliberately has no runtime dependency on downloaded reference files.
const referenceFrames = [
  [1200, 340, 90, 0.2, 0, [275.99551110255675,302.58223385263443,348.19930635168953,387.04953346150444,0,0.9440558555760994,-0.06155272768301521,0.9805055992874533,-8.860659988265413,24.032340662053755]],
  [1200, 340, 90, 0.2, 1, [957.1245948282635,351.41259607365384,937.9781404811947,327.31783753350226,0,0.8997159049524657,0.09920662689344689,0.9950484610459985,7.94069088884425,27.773024012802683]],
  [1200, 340, 90, 0.5, 0, [699.7497767979024,223.00951425064636,783.592938420914,345.7736230682792,0,0.9425639277409902,3.8473413874435795e-17,0.990085270055876,2.9179145523981793,27.615456769373537]],
  [1200, 340, 90, 0.5, 1, [465.61792419597583,344.07453573783187,579.1252740045603,210.5329299844737,0,0.9769949780254352,0.09996838647868433,0.9876075067078601,-3.9767688699478123,26.919534321606687]],
  [1200, 340, 90, 0.94, 0, [593.7967500000011,246.09207000000012,756.7533555000007,216.2193282000001,0,0,-0.09475326735988517,0.9959032394935631,2.5568651210747873,28.965597454605376]],
  [1200, 340, 90, 0.94, 1, [1055.5079999999994,254.64832000000004,961.4540399999997,226.75801600000008,0,0,-0.014346790233246648,0.9910177057124943,9.337461136992461,26.374900059978668]],
  [360, 205, 35, 0.5, 0, [225.23809964947438,135.395886432908,228.180519467689,164.00004068735598,0,0.9425639277409902,3.8473413874435795e-17,0.990085270055876,1.1218204286735143,27.7465168416154]],
  [360, 205, 35, 0.5, 1, [155.42988006513144,183.36105558519893,182.24622253216742,110.43209076762103,0,0.9769949780254352,0.09996838647868433,0.9876075067078601,-3.248196697326967,27.01712858452246]]
];
const sprite = () => ({ meta: { vbW: 300, vbH: 200, nozzle: { x: .7, y: .687 }, faces: 1 }, frames: [{}] });
const sprites = { hover: sprite(), active: sprite() };

test('reference spray preserves original anchors, timing, body motion and beam intensity', () => {
  assert.equal(LOOP_SECONDS, 15);
  assert.equal(PAINT_END, 13 / 15);
  assert.equal(createHash('sha256').update(JSON.stringify(DRONES)).digest('hex'), 'bfac4eccaece0e7fa52079d0d27b4000c3fc9a7e8a84ba4836cc9b80d66c82d6');
  for (const [width, height, bleed, phase, index, expected] of referenceFrames) {
    const frame = droneFrame(DRONES[index], sprites, phase, { x: 15, y: 22, w: width - 30, h: height - 44 }, width, height, bleed);
    const actual = [frame.spot.x, frame.spot.y, frame.nozzle.x, frame.nozzle.y, frame.frame, frame.intensity, frame.swingRad, frame.scale, frame.shadow.dx, frame.shadow.dy];
    actual.forEach((value, i) => assert(Math.abs(value - expected[i]) < 1e-10, 'Reference frame remains numerically identical'));
  }
});

test('reference paint follows sampled paths and rejects positions beyond the spray radius', () => {
  const boxes = [{ x: 0, y: 0, w: 1200, h: 340 }, { x: 0, y: 0, w: 1200, h: 340 }];
  const stamps = stampsFor(DRONES, boxes);
  assert.equal(stamps.length, 202);
  for (const i of [0, 25, 50, 75, 100, 125, 150, 175, 201]) {
    const stamp = stamps[i];
    assert.equal(beamArrivalU(stamp.x, stamp.y, stamps), stamp.u);
  }
  assert.equal(beamArrivalU(-1000, -1000, stamps), Infinity);
  assert.equal(paintProgressFor(DRONES[0], 13 / 15), 1);
  assert.equal(paintProgressFor(DRONES[1], 12 / 15), 1);
});

test('reference loop returns its body and nozzle while switching to unlit hover sprites', () => {
  for (const drone of DRONES) {
    const args = [{ x: 0, y: 0, w: 1200, h: 340 }, 1200, 340, 90];
    const first = droneFrame(drone, sprites, 0, ...args);
    const last = droneFrame(drone, sprites, 1, ...args);
    assert(Math.hypot(first.nozzle.x - last.nozzle.x, first.nozzle.y - last.nozzle.y) < 1e-10);
    assert(Math.hypot(first.spot.x - last.spot.x, first.spot.y - last.spot.y) < 1e-10);
    assert.equal(last.intensity, 0);
    assert.equal(last.set, sprites.hover);
    assert.equal(dronePathPosition(drone, 1), 0);
  }
});
