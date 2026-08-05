var markdownpdf = require("markdown-pdf")
  , fs = require("fs")

markdownpdf().from("Phase_2_Report.md").to("Phase_2_Report.pdf", function () {
  console.log("PDF generated successfully.")
})
