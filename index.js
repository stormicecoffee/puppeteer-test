const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const order = req.body;

  if (!order || !order.firstName) {
    return res.status(400).json({ success: false, message: "Missing order details" });
  }

  try {
    // Launch Puppeteer with Railway-safe flags
    const browser = await puppeteer.launch({
      headless: "new", // "new" mode avoids deprecated headless
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // Go to the form page quickly (no waiting for network idle)
    await page.goto("https://www.salesforce.com/ap/form/demo/order-management-demo/", {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    // Fill form
    await page.type('input[name="UserFirstName"]', order.firstName || "");
    await page.type('input[name="UserLastName"]', order.lastName || "");
    await page.type('input[name="UserTitle"]', order.jobTitle || "");
    await page.type('input[name="UserEmail"]', order.email || "");
    await page.type('input[name="CompanyName"]', order.company || "");
    await page.type('input[name="UserPhone"]', order.mobile || "");

    if (order.employeeValue) {
      await page.select('select[name="CompanyEmployees"]', order.employeeValue);
    }

    // Submit
    await page.click('button[type="submit"]');

    // Wait briefly for submission to process
    await page.waitForTimeout(3000);

    await browser.close();

    // Respond quickly to avoid Railway timeout
    res.status(200).json({ success: true, message: "Form submitted successfully!" });

  } catch (error) {
    console.error("Puppeteer Error:", error);
    res.status(500).json({ success: false, message: "Puppeteer failed", error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
