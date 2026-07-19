const { mdToPdf } = require("md-to-pdf");

async function generatePdf() {
  const result = await mdToPdf(
    { path: "Phase_2_Report.md" },
    { dest: "Phase_2_Report.pdf" }
  );

  if (!result?.filename) {
    throw new Error("PDF generation failed.");
  }

  console.log("PDF generated successfully.");
}

generatePdf().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
