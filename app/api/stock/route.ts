import { pool } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

interface SelectedProduct {
  id: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const {
      employee_id,
      dateCollected,
      productsGivenBy,
      location,
      site_ids = [],
      products = [],
    } = body;

    console.log("Incoming products payload:", products); // 👈 DEBUG

    await client.query("BEGIN");

    // 1️⃣ employee UUID
    const empRes = await client.query(
      "SELECT id FROM employees WHERE employee_id = $1",
      [employee_id]
    );

    if (empRes.rowCount === 0) {
      throw new Error("Employee not found");
    }

    const employeeUuid = empRes.rows[0].id;

    // 2️⃣ stock_registry
    const stockRes = await client.query(
      `
      INSERT INTO stock_registry (
        employee_id,
        date_collected,
        products_given_by,
        location
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [employeeUuid, dateCollected, productsGivenBy, location || null]
    );

    const stockId = stockRes.rows[0].id;

    // 3️⃣ stock_sites
    for (const siteId of site_ids) {
      await client.query(
        `INSERT INTO stock_sites (stock_id, site_id) VALUES ($1, $2)`,
        [stockId, siteId]
      );
    }

    // 4️⃣ stock_products  ✅ THIS IS THE CRITICAL FIX
    for (const p of products) {
      if (!p.id) {
        throw new Error(`Invalid product payload: ${JSON.stringify(p)}`);
      }

      await client.query(
        `
        INSERT INTO stock_products (stock_id, product_id, quantity)
        VALUES ($1, $2, $3)
        `,
        [stockId, p.id, p.quantity]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("STOCK SAVE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create stock record",
        error: String(err),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
