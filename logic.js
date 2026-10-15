/* Calculation and mode logic for MiniSplit-viz. No DOM access, so it can be unit tested with Node.
   Loaded by index.html as a plain script (window.MiniSplitLogic) and by tests via require(). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MiniSplitLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  /* ===== MANUFACTURER SPECIFICATIONS: documented values, not simulated =====
     Equipment: Daikin AURORA R-32 1-ton, outdoor RXT12AVJU9 / indoor FTXV12AVJU9.
     Source A (installation manual): Daikin Room Air Conditioner Installation Manual, R32 Split Series,
       document 3P740832-4K (file dates 2025/04/07-10). Its cover lists RXT12AVJU9. The piping diagram is
       shared by several models in the manual.
       https://www.daikinac.com/docs/default-source/fdma/im-rxp-09-12-avju9.pdf
     Source B (submittal sheet): Daikin Submittal Data Sheet FTXV12AVJU9-RXT12AVJU9, dated 10/8/2024.
       https://www.acdirect.com/media/specs/Daikin/rtx12avju9-specifications-sheet.pdf
     The manufacturer prints both imperial and metric numbers, each rounded. They are kept exactly as printed:
     e.g. 20 m is 65.617 ft, but the manual prints 65-5/8 ft (65.625 ft); 20 g/m is 0.215 oz/ft, but both
     documents print 0.22 oz/ft. Calculations use the imperial numbers. */
  const SPEC = Object.freeze({
    model: Object.freeze({ outdoor: 'RXT12AVJU9', indoor: 'FTXV12AVJU9', refrigerant: 'R-32' }),
    minSuggestedFt: 10,            // A: suggested shortest piping length (3 m), to avoid outdoor-unit noise/vibration
    maxTotalFt: 65.625,            // A: 65-5/8 ft (20 m); B rounds this to 66 ft
    maxVerticalFt: 49.25,          // A: 49-1/4 ft (15 m); B prints 49 ft
    factoryChargePipingFt: 49.25,  // A: refrigerant is added only for piping longer than 49-1/4 ft (15 m); B prints 49 ft
    additionalOzPerFt: 0.22,       // A and B: 0.22 oz/ft (20 g/m)
    ratedPipingFt: 25,             // B: rated piping length
    factoryChargeLb: 1.74,         // B: "Holding Refrigerant Charge"
    liquidLineOdIn: 0.25,          // A: 1/4 in (6.4 mm)
    gasLineOdIn: 0.375,            // A: 3/8 in (9.5 mm); B lists the same connection sizes
    ratedCoolingBtuh: 10600,       // B, rated cooling conditions below
    ratedCoolingConditions: 'indoor 80/67 \u00B0F DB/WB, outdoor 95/75 \u00B0F DB/WB',
    ratedHeatingBtuh: 13500,       // B, rated heating conditions below
    ratedHeatingConditions: 'indoor 70/60 \u00B0F DB/WB, outdoor 47/43 \u00B0F DB/WB'
  });

  /* Piping-length scenarios shown by the three buttons. */
  const SCENARIOS = Object.freeze({
    short: Object.freeze({ lengthFt: 8, name: 'Too short' }),
    good: Object.freeze({ lengthFt: 25, name: 'Good' }),
    long: Object.freeze({ lengthFt: 75, name: 'Too long' })
  });

  const NOT_CALCULATED = 'Not calculated: outside approved piping limits';

  /* Accepts finite numbers or plain numeric strings; everything else is rejected. */
  function parseLength(input) {
    if (typeof input === 'number') return input;
    if (typeof input === 'string' && input.trim() !== '') return Number(input);
    return NaN;
  }

  const formatOz = oz => oz.toFixed(2) + ' oz';

  /* Evaluates a piping length against the manufacturer limits.
     status: 'invalid' | 'below-minimum' | 'compliant' | 'over-maximum'
     additionalChargeOz is a number only when the length is valid and not over the maximum; otherwise null. */
  function evaluatePiping(input) {
    const len = parseLength(input);
    if (!Number.isFinite(len) || len <= 0) {
      return {
        status: 'invalid', valid: false, lengthFt: null, withinManufacturerRange: false,
        belowSuggestedMinimum: false, overMaximum: false,
        additionalChargeOz: null, additionalChargeDisplay: 'Invalid length',
        summary: 'Enter a piping length greater than 0 ft.'
      };
    }
    if (len > SPEC.maxTotalFt) {
      return {
        status: 'over-maximum', valid: true, lengthFt: len, withinManufacturerRange: false,
        belowSuggestedMinimum: false, overMaximum: true,
        additionalChargeOz: null, additionalChargeDisplay: NOT_CALCULATED,
        summary: 'Longer than the 65 5/8 ft maximum. Outside manufacturer specifications; adding refrigerant does not make it acceptable.'
      };
    }
    const oz = Math.max(0, len - SPEC.factoryChargePipingFt) * SPEC.additionalOzPerFt;
    const below = len < SPEC.minSuggestedFt;
    return {
      status: below ? 'below-minimum' : 'compliant', valid: true, lengthFt: len,
      withinManufacturerRange: !below, belowSuggestedMinimum: below, overMaximum: false,
      additionalChargeOz: oz,
      additionalChargeDisplay: oz === 0 ? 'None for piping length' : formatOz(oz),
      summary: below
        ? 'Shorter than the suggested 10 ft minimum.'
        : 'Within the permitted 10 ft to 65 5/8 ft range.'
    };
  }

  /* What each operating mode means for the circuit. The compressor discharge and suction never swap:
     only the coil roles, the gas-line function and the reversing-valve position change. */
  const MODE_STATES = Object.freeze({
    cool: Object.freeze({
      mode: 'cool', reversingValve: 'cooling position',
      compressorDischarge: 'high side', compressorSuction: 'low side',
      outdoorCoilRole: 'condenser', indoorCoilRole: 'evaporator',
      outdoorCoilSide: 'high', indoorCoilSide: 'low',
      gasLineFunction: 'suction line', gasLineState: 'low-pressure vapor',
      liquidLineState: 'low-pressure liquid-vapor mixture'
    }),
    heat: Object.freeze({
      mode: 'heat', reversingValve: 'heating position',
      compressorDischarge: 'high side', compressorSuction: 'low side',
      outdoorCoilRole: 'evaporator', indoorCoilRole: 'condenser',
      outdoorCoilSide: 'low', indoorCoilSide: 'high',
      gasLineFunction: 'discharge line', gasLineState: 'high-pressure vapor',
      liquidLineState: 'high-pressure liquid'
    })
  });

  function getModeState(mode) {
    return Object.prototype.hasOwnProperty.call(MODE_STATES, mode) ? MODE_STATES[mode] : null;
  }

  return { SPEC, SCENARIOS, NOT_CALCULATED, evaluatePiping, getModeState, MODE_STATES };
});
