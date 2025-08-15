//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ecommerce} from "./Ecommerce.sol";

contract RejectsPayment {
    Ecommerce public ecommerce;

    constructor(address _ecommerce) {
        ecommerce = Ecommerce(_ecommerce);
    }

    receive() external payable {
        revert("rejecting eth");
    }

    function trigger() external payable {
        ecommerce.makeTransaction{value: msg.value}(200, msg.sender);
    }



}