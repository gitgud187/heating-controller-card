import { afterEach, describe, expect, it, vi } from 'vitest';

import { HeatingControllerCard } from './card';
import { entityId, makeHass } from './testing/fixtures';

const TAG = 'test-heating-controller-card';

if (customElements.get(TAG) === undefined) {
  customElements.define(TAG, HeatingControllerCard);
}

function mount(spec: Parameters<typeof makeHass>[0] = {}): HeatingControllerCard {
  const card = document.createElement(TAG) as HeatingControllerCard;
  card.setConfig({});
  card.hass = makeHass({
    labels: { on: 'On', off: 'Off', served: 'Heating', satisfied: 'Satisfied' },
    rooms: [{ id: 'bedroom', name: 'Bedroom', status: 'served' }],
    ...spec,
  });
  document.body.append(card);
  return card;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('HeatingControllerCard', () => {
  it('shows the reason, the load and the rooms', async () => {
    const card = mount();
    await card.updateComplete;

    const text = card.shadowRoot?.textContent ?? '';
    expect(text).toContain('running: load 7.2 ≥ 1.5 m²·K');
    expect(text).toContain('7.2');
    expect(text).toContain('Bedroom');
    expect(text).toContain('Heating');
  });

  it('says so when the integration is not there', async () => {
    const card = mount({ boiler: null });
    await card.updateComplete;

    expect(card.shadowRoot?.textContent).toContain('Heating Controller not found');
  });

  it('pauses through the switch', async () => {
    const card = mount();
    await card.updateComplete;
    const paused = vi.fn(() => Promise.resolve(undefined));
    card.hass = { ...card.hass, callService: paused };

    const button = [...(card.shadowRoot?.querySelectorAll('button') ?? [])].find((element) =>
      element.textContent?.includes('Pause'),
    );
    button?.click();

    expect(paused).toHaveBeenCalledWith(
      'switch',
      'turn_on',
      {},
      { entity_id: entityId('controller', 'switch:pause') },
    );
  });

  it('clears a lockout only while the boiler is locked out', async () => {
    const card = mount({ boiler: 'locked_out', lockoutUntil: '2026-01-01T14:30:00+00:00' });
    await card.updateComplete;

    const clear = [...(card.shadowRoot?.querySelectorAll('button') ?? [])].find((element) =>
      element.textContent?.includes('Clear lockout'),
    );
    expect(clear?.disabled).toBe(false);

    const paused = vi.fn(() => Promise.resolve(undefined));
    card.hass = { ...card.hass, callService: paused };
    clear?.click();

    expect(paused).toHaveBeenCalledWith(
      'button',
      'press',
      {},
      { entity_id: entityId('controller', 'button:clear_lockout') },
    );
  });

  it('rejects a configuration that is not an object', () => {
    const card = document.createElement(TAG) as HeatingControllerCard;

    expect(() => card.setConfig(null as unknown as object)).toThrow();
  });
});
