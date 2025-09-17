# 📊 Data Upload Template Guide

This guide will help you understand how to download, fill, and upload your business data templates to the Mariami Financial Control system.

---

## 🔽 Step 1: Download the Template

1. Navigate to the **Data Upload Section** of the application
2. Click on the **"Download Template"** button next to:
   - **Invoices Template**
   - **P&L Template** 
   - **Transactions Template**
3. Save the file (available in `.xlsx` or `.csv` format) to your computer

---

## ✍️ Step 2: Fill in the Template

Open the downloaded template in Excel, Google Sheets, or any spreadsheet software and fill it with your actual business data. Below is a detailed guide for each template:

### 📄 Invoices Template

**File Purpose:** Provide details about all the invoices you have issued.

#### ✅ Required Fields & How to Fill Them:

| Field Name | Description | Example | Notes |
|------------|-------------|---------|-------|
| `Invoice_ID` | Unique identifier for each invoice | `INV-001`, `INV-1002` | Use a consistent format |
| `Date_Issued` | Date invoice was issued | `2025-01-01` | Format: YYYY-MM-DD |
| `Date_Due` | When the invoice is due to be paid | `2025-01-30` | Must be after Date_Issued |
| `Amount` | Total amount of the invoice | `2000` | Numbers only, no currency symbol |
| `Status` | Current status of invoice | `Paid`, `Unpaid`, `Overdue` | Choose one of the values |
| `Client` | Name of the client you billed | `Client A` | Can be company or person |
| `Date_Paid` | Date payment was received | `2025-01-29` | Leave blank if not paid yet |

#### 💡 Example Invoice Data:
```csv
Invoice_ID,Date_Issued,Date_Due,Amount,Status,Client,Date_Paid
INV-001,2025-01-01,2025-01-30,2000,Paid,Client A,2025-01-29
INV-002,2025-01-15,2025-02-15,3000,Overdue,Client B,
INV-003,2025-01-20,2025-02-20,1500,Unpaid,Client C,
```

---

### 💰 P&L (Profit & Loss) Template

**File Purpose:** Track your business income and expenses to understand profitability.

#### ✅ Required Fields & How to Fill Them:

| Field Name | Description | Example | Notes |
|------------|-------------|---------|-------|
| `Date` | Date of the transaction | `2025-01-01` | Format: YYYY-MM-DD |
| `Category` | Type of income or expense | `Sales Revenue`, `Office Rent` | Be specific and consistent |
| `Type` | Whether it's income or expense | `Income`, `Expense` | Only these two values |
| `Amount` | Transaction amount | `5000` | Numbers only, positive values |
| `Description` | Additional details about the transaction | `Product sales for January` | Optional but recommended |
| `Client_Supplier` | Who paid you or who you paid | `Client A`, `Office Landlord` | Leave blank if not applicable |

#### 💡 Example P&L Data:
```csv
Date,Category,Type,Amount,Description,Client_Supplier
2025-01-01,Sales Revenue,Income,5000,Product sales,Client A
2025-01-01,Office Rent,Expense,1200,Monthly office rent,Landlord Corp
2025-01-05,Marketing,Expense,500,Google Ads campaign,Google
2025-01-10,Consulting,Income,2500,Business consultation,Client B
```

---

### 💳 Transactions Template

**File Purpose:** Record all business transactions including income and expenses with detailed categorization.

#### ✅ Required Fields & How to Fill Them:

| Field Name | Description | Example | Notes |
|------------|-------------|---------|-------|
| `Date` | Transaction date | `2025-01-05` | Format: YYYY-MM-DD |
| `Type` | Transaction type | `Income`, `Expense` | Only these two values |
| `Category` | Specific category | `Sales`, `Payroll`, `Utilities` | Be consistent with naming |
| `Amount` | Transaction amount | `5000` | Numbers only, positive values |
| `Client_Supplier` | Who you transacted with | `Client A`, `Electric Company` | Company or person name |
| `Memo` | Additional notes | `Invoice INV-001`, `Monthly electricity` | Optional but helpful |

#### 💡 Example Transaction Data:
```csv
Date,Type,Category,Amount,Client_Supplier,Memo
2025-01-05,Income,Sales,5000,Client A,Invoice INV-001
2025-01-08,Expense,Payroll,1500,Staff,January payroll
2025-01-12,Expense,Utilities,300,Electric Company,Monthly electricity bill
2025-01-15,Income,Consulting,2000,Client B,Business consultation
```

---

## 📤 Step 3: Upload Your Data

1. **Save your completed template** in the same format you downloaded it (`.xlsx` or `.csv`)
2. **Return to the Data Upload Section** of the application
3. **Click "Choose File" or "Upload"** next to the appropriate template type
4. **Select your completed file** from your computer
5. **Click "Upload"** to submit your data
6. **Wait for confirmation** that your data has been successfully processed

---

## ✅ Data Validation Tips

### 🎯 Common Mistakes to Avoid:

- **Date Format:** Always use `YYYY-MM-DD` format (e.g., `2025-01-15`)
- **Amount Format:** Use numbers only, no currency symbols or commas
- **Required Fields:** Don't leave required fields empty
- **Consistent Naming:** Use the same client/supplier names throughout
- **Status Values:** For invoices, only use `Paid`, `Unpaid`, or `Overdue`
- **Type Values:** For transactions and P&L, only use `Income` or `Expense`

### 📋 Before Uploading Checklist:

- [ ] All required fields are filled
- [ ] Dates are in correct format (YYYY-MM-DD)
- [ ] Amounts are numeric values only
- [ ] Status and type fields use only allowed values
- [ ] Client/supplier names are consistent
- [ ] File is saved in correct format (.xlsx or .csv)

---

## ❓ Troubleshooting

### Common Upload Issues:

**"Invalid file format"**
- Ensure your file is saved as `.xlsx` or `.csv`
- Try re-saving the file in the correct format

**"Missing required fields"**
- Check that all required columns have data
- Verify column names match exactly as shown in templates

**"Invalid date format"**
- Use YYYY-MM-DD format for all dates
- Check for typos in date entries

**"Invalid amount format"**
- Remove currency symbols ($, €, etc.)
- Remove commas or spaces from numbers
- Use only numeric values

---

## 🔄 Data Updates

- **Replacing Data:** Uploading a new file of the same type will replace your previous data
- **Adding Data:** There's no append function - include all your data in each upload
- **Backing Up:** Keep local copies of your completed templates as backups

---

## 📞 Need Help?

If you encounter any issues or have questions about the templates, please contact our support team or refer to the help section within the application.

---