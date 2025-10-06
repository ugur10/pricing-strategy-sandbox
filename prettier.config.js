/** @type {import('prettier').Config} */
export default {
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  tabWidth: 2,
  printWidth: 100,
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
      },
    },
  ],
};
