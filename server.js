const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "loans.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API to get all loan details
app.get("/loans/", async (request, response) => {
  try {
    const getLoansQuery = `
            SELECT * FROM users;`;
    const loansArray = await db.all(getLoansQuery);
    response.send(
      loansArray.map((eachLoan) => ({
        id: eachLoan.id,
        name: eachLoan.name,
        loanAmount: eachLoan.loan_amount,
        loanTenure: eachLoan.loan_tenure,
        employmentStatus: eachLoan.employment_status,
        employmentAddress: eachLoan.employment_address,
        loanReason: eachLoan.loan_reason,
        loanStatus: eachLoan.loan_status,
        dateApplied: eachLoan.date_applied,
      }))
    );
  } catch (e) {
    console.log(`getError: ${e.message}`);
  }
});

// API to post loan details
app.post("/loans/", async (request, response) => {
  try {
    const loanDetails = request.body;
    const {
      id,
      name,
      loanAmount,
      loanTenure,
      employmentStatus,
      employmentAddress,
      loanReason,
      loanStatus,
      dateApplied,
    } = loanDetails;
    const addLoanDetails = `
            INSERT INTO users (id, name, loan_amount, loan_tenure, employment_status, employment_address, loan_reason, loan_status, date_applied)
            VALUES (
            '${id}',
            '${name}',
            '${loanAmount}',
            '${loanTenure}',
            '${employmentStatus}',
            '${employmentAddress}',
            '${loanReason}',
            '${loanStatus}',
            '${dateApplied}'
            )
        `;
    const dBResponse = await db.run(addLoanDetails);
    response.send({ dBResponse: "Loan application submitted successfully" });
  } catch (e) {
    response.send(`${e.message}`);
  }
});

// API to update loan status
app.put("/loans/:id/", async (request, response) => {
  try {
    const { id } = request.params;
    const { loanStatus } = request.body;
    console.log("Loan ID:", id);
    console.log("Loan Status:", loanStatus);
    const testQuery = "SELECT * FROM users WHERE id = ?";
    const row = await db.get(testQuery, [id]);
    console.log("Fetched row for test:", row);
    const updateLoanStatusQuery = `
            UPDATE users
            SET loan_status = '${loanStatus}'
            WHERE id = '${id}';`;
    const result = await db.run(updateLoanStatusQuery);
    console.log("Update result:", result);
    response.send({ message: "Loan status updated successfully" });
  } catch (e) {
    console.log(`UpdateError: ${e.message}`);
  }
});
