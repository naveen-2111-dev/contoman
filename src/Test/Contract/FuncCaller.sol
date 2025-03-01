// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Test.sol";

contract TestCaller {
    TestFunc testFunc;

    function setTestFuncAddress(address _testFuncAddress) public {
        testFunc = TestFunc(_testFuncAddress);
    }

    function callAnyFunction(
        address userContract,
        string memory funcName,
        bytes memory params
    ) public returns (bytes memory) {
        require(address(testFunc) != address(0), "TestFunc address not set");
        return testFunc.GetFunction(userContract, funcName, params);
    }
}
