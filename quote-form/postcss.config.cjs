module.exports = {
  plugins: [
    require("@tailwindcss/postcss"),
    require("autoprefixer"),

    // keep this LAST so it prefixes the generated Tailwind CSS selectors
    require("postcss-prefix-selector")({
      prefix: "#quote-form-v2",
      exclude: ['html', 'body', /\.qf-v2-in-qr/],
      transform(prefix, selector, prefixedSelector) {
        if (selector === ":root") return prefix;
        if (selector.startsWith(":root.")) return prefix + selector.slice(":root".length);
        // Don't prefix DatePicker popup classes - they're rendered outside the container
        // These need to work globally to style the popup
        if (selector.includes('.imt-date-picker') || 
            selector.includes('.soventure-date-picker')) {
          return selector;
        }
        // Ensure all p-* classes (PrimeVue) are prefixed
        // The prefix plugin should handle this automatically, but this makes it explicit
        return prefixedSelector;
      },
    }),
  ],
};
