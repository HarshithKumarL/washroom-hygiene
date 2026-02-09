import ExcelJS from "exceljs";

export async function generateExcel(rows: any[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Stock Report");

  sheet.columns = [
    { header: "Employee ID", key: "employeeId", width: 15 },
    { header: "Employee Name", key: "employeeName", width: 25 },
    { header: "Products Given By", key: "givenBy", width: 20 },
    { header: "Date Collected", key: "date", width: 15 },
    { header: "Sites", key: "sites", width: 30 },
    { header: "Product Name", key: "product", width: 30 },
    { header: "Quantity", key: "quantity", width: 12 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF6821F" }, // Your theme color
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 25;

  rows.forEach((record) => {
    const employeeId = record.employee_id;
    const employeeName = record.employee_name;
    const givenBy = record.products_given_by || "-";
    const date = new Date(record.date_collected).toLocaleDateString("en-GB");
    const sitesText = record.sites?.length ? record.sites.join(", ") : "-";
    const products = record.products?.length
      ? record.products
      : [{ name: "-", quantity: 0 }];

    // Add a row for each product
    products.forEach((product: any, index: number) => {
      const row = sheet.addRow({
        employeeId: index === 0 ? employeeId : "", // Show employee details only on first product row
        employeeName: index === 0 ? employeeName : "",
        givenBy: index === 0 ? givenBy : "",
        date: index === 0 ? date : "",
        sites: index === 0 ? sitesText : "",
        product: product.name,
        quantity: product.quantity,
      });

      // Add borders to all cells
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle" };
      });

      // Center align quantity column
      row.getCell("quantity").alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    // Add a blank row between different records for better readability
    if (products.length > 0) {
      const separatorRow = sheet.addRow({});
      separatorRow.height = 5;
      separatorRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F5" },
      };
    }
  });

  // Add borders to header
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  return workbook.xlsx.writeBuffer();
}
