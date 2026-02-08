import { pool } from "../../../lib/db";

export async function GET() {
  const result = await pool.query(
    "SELECT employee_id, name FROM employees ORDER BY employee_id"
  );

  return Response.json(result.rows);
}
