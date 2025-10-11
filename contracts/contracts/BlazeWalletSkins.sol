// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Blaze Wallet Skins
 * @dev NFTs that unlock exclusive wallet themes/skins
 * 
 * Features:
 * - Multiple skin collections
 * - Limited edition skins
 * - Purchase with BLAZE tokens
 * - Premium member discounts (50%)
 * - Secondary market ready (OpenSea compatible)
 */
contract BlazeWalletSkins is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public blazeToken;
    
    enum SkinRarity {
        Common,
        Rare,
        Epic,
        Legendary
    }
    
    struct SkinCollection {
        uint256 id;
        string name;
        string description;
        SkinRarity rarity;
        uint256 price;          // Price in BLAZE tokens
        uint256 maxSupply;      // 0 = unlimited
        uint256 minted;
        bool isActive;
        string baseURI;
    }
    
    struct OwnedSkin {
        uint256 tokenId;
        uint256 collectionId;
        uint256 serialNumber;
        uint256 mintedAt;
    }
    
    // Constants
    uint256 public constant PREMIUM_THRESHOLD = 1000 * 10**18; // 1k BLAZE staked
    uint256 public constant PREMIUM_DISCOUNT = 50; // 50% discount
    
    // Storage
    uint256 public collectionCount;
    uint256 public totalSupply;
    
    mapping(uint256 => SkinCollection) public collections;
    mapping(uint256 => uint256) public tokenToCollection; // tokenId => collectionId
    mapping(uint256 => uint256) public tokenSerialNumber; // tokenId => serial number
    mapping(address => uint256[]) public userSkins; // user => tokenIds
    
    address public treasuryWallet;
    
    // Events
    event CollectionCreated(
        uint256 indexed collectionId,
        string name,
        SkinRarity rarity,
        uint256 price,
        uint256 maxSupply
    );
    
    event SkinMinted(
        uint256 indexed tokenId,
        uint256 indexed collectionId,
        address indexed owner,
        uint256 serialNumber,
        uint256 price
    );
    
    event CollectionUpdated(uint256 indexed collectionId, bool isActive);
    
    constructor(
        address _blazeToken,
        address _treasuryWallet
    ) ERC721("Blaze Wallet Skins", "BLAZESKIN") Ownable(msg.sender) {
        require(_blazeToken != address(0), "Invalid BLAZE token");
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        
        blazeToken = IERC20(_blazeToken);
        treasuryWallet = _treasuryWallet;
    }
    
    /**
     * @dev Create a new skin collection
     */
    function createCollection(
        string memory _name,
        string memory _description,
        SkinRarity _rarity,
        uint256 _price,
        uint256 _maxSupply,
        string memory _baseURI
    ) external onlyOwner returns (uint256) {
        require(bytes(_name).length > 0, "Name required");
        require(_price > 0, "Price required");
        
        collectionCount++;
        uint256 collectionId = collectionCount;
        
        SkinCollection storage collection = collections[collectionId];
        collection.id = collectionId;
        collection.name = _name;
        collection.description = _description;
        collection.rarity = _rarity;
        collection.price = _price;
        collection.maxSupply = _maxSupply;
        collection.minted = 0;
        collection.isActive = true;
        collection.baseURI = _baseURI;
        
        emit CollectionCreated(collectionId, _name, _rarity, _price, _maxSupply);
        
        return collectionId;
    }
    
    /**
     * @dev Mint a skin NFT
     */
    function mintSkin(uint256 _collectionId) external nonReentrant returns (uint256) {
        SkinCollection storage collection = collections[_collectionId];
        
        require(_collectionId > 0 && _collectionId <= collectionCount, "Invalid collection");
        require(collection.isActive, "Collection not active");
        require(
            collection.maxSupply == 0 || collection.minted < collection.maxSupply,
            "Sold out"
        );
        
        // Calculate price with potential discount
        uint256 price = collection.price;
        uint256 blazeBalance = blazeToken.balanceOf(msg.sender);
        
        if (blazeBalance >= PREMIUM_THRESHOLD) {
            price = (price * (100 - PREMIUM_DISCOUNT)) / 100;
        }
        
        // Transfer BLAZE tokens
        blazeToken.safeTransferFrom(msg.sender, treasuryWallet, price);
        
        // Mint NFT
        totalSupply++;
        uint256 tokenId = totalSupply;
        collection.minted++;
        uint256 serialNumber = collection.minted;
        
        _safeMint(msg.sender, tokenId);
        
        tokenToCollection[tokenId] = _collectionId;
        tokenSerialNumber[tokenId] = serialNumber;
        userSkins[msg.sender].push(tokenId);
        
        // Set token URI
        string memory uri = string(
            abi.encodePacked(collection.baseURI, "/", _uint2str(serialNumber), ".json")
        );
        _setTokenURI(tokenId, uri);
        
        emit SkinMinted(tokenId, _collectionId, msg.sender, serialNumber, price);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint (for airdrops/promotions)
     */
    function batchMintSkin(
        uint256 _collectionId,
        address[] memory _recipients
    ) external onlyOwner {
        SkinCollection storage collection = collections[_collectionId];
        
        require(_collectionId > 0 && _collectionId <= collectionCount, "Invalid collection");
        require(collection.isActive, "Collection not active");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "Invalid recipient");
            
            if (collection.maxSupply > 0 && collection.minted >= collection.maxSupply) {
                break;
            }
            
            totalSupply++;
            uint256 tokenId = totalSupply;
            collection.minted++;
            uint256 serialNumber = collection.minted;
            
            _safeMint(_recipients[i], tokenId);
            
            tokenToCollection[tokenId] = _collectionId;
            tokenSerialNumber[tokenId] = serialNumber;
            userSkins[_recipients[i]].push(tokenId);
            
            string memory uri = string(
                abi.encodePacked(collection.baseURI, "/", _uint2str(serialNumber), ".json")
            );
            _setTokenURI(tokenId, uri);
            
            emit SkinMinted(tokenId, _collectionId, _recipients[i], serialNumber, 0);
        }
    }
    
    /**
     * @dev Toggle collection active state
     */
    function setCollectionActive(uint256 _collectionId, bool _isActive) external onlyOwner {
        require(_collectionId > 0 && _collectionId <= collectionCount, "Invalid collection");
        collections[_collectionId].isActive = _isActive;
        emit CollectionUpdated(_collectionId, _isActive);
    }
    
    /**
     * @dev Update collection price
     */
    function updateCollectionPrice(uint256 _collectionId, uint256 _newPrice) external onlyOwner {
        require(_collectionId > 0 && _collectionId <= collectionCount, "Invalid collection");
        require(_newPrice > 0, "Invalid price");
        collections[_collectionId].price = _newPrice;
    }
    
    /**
     * @dev Update treasury wallet
     */
    function setTreasuryWallet(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        treasuryWallet = _newTreasury;
    }
    
    /**
     * @dev Get collection details
     */
    function getCollection(uint256 _collectionId) external view returns (
        uint256 id,
        string memory name,
        string memory description,
        SkinRarity rarity,
        uint256 price,
        uint256 maxSupply,
        uint256 minted,
        bool isActive
    ) {
        require(_collectionId > 0 && _collectionId <= collectionCount, "Invalid collection");
        
        SkinCollection storage collection = collections[_collectionId];
        
        return (
            collection.id,
            collection.name,
            collection.description,
            collection.rarity,
            collection.price,
            collection.maxSupply,
            collection.minted,
            collection.isActive
        );
    }
    
    /**
     * @dev Get user's skins
     */
    function getUserSkins(address _user) external view returns (uint256[] memory) {
        return userSkins[_user];
    }
    
    /**
     * @dev Get skin details
     */
    function getSkinDetails(uint256 _tokenId) external view returns (
        uint256 tokenId,
        uint256 collectionId,
        uint256 serialNumber,
        address owner,
        string memory uri
    ) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        
        return (
            _tokenId,
            tokenToCollection[_tokenId],
            tokenSerialNumber[_tokenId],
            ownerOf(_tokenId),
            tokenURI(_tokenId)
        );
    }
    
    /**
     * @dev Check if user is premium (for discount)
     */
    function isPremiumUser(address _user) public view returns (bool) {
        return blazeToken.balanceOf(_user) >= PREMIUM_THRESHOLD;
    }
    
    /**
     * @dev Get effective price for user (with discount if applicable)
     */
    function getEffectivePrice(uint256 _collectionId, address _user) external view returns (uint256) {
        require(_collectionId > 0 && _collectionId <= collectionCount, "Invalid collection");
        
        uint256 price = collections[_collectionId].price;
        
        if (isPremiumUser(_user)) {
            price = (price * (100 - PREMIUM_DISCOUNT)) / 100;
        }
        
        return price;
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Helper function to convert uint to string
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}

