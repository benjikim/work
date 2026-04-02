import { defineStore } from 'pinia';

export const useDocsStore = defineStore('docs-store', {
  state: () => {
    return {
      sections: [
        {
          title: 'Buttons',
          identifier: 'docs-buttons',
          hint: 'Usage of button component.',
          innerClasses: 'grid grid-cols-3 gap-4',
          components: [
            {
              name: 'BaseButton',
              id: 'button-one',
              title: 'Blue',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'blue',
                text: 'Solid Blue Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-two',
              title: 'Green',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'green',
                text: 'Solid Green Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-three',
              title: 'Yellow',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'yellow',
                text: 'Solid yellow Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-four',
              title: 'Grey',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'grey',
                text: 'Solid grey Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-five',
              title: 'Purple',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'purple',
                text: 'Solid Purple Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-six',
              title: 'Red',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'red',
                text: 'Solid Red Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-one',
              title: 'Outlined Blue',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: true,
                disabled: false,
                color: 'blue',
                text: 'Outlined Blue Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-two',
              title: 'Outlined Green',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: true,
                disabled: false,
                color: 'green',
                text: 'Outlined Green Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-two',
              title: 'Disabled Solid Purple',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: true,
                color: 'purple',
                text: 'Disabled Purple Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-three',
              title: 'Disabled Outlined Yellow',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: true,
                disabled: true,
                color: 'yellow',
                text: 'Disabled outlined yellow Button',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-two',
              title: 'Full Width Button',
              classes: 'col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'green',
                text: 'Full Width Button',
                size: 'full',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-two',
              title: 'Extra Large Button',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'green',
                text: 'Extra Large Button',
                size: 'xl',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-two',
              title: 'Large Button',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'green',
                text: 'Large Button',
                size: 'lg',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-two',
              title: 'Small Button',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'green',
                text: 'Small Button',
                size: 'sm',
              },
            },
            {
              name: 'BaseButton',
              id: 'button-two',
              title: 'Extra Small Button',
              classes: 'col-span-3 sm:col-span-2 md:col-span-1',
              props: {
                outlined: false,
                disabled: false,
                color: 'green',
                text: 'Extra Small Button',
                size: 'xs',
              },
            }
          ],
        },
        {
          title: 'Forms',
          identifier: 'form',
          hint: 'Base form input usage.',
          innerClasses: 'grid grid-cols-2 gap-4',
          components: [
            {
              name: 'BaseFormTextInput',
              id: 'base-text-input-one',
              title: 'Text Input',
              classes: 'col-span-1',
              props: {
                disabled: false,
                hint: 'This is form help or hint for a form input',
                id: 'form-item-text-two',
                label: 'Text input label',
                messages: [],
                model: 'fieldOne' ,
                placeholder: 'Field Placeholder',
                errors: ['This is an example error'],
                required: true,
                value: 'Default Value',
                type: 'text',
              },
            },
            {
              name: 'BaseFormTextInput',
              id: 'base-text-input-two',
              title: 'Disabled Text Input',
              classes: 'col-span-1',
              props: {
                disabled: true,
                hint: 'This is form help or hint for a form input',
                id: 'form-item-select',
                label: 'Disabled Label',
                model: 'fieldOne' ,
                placeholder: 'Disabled Field Placeholder',
                required: true,
                value: '',
                type: 'text',
              },
            },
            {
              name: 'BaseFormDropDownInput',
              id: 'base-dropdown-input',
              title: 'Select List With Options As Array',
              classes: 'col-span-1',
              messages: [],
              props: {
                disabled: true,
                hint: 'This is form help or hint for a form input',
                id: 'form-item-one',
                label: 'Select List Label',
                model: 'fieldOne' ,
                placeholder: null,
                required: true,
                type: 'text',
                value: 'Disabled',
                options: ['Option One', 'Option Two'],
              },
            },
            {
              name: 'BaseFormDropDownInput',
              id: 'base-dropdown-input',
              title: 'Select List With Options as Object',
              classes: 'col-span-1',
              messages: [],
              props: {
                disabled: true,
                hint: 'This is form help or hint for a form input',
                id: 'form-item-one',
                label: 'Select List Label',
                model: 'fieldOne' ,
                placeholder: null,
                required: true,
                type: 'text',
                value: 'Disabled',
                options: {
                  MA: 'Massachusetts',
                  RI: 'Rhode Island',
                  NH: 'New Hampshire',
                },
              },
            }
          ],
        }
      ],
      modals: {
        show: false,
        data: null,
        // Our different types of defined example modals holding props we can use to populate our modal data
        htmlModal: {
          id: 'html-modal',
          header: 'Plan cost change',
          body: {
            type: 'html', // text, list,,
            content: '<div class="docs__modal-body"><h2>Hello</h2><p>This is some test text</p></div>',
          },
          actionButton: true,
          buttonActionText: 'Do not click',
          width: 450,
        },
        textModal: {
          id: 'text-modal',
          header: 'Text Modal Test',
          body: {
            type: 'text',
            content: 'This is some text',
          },
          actionButton: false,
          width: 400,
        },
        listModal: {
          id: 'list-2',
          header: 'List Modal Test',
          body: {
            type: 'list',
            content: ['List Item 1', 'List Item 2', 'List Item 3'],
          },
          actionButton: false,
          width: 500,
        },
      },
    };
  },

  getters: {
    /**
     * Get Sections
     *
     * @param {Object} state
     * @returns {Object}
     */
    getSections(state) {
      return state.sections;
    },
    getModal: (state) => (key) => {
      return state.modals[key];
    },
    getIsModalDisplayed() {
      return this.modals.show;
    },
    getModalData() {
      return this.modals.data;
    },
  },

  actions: {
    setShowModal(show) {
      this.modals.show = show;
    },
    setModalData(data) {
      this.modals.data = data;
    },
  },
});
