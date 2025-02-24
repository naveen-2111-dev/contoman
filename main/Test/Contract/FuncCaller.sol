// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;
import "./Test.sol";    

contract TestCaller {
    TestFunc testFunc;

    constructor(address _testFuncAddress) {
        testFunc = TestFunc(_testFuncAddress);
    }

    function callAnyFunction(
        address userContract,
        string memory funcName,
        bytes memory params
    ) public returns (bytes memory) {
        return testFunc.GetFunction(userContract, funcName, params);
    }
}
