import { initializeDatabase } from "../../../lib/init-db";

export async function GET() {
  try {
    const result = await initializeDatabase();
    return Response.json(result);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return Response.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}
