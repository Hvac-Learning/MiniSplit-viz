# Mini-Split Refrigeration Cycle

An interactive, single-file HTML/SVG animation for HVAC/R apprentices. It shows a simplified conceptual heat-pump refrigeration circuit for the Daikin AURORA R-32 1-ton single-zone system (outdoor RXT12AVJU9, indoor FTXV12AVJU9) and compares three piping lengths against the manufacturer's published limits.

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
- **Pause / Play**: stops or resumes the animation (it starts paused if the system requests reduced motion).

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

## What is intentionally not modeled

Operating pressures, pressure drop, temperatures and field capacity are **not** modeled, because they depend on refrigerant state, indoor and outdoor conditions, load, compressor speed, expansion-device control and airflow. The animation shows only "high side" and "low side". The drawing is a simplified conceptual circuit and does not claim to match the unit's actual internal component arrangement.

## Disclaimer

Educational use only. This is not a substitute for the manufacturer's installation manual, service information, or required commissioning procedures.

## Run locally

Open `index.html` in a browser. No build step or dependencies.
