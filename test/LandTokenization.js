const {ethers} = require("hardhat");
const {expect} = require("chai");

describe("LandTokenization", async ()=> {
   let LandTokenization;
   let owner;
   let buyer;

   beforeEach(async ()=> {
      [owner,buyer] = await ethers.getSigners();
      whetherOracle = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
      LandTokenization = await ethers.deployContract("LandTokenization",[whetherOracle]);

      console.log("your contract address", LandTokenization.getAddress());
   });

   describe("Owner", async ()=> {
      it("should set right owner", async ()=> {
         expect(await LandTokenization.owner()).to.equal(owner.address);
      });
   });

   describe("RegisterNewLand", async ()=> {
        it("should register a new land", async ()=> {
           await LandTokenization.connect(owner).RegisterNewLand(1, 1000, ethers.parseEther("1"));

           const land = await LandTokenization.AgriculLands(1);
         
           expect(land.owner).to.equal(owner.address);
           expect(land.area).to.equal(1000);
           expect(land.price).to.equal(ethers.parseEther("1"));
        })
   });

   describe("TransferOwnership", async ()=> {
       it("should transfer ownership of land", async ()=> {
         await LandTokenization.connect(owner).RegisterNewLand(1, 1000, ethers.parseEther("1"));
          await LandTokenization.connect(owner).TransferOwnership(1, buyer.address);
          const land = await LandTokenization.AgriculLands(1);
         
          expect(land.owner).to.equal(buyer.address);  
       });
   });

   describe("LandPutForSell", async ()=> {
      it("should list the land for sale", async function () {
         // Register a new land
         await LandTokenization.connect(owner).RegisterNewLand(1, 1000, ethers.parseEther("1"));
       
         // Check initial state (should not be for sale)
         let land = await LandTokenization.AgriculLands(1);
         console.log(land);
         expect(land.forSale).to.be.false;
       
         // List the land for sale
         await LandTokenization.connect(owner).LandPutForSell(1, ethers.parseEther("1.5"));
       
         // Check the state after listing
         land = await LandTokenization.AgriculLands(1);
         expect(land.forSale).to.be.true;
         expect(land.price).to.equal(ethers.parseEther("1.5"));
       });
       
   });
    
   describe("buyLand", async ()=> {
      it("should buy the land", async ()=> {
         await LandTokenization.connect(owner).RegisterNewLand(1,1000, ethers.parseEther("1"));
         await LandTokenization.connect(owner).LandPutForSell(1, ethers.parseEther("1"));
         await LandTokenization.connect(buyer).buyLand(1, {value: ethers.parseEther("1")});

         const land = await LandTokenization.AgriculLands(1);
         expect(land.owner).to.equal(buyer.address);
         expect(land.forSale).to.be.false;
         expect(land.price).to.equal(ethers.parseEther("1"));
        });

        it("should not allow land for sale if it is already for sale", async ()=> {
         await LandTokenization.connect(owner).RegisterNewLand(1,1000, ethers.parseEther("1"));
         await LandTokenization.connect(owner).LandPutForSell(1, ethers.parseEther("1"));

         await expect(LandTokenization.connect(owner).LandPutForSell(1, ethers.parseEther("1"))).to.rejectedWith("Land is already for sale");
        });
   });

   describe("locationUpdate", async ()=> {
       it("should update live location", async ()=> {
         await LandTokenization.connect(owner).RegisterNewLand(1,1000, ethers.parseEther("1"));
          await LandTokenization.connect(owner).LocationUpdate(1, "new location");
          const land = await LandTokenization.AgriculLands(1);
         
          expect(land.liveLocation).to.equal("new location");
       });
   });

    


});