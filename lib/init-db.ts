import { pool } from "./db";

export async function initializeDatabase() {
  try {
    // Enable UUID extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Employees
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        designation TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Sites
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Products
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Stock registry (main record)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_registry (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID NOT NULL REFERENCES employees(id),
        date_collected DATE NOT NULL,
        products_given_by TEXT,
        location TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);

    // Stock ↔ Sites (many-to-many)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_sites (
        stock_id UUID NOT NULL REFERENCES stock_registry(id) ON DELETE CASCADE,
        site_id UUID NOT NULL REFERENCES sites(id),
        PRIMARY KEY (stock_id, site_id)
      );
    `);

    // Stock ↔ Products (many-to-many with quantity)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_products (
        stock_id UUID NOT NULL REFERENCES stock_registry(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        PRIMARY KEY (stock_id, product_id)
      );
    `);

    console.log("Database initialized successfully");
    return { success: true };
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return { success: false, error };
  }
}
