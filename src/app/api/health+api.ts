// Liveness check for EAS Hosting. Authenticated routes verify the Clerk session token (phase 1).
export function GET() {
  return Response.json({ ok: true });
}
