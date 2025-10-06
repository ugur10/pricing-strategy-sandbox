import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';

const ignores = {
	ignores: ['.svelte-kit', 'build', 'dist', 'eslint.config.js', 'tailwind.config.cjs', 'postcss.config.cjs', 'bunfig.toml']
};

const svelteTypeScript = {
	files: ['**/*.svelte'],
	languageOptions: {
		parserOptions: {
			parser: {
				ts: tseslint.parser
			},
			projectService: true,
			tsconfigRootDir: import.meta.dirname,
			extraFileExtensions: ['.svelte']
		}
	}
};

const typeCheckedTs = tseslint.configs.recommendedTypeChecked.map((config) => ({
	...config,
	files: ['**/*.ts'],
	languageOptions: {
		...(config.languageOptions ?? {}),
		parserOptions: {
			...(config.languageOptions?.parserOptions ?? {}),
			projectService: true,
			tsconfigRootDir: import.meta.dirname
		}
	}
}));

export default [
	ignores,
	...svelte.configs['flat/recommended'],
	svelteTypeScript,
	...typeCheckedTs,
	js.configs.recommended,
	prettier,
	{
		files: ['**/*.{js,ts,svelte}'],
		rules: {
			'no-console': ['warn', { allow: ['warn', 'error'] }]
		}
	}
];
