import UtilityHTMLRenderer from 'src/components/utility/UtilityHTMLRenderer.vue';

const defaultProps = {
  content: 'Hello!',
  tag: 'p',
};

describe('<UtilityHTMLRenderer />', () => {
  it('renders component', () => {
    cy.mount(UtilityHTMLRenderer, {
      props: defaultProps,
    });
  });

  it('renders correct text', () => {
    cy.mount(UtilityHTMLRenderer, {
      props: defaultProps,
    });
    cy.get('p').should('have.text', 'Hello!');
  });
});
