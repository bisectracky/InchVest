// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Simple HTLC for locking TRX on Tron
contract HTLC {
    // owner who deployed
    address public owner;

    // beneficiary who can claim with secret
    address public beneficiary;

    // hashlock (keccak256 of the secret)
    bytes32 public hashlock;

    // UNIX timestamp after which sender can refund
    uint256 public timelock;

    // amount locked
    uint256 public amount;

    // whether funds were withdrawn
    bool public withdrawn;

    // whether refunded
    bool public refunded;

    // events
    event Locked(bytes32 indexed hashlock, uint256 timelock, uint256 amount);
    event Withdrawn(bytes32 indexed secret);
    event Refunded();

    constructor(
        address _beneficiary,
        bytes32 _hashlock,
        uint256 _timelock
    ) payable {
        require(msg.value > 0, "Must lock some TRX");
        owner       = msg.sender;
        beneficiary = _beneficiary;
        hashlock    = _hashlock;
        timelock    = _timelock;
        amount      = msg.value;

        emit Locked(_hashlock, _timelock, msg.value);
    }

    /// @notice Claim the locked TRX by revealing the pre-image
    function withdraw(bytes32 _secret) external {
        require(!withdrawn, "Already withdrawn");
        require(!refunded, "Already refunded");
        require(msg.sender == beneficiary, "Not beneficiary");
        require(keccak256(abi.encodePacked(_secret)) == hashlock, "Invalid secret");
        withdrawn = true;

        // send the funds
        payable(beneficiary).transfer(amount);
        emit Withdrawn(_secret);
    }

    /// @notice Refund the locked TRX after timelock
    function refund() external {
        require(!withdrawn, "Already withdrawn");
        require(!refunded, "Already refunded");
        require(block.timestamp >= timelock, "Too early");
        require(msg.sender == owner, "Not owner");
        refunded = true;

        payable(owner).transfer(amount);
        emit Refunded();
    }
}
