import { NextRequest, NextResponse } from "next/server";
import { generateExcel } from "../../../../lib/reports/excel"; // Adjust path based on where you save the utility
// Import your database connection or data fetching logic
// For example: import { getRecordsByIds } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recordIds } = body;

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return NextResponse.json(
        { error: "No record IDs provided" },
        { status: 400 },
      );
    }

    // Fetch the records from your database
    // Replace this with your actual data fetching logic
    // Example:
    // const records = await getRecordsByIds(recordIds);

    // For now, using a placeholder - replace with your actual database query
    const records = await fetchRecordsFromDatabase(recordIds);

    if (!records || records.length === 0) {
      return NextResponse.json({ error: "No records found" }, { status: 404 });
    }

    // Generate Excel file
    const buffer = await generateExcel(records);

    // Return the file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=stock-report.xlsx",
      },
    });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}

// Placeholder function - replace with your actual database query
async function fetchRecordsFromDatabase(recordIds: string[]) {
  // This is where you would fetch from your database
  // Example with Prisma:
  // return await prisma.record.findMany({
  //   where: {
  //     id: { in: recordIds }
  //   },
  //   include: {
  //     products: true,
  //     sites: true
  //   }
  // });

  // Example with a fetch to another API endpoint:
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/records`,
  );
  const allRecords = await response.json();

  // Filter to only the selected IDs
  return allRecords.filter((record: any) => recordIds.includes(record.id));
}
