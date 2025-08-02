// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

contract HelloTron {

string public message;

constructor(string memory initMessage) public {

message = initMessage;

}

function setMessage(string memory newMessage) public {

message = newMessage;

}

}