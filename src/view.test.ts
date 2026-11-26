import { describe, expect, it } from 'vitest';

import { entityId, makeHass } from './testing/fixtures';
import { buildView } from './view';

const LABELS = {
  on: 'On',
  off: 'Off',
  locked_out: 'Locked out',
  unavailable: 'Unavailable',
  served: 'Heating',
  satisfied: 'Satisfied',
  blocked: 'Blocked',
  valve_unhealthy: 'Valve misconfigured',
};

describe('buildView', () => {
  it('reads the boiler, its reason and its load thresholds', () => {
    const view = buildView(makeHass({ labels: LABELS }), {});

    expect(view?.title).toBe('Heating');
    expect(view?.boiler).toMatchObject({
      state: 'on',
      label: 'On',
      heating: true,
      paused: false,
      load: 7.2,
      startLoad: 4,
      stopLoad: 1.5,
      output: 54,
      base: 48,
      proportional: 2.8,
      integral: 3.2,
      starts: 1,
      runMinutes: 42,
    });
    expect(view?.boiler.reason).toEqual({
      code: 'running_load',
      message: 'running: load 7.2 ≥ 1.5 m²·K',
    });
  });

  it('leaves out what the entities do not provide', () => {
    const view = buildView(makeHass({ load: null, reason: null }), {});

    expect(view?.boiler.load).toBeUndefined();
    expect(view?.boiler.startLoad).toBeUndefined();
    expect(view?.boiler.reason).toBeUndefined();
  });

  it('reads a room with its temperatures, valve and share', () => {
    const hass = makeHass({
      labels: LABELS,
      rooms: [
        {
          id: 'bedroom',
          name: 'Bedroom',
          status: 'served',
          share: 4.8,
          errorK: 0.2,
          current: 20.8,
          target: 21,
          valvePosition: 62,
          valveOpen: true,
        },
      ],
    });

    const room = buildView(hass, {})?.rooms[0];

    expect(room).toMatchObject({
      name: 'Bedroom',
      status: 'served',
      label: 'Heating',
      share: 4.8,
      errorK: 0.2,
      current: 20.8,
      target: 21,
      valvePosition: 62,
      valveOpen: true,
      valveKnown: true,
      overheating: false,
      problem: false,
    });
  });

  it('marks the rooms that need a human', () => {
    const hass = makeHass({
      labels: LABELS,
      rooms: [
        { id: 'bedroom', name: 'Bedroom', status: 'blocked' },
        { id: 'kitchen', name: 'Kitchen', status: 'valve_unhealthy' },
        { id: 'living', name: 'Living', status: 'satisfied', overheating: true },
        { id: 'hall', name: 'Hall', status: 'window_open' },
      ],
    });

    const view = buildView(hass, {});

    // Rooms come back sorted by name: Bedroom, Hall, Kitchen, Living.
    expect(view?.rooms.map((room) => room.problem)).toEqual([true, false, true, false]);
    expect(view?.problems.map((problem) => problem.title)).toEqual([
      'Bedroom: Blocked',
      'Kitchen: Valve misconfigured',
      'Living: Overheating',
    ]);
  });

  it('reports an unavailable boiler as a problem', () => {
    const hass = makeHass({ boiler: 'unavailable', labels: LABELS, rooms: [] });

    expect(buildView(hass, {})?.problems).toEqual([
      { id: 'controller:boiler', title: 'Boiler unavailable' },
    ]);
  });

  it('keeps a room whose status is unavailable', () => {
    const hass = makeHass({ rooms: [{ id: 'bedroom', name: 'Bedroom', status: 'unavailable' }] });

    const room = buildView(hass, {})?.rooms[0];

    expect(room?.name).toBe('Bedroom');
    expect(room?.status).toBe('unavailable');
    expect(room?.problem).toBe(false);
  });

  it('knows when a room has no valve sensor', () => {
    const hass = makeHass({ rooms: [{ id: 'bedroom', name: 'Bedroom', status: 'served' }] });
    const valveId = entityId('bedroom', 'binary_sensor:valve_open');
    delete hass.entities[valveId];
    delete hass.states[valveId];

    expect(buildView(hass, {})?.rooms[0]?.valveKnown).toBe(false);
  });

  it('returns nothing without a controller', () => {
    expect(buildView(makeHass({ boiler: null }), {})).toBeUndefined();
  });
});
