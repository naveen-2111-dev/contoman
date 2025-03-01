// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestFunc {
    function GetFunction(
        address _ContractAddress,
        string memory functionName,
        bytes memory params
    ) public returns (bytes memory) {
        bytes4 Funcselector = bytes4(keccak256(bytes(functionName)));

        (bool success, bytes memory result) = _ContractAddress.call(
            abi.encodePacked(Funcselector, params)
        );

        require(success, "Function call failed");

        return result;
    }
}
