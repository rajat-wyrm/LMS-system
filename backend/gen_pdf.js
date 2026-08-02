const { mdToPdf } = require("md-to-pdf");

(async () => {
  try {
    await mdToPdf({
      path: "Phase_2_Report.md",
      dest: "Phase_2_Report.pdf",
    });
    console.log("PDF generated successfully.");
  } catch (error) {
    console.error("Failed to generate PDF.");
    console.error(error);
    process.exitCode = 1;
  }
})();
