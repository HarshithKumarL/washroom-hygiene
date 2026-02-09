import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") || "month") as
    | "week"
    | "month"
    | "year";

  try {
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 1. TOTAL RECORDS ✅
    const totalRecords = await pool.query(
      `SELECT COUNT(*)::int as total FROM stock_registry WHERE date_collected >= $1`,
      [startDate],
    );

    // 2. TOTAL PRODUCTS ✅
    const totalProducts = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0)::int as total 
       FROM stock_products WHERE stock_id IN (
         SELECT id FROM stock_registry WHERE date_collected >= $1
       )`,
      [startDate],
    );

    // 3. TOTAL SITES ✅
    const totalSites = await pool.query(
      `SELECT COUNT(DISTINCT site_id)::int as total 
       FROM stock_sites WHERE stock_id IN (
         SELECT id FROM stock_registry WHERE date_collected >= $1
       )`,
      [startDate],
    );

    // 4. TOTAL EMPLOYEES - FIXED UUID::text CAST ✅
    const totalEmployees = await pool.query(
      `SELECT COUNT(DISTINCT employee_id::text)::int as total 
       FROM stock_registry WHERE date_collected >= $1`,
      [startDate],
    );

    // 5. PRODUCT DISTRIBUTION ✅
    const productDist = await pool.query(
      `SELECT 
        p.name, 
        COALESCE(SUM(sp.quantity), 0)::int as quantity,
        COUNT(*)::int as count
       FROM products p 
       LEFT JOIN stock_products sp ON p.id = sp.product_id
       WHERE sp.stock_id IN (SELECT id FROM stock_registry WHERE date_collected >= $1)
       GROUP BY p.id, p.name 
       ORDER BY quantity DESC 
       LIMIT 10
      `,
      [startDate],
    );

    // 6. SITE DISTRIBUTION ✅
    const siteDist = await pool.query(
      `SELECT 
        s.name, 
        COUNT(DISTINCT ss.stock_id)::int as count
       FROM sites s 
       JOIN stock_sites ss ON s.id = ss.site_id
       WHERE ss.stock_id IN (SELECT id FROM stock_registry WHERE date_collected >= $1)
       GROUP BY s.id, s.name 
       ORDER BY count DESC 
       LIMIT 8
      `,
      [startDate],
    );

    // 7. EMPLOYEE - Just use stock_registry.employee_id as-is ✅
    const empDist = await pool.query(
      `SELECT 
    sr.employee_id::text as name,  -- Shows full employee_id TEXT
    COUNT(*)::int as count,
    COALESCE(SUM((
      SELECT COALESCE(SUM(sp.quantity), 0) 
      FROM stock_products sp WHERE sp.stock_id = sr.id
    )), 0)::int as products
   FROM stock_registry sr 
   WHERE sr.date_collected >= $1
   GROUP BY sr.employee_id
   ORDER BY count DESC 
   LIMIT 15
  `,
      [startDate],
    );

    // 8. TREND DATA ✅
    const trendData = await pool.query(
      range === "year"
        ? `SELECT 
            TO_CHAR(sr.date_collected, 'Mon YYYY') as month, 
            COUNT(sr.*)::int as records,
            COALESCE(SUM(sp.quantity), 0)::int as products
           FROM stock_registry sr
           LEFT JOIN stock_products sp ON sp.stock_id = sr.id
           WHERE sr.date_collected >= $1 
           GROUP BY TO_CHAR(sr.date_collected, 'Mon YYYY') 
           ORDER BY MIN(sr.date_collected)`
        : `SELECT 
            TO_CHAR(sr.date_collected, 'DD Mon') as date, 
            COUNT(sr.*)::int as records,
            COALESCE(SUM(sp.quantity), 0)::int as products
           FROM stock_registry sr
           LEFT JOIN stock_products sp ON sp.stock_id = sr.id
           WHERE sr.date_collected >= $1 
           GROUP BY TO_CHAR(sr.date_collected, 'DD Mon'), sr.date_collected
           ORDER BY sr.date_collected`,
      [startDate],
    );

    const analytics = {
      totalProducts: Number(totalProducts.rows[0]?.total || 0),
      totalRecords: Number(totalRecords.rows[0]?.total || 0),
      totalSites: Number(totalSites.rows[0]?.total || 0),
      totalEmployees: Number(totalEmployees.rows[0]?.total || 0),
      productDistribution: productDist.rows.map((row: any) => ({
        name: row.name,
        quantity: Number(row.quantity),
        count: Number(row.count),
      })),
      siteDistribution: siteDist.rows.map((row: any) => ({
        name: row.name,
        count: Number(row.count),
      })),
      employeeDistribution: empDist.rows.map((row: any) => ({
        name: row.name || "Unknown",
        count: Number(row.count),
        products: Number(row.products),
      })),
      dailyTrend:
        range !== "year"
          ? trendData.rows.map((row: any) => ({
              date: row.date || row.month,
              records: Number(row.records),
              products: Number(row.products),
            }))
          : [],
      monthlyTrend:
        range === "year"
          ? trendData.rows.map((row: any) => ({
              month: row.month,
              records: Number(row.records),
              products: Number(row.products),
            }))
          : [],
    };

    console.log("✅ SUCCESS:", analytics);
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("❌ ERROR:", error.message);
    return NextResponse.json(
      { error: "Database error", details: error.message },
      { status: 500 },
    );
  }
}
