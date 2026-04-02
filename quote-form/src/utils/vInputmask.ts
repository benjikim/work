// src/directives/vInputmask.ts
import type { DirectiveBinding, ObjectDirective } from 'vue';
import Inputmask from 'inputmask';

type InputMaskValue = string | Inputmask.Options;

const findInput = (el: HTMLElement): HTMLInputElement | null => {
  if (el instanceof HTMLInputElement) return el;
  return el.querySelector('input');
};

const applyMask = (el: HTMLElement, value: InputMaskValue) => {
  const input = findInput(el);
  if (!input) return;

  // Remove any previous mask on this element
  Inputmask.remove(input);

  if (!value) return;

  const options: Inputmask.Options =
    typeof value === 'string' ? { mask: value } : value;

  const im = new Inputmask(options);
  im.mask(input);
};

const vInputmask: ObjectDirective<HTMLElement, InputMaskValue> = {
  mounted(el, binding: DirectiveBinding<InputMaskValue>) {
    applyMask(el, binding.value);
  },
  updated(el, binding: DirectiveBinding<InputMaskValue>) {
    if (binding.value !== binding.oldValue) {
      applyMask(el, binding.value);
    }
  },
  unmounted(el) {
    const input = findInput(el);
    if (!input) return;

    Inputmask.remove(input);
  },
};

export default vInputmask;
