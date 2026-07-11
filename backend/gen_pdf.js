const { mdToPdf } = require("md-to-pdf");

async function main() {
  const result = await mdToPdf(
    { path: "Phase_2_Report.md" },
    { dest: "Phase_2_Report.pdf" }
  );

  if (!result) {
    throw new Error("Failed to generate Phase_2_Report.pdf");
  }

  console.log("PDF generated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
