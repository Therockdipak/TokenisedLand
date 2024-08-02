// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";

contract LandTokenization is ERC721, Ownable(msg.sender) {
     
    struct Land {
        address owner;
        uint256 area; //in square meters
        uint256 price; //in wei
        bool forSale;
        string liveLocation;
    }

    mapping(uint256 => Land) public AgriculLands; 

    //  chainlink oracle for getting weather data
    FeedRegistryInterface public whetherOracle;
    string public whetherDescription;

    event LandRegistered(uint256 indexed landId, address indexed owner, uint256 area, uint256 price);
    event LandTransfer(uint256 indexed landId, address from, address to);
    event LandForSell(uint256 indexed landId, uint256 price);
    event LandSold(uint256 indexed landId, address indexed buyer);

    constructor(address _whetherOracleAddress)
        ERC721("LandToken", "LND")
    {
        whetherOracle = FeedRegistryInterface (_whetherOracleAddress);
    }

    function RegisterNewLand(uint256 _landId, uint256 _area, uint256 _price) external {
        require(_landId > 0 && _price > 0, "Invalid entry");
        require(AgriculLands[_landId].owner == address(0), "Land already registered");
        AgriculLands[_landId] = Land(msg.sender, _area, _price, false, "");
        emit LandRegistered(_landId, msg.sender, _area, _price);
    }

    function TransferOwnership(uint256 _landId, address _to) external {
        require(AgriculLands[_landId].owner == msg.sender, "You are not the owner of this land");
        AgriculLands[_landId].owner = _to;
        emit LandTransfer(_landId, msg.sender, _to);
    }

    function LandPutForSell(uint256 _landId, uint256 _price) external {
        require(AgriculLands[_landId].owner == msg.sender, "You are not the owner");
        require(!AgriculLands[_landId].forSale, "Land is already for sale");
        AgriculLands[_landId].forSale = true;
        AgriculLands[_landId].price = _price;

        emit LandForSell(_landId, _price);
    }

    function buyLand(uint256 _landId) external payable {
        require(AgriculLands[_landId].forSale, "Land is not for sale");
        require(msg.sender != address(0), "Invalid buyer address");
        require(msg.value == AgriculLands[_landId].price, "Incorrect payment amount");

        payable(AgriculLands[_landId].owner).transfer(msg.value);
        AgriculLands[_landId].owner = msg.sender;
        AgriculLands[_landId].forSale = false;

        emit LandSold(_landId, msg.sender);
    }

    function LocationUpdate(uint256 _landId, string memory _location) external {
        require(AgriculLands[_landId].owner == msg.sender, "You are not the owner");
        AgriculLands[_landId].liveLocation = _location;
    }
}
