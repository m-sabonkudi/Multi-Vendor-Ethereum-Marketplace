// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract Ecommerce is ReentrancyGuard {

    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    enum Status{Pending, Delivered, Confirmed, Disputed, Cancelled, Finalized}

    error InsufficientAmount(uint required, uint sent);
    error NotBuyer();
    error Transaction404(uint idPassed);
    error TransactionPending();
    error TransactionDelivered();
    error TransactionAlreadyConfirmed();
    error TransactionDisputed();
    error TransactionCancelled();
    error TransactionFinalized();
    error NotSeller();
    error WaitPeriodNotPassed(uint requiredTime, uint currentTime);
    error WaitPeriodHasPassed(uint deadline, uint currentTime);
    error InsufficientBalance(uint balance, uint requestedAmount);
    error TransactionNotDisputed();

    function revertByStatus(Status _status) internal pure {
        if (_status == Status.Pending) revert TransactionPending();
        if (_status == Status.Delivered) revert TransactionDelivered();
        if (_status == Status.Confirmed) revert TransactionAlreadyConfirmed();
        if (_status == Status.Disputed) revert TransactionDisputed();
        if (_status == Status.Cancelled) revert TransactionCancelled();
        if (_status == Status.Finalized) revert TransactionFinalized();
    }

    event SurplusRefund(address user, uint amountSent, uint amountExpected, uint amountRefunded);
    event NewTransaction(uint transaction_id, address indexed buyer, address indexed seller, uint amount);
    event Delivered(address indexed buyer, address indexed seller, uint amount, uint transactionId);
    event TransactionConfirmed(address indexed buyer, address indexed seller, uint amount, uint transactionId);
    event WithdrawalSuccessful(address indexed account, uint amount, uint newBalance);
    event BalanceUpdated(address indexed account, uint previousBalance, uint newBalance);
    event BuyerDisputed(address indexed buyer, address indexed seller, uint transactionId);
    event TransactionCancelledEvent(address indexed buyer, address indexed seller, uint cancelledAt, uint transactionId);
    event SellerClaimed(address indexed buyer, address indexed seller, uint transactionId);
    event SellerConfirmed(address indexed buyer, address indexed seller, uint transactionId);
    event AutoWithdrawSet(address indexed user, bool status);

    struct Transaction {
        address buyer;
        address seller;
        uint amount;
        uint confirmedAt;
        Status status;
        bool exists;
    }

    mapping(uint => Transaction) public transactions;
    uint public transactions_count;

    mapping(address => uint) private balances;
    mapping(address => bool) private autoWithdraw;

    function balanceOf(address _account) public view returns(uint balance) {
        return balances[_account];
    }   

    modifier sendEth() {
        require(msg.value > 0, "No eth sent in the transaction.");
        _;
    }

    modifier transactionExists(uint txId) {
        if (!transactions[txId].exists) {
            revert Transaction404(txId);
        }
        _;
    }

    function setAutoWithdraw(bool _value) public {
        autoWithdraw[msg.sender] = _value;
        emit AutoWithdrawSet(msg.sender, autoWithdraw[msg.sender]);
    }

    function getAutoWithdraw(address _address) public view returns(bool) {
        return autoWithdraw[_address];
    }

    function sendMoney(address _account, uint _amount) private nonReentrant{
        if (!autoWithdraw[_account]) {
            uint prevBal = balanceOf(_account);
            balances[_account] += _amount;
            emit BalanceUpdated(_account, prevBal, balanceOf(_account));
        } else {
            (bool success, ) = payable(_account).call{ value: _amount }("");
            require(success);
            emit WithdrawalSuccessful(_account, _amount, balanceOf(_account));
        }
    }
    
    function makeTransaction(uint _productPrice, address _seller) public payable nonReentrant sendEth returns(uint) {
        if (msg.value < _productPrice) {
            revert InsufficientAmount(_productPrice, msg.value);
        } else if (msg.value > _productPrice) { 
            uint refundAmount = msg.value - _productPrice;
            (bool success, ) = payable(msg.sender).call{ value: refundAmount }("");
            if (success) {
                emit SurplusRefund(msg.sender, msg.value, _productPrice, refundAmount);
            } else {
                uint prevBal = balanceOf(msg.sender);
                balances[msg.sender] += refundAmount;
                emit BalanceUpdated(msg.sender, prevBal, balanceOf(msg.sender));
            }
        }

        Transaction memory new_transaction = Transaction({
            buyer: msg.sender,
            seller: _seller,
            amount: _productPrice,
            confirmedAt: 0,
            status: Status.Pending,
            exists: true
        });

        transactions[transactions_count] = new_transaction;
        transactions_count += 1;
        emit NewTransaction(transactions_count - 1, new_transaction.buyer, new_transaction.seller, new_transaction.amount);
        return transactions_count - 1;
    }

    function deliver(uint _transactionId) public transactionExists(_transactionId) {
        if (transactions[_transactionId].seller != msg.sender) {
            revert NotSeller();
        }

        if (transactions[_transactionId].status > Status.Pending) {
            revertByStatus(transactions[_transactionId].status);
        }

        transactions[_transactionId].status = Status.Delivered;
        emit Delivered(transactions[_transactionId].buyer, msg.sender, transactions[_transactionId].amount, _transactionId);
    }

    function satisfy(uint _transactionId) public transactionExists(_transactionId) {
        if (transactions[_transactionId].buyer != msg.sender) {
            revert NotBuyer();
        }

        if (transactions[_transactionId].status != Status.Delivered) {
            revertByStatus(transactions[_transactionId].status);
        }

        transactions[_transactionId].status = Status.Confirmed;
        transactions[_transactionId].confirmedAt = block.timestamp;
        emit TransactionConfirmed(msg.sender, transactions[_transactionId].seller, transactions[_transactionId].amount, _transactionId);
    }

    function dispute(uint _transactionId) public transactionExists(_transactionId) {
        if (transactions[_transactionId].buyer != msg.sender) {
            revert NotBuyer();
        }

        if (transactions[_transactionId].status != Status.Confirmed) {
            revertByStatus(transactions[_transactionId].status);
        }

        if (block.timestamp >= transactions[_transactionId].confirmedAt + 1 days) {
            revert WaitPeriodHasPassed(transactions[_transactionId].confirmedAt + 1 days, block.timestamp);
        }

        transactions[_transactionId].status = Status.Disputed;  
        emit BuyerDisputed(transactions[_transactionId].buyer, transactions[_transactionId].seller, _transactionId);
    }

    function sellerConfirm(uint _transactionId) public transactionExists(_transactionId) {
        if (transactions[_transactionId].seller != msg.sender) {
            revert NotSeller();
        }

        if (transactions[_transactionId].status != Status.Disputed) {
            if (transactions[_transactionId].status == Status.Confirmed) {
                revert TransactionNotDisputed();
            }
            revertByStatus(transactions[_transactionId].status);
        }

        transactions[_transactionId].status = Status.Cancelled;
        sendMoney(transactions[_transactionId].buyer, transactions[_transactionId].amount);
        emit SellerConfirmed(transactions[_transactionId].buyer, transactions[_transactionId].seller, _transactionId);
    }

    function claim(uint _transactionId) public transactionExists(_transactionId) {
        if (transactions[_transactionId].seller != msg.sender) {
            revert NotSeller();
        }

        if (transactions[_transactionId].status != Status.Confirmed) {
            revertByStatus(transactions[_transactionId].status);
        }

        if (block.timestamp < transactions[_transactionId].confirmedAt + 1 days) {
            revert WaitPeriodNotPassed(transactions[_transactionId].confirmedAt + 1 days, block.timestamp);
        }

        sendMoney(msg.sender, transactions[_transactionId].amount);
        transactions[_transactionId].status = Status.Finalized;
        emit SellerClaimed(transactions[_transactionId].buyer, transactions[_transactionId].seller, _transactionId);
    }

    function withdraw(uint _amount) public nonReentrant{
        if (balanceOf(msg.sender) < _amount) {
            revert InsufficientBalance(balanceOf(msg.sender), _amount);
        }

        balances[msg.sender] -= _amount;
        (bool success, ) = payable(msg.sender).call{ value: _amount }("");
        require(success);
        emit WithdrawalSuccessful(msg.sender, _amount, balanceOf(msg.sender));
    }

}