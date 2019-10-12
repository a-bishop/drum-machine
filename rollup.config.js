import resolve from 'rollup-plugin-node-resolve';

export default {
    input: ['src/index.js'],
    output: {
        file: 'build/index.js',
        format: 'es',
        sourcemap: true
    },
    plugins: [resolve()]
};