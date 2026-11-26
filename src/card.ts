/**
 * The card: one controller, its reason, its load and output, its rooms, its problems, and the two
 * controls the integration offers.
 *
 * It renders from the entity states only. Anything the entities do not carry is left out; the card
 * never guesses and never throws because something is missing.
 */

import { css, html, LitElement, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';

import { PLATFORM } from './discovery';
import { formatMinutes, formatNumber, formatTime } from './format';
import { iconPath } from './icons';
import type { HeatingControllerCardConfig, HomeAssistant } from './types';
import { buildView } from './view';
import type { CardView, Room } from './view';

/**
 * The palette, with the Material value as a fallback.
 *
 * Home Assistant does not define every `--rgb-*` variable in every theme (grey is missing from
 * the default one), and an undefined variable in `rgba()` invalidates the whole declaration,
 * which would paint nothing at all. The fallback keeps the card drawn.
 */
const COLORS = {
  grey: ['--rgb-grey-color', '158, 158, 158'],
  orange: ['--rgb-orange-color', '255, 152, 0'],
  amber: ['--rgb-amber-color', '255, 193, 7'],
  green: ['--rgb-green-color', '76, 175, 80'],
  red: ['--rgb-red-color', '244, 67, 54'],
  blue: ['--rgb-blue-color', '33, 150, 243'],
  purple: ['--rgb-purple-color', '156, 39, 176'],
  teal: ['--rgb-teal-color', '0, 150, 136'],
  primary: ['--rgb-primary-color', '3, 169, 244'],
} as const;

type ColorName = keyof typeof COLORS;

/** A theme colour as a CSS value, with its fallback. */
const color = (name: ColorName): string => `var(${COLORS[name][0]}, ${COLORS[name][1]})`;

const ROOM_STATUS: Record<string, { icon: string; color: ColorName }> = {
  served: { icon: 'radiator', color: 'orange' },
  waiting_for_valve: { icon: 'timer-sand', color: 'amber' },
  satisfied: { icon: 'check-circle', color: 'green' },
  blocked: { icon: 'valve-closed', color: 'red' },
  window_open: { icon: 'window-open', color: 'blue' },
  thermostat_off: { icon: 'power', color: 'grey' },
  wall_invalid: { icon: 'alert-circle', color: 'red' },
  thermostat_invalid: { icon: 'alert-circle', color: 'red' },
  valve_data_missing: { icon: 'help-circle', color: 'red' },
  // The valve closed on its own near the target: the room is not a problem.
  valve_settled: { icon: 'valve-closed', color: 'grey' },
};

const BOILER_STATE: Record<string, { icon: string; color: ColorName }> = {
  on: { icon: 'radiator', color: 'orange' },
  off: { icon: 'radiator-off', color: 'grey' },
  locked_out: { icon: 'lock', color: 'red' },
  paused: { icon: 'pause', color: 'blue' },
  unavailable: { icon: 'wifi-off', color: 'grey' },
};

/** How urgent a reason reads: starts green, running orange, waiting grey, trouble red. */
const REASON_COLORS: Record<string, ColorName> = {
  start_load: 'green',
  start_starvation: 'green',
  running_load: 'orange',
  running_min_on: 'orange',
  running_excluded_hold: 'amber',
  waiting_load: 'grey',
  idle: 'grey',
  stop_load: 'grey',
  external_stop: 'grey',
  all_rooms_excluded: 'grey',
  min_off: 'amber',
  start_limit: 'amber',
  snapshot_incomplete: 'amber',
  snapshot_old: 'amber',
  no_open_valve: 'amber',
  paused: 'blue',
  lockout: 'red',
  max_run: 'red',
  no_progress: 'red',
  boiler_unavailable: 'red',
};

const icon = (name: string): TemplateResult =>
  html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d=${iconPath(name)}></path></svg>`;

const shape = (name: string, tone: ColorName, small = false): TemplateResult =>
  html`<div class="shape ${small ? 'small' : ''}" style="--c: ${color(tone)}">${icon(name)}</div>`;

export class HeatingControllerCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    config: { attribute: false },
  };

  static override styles = css`
    :host {
      display: block;
      /* The card owns its text colour: a shadow root does not inherit the page's ha-card styles. */
      color: var(--primary-text-color);
    }

    ha-card {
      padding: 12px;
      font-size: 14px;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
    }

    .content {
      container-type: inline-size;
    }

    .shape {
      flex: none;
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(var(--c), 0.16);
      color: rgb(var(--c));
    }

    .shape svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }

    .shape.small {
      width: 34px;
      height: 34px;
    }

    .shape.small svg {
      width: 18px;
      height: 18px;
    }

    .head {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .head-main {
      flex: 1 1 auto;
      min-width: 0;
    }

    .title {
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: 0.1px;
    }

    .subtitle {
      margin-top: 2px;
      font-size: 0.82rem;
      color: var(--secondary-text-color);
    }

    .head-end {
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .hero {
      display: flex;
      align-items: baseline;
      gap: 2px;
      font-variant-numeric: tabular-nums;
    }

    .hero b {
      font-size: 1.5rem;
      font-weight: 500;
      line-height: 1;
    }

    .hero small {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      background: rgba(var(--c), 0.14);
      color: rgb(var(--c));
    }

    .chip svg {
      width: 15px;
      height: 15px;
      fill: currentColor;
    }

    .reason {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(var(--c), 0.09);
      box-shadow: inset 3px 0 0 rgba(var(--c), 0.9);
    }

    .reason-text {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 0.86rem;
      line-height: 1.35;
    }

    .reason-code {
      flex: none;
      padding: 4px 6px;
      border-radius: 6px;
      background: rgba(var(--c), 0.16);
      color: rgb(var(--c));
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.6rem;
      font-weight: 500;
      line-height: 1;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .section {
      margin-top: 18px;
    }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .section-title {
      font-size: 0.66rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }

    .section-note {
      font-size: 0.72rem;
      color: var(--secondary-text-color);
    }

    .metric {
      display: flow-root;
    }

    .metric + .metric {
      margin-top: 12px;
    }

    .metric-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 7px;
    }

    .metric-label {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }

    .metric-value {
      font-size: 0.95rem;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    .metric-value small {
      margin-left: 3px;
      font-size: 0.72rem;
      font-weight: 400;
      color: var(--secondary-text-color);
    }

    .bar {
      position: relative;
      height: 10px;
      margin-bottom: 20px;
      border-radius: 5px;
      background: rgba(var(--rgb-grey-color, 158, 158, 158), 0.18);
    }

    .bar-fill {
      position: absolute;
      inset: 0 auto 0 0;
      border-radius: 5px;
      transition: width 0.35s ease;
    }

    .bar-fill.high {
      background: rgb(var(--rgb-orange-color, 255, 152, 0));
    }

    .bar-fill.low {
      background: rgb(var(--rgb-amber-color, 255, 193, 7));
    }

    .bar-fill.none {
      background: rgba(var(--rgb-grey-color, 158, 158, 158), 0.55);
    }

    .tick {
      position: absolute;
      top: -4px;
      bottom: -4px;
      width: 2px;
      border-radius: 2px;
      background: rgba(var(--rgb-grey-color, 158, 158, 158), 0.55);
    }

    .tick-label {
      position: absolute;
      top: 14px;
      font-size: 0.62rem;
      color: var(--secondary-text-color);
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }

    .output-stack {
      display: flex;
      height: 8px;
      overflow: hidden;
      border-radius: 4px;
      background: rgba(var(--rgb-grey-color, 158, 158, 158), 0.16);
    }

    .output-stack i {
      height: 100%;
    }

    .output-empty {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }

    .output-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      margin-top: 8px;
      font-size: 0.7rem;
      color: var(--secondary-text-color);
    }

    .output-legend span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .output-legend b {
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .swatch {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      background: var(--d);
    }

    .rooms {
      display: flex;
      flex-direction: column;
    }

    .room {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      padding: 6px 0;
    }

    .room + .room {
      border-top: 1px solid var(--divider-color);
    }

    .room-body {
      flex: 1 1 auto;
      min-width: 0;
    }

    .room-line {
      display: flex;
      align-items: baseline;
      gap: 8px;
      min-width: 0;
    }

    .room-name {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      font-size: 0.88rem;
      font-weight: 500;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .room-valve {
      flex: none;
      font-size: 0.8rem;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color);
    }

    .room-valve.open {
      color: rgb(var(--rgb-orange-color, 255, 152, 0));
    }

    .room-sub {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-top: 1px;
      min-width: 0;
      font-size: 0.76rem;
      color: var(--secondary-text-color);
    }

    .room-status {
      flex: none;
      color: rgb(var(--c));
    }

    .room-temps {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
    }

    .room-share {
      flex: none;
      font-size: 0.7rem;
      font-variant-numeric: tabular-nums;
    }

    .room-tag {
      flex: none;
      padding: 1px 5px;
      border-radius: 4px;
      background: rgba(var(--rgb-purple-color, 156, 39, 176), 0.14);
      color: rgb(var(--rgb-purple-color, 156, 39, 176));
      font-size: 0.62rem;
      font-weight: 500;
    }

    /* On a wide card the room rows become two columns of quiet tiles. */
    @container (min-width: 560px) {
      .rooms {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 12px;
      }

      .room {
        padding: 8px;
        border-radius: 10px;
        background: var(--secondary-background-color);
      }

      .room + .room {
        border-top: 0;
      }
    }

    .problems {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .problem {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(var(--c), 0.09);
    }

    .problem-body {
      flex: 1 1 auto;
      min-width: 0;
    }

    .problem-title {
      font-size: 0.82rem;
      font-weight: 500;
    }

    .controls {
      display: flex;
      gap: 8px;
      margin-top: 14px;
    }

    .btn {
      flex: 1 1 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 42px;
      padding: 0 12px;
      border: 0;
      border-radius: 10px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      font: 500 0.84rem/1 inherit;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .btn:hover {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    }

    .btn.is-on {
      background: rgba(var(--rgb-orange-color, 255, 152, 0), 0.18);
      color: rgb(var(--rgb-orange-color, 255, 152, 0));
    }

    .btn:disabled {
      opacity: 0.38;
      cursor: default;
      background: var(--secondary-background-color);
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--divider-color);
      font-size: 0.7rem;
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
    }

    .meta span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .meta svg {
      width: 13px;
      height: 13px;
      fill: currentColor;
      opacity: 0.85;
    }

    .empty {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 10px;
      background: var(--secondary-background-color);
    }

    .empty-title {
      font-size: 0.86rem;
      font-weight: 500;
    }

    .empty-sub {
      margin-top: 2px;
      font-size: 0.75rem;
      color: var(--secondary-text-color);
    }
  `;

  declare public hass: HomeAssistant;
  declare public config: HeatingControllerCardConfig;

  private _view?: CardView;

  public setConfig(config: HeatingControllerCardConfig): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('Invalid configuration');
    }
    if (config.controller !== undefined && typeof config.controller !== 'string') {
      throw new Error('"controller" must be a device id');
    }
    this.config = config;
  }

  /** The card finds the controller itself, so it works without configuration. */
  public static getStubConfig(): HeatingControllerCardConfig {
    return {};
  }

  public static getConfigForm(): Record<string, unknown> {
    return {
      schema: [
        {
          name: 'controller',
          selector: { device: { integration: PLATFORM } },
        },
      ],
      computeLabel: (schema: { name?: string }): string | undefined =>
        schema.name === 'controller' ? 'Controller' : undefined,
      computeHelper: (schema: { name?: string }): string | undefined =>
        schema.name === 'controller'
          ? 'Only needed when you run more than one heating controller.'
          : undefined,
    };
  }

  public getCardSize(): number {
    return 4 + (this._view?.rooms.length ?? 0);
  }

  public getGridOptions(): { columns: number; min_columns: number; min_rows: number } {
    return { columns: 6, min_columns: 3, min_rows: 2 };
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('hass') || changed.has('config')) {
      this._view = this.hass === undefined ? undefined : buildView(this.hass, this.config ?? {});
    }
  }

  protected override render(): TemplateResult | typeof nothing {
    if (this.hass === undefined) {
      return nothing;
    }
    const view = this._view;
    if (view === undefined) {
      return html`<ha-card>
        <div class="empty">
          ${shape('alert', 'amber')}
          <div>
            <div class="empty-title">Heating Controller not found</div>
            <div class="empty-sub">
              Set the integration up, or point this card at a controller in its settings.
            </div>
          </div>
        </div>
      </ha-card>`;
    }

    return html`<ha-card>
      <div class="content">
        ${this._head(view)} ${this._reason(view)} ${this._boiler(view)} ${this._rooms(view)}
        ${this._problems(view)} ${this._controls(view)} ${this._meta(view)}
      </div>
    </ha-card>`;
  }

  private _head(view: CardView): TemplateResult {
    const boiler = view.boiler;
    const state = BOILER_STATE[boiler.state] ?? BOILER_STATE['unavailable'];
    const showOutput = boiler.heating && boiler.output !== undefined;

    return html`<div class="head">
      ${shape(state?.icon ?? 'radiator-off', state?.color ?? 'grey')}
      <div class="head-main">
        <div class="title">${view.title}</div>
        <div class="subtitle">${this._subtitle(view)}</div>
      </div>
      <div class="head-end">
        ${
          showOutput
            ? html`<span class="hero"
                ><b>${formatNumber(boiler.output, 0)}</b><small>%</small></span
              >`
            : html`<span class="chip" style="--c: ${color(state?.color ?? 'grey')}"
                >${icon(state?.icon ?? 'radiator-off')}${boiler.label}</span
              >`
        }
      </div>
    </div>`;
  }

  private _subtitle(view: CardView): string {
    const boiler = view.boiler;
    if (boiler.heating) {
      const run = formatMinutes(boiler.runMinutes);
      return run ? `${boiler.label} · ${run}` : boiler.label;
    }
    if (boiler.state === 'locked_out') {
      const time = formatTime(boiler.lockoutUntil);
      return time ? `Lockout ends ${time}` : '';
    }
    if (boiler.state === 'paused') {
      return 'Rooms keep regulating';
    }
    if (boiler.state === 'unavailable') {
      return 'No connection';
    }
    return '';
  }

  private _reason(view: CardView): TemplateResult | typeof nothing {
    const reason = view.boiler.reason;
    if (reason === undefined) {
      return nothing;
    }
    const tone = REASON_COLORS[reason.code] ?? 'grey';
    return html`<div class="reason" style="--c: ${color(tone)}">
      <div class="reason-text">${reason.message}</div>
      <span class="reason-code">${reason.code}</span>
    </div>`;
  }

  private _boiler(view: CardView): TemplateResult {
    return html`<div class="section">
      <div class="section-head"><span class="section-title">Boiler</span></div>
      ${this._load(view)} ${this._output(view)}
    </div>`;
  }

  private _load(view: CardView): TemplateResult {
    const { load, startLoad, stopLoad } = view.boiler;
    if (load === undefined) {
      return html`<div class="metric">
        <div class="metric-head"><span class="metric-label">Load</span></div>
      </div>`;
    }

    const scale = Math.max(8, Math.ceil(load * 1.1));
    const width = Math.min(100, Math.max(0, (load / scale) * 100));
    const thresholdsKnown = startLoad !== undefined || stopLoad !== undefined;
    const tone = thresholdsKnown
      ? startLoad !== undefined && load >= startLoad
        ? 'high'
        : stopLoad !== undefined && load >= stopLoad
          ? 'low'
          : 'none'
      : // Without thresholds, the boiler state is the only hint whether this load is enough.
        view.boiler.heating
        ? 'high'
        : 'none';

    const position = (value: number): number => Math.min(100, Math.max(0, (value / scale) * 100));
    const stop = stopLoad === undefined ? undefined : position(stopLoad);
    const start = startLoad === undefined ? undefined : position(startLoad);

    return html`<div class="metric">
      <div class="metric-head">
        <span class="metric-label">Load</span>
        <span class="metric-value">${formatNumber(load)}<small>m²·K</small></span>
      </div>
      <div class="bar">
        <span class="bar-fill ${tone}" style="width: ${width}%"></span>
        ${stop === undefined ? nothing : html`<span class="tick" style="left: ${stop}%"></span>`}
        ${start === undefined ? nothing : html`<span class="tick" style="left: ${start}%"></span>`}
        ${this._markLabels(stop, start, stopLoad, startLoad)}
      </div>
    </div>`;
  }

  /**
   * The threshold labels under the load bar. Two marks that sit close together would run over
   * each other, so they share one line.
   */
  private _markLabels(
    stop: number | undefined,
    start: number | undefined,
    stopLoad: number | undefined,
    startLoad: number | undefined,
  ): TemplateResult | typeof nothing {
    if (stop === undefined && start === undefined) {
      return nothing;
    }
    if (stop !== undefined && start !== undefined && start - stop < 20) {
      return html`<span class="tick-label" style="left: ${stop}%; transform: none"
        >Stop ${formatNumber(stopLoad)} · Start ${formatNumber(startLoad)}</span
      >`;
    }
    return html`${
      stop === undefined ? nothing : this._markLabel(stop, `Stop ${formatNumber(stopLoad)}`)
    }
    ${start === undefined ? nothing : this._markLabel(start, `Start ${formatNumber(startLoad)}`)}`;
  }

  private _markLabel(position: number, label: string): TemplateResult {
    const transform =
      position < 14 ? 'none' : position > 86 ? 'translateX(-100%)' : 'translateX(-50%)';
    return html`<span class="tick-label" style="left: ${position}%; transform: ${transform}"
      >${label}</span
    >`;
  }

  private _output(view: CardView): TemplateResult {
    const { output, base, proportional, integral } = view.boiler;
    if (output === undefined) {
      return html`<div class="metric">
        <div class="metric-head">
          <span class="metric-label">Output</span>
          <span class="output-empty">no demand</span>
        </div>
      </div>`;
    }

    const terms = [base, proportional, integral];
    const hasTerms = terms.every((term) => term !== undefined);
    return html`<div class="metric">
      <div class="metric-head">
        <span class="metric-label">Output</span>
        <span class="metric-value">${formatNumber(output, 0)} %</span>
      </div>
      ${
        hasTerms
          ? html`<div class="output-stack">
                <i style="flex: ${base}; background: rgb(${color('primary')})"></i>
                <i style="flex: ${proportional}; background: rgb(${color('teal')})"></i>
                <i style="flex: ${integral}; background: rgb(${color('purple')})"></i>
              </div>
              <div class="output-legend">
                <span
                  ><i class="swatch" style="--d: rgb(${color('primary')})"></i>Base
                  <b>${formatNumber(base)}</b></span
                >
                <span
                  ><i class="swatch" style="--d: rgb(${color('teal')})"></i>P
                  <b>+${formatNumber(proportional)}</b></span
                >
                <span
                  ><i class="swatch" style="--d: rgb(${color('purple')})"></i>I
                  <b>+${formatNumber(integral)}</b></span
                >
              </div>`
          : nothing
      }
    </div>`;
  }

  private _rooms(view: CardView): TemplateResult {
    return html`<div class="section">
      <div class="section-head">
        <span class="section-title">Rooms</span>
        <span class="section-note">${view.rooms.length}</span>
      </div>
      ${view.rooms.length === 0 ? this._noRooms() : html`<div class="rooms">${view.rooms.map((room) => this._room(room))}</div>`}
    </div>`;
  }

  private _noRooms(): TemplateResult {
    return html`<div class="empty">
      ${shape('radiator-off', 'grey', true)}
      <div>
        <div class="empty-title">No rooms configured</div>
        <div class="empty-sub">Add rooms in the integration.</div>
      </div>
    </div>`;
  }

  private _room(room: Room): TemplateResult {
    const status = ROOM_STATUS[room.status ?? ''] ?? {
      icon: 'help-circle',
      color: 'grey' as ColorName,
    };
    const simple = room.status === 'window_open' || room.status === 'thermostat_off';
    const temps = this._temperatures(room, simple);
    const errorK =
      !simple &&
      room.errorK !== undefined &&
      room.errorK > 0 &&
      (room.status === 'served' || room.status === 'waiting_for_valve' || room.status === 'blocked')
        ? `${formatNumber(room.errorK)} K`
        : '';
    const valve = this._valve(room);
    const details = [temps, errorK].filter((part) => part !== '').join(' · ');

    return html`<div class="room">
      ${shape(status.icon, status.color, true)}
      <div class="room-body">
        <div class="room-line">
          <span class="room-name">${room.name}</span>
          ${valve === '' ? nothing : html`<span class="room-valve ${this._valveOpen(room) ? 'open' : ''}">${valve}</span>`}
        </div>
        <div class="room-sub">
          <span class="room-status" style="--c: ${color(status.color)}">${room.label}</span>
          ${details === '' ? nothing : html`<span class="room-temps">${details}</span>`}
          ${room.overheating ? html`<span class="room-tag">Overheating</span>` : nothing}
          ${
            room.share === undefined || room.share === 0
              ? nothing
              : html`<span class="room-share">${formatNumber(room.share)} m²·K</span>`
          }
        </div>
      </div>
    </div>`;
  }

  private _temperatures(room: Room, simple: boolean): string {
    if (room.current === undefined) {
      return '';
    }
    const current = `${formatNumber(room.current)} °C`;
    if (simple || room.target === undefined) {
      return current;
    }
    return `${formatNumber(room.current)} → ${formatNumber(room.target)} °C`;
  }

  private _valveOpen(room: Room): boolean {
    return room.valvePosition !== undefined ? room.valvePosition > 0 : room.valveOpen;
  }

  private _valve(room: Room): string {
    if (room.valvePosition !== undefined) {
      return `${Math.round(room.valvePosition)} %`;
    }
    if (!room.valveKnown) {
      return '';
    }
    return room.valveOpen ? 'Open' : 'Closed';
  }

  private _problems(view: CardView): TemplateResult | typeof nothing {
    if (view.problems.length === 0) {
      return nothing;
    }
    return html`<div class="section">
      <div class="section-head">
        <span class="section-title">Problems</span>
        <span class="section-note">${view.problems.length}</span>
      </div>
      <div class="problems">
        ${view.problems.map(
          (problem) =>
            html`<div class="problem" style="--c: ${color('red')}">
              ${shape('alert-circle', 'red', true)}
              <div class="problem-body">
                <div class="problem-title">${problem.title}</div>
              </div>
            </div>`,
        )}
      </div>
    </div>`;
  }

  private _controls(view: CardView): TemplateResult {
    const entities = view.entities;
    const paused = view.boiler.paused;
    const canClear = view.boiler.state === 'locked_out' && entities.clearLockout !== undefined;

    return html`<div class="controls">
      <button
        type="button"
        class="btn ${paused ? 'is-on' : ''}"
        ?disabled=${entities.pause === undefined}
        @click=${this._togglePause}
      >
        ${icon(paused ? 'play-circle' : 'pause')}${paused ? 'Resume' : 'Pause'}
      </button>
      <button type="button" class="btn" ?disabled=${!canClear} @click=${this._clearLockout}>
        ${icon('lock-open')}Clear lockout
      </button>
    </div>`;
  }

  private _meta(view: CardView): TemplateResult | typeof nothing {
    const { runMinutes, starts } = view.boiler;
    if (runMinutes === undefined && starts === undefined) {
      return nothing;
    }
    return html`<div class="meta">
      ${
        runMinutes === undefined
          ? nothing
          : html`<span>${icon('clock-outline')}Run time ${formatMinutes(runMinutes)}</span>`
      }
      ${starts === undefined ? nothing : html`<span>${icon('sync')}${starts} starts/h</span>`}
    </div>`;
  }

  private _togglePause = (): void => {
    const view = this._view;
    if (view?.entities.pause === undefined) {
      return;
    }
    void this.hass.callService(
      'switch',
      view.boiler.paused ? 'turn_off' : 'turn_on',
      {},
      { entity_id: view.entities.pause },
    );
  };

  private _clearLockout = (): void => {
    const view = this._view;
    if (view?.entities.clearLockout === undefined) {
      return;
    }
    void this.hass.callService('button', 'press', {}, { entity_id: view.entities.clearLockout });
  };
}

declare global {
  interface Window {
    customCards?: {
      type: string;
      name: string;
      description?: string;
      preview?: boolean;
      documentationURL?: string;
    }[];
  }
}
