import { describe, expect, test } from 'bun:test';
import { createCrashReporter } from './canvasCrash.tsx';

describe('createCrashReporter', () => {
    test('reports only the first crash', () => {
        const crashes: unknown[] = [];
        const report = createCrashReporter((error) => crashes.push(error));

        report(new Error('first'));
        report(new Error('second'));

        expect(crashes).toHaveLength(1);
        expect(crashes[0]).toEqual(new Error('first'));
    });
});
