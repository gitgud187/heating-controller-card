# AGENTS.md

Instructions for anyone, human or agent, changing this repository. CI enforces the mechanical rules;
a change that does not pass `npm run check` is not done.

## What this is

A Lovelace card for Home Assistant, bundled to one ES module and published through the Marketplace
(HACS calls this type `plugin`). It shows what the `heating_controller` integration is doing: the
boiler state with the reason the engine decided it, the load against its thresholds, the output and
its terms, every room, the problems, and the two controls the integration offers (pause, clear
lockout).

The integration owns the decisions. This repository only reads its entities and calls two of its
services.

## Layout

```
src/
  card.ts        the element: rendering, styles, the two actions
  view.ts        hass + controller → what the card draws (pure)
  discovery.ts   entity registry → controller and rooms (pure)
  format.ts      numbers, durations, times, state labels
  icons.ts       the Material Design icon paths the card uses
  types.ts       the parts of the Home Assistant object the card uses
  testing/       the fake hass the tests build on
design/demo.html renders the built bundle against a fake hass, for looking at it
dist/            the committed bundle (built, never edited by hand)
docs/            README screenshots
```

## Rules

- **TypeScript strict, Lit.** No framework beyond Lit, no Home Assistant imports: the object the
  frontend passes is described in `types.ts`. Broaden it there, not with `any` in the card.
- **Never hard-code an entity id.** Entities are found through the entity registry
  (`hass.entities`: `platform === "heating_controller"`, `translation_key`, `device_id`), because the
  user may rename them and their ids depend on the language at creation time. The card's own config
  has no entity options.
- **Show what is there.** A missing entity, attribute or value is left out — no placeholder text, no
  defaults that pretend to be data, no guessing. The card must never throw because something is
  missing; a broken config throws in `setConfig` and Home Assistant shows that error.
- **English only.** No translation layer in the card. Enum states and names come from Home Assistant
  (`hass.formatEntityState`), the reason sentence comes from the integration.
- **Theme variables only.** Colours, fonts and surfaces come from `--rgb-*-color`, `--primary-text-
color`, `--secondary-text-color`, `--divider-color`, `--secondary-background-color` and the
  `--ha-card-*` variables, so light, dark and custom themes work without a palette of our own.
  `ha-card` is the surface; the card owns its text colour, because a shadow root does not inherit
  the page's `ha-card` styles.
- **The bundle is a deliverable.** `dist/heating-controller-card.js` is committed; the Marketplace
  installs it as it is and does not build. Build deterministically and keep it readable (no
  minification), so `git diff dist` shows what changed. CI builds and fails if `dist` differs.
- **Sizing.** `getGridOptions()` gives the sections view a sensible default; `getCardSize()` the
  masonry view.
- **Tests.** Discovery and the state mapping are pure functions with unit tests. A behaviour change
  starts with a failing test.

## House style

- English, present tense, imperative commit subjects ("Show the load thresholds").
- Small commits; `main` stays green. Releases are tags `vX.Y.Z` that equal `version` in
  `package.json`, with a GitHub release.
- `0.x` until the card is in use on a real dashboard.
- Dependencies are pinned exactly and bumped deliberately.

## Privacy

This repository is public. Never commit real entity ids, room names, host names, tokens or
screenshots of a real home. Tests, the demo and the screenshots use invented rooms and values.

## The look

It follows Mushroom's language on purpose, so it does not look foreign next to those cards: a
`ha-card` surface, a round 42 px state shape with a tinted background (`rgba(var(--rgb-*-color),
.16)`) and the icon in full colour, two text lines per row (14 px/500 and 12 px secondary), and
small uppercase section labels. The reason is the loudest element on the card, because it is the
thing people open the card for.
