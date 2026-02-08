import { pool } from "../../../lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const employeeId = searchParams.get("employee_id");
  const fromDate = searchParams.get("from_date");
  const toDate = searchParams.get("to_date");

  let where: string[] = [];
  let values: any[] = [];

  if (employeeId) {
    values.push(employeeId);
    where.push(`e.employee_id = $${values.length}`);
  }

  if (fromDate) {
    values.push(fromDate);
    where.push(`sr.date_collected >= $${values.length}`);
  }

  if (toDate) {
    values.push(toDate);
    where.push(`sr.date_collected <= $${values.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const query = `
    SELECT
      sr.id,
      sr.date_collected,
      e.employee_id,
      e.name AS employee_name,
      sr.products_given_by,

      COALESCE(
        json_agg(DISTINCT s.name)
          FILTER (WHERE s.name IS NOT NULL),
        '[]'
      ) AS sites,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'name', p.name,
            'quantity', sp.quantity
          )
        )
        FILTER (WHERE p.name IS NOT NULL),
        '[]'
      ) AS products

    FROM stock_registry sr
    JOIN employees e ON e.id = sr.employee_id
    LEFT JOIN stock_sites ss ON ss.stock_id = sr.id
    LEFT JOIN sites s ON s.id = ss.site_id
    LEFT JOIN stock_products sp ON sp.stock_id = sr.id
    LEFT JOIN products p ON p.id = sp.product_id
    ${whereClause}
    GROUP BY
      sr.id,
      sr.date_collected,
      e.employee_id,
      e.name,
      sr.products_given_by
    ORDER BY sr.date_collected DESC
  `;

  const result = await pool.query(query, values);
  return Response.json(result.rows);
}
