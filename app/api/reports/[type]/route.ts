import { pool } from "../../../../lib/db";
import { generateExcel } from "@/lib/reports/excel";
import { generatePDF } from "@/lib/reports/pdf";

export async function POST(req: Request) {
  try {
    const { recordIds, type } = await req.json();

    // 🔒 Validation
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return new Response("recordIds required", { status: 400 });
    }

    if (!type || (type !== "pdf" && type !== "excel")) {
      return new Response("Invalid export type", { status: 400 });
    }

    // 📦 Fetch records (NULL-SAFE + UUID SAFE)
    const { rows } = await pool.query(
      `
      SELECT
        sr.id,
        sr.date_collected,
        sr.products_given_by,
        e.employee_id,
        e.name AS employee_name,

        COALESCE(
          ARRAY_AGG(DISTINCT s.name)
          FILTER (WHERE s.name IS NOT NULL),
          '{}'
        ) AS sites,

        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'name', p.name,
              'quantity', sp.quantity
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS products

      FROM stock_registry sr
      JOIN employees e ON e.id = sr.employee_id
      LEFT JOIN stock_sites ss ON ss.stock_id = sr.id
      LEFT JOIN sites s ON s.id = ss.site_id
      LEFT JOIN stock_products sp ON sp.stock_id = sr.id
      LEFT JOIN products p ON p.id = sp.product_id
      WHERE sr.id = ANY($1::uuid[])
      GROUP BY sr.id, e.employee_id, e.name
      ORDER BY sr.date_collected DESC
      `,
      [recordIds],
    );

    if (!rows.length) {
      return new Response("No records found", { status: 404 });
    }

    // 📄 PDF
    if (type === "pdf") {
      const buffer = await generatePDF(rows);

      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=stock-report.pdf",
        },
      });
    }

    // 📊 Excel
    if (type === "excel") {
      const buffer = await generateExcel(rows);

      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=stock-report.xlsx",
        },
      });
    }

    return new Response("Unsupported export type", { status: 400 });
  } catch (error) {
    console.error("❌ REPORT EXPORT ERROR:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
