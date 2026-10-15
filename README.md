# Mini-Split Refrigeration Cycle

An interactive HTML/SVG animation for HVAC/R apprentices (plain HTML, one small JavaScript file, no dependencies). It shows a simplified conceptual heat-pump refrigeration circuit for the Daikin AURORA R-32 1-ton single-zone system (outdoor RXT12AVJU9, indoor FTXV12AVJU9) and compares three piping lengths against the manufacturer's published limits.

## What it shows

- Cooling path: compressor, reversing valve, outdoor condenser, expansion device, indoor evaporator, reversing valve, compressor.
- Heating: the reversing valve flips, the indoor coil becomes the condenser and the outdoor coil the evaporator, and the gas line changes from a suction line to a discharge line.
- Color-coded refrigerant states: high-pressure vapor, high-pressure liquid, low-pressure liquid-vapor mixture, low-pressure vapor. Actual temperature, superheat and subcooling depend on operating conditions.
- Piping scenarios:
  - **Too short, 8 ft:** below Daikin's suggested 10 ft minimum (suggested to avoid outdoor-unit noise and vibration). A warning is shown; no specific failure is predicted or animated.
  - **Good, 25 ft:** Daikin's published rated piping length, within the permitted range and below the 49 1/4 ft factory-charge allowance, so no additional refrigerant is needed for piping length alone.
  - **Too long, 75 ft:** exceeds the 65 5/8 ft maximum and is labeled "OUTSIDE MANUFACTURER SPECIFICATIONS - DO NOT INSTALL AS SHOWN". Pressure drop, capacity and charge are shown as "Not calculated: outside approved piping limits".

## Controls

- **Heating / Cooling**: flow slows, reverses, and the reversing valve spool slides.
- **Too short / Good / Too long**: changes the drawn line-set length (conceptual, not to scale) and the specification status.
- **Labels**: shows or hides component names.
- **Pause animation / Resume animation**: stops or resumes the motion (it starts paused if the system requests reduced motion). Mode changes still settle while paused.

Small white arrows show the flow direction and reverse with the mode. The coil tags show each coil's current role (condenser or evaporator).

## Manufacturer specifications used

| Item | Value |
| --- | --- |
| Piping length, suggested minimum | 10 ft (3 m) |
| Piping length, maximum total | 65 5/8 ft (20 m); the submittal sheet rounds to 66 ft |
| Maximum vertical separation | 49 1/4 ft (15 m) |
| Factory-charge piping allowance | 49 1/4 ft (15 m) |
| Additional R-32 beyond the allowance | 0.22 oz/ft (20 g/m), only up to the maximum length |
| Factory charge | 1.74 lb |
| Rated piping length | 25 ft |
| Rated cooling capacity | 10,600 Btu/h (indoor 80/67 F DB/WB, outdoor 95/75 F DB/WB) |
| Rated heating capacity | 13,500 Btu/h (indoor 70/60 F DB/WB, outdoor 47/43 F DB/WB) |
| Pipe sizes | liquid 1/4 in, gas 3/8 in |

Sources:

- Daikin Room Air Conditioner Installation Manual, R32 Split Series (document 3P740832-4K, covers RXT12AVJU9 among other models): https://www.daikinac.com/docs/default-source/fdma/im-rxp-09-12-avju9.pdf
- Daikin Submittal Data Sheet, AURORA R-32 1.0-Ton Wall Mounted Unit FTXV12AVJU9-RXT12AVJU9 (dated 10/8/2024): https://www.acdirect.com/media/specs/Daikin/rtx12avju9-specifications-sheet.pdf

The manufacturer prints rounded numbers in both unit systems (for example 20 m is 65.617 ft, but the manual prints 65 5/8 ft; 20 g/m is 0.215 oz/ft, but both documents print 0.22 oz/ft). The values are kept as printed, and the calculation uses the imperial numbers. The specification data lives in one place, the `SPEC` object in `logic.js`.

## How heating and cooling change the circuit

| | Cooling | Heating |
| --- | --- | --- |
| Compressor discharge | high side | high side (unchanged) |
| Compressor suction | low side | low side (unchanged) |
| Outdoor coil | condenser | evaporator |
| Indoor coil | evaporator | condenser |
| Gas line | suction line, low-pressure vapor | discharge line, high-pressure vapor |
| Liquid line (in this drawing) | low-pressure liquid-vapor mixture | high-pressure liquid |

The reversing valve only redirects the flow. It does not expand the refrigerant; the expansion device does that.

## Line-set charge calculation

`evaluatePiping(length)` in `logic.js` is the only place the calculation lives:

1. The length must be a finite number (or numeric text) greater than 0, otherwise the result is `invalid`.
2. A length above 65.625 ft (65 5/8 ft) is `over-maximum`: no charge is calculated and no recommendation is made. Adding refrigerant does not make an overlength installation acceptable.
3. At or below 49.25 ft the additional charge for piping length is 0.
4. Between 49.25 ft and 65.625 ft the additional charge is `(length - 49.25) x 0.22 oz`, with no rounding inside the calculation (only the displayed text is rounded to 0.01 oz).
5. A length under 10 ft is flagged `below-minimum` (the charge by length is still 0).

The 1.74 lb factory charge is shown separately and is not part of this calculation. The result does not replace the manufacturer's installation and charging procedure.

## What the piping-length warnings mean

- **Below the 10 ft suggested minimum (8 ft scenario):** Daikin suggests at least 10 ft to avoid outdoor-unit noise and vibration. It is a warning, not a predicted failure.
- **Within range (25 ft scenario):** inside 10 ft to 65 5/8 ft. Not a promise of any particular performance.
- **Outside specifications (75 ft scenario):** longer than the maximum. Shown as "DO NOT INSTALL AS SHOWN" with every calculated value withheld.

## What is intentionally not modeled

Pressure, pressure drop, temperatures, superheat, subcooling, mass flow, compressor load, oil return, capacity loss, efficiency and live capacity are **not** modeled, because they depend on operating conditions and would need a real thermodynamic model. The page shows only "High side" and "Low side". The only capacity figures are Daikin's published ratings, labeled as ratings at their rated conditions. Animation speed and the drawn zig-zags are illustrative; the drawing is not to scale.

## Why the drawing is conceptual

The two Daikin documents used contain no refrigerant-circuit diagram, and the Daikin resource center could not be searched for a service manual from here. The reversing-valve ports, the number and position of expansion devices, any check valves, the accumulator and the liquid routing in heating mode are therefore **not verified** for this model. The generic reversible heat-pump circuit is drawn instead and labeled as simplified and conceptual.

## What remains unverified

- Internal refrigerant circuit of the RXT12AVJU9 / FTXV12AVJU9 (see above), including where the expansion device sits and whether an accumulator is fitted.
- The installation manual covers several models with one shared piping diagram; its limits agree with the RXT12AVJU9 submittal sheet (66 ft total, 49 ft vertical, 49 ft pre-charge, 0.22 oz/ft) but the manual does not list per-model limits separately.
- Whether newer revisions of either document exist than 3P740832-4K (2025) and the 10/8/2024 submittal sheet.

## Run locally

Open `index.html` in a browser (double-click works), or serve the folder, for example `python -m http.server 5500` and open http://localhost:5500/.

## Run the tests

Install Node.js 18 or newer, then in this folder run:

```
npm test
```

(or `node --test`). The tests in `test/logic.test.js` check the specification values, the charge calculation at 8, 25, 49.25, 50.25, 65.625 and 75 ft, invalid inputs (negative, empty, text, NaN, infinities and other types), the coil roles in each mode, and that the page contains no invented pressure or capacity numbers and its buttons match the scenario lengths. They do not click through the page. Check the buttons by hand: switch modes rapidly, pause and resume, toggle Labels, try all three lengths, and confirm the browser console shows no errors.

## Deploy to GitHub Pages

The repository publishes from the `main` branch, root folder (Settings, Pages, Deploy from a branch, `main`, `/ (root)`). Push to `main` and the site rebuilds in a minute or two; no build step or workflow is needed. Live site: https://hvac-learning.github.io/MiniSplit-viz/

## Disclaimer

Educational use only. This is not a substitute for the manufacturer's installation manual, service information, or required commissioning procedures.
