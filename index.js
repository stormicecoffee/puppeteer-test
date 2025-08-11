const puppeteer = require('puppeteer');
const readline = require('readline');

// Simple CLI input helper
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

(async () => {
  // Get user input
  const firstName = await askQuestion('First Name: ');
  const lastName = await askQuestion('Last Name: ');
  const jobTitle = await askQuestion('Job Title: ');
  const email = await askQuestion('Email: ');
  const company = await askQuestion('Company: ');
  // Employee options mapping
  const employeeOptions = {
  "1": "1 - 5 employees",
  "2": "6 - 30 employees",
  "3": "31 - 200 employees",
  "4": "201 - 500 employees",
  "5": "501 - 2000 employees",
  "6": "2000+ employees",
  };

  // Ask for numeric choice
  let employeeChoice;
  while (true) {
	employeeChoice = await askQuestion(
		'Number of Employees:\n' +
		' 1. 1 - 5 employees\n' +
		' 2. 6 - 30 employees\n' +
		' 3. 31 - 200 employees\n' +
		' 4. 201 - 500 employees\n' +
		' 5. 501 - 2000 employees\n' +
		' 6. 2000+ employees\n> '
	);

	if (employeeOptions[employeeChoice]) break;
	console.log('Invalid choice. Please enter a number from 1 to 6.');
	}

  const employeeValue = employeeOptions[employeeChoice];

  const mobile = await askQuestion('Mobile: ');

  const browser = await puppeteer.launch({
    headless: false, // set to true for headless mode when not debugging
    defaultViewport: null,
  });
  console.log('Opening the browser...');

  const page = await browser.newPage();
  await page.goto('https://www.salesforce.com/ap/form/demo/order-management-demo/', {
    waitUntil: 'networkidle2',
  });

  // Fill the form fields
  await page.type('input[name="UserFirstName"]', firstName);
  await page.type('input[name="UserLastName"]', lastName);
  await page.type('input[name="UserTitle"]', jobTitle);
  await page.type('input[name="UserEmail"]', email);
  await page.type('input[name="CompanyName"]', company);
  await page.type('input[name="UserPhone"]', mobile);

  // Select dropdown option for number of employees
  await page.select('select[name="CompanyEmployees"]', employeeValue);

  // Country is already selected as per IP address – skip unless you want to change

  // This is for us to check the form submission before clicking the button
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Click the "Watch Demo" button
  await page.click('button[type="submit"]');

  // Optional: Wait for some response or next page
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('Form filled and submitted!');
  await browser.close();
})();
