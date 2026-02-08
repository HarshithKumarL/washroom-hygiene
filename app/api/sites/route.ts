import { pool } from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    "SELECT id, name FROM sites ORDER BY name"
  );

  return Response.json(result.rows);
}
