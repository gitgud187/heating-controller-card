import { HeatingControllerCard } from './card';

if (customElements.get('heating-controller-card') === undefined) {
  customElements.define('heating-controller-card', HeatingControllerCard);
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === 'heating-controller-card')) {
  window.customCards.push({
    type: 'heating-controller-card',
    name: 'Heating Controller',
    description:
      'What the heating is doing and why: boiler state with its reason, load, output, rooms and problems.',
    preview: true,
  });
}
