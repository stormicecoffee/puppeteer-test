const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/', async (req, res) => {
  const order = req.body;

  if (!order || !order.firstName) {
    return res.status(400).json({ success: false, message: "Missing order details" });
  }

  try {
    const browser = await puppeteer.launch({ headless: false }); // use true in prod
    const page = await browser.newPage();

	// replace with actual form URL
    await page.goto('https://www.salesforce.com/ap/form/demo/order-management-demo/');

    // Fill the form using the data
    await page.type('input[name="UserFirstName"]', order.firstName);
    await page.type('input[name="UserLastName"]', order.lastName);
    await page.type('input[name="UserTitle"]', order.jobTitle);
    await page.type('input[name="UserEmail"]', order.email);
    await page.type('input[name="CompanyName"]', order.company);
    await page.type('input[name="UserPhone"]', order.mobile);

	// Select employee dropdown
    await page.select('select[name="CompanyEmployees"]', employeeValue);

    // Optional wait (for debugging and to preview)
    await page.waitForTimeout(5000);

    // Submit the form
    await page.click('button[type="submit"]');

    // Optional post-submit wait
    await page.waitForTimeout(5000);

    await browser.close();
    res.status(200).send({ status: 'Success', message: 'Form submitted!' });
    res.json({ success: true, message: "Puppeteer ran with form data!" });


  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Puppeteer failed", error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
