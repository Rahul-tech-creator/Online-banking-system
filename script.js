/* ==========================================================================
   MYBANK ONLINE BANKING SYSTEM - JAVASCRIPT SIMULATOR
   Clean, simple, well-commented vanilla JavaScript logic suitable for
   college project code review. Uses Browser LocalStorage for state.
   ========================================================================== */

// Global Application State Object
let appData = {
    accounts: {
        Savings: {
            name: "Savings Account",
            accountNumber: "****4521",
            balance: 45500
        },
        Current: {
            name: "Current Account",
            accountNumber: "****7823",
            balance: 82300
        }
    },
    transactions: [
        {
            id: 1,
            date: "01-10-2026",
            type: "Salary Credit",
            description: "Monthly Salary Credit",
            account: "Savings",
            amount: 50000,
            transactionType: "credit"
        },
        {
            id: 2,
            date: "29-09-2026",
            type: "Bill Payment",
            description: "Electricity Bill",
            account: "Savings",
            amount: 2000,
            transactionType: "debit"
        },
        {
            id: 3,
            date: "27-09-2026",
            type: "Shopping",
            description: "Shopping Expense",
            account: "Savings",
            amount: 3500,
            transactionType: "debit"
        },
        {
            id: 4,
            date: "25-09-2026",
            type: "Bill Payment",
            description: "Mobile Recharge",
            account: "Current",
            amount: 500,
            transactionType: "debit"
        }
    ],
    loans: [],
    recurringPayments: [],
    isLoggedIn: false
};

// Global state variable for active transaction filter ("all", "credit", "debit")
let currentTransactionFilter = "all";


/* ==========================================================================
   1. LOCAL STORAGE STORAGE FUNCTIONS (loadData & saveData)
   ========================================================================== */

/**
 * Loads saved banking data from browser LocalStorage.
 * If data exists in LocalStorage, parse it into appData.
 * If no saved data exists, save the default initial state.
 */
function loadData() {
    let saved = localStorage.getItem("myBankData");
    if (saved) {
        try {
            appData = JSON.parse(saved);
        } catch (e) {
            console.error("Error parsing saved data:", e);
        }
    } else {
        // Save initial default state to local storage
        saveData();
    }
}

/**
 * Saves current appData object into browser LocalStorage.
 */
function saveData() {
    localStorage.setItem("myBankData", JSON.stringify(appData));
}


/* ==========================================================================
   2. HELPER UTILITY FUNCTIONS
   ========================================================================== */

/**
 * Formats a numeric value into Indian Rupee currency format (e.g. 45500 -> ₹45,500).
 */
function formatCurrency(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

/**
 * Helper to display temporary feedback messages (success or error) in form sections.
 */
function showMessage(elementId, text, isSuccess) {
    let msgElement = document.getElementById(elementId);
    if (!msgElement) return;

    msgElement.innerText = text;
    msgElement.classList.remove("hidden", "success", "error");

    if (isSuccess) {
        msgElement.classList.add("success");
    } else {
        msgElement.classList.add("error");
    }
}

/**
 * Formats a Date object into DD-MM-YYYY string.
 */
function getCurrentFormattedDate() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    return dd + "-" + mm + "-" + yyyy;
}


/* ==========================================================================
   3. LOGIN & LOGOUT MANAGEMENT
   ========================================================================== */

/**
 * Validates login credentials and updates application login state.
 * Demo credentials: admin / 1234
 */
function login() {
    let usernameInput = document.getElementById("username").value.trim();
    let passwordInput = document.getElementById("password").value.trim();

    if (usernameInput === "admin" && passwordInput === "1234") {
        appData.isLoggedIn = true;
        saveData();

        // Hide login view, display dashboard view
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("bankPage").classList.remove("hidden");

        // Clear error messages & inputs
        document.getElementById("loginMessage").classList.add("hidden");
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";

        // Refresh all dashboard UI displays
        refreshAllUI();
    } else {
        showMessage("loginMessage", "Invalid username or password!", false);
    }
}

/**
 * Logs out user, clears login session state, and returns to login screen.
 */
function logout() {
    appData.isLoggedIn = false;
    saveData();

    document.getElementById("bankPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
}


/* ==========================================================================
   4. NAVIGATION SECTION SWITCHER
   ========================================================================== */

/**
 * Switches between active feature content sections (Deposit, Transfer, Bills, etc.)
 */
function showSection(sectionId, clickedTab) {
    // Hide all content sections
    let sections = document.querySelectorAll(".content-section");
    sections.forEach(function (sec) {
        sec.classList.add("hidden");
    });

    // Remove active state from all navigation menu tabs
    let tabs = document.querySelectorAll(".menu-tab");
    tabs.forEach(function (tab) {
        tab.classList.remove("active");
    });

    // Show target content section
    let targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove("hidden");
    }

    // Set active style on clicked tab element
    if (clickedTab) {
        clickedTab.classList.add("active");
    }

    // Hide any previous message boxes in form sections
    let messageBoxes = document.querySelectorAll(".message-box");
    messageBoxes.forEach(function (box) {
        if (box.id !== "loginMessage") {
            box.classList.add("hidden");
        }
    });
}


/* ==========================================================================
   5. DASHBOARD & BALANCE UPDATES
   ========================================================================== */

/**
 * Calculates and updates all account balances and top summary metrics.
 */
function updateDashboard() {
    // 1. Update Account Card Balances
    let savingsBal = appData.accounts.Savings.balance;
    let currentBal = appData.accounts.Current.balance;

    document.getElementById("savingsBalanceDisplay").innerText = formatCurrency(savingsBal);
    document.getElementById("currentBalanceDisplay").innerText = formatCurrency(currentBal);

    // 2. Calculate Dashboard Summary Totals
    let totalBalance = savingsBal + currentBal;
    let totalCredits = 0;
    let totalDebits = 0;

    appData.transactions.forEach(function (tx) {
        if (tx.transactionType === "credit") {
            totalCredits += tx.amount;
        } else if (tx.transactionType === "debit") {
            totalDebits += tx.amount;
        }
    });

    document.getElementById("totalBalanceDisplay").innerText = formatCurrency(totalBalance);
    document.getElementById("totalCreditsDisplay").innerText = "+ " + formatCurrency(totalCredits);
    document.getElementById("totalDebitsDisplay").innerText = "- " + formatCurrency(totalDebits);
    document.getElementById("totalTransactionsCount").innerText = appData.transactions.length;
}


/* ==========================================================================
   6. DEPOSIT MONEY FEATURE
   ========================================================================== */

/**
 * Adds money to selected account and records a credit transaction.
 */
function depositMoney() {
    let accountKey = document.getElementById("depositAccount").value; // "Savings" or "Current"
    let amountInput = document.getElementById("depositAmount").value;
    let amount = parseFloat(amountInput);

    // Validation 1: Check if amount is entered and valid number
    if (isNaN(amount) || amount <= 0) {
        showMessage("depositMessage", "Please enter a valid amount greater than 0.", false);
        return;
    }

    // Add amount to selected account balance
    appData.accounts[accountKey].balance += amount;

    // Create a new Credit transaction record
    addTransactionRecord(
        "Deposit",
        "Money Deposit to " + accountKey + " Account",
        accountKey,
        amount,
        "credit"
    );

    // Save state and refresh UI
    saveData();
    refreshAllUI();

    // Clear input field and display success message
    document.getElementById("depositAmount").value = "";
    showMessage("depositMessage", formatCurrency(amount) + " deposited successfully to " + accountKey + " Account!", true);
}


/* ==========================================================================
   7. FUND TRANSFER FEATURE
   ========================================================================== */

/**
 * Transfers funds from selected account to a receiver. Validates balance before deducting.
 */
function transferMoney() {
    let sourceAccount = document.getElementById("transferSourceAccount").value; // "Savings" or "Current"
    let receiverName = document.getElementById("receiverName").value.trim();
    let receiverAcc = document.getElementById("receiverAccount").value.trim();
    let amountInput = document.getElementById("transferAmount").value;
    let amount = parseFloat(amountInput);

    // Validation 1: Check for empty receiver details
    if (!receiverName || !receiverAcc) {
        showMessage("transferMessage", "Please enter receiver name and account number.", false);
        return;
    }

    // Validation 2: Check amount > 0
    if (isNaN(amount) || amount <= 0) {
        showMessage("transferMessage", "Please enter a valid transfer amount greater than 0.", false);
        return;
    }

    // Validation 3: Check sufficient balance in selected source account
    let currentBalance = appData.accounts[sourceAccount].balance;
    if (amount > currentBalance) {
        showMessage("transferMessage", "Insufficient balance! Your " + sourceAccount + " Account balance is " + formatCurrency(currentBalance) + ".", false);
        return;
    }

    // Deduct amount from selected source account
    appData.accounts[sourceAccount].balance -= amount;

    // Create Debit transaction record
    addTransactionRecord(
        "Fund Transfer",
        "Transfer to " + receiverName + " (Acc: " + receiverAcc + ")",
        sourceAccount,
        amount,
        "debit"
    );

    // Save updated state & refresh UI
    saveData();
    refreshAllUI();

    // Clear inputs and display success message
    document.getElementById("receiverName").value = "";
    document.getElementById("receiverAccount").value = "";
    document.getElementById("transferAmount").value = "";
    showMessage("transferMessage", "Successfully transferred " + formatCurrency(amount) + " from " + sourceAccount + " Account to " + receiverName + ".", true);
}


/* ==========================================================================
   8. BILL PAYMENT FEATURE
   ========================================================================== */

/**
 * Pays utility bills (Electricity, Water, Internet, Mobile) from selected account.
 */
function payBill() {
    let sourceAccount = document.getElementById("billSourceAccount").value;
    let billType = document.getElementById("billType").value;
    let consumerNo = document.getElementById("consumerNumber").value.trim();
    let amountInput = document.getElementById("billAmount").value;
    let amount = parseFloat(amountInput);

    // Validation 1: Consumer number required
    if (!consumerNo) {
        showMessage("billMessage", "Please enter consumer / meter / mobile number.", false);
        return;
    }

    // Validation 2: Amount check
    if (isNaN(amount) || amount <= 0) {
        showMessage("billMessage", "Please enter a valid bill amount greater than 0.", false);
        return;
    }

    // Validation 3: Check sufficient balance
    let availableBal = appData.accounts[sourceAccount].balance;
    if (amount > availableBal) {
        showMessage("billMessage", "Insufficient balance! Your " + sourceAccount + " Account balance is " + formatCurrency(availableBal) + ".", false);
        return;
    }

    // Deduct bill amount from selected account
    appData.accounts[sourceAccount].balance -= amount;

    // Create Debit transaction record
    addTransactionRecord(
        "Bill Payment",
        billType + " Bill (" + consumerNo + ")",
        sourceAccount,
        amount,
        "debit"
    );

    // Save and refresh UI
    saveData();
    refreshAllUI();

    // Clear inputs and display success message
    document.getElementById("consumerNumber").value = "";
    document.getElementById("billAmount").value = "";
    showMessage("billMessage", billType + " bill of " + formatCurrency(amount) + " paid successfully from " + sourceAccount + " Account.", true);
}


/* ==========================================================================
   9. TRANSACTION HISTORY MANAGEMENT
   ========================================================================== */

/**
 * Adds a transaction object to the beginning of the transactions array.
 */
function addTransactionRecord(type, description, account, amount, transactionType) {
    let newTx = {
        id: Date.now(),
        date: getCurrentFormattedDate(),
        type: type,
        description: description,
        account: account,
        amount: amount,
        transactionType: transactionType // "credit" or "debit"
    };

    // Place newest transaction at the beginning of the array
    appData.transactions.unshift(newTx);
}

/**
 * Renders transaction rows into the HTML table based on search query & filter buttons.
 */
function displayTransactions() {
    let tbody = document.getElementById("transactionsTableBody");
    if (!tbody) return;

    let query = document.getElementById("searchQuery").value.toLowerCase().trim();

    // Filter transactions by filter button ("all", "credit", "debit") and search text
    let filtered = appData.transactions.filter(function (tx) {
        // Filter by Credit/Debit type
        if (currentTransactionFilter !== "all" && tx.transactionType !== currentTransactionFilter) {
            return false;
        }

        // Search match across description, type, account, and amount
        if (query !== "") {
            let matchDesc = tx.description.toLowerCase().includes(query);
            let matchType = tx.type.toLowerCase().includes(query);
            let matchAccount = tx.account.toLowerCase().includes(query);
            let matchAmount = tx.amount.toString().includes(query);

            return matchDesc || matchType || matchAccount || matchAmount;
        }

        return true;
    });

    // Render HTML table rows
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No transactions found.</td></tr>`;
        return;
    }

    let rowsHTML = "";
    filtered.forEach(function (tx) {
        let isCredit = tx.transactionType === "credit";
        let amountText = (isCredit ? "+ " : "- ") + formatCurrency(tx.amount);
        let amountClass = isCredit ? "text-credit" : "text-debit";

        rowsHTML += `
            <tr>
                <td>${tx.date}</td>
                <td><strong>${tx.type}</strong></td>
                <td>${tx.description}</td>
                <td>${tx.account}</td>
                <td class="${amountClass}"><strong>${amountText}</strong></td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHTML;
}

/**
 * Event listener function triggered when typing in the transaction search input box.
 */
function searchTransactions() {
    displayTransactions();
}

/**
 * Sets current transaction filter ("all", "credit", "debit") and updates table view.
 */
function filterTransactions(filterType, clickedBtn) {
    currentTransactionFilter = filterType;

    // Update active filter button styling
    let buttons = document.querySelectorAll(".btn-filter");
    buttons.forEach(function (btn) {
        btn.classList.remove("active");
    });

    if (clickedBtn) {
        clickedBtn.classList.add("active");
    }

    displayTransactions();
}


/* ==========================================================================
   10. LOAN REQUEST FEATURE
   ========================================================================== */

/**
 * Submits a new loan application and stores it with status "Pending".
 */
function requestLoan() {
    let loanType = document.getElementById("loanType").value;
    let amountInput = document.getElementById("loanAmount").value;
    let tenureInput = document.getElementById("loanTenure").value;

    let amount = parseFloat(amountInput);
    let tenure = parseInt(tenureInput);

    if (isNaN(amount) || amount <= 0) {
        showMessage("loanMessage", "Please enter a valid loan amount.", false);
        return;
    }

    if (isNaN(tenure) || tenure <= 0) {
        showMessage("loanMessage", "Please enter valid tenure in years.", false);
        return;
    }

    let loanObj = {
        id: "L" + (appData.loans.length + 101),
        type: loanType,
        amount: amount,
        tenure: tenure + " Years",
        status: "Pending"
    };

    appData.loans.push(loanObj);
    saveData();
    displayLoans();

    // Clear inputs and display success message
    document.getElementById("loanAmount").value = "";
    document.getElementById("loanTenure").value = "";
    showMessage("loanMessage", loanType + " application for " + formatCurrency(amount) + " submitted successfully. Status: Pending.", true);
}

/**
 * Displays requested loan applications in the "My Loans" table.
 */
function displayLoans() {
    let tbody = document.getElementById("loansList");
    if (!tbody) return;

    if (appData.loans.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No loan applications found.</td></tr>`;
        return;
    }

    let rowsHTML = "";
    appData.loans.forEach(function (loan) {
        rowsHTML += `
            <tr>
                <td><strong>${loan.id}</strong></td>
                <td>${loan.type}</td>
                <td>${formatCurrency(loan.amount)}</td>
                <td>${loan.tenure}</td>
                <td><span class="status-pending">${loan.status}</span></td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHTML;
}


/* ==========================================================================
   11. RECURRING PAYMENTS FEATURE
   ========================================================================== */

/**
 * Schedules a recurring payment object and stores it in LocalStorage.
 */
function addRecurringPayment() {
    let name = document.getElementById("paymentName").value.trim();
    let amountInput = document.getElementById("paymentAmount").value;
    let frequency = document.getElementById("paymentFrequency").value;
    let date = document.getElementById("nextPaymentDate").value;

    let amount = parseFloat(amountInput);

    if (!name) {
        showMessage("recurringMessage", "Please enter payment name / description.", false);
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        showMessage("recurringMessage", "Please enter a valid payment amount.", false);
        return;
    }

    if (!date) {
        showMessage("recurringMessage", "Please select next payment date.", false);
        return;
    }

    let item = {
        id: Date.now(),
        name: name,
        amount: amount,
        frequency: frequency,
        date: date
    };

    appData.recurringPayments.push(item);
    saveData();
    displayRecurringPayments();

    // Clear inputs & show success
    document.getElementById("paymentName").value = "";
    document.getElementById("paymentAmount").value = "";
    document.getElementById("nextPaymentDate").value = "";
    showMessage("recurringMessage", "Recurring payment for " + name + " (" + formatCurrency(amount) + ") scheduled successfully.", true);
}

/**
 * Renders recurring payment items into HTML table.
 */
function displayRecurringPayments() {
    let tbody = document.getElementById("recurringList");
    if (!tbody) return;

    if (appData.recurringPayments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No recurring payments set.</td></tr>`;
        return;
    }

    let rowsHTML = "";
    appData.recurringPayments.forEach(function (item) {
        rowsHTML += `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${formatCurrency(item.amount)}</td>
                <td>${item.frequency}</td>
                <td>${item.date}</td>
                <td>
                    <button class="btn-danger" style="padding: 4px 10px; font-size: 12px;" onclick="deleteRecurringPayment(${item.id})">Delete</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHTML;
}

/**
 * Removes a recurring payment by ID, updates LocalStorage and refreshes table UI.
 */
function deleteRecurringPayment(id) {
    appData.recurringPayments = appData.recurringPayments.filter(function (item) {
        return item.id !== id;
    });

    saveData();
    displayRecurringPayments();
}


/* ==========================================================================
   12. ACCOUNT STATEMENT & FILE DOWNLOAD
   ========================================================================== */

/**
 * Updates statement view details for the selected account (Savings or Current).
 */
function updateStatementView() {
    let selectedAccount = document.getElementById("statementAccountSelect").value;
    let accObj = appData.accounts[selectedAccount];

    document.getElementById("stmtAccNo").innerText = accObj.accountNumber;
    document.getElementById("stmtAccType").innerText = selectedAccount;
    document.getElementById("stmtAccBalance").innerText = formatCurrency(accObj.balance);

    let tbody = document.getElementById("statementTableBody");
    if (!tbody) return;

    // Filter transactions for the selected account
    let accTransactions = appData.transactions.filter(function (tx) {
        return tx.account === selectedAccount;
    });

    if (accTransactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No statement records for this account.</td></tr>`;
        return;
    }

    let rowsHTML = "";
    accTransactions.forEach(function (tx) {
        let isCredit = tx.transactionType === "credit";
        let amountText = (isCredit ? "+ " : "- ") + formatCurrency(tx.amount);
        let amountClass = isCredit ? "text-credit" : "text-debit";

        rowsHTML += `
            <tr>
                <td>${tx.date}</td>
                <td>${tx.type}</td>
                <td>${tx.description}</td>
                <td class="${amountClass}"><strong>${amountText}</strong></td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHTML;
}

/**
 * Generates and downloads a real formatted .txt statement file using JavaScript Blob.
 */
function downloadStatement() {
    let selectedAccount = document.getElementById("statementAccountSelect").value;
    let accObj = appData.accounts[selectedAccount];
    let currentDate = getCurrentFormattedDate();

    let accTransactions = appData.transactions.filter(function (tx) {
        return tx.account === selectedAccount;
    });

    // Build text statement content
    let content = "====================================================\n";
    content += "             MYBANK ACCOUNT STATEMENT               \n";
    content += "====================================================\n";
    content += "Account Holder : Abhi\n";
    content += "Customer ID    : CUST1001\n";
    content += "Account Number : " + accObj.accountNumber + "\n";
    content += "Account Type   : " + selectedAccount + " Account\n";
    content += "Current Balance: " + formatCurrency(accObj.balance) + "\n";
    content += "Generated On   : " + currentDate + "\n";
    content += "====================================================\n\n";

    content += "TRANSACTION HISTORY:\n";
    content += "----------------------------------------------------\n";
    content += "DATE       | TYPE            | AMOUNT       | DESCRIPTION\n";
    content += "----------------------------------------------------\n";

    if (accTransactions.length === 0) {
        content += "No transaction records found.\n";
    } else {
        accTransactions.forEach(function (tx) {
            let sign = tx.transactionType === "credit" ? "+" : "-";
            let amountStr = sign + " ₹" + tx.amount;
            // Pad columns for clean text alignment
            let datePad = tx.date.padEnd(10, " ");
            let typePad = tx.type.padEnd(15, " ");
            let amtPad = amountStr.padEnd(12, " ");
            content += datePad + " | " + typePad + " | " + amtPad + " | " + tx.description + "\n";
        });
    }

    content += "====================================================\n";
    content += "Thank you for banking with MyBank!\n";

    // Create Blob object with text content
    let blob = new Blob([content], { type: "text/plain;charset=utf-8" });

    // Create dynamic download anchor link
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Statement_" + selectedAccount + "_" + currentDate + ".txt";

    // Append, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


/* ==========================================================================
   13. RESET DEMO DATA FUNCTION
   ========================================================================== */

/**
 * Resets application state back to default initial values after user confirmation.
 */
function resetData() {
    let confirmReset = confirm("Are you sure you want to reset all data to default demo state?");
    if (!confirmReset) return;

    // Reset appData object to default initial state
    appData = {
        accounts: {
            Savings: {
                name: "Savings Account",
                accountNumber: "****4521",
                balance: 45500
            },
            Current: {
                name: "Current Account",
                accountNumber: "****7823",
                balance: 82300
            }
        },
        transactions: [
            {
                id: 1,
                date: "01-10-2026",
                type: "Salary Credit",
                description: "Monthly Salary Credit",
                account: "Savings",
                amount: 50000,
                transactionType: "credit"
            },
            {
                id: 2,
                date: "29-09-2026",
                type: "Bill Payment",
                description: "Electricity Bill",
                account: "Savings",
                amount: 2000,
                transactionType: "debit"
            },
            {
                id: 3,
                date: "27-09-2026",
                type: "Shopping",
                description: "Shopping Expense",
                account: "Savings",
                amount: 3500,
                transactionType: "debit"
            },
            {
                id: 4,
                date: "25-09-2026",
                type: "Bill Payment",
                description: "Mobile Recharge",
                account: "Current",
                amount: 500,
                transactionType: "debit"
            }
        ],
        loans: [],
        recurringPayments: [],
        isLoggedIn: appData.isLoggedIn // Maintain current login status
    };

    // Save default state to LocalStorage
    saveData();

    // Refresh all UI elements
    refreshAllUI();

    alert("Demo data has been reset to default initial state!");
}


/* ==========================================================================
   14. UI REFRESH ORCHESTRATOR
   ========================================================================== */

/**
 * Triggers re-rendering of all dynamic UI sections across the app.
 */
function refreshAllUI() {
    updateDashboard();
    displayTransactions();
    displayLoans();
    displayRecurringPayments();
    updateStatementView();
}


/* ==========================================================================
   15. INITIALIZATION ON PAGE LOAD
   ========================================================================== */

// When DOM is fully loaded, load stored data and restore login state
document.addEventListener("DOMContentLoaded", function () {
    loadData();

    if (appData.isLoggedIn) {
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("bankPage").classList.remove("hidden");
        refreshAllUI();
    } else {
        document.getElementById("loginPage").classList.remove("hidden");
        document.getElementById("bankPage").classList.add("hidden");
    }
});