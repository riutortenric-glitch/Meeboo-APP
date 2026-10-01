import { task } from '@trigger.dev/sdk';

// Smoke-test task to verify the Trigger.dev project wiring. Real tasks: see plan.md §2.
export const ping = task({
  id: 'ping',
  run: async (payload: { from: string }) => ({ pong: true, from: payload.from }),
});
