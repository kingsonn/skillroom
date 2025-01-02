// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UserCertificates is AccessControl {
    struct Certificate {
        string courseName;
        string metadataURI;
        uint256 issueDate;
    }

    struct UserData {
        bytes32 userHash;
        Certificate[] certificates;
        uint256 rewardPoints;
    }

    mapping(address => UserData) private users;

    IERC20 public rewardToken;
    uint256 public rewardPerCertificate = 100;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event UserDataUpdated(address indexed user, bytes32 userHash);
    event CertificateAdded(address indexed user, string courseName, uint256 issueDate);
    event CertificateRevoked(address indexed user, string courseName);
    event RewardClaimed(address indexed user, uint256 amount);

  constructor(address rewardTokenAddress) {
    rewardToken = IERC20(rewardTokenAddress);
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(ADMIN_ROLE, msg.sender);
}   

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not an admin");
        _;
    }

    function addOrUpdateUserData(bytes32 userHash) external {
        users[msg.sender].userHash = userHash;
        emit UserDataUpdated(msg.sender, userHash);
    }

    function addCertificate(
        address userAddress,
        string memory courseName,
        string memory metadataURI
    ) external onlyAdmin {
        users[userAddress].certificates.push(Certificate(courseName, metadataURI, block.timestamp));
        users[userAddress].rewardPoints += rewardPerCertificate;
        emit CertificateAdded(userAddress, courseName, block.timestamp);
    }

    function revokeCertificate(address userAddress, string memory courseName) external onlyAdmin {
        require(users[userAddress].userHash != bytes32(0), "User data not found");
        Certificate[] storage certs = users[userAddress].certificates;
        for (uint256 i = 0; i < certs.length; i++) {
            if (keccak256(bytes(certs[i].courseName)) == keccak256(bytes(courseName))) {
                certs[i] = certs[certs.length - 1];
                certs.pop();
                emit CertificateRevoked(userAddress, courseName);
                return;
            }
        }
        revert("Certificate not found");
    }

    function getCertificates() external view returns (Certificate[] memory) {
        return users[msg.sender].certificates;
    }

    function claimRewards() external {
        uint256 points = users[msg.sender].rewardPoints;
        require(points > 0, "No rewards to claim");
        require(rewardToken.balanceOf(address(this)) >= points, "Insufficient reward tokens");

        users[msg.sender].rewardPoints = 0;
        rewardToken.transfer(msg.sender, points);
        emit RewardClaimed(msg.sender, points);
    }

    function updateRewardPerCertificate(uint256 newReward) external onlyAdmin {
        rewardPerCertificate = newReward;
    }
}
//0x1556492b65988EE59825421F576F1735103e216B-erc20
//0x02171AA9e7066b71ad76bC746E752Ae2Bb3aC5Ed-this