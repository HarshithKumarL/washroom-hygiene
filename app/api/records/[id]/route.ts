import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Record ID is required" },
      { status: 400 },
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log(`Attempting to delete record with ID: ${id}`);

    // First, delete related records from stock_sites
    const sitesResult = await client.query(
      `DELETE FROM stock_sites WHERE stock_id = $1`,
      [id],
    );
    console.log(`Deleted ${sitesResult.rowCount} rows from stock_sites`);

    // Delete related records from stock_products
    const productsResult = await client.query(
      `DELETE FROM stock_products WHERE stock_id = $1`,
      [id],
    );
    console.log(`Deleted ${productsResult.rowCount} rows from stock_products`);

    // Finally, delete the main stock_registry record
    const registryResult = await client.query(
      `DELETE FROM stock_registry WHERE id = $1 RETURNING *`,
      [id],
    );
    console.log(`Deleted ${registryResult.rowCount} rows from stock_registry`);

    if (registryResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await client.query("COMMIT");
    console.log(`Successfully deleted record ${id}`);

    return NextResponse.json(
      { message: "Record deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting record:", error);

    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to delete record",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
