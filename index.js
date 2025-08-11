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
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto("https://www.salesforce.com/ap/form/demo/order-management-demo/", {
      waitUntil: "networkidle2"
    });

    await page.type('input[name="UserFirstName"]', order.firstName);
    await page.type('input[name="UserLastName"]', order.lastName);
    await page.type('input[name="UserTitle"]', order.jobTitle);
    await page.type('input[name="UserEmail"]', order.email);
    await page.type('input[name="CompanyName"]', order.company);
    await page.type('input[name="UserPhone"]', order.mobile);

    // If order contains employees
    if (order.employeeValue) {
      await page.select('select[name="CompanyEmployees"]', order.employeeValue);
    }

    await page.click('button[type="submit"]');

    await browser.close();
    res.status(200).json({ success: true, message: "Form submitted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Puppeteer failed", error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
