import { describe, it, expect, vi } from 'vitest';
// Correct path: from tests/unit/ to src/Infrastructures/http/plugins/HelloPlugin.js
import { HelloPlugin } from '../../src/Infrastructures/http/plugins/HelloPlugin.js';

describe('HelloPlugin', () => {
  it('should register GET /hello route', () => {
    const app = {
      get: vi.fn(),
    };
    HelloPlugin(app);
    expect(app.get).toHaveBeenCalledTimes(1);
    expect(app.get).toHaveBeenCalledWith('/hello', expect.any(Function));
  });

  it('should return JSON message when route handler is called', () => {
    const app = {
      get: vi.fn(),
    };
    HelloPlugin(app);
    const handler = app.get.mock.calls[0][1];
    const req = {};
    const res = {
      json: vi.fn(),
    };
    handler(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Hello, World!' });
  });
});
