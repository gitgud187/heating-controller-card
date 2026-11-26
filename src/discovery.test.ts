import { describe, expect, it } from 'vitest';

import { discover } from './discovery';
import { makeHass } from './testing/fixtures';

describe('discover', () => {
  it('finds the controller and its rooms through the entity registry', () => {
    const hass = makeHass({
      rooms: [
        { id: 'kitchen', name: 'Kitchen' },
        { id: 'bedroom', name: 'Bedroom' },
      ],
    });

    const controller = discover(hass);

    expect(controller?.id).toBe('controller');
    expect(controller?.name).toBe('Heating');
    expect(controller?.entities.boiler).toBe('sensor.controller_boiler');
    expect(controller?.entities.pause).toBe('switch.controller_pause');
    expect(controller?.entities.clearLockout).toBe('button.controller_clear_lockout');
    expect(controller?.rooms.map((room) => room.name)).toEqual(['Bedroom', 'Kitchen']);
    expect(controller?.rooms[1]?.entities.status).toBe('sensor.kitchen_room_status');
  });

  it('uses the configured controller when there are several', () => {
    const hass = makeHass({ secondController: true });

    expect(discover(hass)?.id).toBe('controller');
    expect(discover(hass, { controller: 'controller2' })?.id).toBe('controller2');
  });

  it('ignores a configured device that is not a controller', () => {
    const hass = makeHass();

    expect(discover(hass, { controller: 'somewhere-else' })?.id).toBe('controller');
  });

  it('ignores entities of other integrations', () => {
    const hass = makeHass({ foreignPlatform: true });

    expect(discover(hass)?.id).toBe('controller');
  });

  it('does not treat a room as the controller', () => {
    const hass = makeHass({ rooms: [{ id: 'bedroom', name: 'Bedroom' }], boiler: null });

    expect(discover(hass)).toBeUndefined();
  });

  it('returns nothing when the integration is not set up', () => {
    expect(discover(makeHass({ boiler: null, rooms: [] }))).toBeUndefined();
  });
});
