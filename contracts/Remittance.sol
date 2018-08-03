pragma solidity ^0.4.24;


contract Remittance {
    mapping(bytes32 => uint) public remittances;
    
    event MoneySent(bytes32 _passwordHash, uint _amount);

    event WithdrawalMade(address _by, uint _amount);

    function generateHash(address vendor, string recipientPassword) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(vendor, recipientPassword));
    }

    /// @notice funds the contract with ETH
    /// @param pwHash would have been created based on the recipient's password and the vendor's address
    function sendMoney(bytes32 pwHash) public payable {
        require(msg.value > 0, "msg.value equals 0");
        require(remittances[pwHash] == 0, "an unclaimed remittance already exists for this account");
        emit MoneySent(pwHash, msg.value);
        remittances[pwHash] = msg.value;
    }

    /// @notice withdraw ETH funds from contract
    function withdraw(string password) public {
        bytes32 pwHash = generateHash(msg.sender, password);
        uint allowance = remittances[pwHash];
        require(allowance > 0, "nothing to withdraw, allowance equals 0");
        remittances[pwHash] = 0;
        emit WithdrawalMade(msg.sender, allowance);
        msg.sender.transfer(allowance);
    }
}