document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    // Mobile menu toggle
  document.querySelector('.navbar-toggle').addEventListener('click', function() {
    document.querySelector('.navbar-links').classList.toggle('active');
  });
  
  // Close mobile menu when clicking on a link
  document.querySelectorAll('.navbar-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.navbar-links').classList.remove('active');
    });
  });
  
  // Your existing ATM simulator code follows...
    const welcomeScreen = document.getElementById('welcomeScreen');
    const pinScreen = document.getElementById('pinScreen');
    const menuScreen = document.getElementById('menuScreen');
    const transactionScreen = document.getElementById('transactionScreen');
    const receiptScreen = document.getElementById('receiptScreen');
    
    const insertCardBtn = document.getElementById('insertCardBtn');
    const pinDisplay = document.getElementById('pinDisplay');
    const keypadKeys = document.querySelectorAll('.key');
    const menuButtons = document.querySelectorAll('.menu-btn');
    const transactionTitle = document.getElementById('transactionTitle');
    const transactionContent = document.getElementById('transactionContent');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const doneBtn = document.getElementById('doneBtn');
    const receiptContent = document.getElementById('receiptContent');
    const atmCard = document.getElementById('atmCard');
    
    // State variables
    let currentCard = null;
    let enteredPin = '';
    let currentAccount = null;
    let currentTransaction = null;
    let transactionAmount = 0;
    let transferAccount = '';
    
    // Event Listeners
    insertCardBtn.addEventListener('click', insertCard);
    doneBtn.addEventListener('click', resetATM);
    confirmBtn.addEventListener('click', confirmTransaction);
    cancelBtn.addEventListener('click', cancelTransaction);
    
    // Keypad handling
    keypadKeys.forEach(key => {
        key.addEventListener('click', () => {
            const value = key.getAttribute('data-value');
            
            if (value === 'clear') {
                enteredPin = '';
                updatePinDisplay();
            } else if (value === 'enter') {
                verifyPin();
            } else if (enteredPin.length < 4) {
                enteredPin += value;
                updatePinDisplay();
            }
        });
    });
    
    // Menu buttons handling
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const option = button.getAttribute('data-option');
            handleMenuOption(option);
        });
    });
    
    // Functions
    function insertCard() {
        // Simulate card insertion
        atmCard.style.transform = 'translateY(-60px)';
        
        // Fetch a random account from the database
        fetch('db.json')
            .then(response => response.json())
            .then(data => {
                const accounts = data.accounts;
                currentCard = accounts[Math.floor(Math.random() * accounts.length)];
                
                // Show PIN screen after a delay
                setTimeout(() => {
                    welcomeScreen.style.display = 'none';
                    pinScreen.style.display = 'flex';
                }, 1000);
            })
            .catch(error => {
                console.error('Error loading accounts:', error);
                // Fallback to a default account if DB fails
                currentCard = {
                    "cardNumber": "1234567890123456",
                    "pin": "1234",
                    "accountNumber": "987654321",
                    "accountHolder": "John Doe",
                    "balance": 2500.00
                };
                
                setTimeout(() => {
                    welcomeScreen.style.display = 'none';
                    pinScreen.style.display = 'flex';
                }, 1000);
            });
    }
    
    function updatePinDisplay() {
        pinDisplay.textContent = '*'.repeat(enteredPin.length) + '_'.repeat(4 - enteredPin.length);
    }
    
    function verifyPin() {
        if (enteredPin === currentCard.pin) {
            currentAccount = {...currentCard};
            enteredPin = '';
            pinScreen.style.display = 'none';
            menuScreen.style.display = 'flex';
        } else {
            alert('Incorrect PIN. Please try again.');
            enteredPin = '';
            updatePinDisplay();
        }
    }
    
    function handleMenuOption(option) {
        menuScreen.style.display = 'none';
        transactionScreen.style.display = 'flex';
        
        switch(option) {
            case 'balance':
                currentTransaction = 'balance';
                transactionTitle.textContent = 'Account Balance';
                transactionContent.innerHTML = `
                    <p>Account Holder: <strong>${currentAccount.accountHolder}</strong></p>
                    <p>Account Number: <strong>${currentAccount.accountNumber}</strong></p>
                    <p class="balance">Available Balance: <strong>$${currentAccount.balance.toFixed(2)}</strong></p>
                `;
                break;
                
            case 'withdraw':
                currentTransaction = 'withdraw';
                transactionTitle.textContent = 'Withdraw Cash';
                transactionContent.innerHTML = `
                    <p>Select amount to withdraw:</p>
                    <div class="amount-options">
                        <button class="amount-btn" data-amount="20">$20</button>
                        <button class="amount-btn" data-amount="50">$50</button>
                        <button class="amount-btn" data-amount="100">$100</button>
                        <button class="amount-btn" data-amount="200">$200</button>
                        <button class="amount-btn" data-amount="500">$500</button>
                        <button class="amount-btn" data-amount="other">Other Amount</button>
                    </div>
                    <div class="custom-amount" style="display: none;">
                        <input type="number" id="customAmount" placeholder="Enter amount" min="1">
                    </div>
                `;
                
                // Add event listeners to amount buttons
                document.querySelectorAll('.amount-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const amount = this.getAttribute('data-amount');
                        
                        if (amount === 'other') {
                            document.querySelector('.custom-amount').style.display = 'block';
                        } else {
                            transactionAmount = parseInt(amount);
                            updateWithdrawalConfirmation();
                        }
                    });
                });
                
                // Handle custom amount input
                document.getElementById('customAmount')?.addEventListener('input', function() {
                    transactionAmount = parseFloat(this.value) || 0;
                    updateWithdrawalConfirmation();
                });
                break;
                
            case 'deposit':
                currentTransaction = 'deposit';
                transactionTitle.textContent = 'Deposit Cash';
                transactionContent.innerHTML = `
                    <p>Enter amount to deposit:</p>
                    <input type="number" id="depositAmount" placeholder="Enter amount" min="1">
                `;
                
                // Handle deposit amount input
                document.getElementById('depositAmount').addEventListener('input', function() {
                    transactionAmount = parseFloat(this.value) || 0;
                });
                break;
                
            case 'transfer':
                currentTransaction = 'transfer';
                transactionTitle.textContent = 'Transfer Funds';
                transactionContent.innerHTML = `
                    <p>Enter recipient account number:</p>
                    <input type="text" id="recipientAccount" placeholder="Account number">
                    <p>Enter amount to transfer:</p>
                    <input type="number" id="transferAmount" placeholder="Enter amount" min="1">
                `;
                
                // Handle transfer inputs
                document.getElementById('recipientAccount').addEventListener('input', function() {
                    transferAccount = this.value;
                });
                
                document.getElementById('transferAmount').addEventListener('input', function() {
                    transactionAmount = parseFloat(this.value) || 0;
                });
                break;
                
            case 'exit':
                resetATM();
                break;
        }
    }
    