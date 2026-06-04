import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    globalSetup: './src/__tests__/setup.ts',
    setupFiles: ['./src/__tests__/testEnv.ts'],
    globals: {
        'ts-jest': {
            tsconfig: {
                // Override module to commonjs so ts-jest can process files correctly
                module: 'commonjs',
                // Relax verbatimModuleSyntax which doesn't play well with CJS output
                verbatimModuleSyntax: false,
                // Include node types for test globals
                types: ['node', 'jest'],
            },
        },
    },
};

export default config;
