pragma solidity ^0.4.24;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Remitter is Ownable {
    mapping(bytes32 => Remittance) public remittances;
    
    struct Remittance {
        uint balance;
        uint deadline;
    }

    event MoneySent(bytes32 _passwordHash, uint blocksTilExpired, uint _amount);

    event WithdrawalMade(address _by, uint _amount);

    function generateHash(address vendor, string recipientPassword) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(vendor, recipientPassword));
    }

    /// @notice funds the contract with ETH
    /// @param pwHash would have been created based on the recipient's password and the vendor's address
    function sendMoney(bytes32 pwHash, uint blocksTilExpired) public payable {
        require(msg.value > 0, "msg.value equals 0");
        require(remittances[pwHash].balance == 0, "an unclaimed remittance already exists for this account");
        emit MoneySent(pwHash, blocksTilExpired, msg.value);
        remittances[pwHash].deadline = block.number + blocksTilExpired;
        remittances[pwHash].balance = msg.value;
    }

    /// @notice withdraw ETH funds from contract
    function withdraw(string password) public {
        bytes32 pwHash = generateHash(msg.sender, password);
        uint allowance = remittances[pwHash].balance;
        require(allowance > 0, "nothing to withdraw, allowance equals 0");
        remittances[pwHash].balance = 0;
        emit WithdrawalMade(msg.sender, allowance);
        msg.sender.transfer(allowance);
    }

    function withdraw(address vendorAddress, string password) public onlyOwner {
        bytes32 pwHash = generateHash(vendorAddress, password);
        uint allowance = remittances[pwHash].balance;
        require(block.number >= remittances[pwHash].deadline, "remittance deadline not yet passed");
        require(allowance > 0, "nothing to withdraw, allowance equals 0");
        remittances[pwHash].balance = 0;
        emit WithdrawalMade(msg.sender, allowance);
        msg.sender.transfer(allowance);
    }
}