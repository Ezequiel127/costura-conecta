import { describe, expect, it } from 'vitest';
import * as vercelEntrypoint from '../src/app.js';

describe('Vercel entrypoint', () => {
  it('exports a callable default handler without initializing the app', () => {
    expect(vercelEntrypoint.default).toBeTypeOf('function');
    expect(vercelEntrypoint.createApp).toBeTypeOf('function');
  });
});
