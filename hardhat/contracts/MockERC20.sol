// contracts/MockERC20.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
  constructor(string memory name, string memory symbol, uint256 initial) ERC20(name, symbol) {
    _mint(msg.sender, initial);
  }
}
