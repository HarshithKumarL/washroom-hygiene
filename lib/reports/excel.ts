import ExcelJS from "exceljs";

export async function generateExcel(records: any[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Stock Records");

  sheet.columns = [
    { header: "Employee", key: "employee", width: 30 },
    { header: "Products Given By", key: "givenBy", width: 20 },
    { header: "Date", key: "date", width: 15 },
    { header: "Sites", key: "sites", width: 30 },
    { header: "Products", key: "products", width: 40 },
  ];

  records.forEach((r) => {
    sheet.addRow({
      employee: `${r.employee_id} - ${r.employee_name}`,
      givenBy: r.products_given_by,
      date: new Date(r.date_collected).toLocaleDateString("en-GB"),
      sites: r.sites?.join(", "),
      products: r.products
        ?.map((p: any) => `${p.name} (x${p.quantity})`)
        .join(", "),
    });
  });

  return workbook.xlsx.writeBuffer();
}
