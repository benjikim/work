import { event } from 'vue-gtag';

export function sendGtagEvent(
  eventName: string,
  layers: Array<string | number | boolean | null>
) {
  const params: Record<string, string> = {};

  layers.forEach((value, index) => {
    params[`hierarchical_layer_${index + 1}`] = String(value);
  });

  event(eventName, params);
}
