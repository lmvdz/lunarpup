# R3F browser smoke checklist

Run after world, player/camera, or UI batches. Keep the game runnable with no console errors.

## Launch

- [ ] `bun run dev` loads `index.html` without build errors
- [ ] Canvas renders moon background, stars, planet, and terrain chunks
- [ ] No errors in the browser console on load

## Movement and camera (Phase 3)

- [ ] W / ▲ thrusts forward; S / ▼ brakes or reverses
- [ ] A / D (or ◀ / ▶) steer on ground and in air
- [ ] Space triggers hover burst / jump with coyote-time feel
- [ ] Shift + W boosts on ground
- [ ] Mouse drag orbits camera; wheel zooms in and out
- [ ] Speed FOV widens at high speed
- [ ] Board tilts on slopes and during turns

## Tricks and HUD

- [ ] Trick score updates after landed rotations / grabs
- [ ] Speedometer text updates while moving (not React re-renders)
- [ ] Speed lines appear at high speed; hidden when Reduced motion is on
- [ ] Minimap redraws player position while moving

## UI and settings (Phase 4)

- [ ] Settings panel toggles persist across reload (localStorage)
- [ ] Controls reference opens with `?` and from Settings
- [ ] Live tuning panel only shows when enabled in Settings
- [ ] Multiplayer panel shows connection state with live region updates
- [ ] Crash screen appears and stops the frame loop on forced runtime errors

## Multiplayer (when `?multiplayer` is in the URL)

- [ ] Chat toggles with `T`; connection errors show in the multiplayer panel
- [ ] Remote pups render with distinct colors

## Automated gate

```bash
bun run typecheck
bun test
bun run build
```
