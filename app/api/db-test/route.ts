import { pool } from "../../../lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");
    return Response.json({
      connected: true,
      time: result.rows[0],
    });
  } catch (err: any) {
    return Response.json(
      { connected: false, error: err.message },
      { status: 500 },
    );
  }
}
