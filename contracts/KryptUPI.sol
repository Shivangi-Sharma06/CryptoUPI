// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract UPIRegistryPayments {
    /// Events
    event UPIRegistered(address indexed user, string upi);
    event UPIUnregistered(address indexed user, string upi);
    event PaymentExecuted(
        address indexed sender,
        address indexed receiverWallet,
        string receiverUPI,
        address token,
        uint256 amount
    );
    event PaymentRequested(
        address indexed sender,
        string indexed receiverUPI,
        address token,
        uint256 amount
    );

    /// Mappings
    mapping(address => string) public addressToUPI;
    mapping(string => address) private upiToAddress; // maps UPI -> wallet (if registered)

    /// Custom errors
    error UPIAlreadyRegistered(string upi);
    error UPINotRegistered(string upi);
    error NotUPIOwner();
    error ZeroAddress();
    error TransferFailed();

    /// ---------- UPI registration ----------
    function registerUPI(string calldata upi) external {
        bytes memory ub = bytes(upi);
        require(ub.length > 0, "UPI cannot be empty");

        address existing = upiToAddress[upi];
        if (existing != address(0) && existing != msg.sender) {
            revert UPIAlreadyRegistered(upi);
        }

        string storage oldUPI = addressToUPI[msg.sender];
        if (bytes(oldUPI).length != 0) {
            delete upiToAddress[oldUPI];
            emit UPIUnregistered(msg.sender, oldUPI);
        }

        addressToUPI[msg.sender] = upi;
        upiToAddress[upi] = msg.sender;

        emit UPIRegistered(msg.sender, upi);
    }

    function unregisterUPI() external {
        string storage u = addressToUPI[msg.sender];
        require(bytes(u).length != 0, "no upi set");
        delete upiToAddress[u];
        delete addressToUPI[msg.sender];
        emit UPIUnregistered(msg.sender, u);
    }

    function getWalletByUPI(string calldata upi) external view returns (address) {
        return upiToAddress[upi];
    }

    /// ---------- ERC20 Payments (fixed for USDT etc.) ----------
    function sendPayment(address token, string calldata receiverUPI, uint256 amount) external {
        if (token == address(0)) revert ZeroAddress();
        require(amount > 0, "amount must be > 0");

        address receiver = upiToAddress[receiverUPI];

        if (receiver != address(0)) {
            // Use low-level call to support non-standard ERC20s like USDT
            (bool success, bytes memory data) = token.call(
                abi.encodeWithSelector(IERC20.transferFrom.selector, msg.sender, receiver, amount)
            );
            if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
                revert TransferFailed();
            }

            emit PaymentExecuted(msg.sender, receiver, receiverUPI, token, amount);
        } else {
            emit PaymentRequested(msg.sender, receiverUPI, token, amount);
        }
    }

    /// ---------- ETH Payments ----------
    function sendPaymentETH(string calldata receiverUPI) external payable {
        require(msg.value > 0, "ETH amount must be > 0");

        address receiver = upiToAddress[receiverUPI];

        if (receiver != address(0)) {
            (bool sent, ) = receiver.call{value: msg.value}("");
            if (!sent) revert TransferFailed();
            emit PaymentExecuted(msg.sender, receiver, receiverUPI, address(0), msg.value);
        } else {
            emit PaymentRequested(msg.sender, receiverUPI, address(0), msg.value);
        }
    }

    /// ---------- Helpers ----------
    function myUPI() external view returns (string memory) {
        return addressToUPI[msg.sender];
    }
}
