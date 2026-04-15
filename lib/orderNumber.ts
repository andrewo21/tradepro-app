import { sql } from "@vercel/postgres";

export async function generateOrderNumber() {
  const year = new Date().getFullYear();

  const result = await sql`
    SELECT COUNT(*)::int AS count
    FROM orders
    WHERE EXTRACT(YEAR FROM created_at) = ${year};
  `;

  const count = result.rows[0].count + 1;
  const padded = String(count).padStart(4, "0");

  return `TP-${year}-${padded}`;
}
