import PDFDocument from "pdfkit";

export function generatePDF(records: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      doc.fontSize(18).text("Stock Records Report", { align: "center" });
      doc.moveDown();

      records.forEach((r) => {
        doc.fontSize(12).text(
          `Employee: ${r.employee_id} - ${r.employee_name}`
        );
        doc.text(`Products Given By: ${r.products_given_by}`);
        doc.text(
          `Date: ${new Date(r.date_collected).toLocaleDateString("en-GB")}`
        );
        doc.text(`Sites: ${r.sites.join(", ")}`);
        doc.text("Products:");

        r.products.forEach((p: any) => {
          doc.text(`  • ${p.name} (x${p.quantity})`);
        });

        doc.moveDown();
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
