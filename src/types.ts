/**
 * The parts of the Home Assistant frontend this card uses.
 *
 * The card must not import anything from Home Assistant, so the shapes are declared here.
 */

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

/** One row of `hass.entities`: the entity registry as the frontend keeps it. */
export interface EntityRegistryEntry {
  entity_id: string;
  device_id?: string;
  platform?: string;
  translation_key?: string;
  name?: string;
  hidden?: boolean;
}

/** One row of `hass.devices`. */
export interface DeviceRegistryEntry {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
  area_id?: string | null;
}

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities: Record<string, EntityRegistryEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>,
  ): Promise<unknown>;
  /** Translates an enum state through the integration's translations, when the frontend has it. */
  formatEntityState?(stateObj: HassEntity, state?: string): string;
}

export interface HeatingControllerCardConfig {
  type?: string;
  /** Device id of the controller; only needed when the house has more than one. */
  controller?: string;
}
