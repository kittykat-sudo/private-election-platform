// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Election {
  struct Vote {
    address voter;
    string candidate;
    uint256 timestamp;
  }

  address public admin;
  string public tenantId;
  Vote[] public votes;

  constructor(string memory _tenantId) {
    admin = msg.sender;
    tenantId = _tenantId;
  }

  function castVote(string memory candidate) public {
    votes.push(Vote(msg.sender, candidate, block.timestamp));
  }

  function getVotes() public view returns (Vote[] memory) {
    return votes;
  }
}