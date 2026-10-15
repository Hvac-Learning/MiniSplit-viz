# Mini-Split Refrigeration Cycle

An interactive, single-file HTML/SVG animation of a ductless mini-split heat pump (modeled on a 1-ton R-32 inverter outdoor unit) for HVAC students.

## What it shows

- Refrigerant path: compressor, reversing valve, outdoor coil, electronic expansion valve (EEV), liquid line, indoor coil, vapor line, accumulator, and back to the compressor.
- Color-coded refrigerant states (high/low pressure, liquid/vapor).
- How lineset length affects flow, pressure drop, capacity, and extra refrigerant charge.

## Controls

- **Heating / Cooling**: flow slows to a stop and reverses, the reversing valve spool slides, and the indoor and outdoor coils swap condenser and evaporator roles.
- **Too short (8 ft) / Good (25 ft) / Long (66 ft)**: changes the lineset length. Short shows turbulent flow, a shaking compressor and a pulsing EEV. Long shows the vapor line fading as pressure drops.
- **Labels**: shows or hides component names.
- **Pause / Play**: stops or resumes the animation (it starts paused if the system requests reduced motion).

## Note on the numbers

Pressures, pressure drops, capacity percentages and the extra-charge figure are **illustrative teaching values, not manufacturer data**. Always use the manufacturer's installation manual for real charging and piping requirements.

## Run locally

Open `index.html` in a browser. No build step or dependencies.
