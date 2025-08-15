
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const {expect} = require("chai")
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");



describe("Ecommerce contract", function() {
    async function deployFixture() {
        const [owner, buyer, seller] = await ethers.getSigners();

        const ecommerceToken = await ethers.deployContract("Ecommerce");
        await ecommerceToken.waitForDeployment();   

        return { ecommerceToken, owner, buyer, seller }
    }

    describe("Deployment", () => {
        it("Should set the right owner", async () => {
            const { ecommerceToken, owner } = await loadFixture(deployFixture);
            expect(await ecommerceToken.owner()).to.eq(owner);
        })
    })

    describe("Transactions", () => {

        describe("makeTransaction()", () => {
            it("Should revert with insufficient amount", async () => {
                const {ecommerceToken, seller} = await loadFixture(deployFixture);

                await expect(ecommerceToken.makeTransaction(200, seller.address, {
                    value: 100
                })).to.be.revertedWithCustomError(ecommerceToken, "InsufficientAmount").withArgs(200, 100)

            })

            describe("Sending more than needed", () => {
                it("Should emit SurplusRefund event", async () => {
                    const {ecommerceToken, buyer, seller} = await loadFixture(deployFixture);

                    await expect(ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                        value: ethers.parseUnits("300", "wei")
                    })).to.emit(ecommerceToken, "SurplusRefund").withArgs(buyer.address, 300, 200, 100);
                })


            it("Should emit BalanceUpdated, and update balance because refund fails", async () => {
                    const { ecommerceToken } = await loadFixture(deployFixture);

                    const rejector = await ethers.deployContract("RejectsPayment", [await ecommerceToken.getAddress()])

                    await rejector.waitForDeployment();

                    const tx = rejector.trigger({value: 300})

                    await expect(tx).to.emit(ecommerceToken, "BalanceUpdated").
                    withArgs(await rejector.getAddress(), 0, 100)

                    expect(await ecommerceToken.balanceOf(await rejector.getAddress())).to.eq(100)
                });
            })

            it("Should emit NewTransaction", async () => {
                const {ecommerceToken, buyer, seller} = await loadFixture(deployFixture);

                await expect(ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200  
                })).to.emit(ecommerceToken, "NewTransaction").withArgs(0, buyer.address, seller.address, 200)
            })
        })

        describe("deliver()", () => {
            it("Should revert with NotSeller", async () => {
                const { ecommerceToken, owner, buyer, seller } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await expect(ecommerceToken.deliver(0)).to.be.revertedWithCustomError(ecommerceToken, "NotSeller")
            })

            it("Should emit Delivered", async () => {
                const { ecommerceToken, owner, buyer, seller } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await expect(ecommerceToken.connect(seller).deliver(0)).to.
                emit(ecommerceToken, "Delivered").withArgs(buyer.address, seller.address, 200, 0)
            })

            it("Should revert with Transaction404", async () => {
                const { ecommerceToken, owner, buyer, seller } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await expect(ecommerceToken.connect(seller).deliver(1)).to.be.
                revertedWithCustomError(ecommerceToken, "Transaction404").withArgs(1)
            })
        })

        describe("satisfy()", () => { 
            it("Should revert with NotBuyer", async () => {
                const { ecommerceToken, seller, buyer } = await loadFixture(deployFixture);

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await expect(ecommerceToken.connect(seller).satisfy(0)).to.be.revertedWithCustomError(ecommerceToken, "NotBuyer")
            })

            it("Should revert with TransactionPending since it wasn't delivered by seller", async () => {
                const { ecommerceToken, seller, buyer } = await loadFixture(deployFixture);

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await expect(ecommerceToken.connect(buyer).satisfy(0)).to.be.revertedWithCustomError(ecommerceToken, "TransactionPending")
            })

            it("Should emit TransactionConfirmed if transaction isn't already confirmed, otherwise revert with TransactionAlreadyConfirmed", async () => {
                const { ecommerceToken, seller, buyer } = await loadFixture(deployFixture);

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await expect(ecommerceToken.connect(buyer).satisfy(0)).to
                .emit(ecommerceToken, "TransactionConfirmed").withArgs(buyer.address, seller.address, 200, 0)

                await expect(ecommerceToken.connect(buyer).satisfy(0)).to.be
                .revertedWithCustomError(ecommerceToken, "TransactionAlreadyConfirmed")
                
            })

         })

         describe("claim()", function() {
            it("Should revert with NotSeller", async () => {
                const { ecommerceToken, seller, buyer } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await ecommerceToken.connect(buyer).satisfy(0)

                await expect(ecommerceToken.connect(buyer).claim(0)).to.be
                .revertedWithCustomError(ecommerceToken, "NotSeller")
            })

            it("Should revert with TransactionDelivered since it wasn't satisfied by buyer", async () => {
                const { ecommerceToken, seller, buyer } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await expect(ecommerceToken.connect(seller).claim(0)).to.be
                .revertedWithCustomError(ecommerceToken, "TransactionDelivered") 
            })

            it("Should revert with WaitPeriodNotPassed", async () => {
                const { ecommerceToken, seller, buyer } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await ecommerceToken.connect(buyer).satisfy(0)

                await expect(ecommerceToken.connect(seller).claim(0)).to.be
                .revertedWithCustomError(ecommerceToken, "WaitPeriodNotPassed")                
            })

            it("Should emit SellerClaimed and set status to Finalized", async () => {
                const { ecommerceToken, seller, buyer } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await ecommerceToken.connect(buyer).satisfy(0)

                const now = await time.latest()
                const oneDay = now + 86400

                await time.increaseTo(oneDay)

                const currentSellerBal = await ecommerceToken.balanceOf(seller.address)

                await expect(ecommerceToken.connect(seller).claim(0)).to
                .emit(ecommerceToken, "SellerClaimed").withArgs(buyer.address, seller.address, 0)

                expect(await ecommerceToken.balanceOf(seller.address)).to.eq(currentSellerBal + 200n)

                const tx = await ecommerceToken.transactions(0);
                expect(tx.status).to.equal(5)
            })
         })

         describe("dispute()", function() {
            it("Should revert with WaitPeriodHasPassed", async () => {
                const { ecommerceToken, buyer, seller } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await ecommerceToken.connect(buyer).satisfy(0)

                const now = await time.latest()
                const twoDays = now + 86400
                
                await time.increaseTo(twoDays)

                await expect(ecommerceToken.connect(buyer).dispute(0)).to
                .be.revertedWithCustomError(ecommerceToken, "WaitPeriodHasPassed")
            })

            it("Should emit BuyerDisputed and set status to Disputed", async () => {
                const { ecommerceToken, buyer, seller } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await ecommerceToken.connect(buyer).satisfy(0)

                await expect(ecommerceToken.connect(buyer).dispute(0)).to
                .emit(ecommerceToken, "BuyerDisputed").withArgs(buyer.address, seller.address, 0)

                const tx = await ecommerceToken.transactions(0)
                
                expect(tx.status).to.eq(3)
            })
         })

         describe("sellerConfirm()", function() {
            it("Should revert with TransactionNotDisputed", async () => {
                const { ecommerceToken, buyer, seller } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await ecommerceToken.connect(buyer).satisfy(0)

                await expect(ecommerceToken.connect(seller).sellerConfirm(0)).to.be
                .revertedWithCustomError(ecommerceToken, "TransactionNotDisputed")
            })

            it("Should emit SellerConfirmed and set status to Cancelled, and send back the money to buyer", async () => {
                const { ecommerceToken, buyer, seller } = await loadFixture(deployFixture)

                await ecommerceToken.connect(buyer).makeTransaction(200, seller.address, {
                    value: 200
                })

                await ecommerceToken.connect(seller).deliver(0)

                await ecommerceToken.connect(buyer).satisfy(0)

                await ecommerceToken.connect(buyer).dispute(0)

                const currentBuyerBal = await ecommerceToken.balanceOf(buyer.address)

                await expect(ecommerceToken.connect(seller).sellerConfirm(0)).to
                .emit(ecommerceToken, "SellerConfirmed").withArgs(buyer.address, seller.address, 0)

                const tx = await ecommerceToken.transactions(0)
                expect(tx.status).to.eq(4)

                expect(await ecommerceToken.balanceOf(buyer.address)).to.eq(currentBuyerBal + tx.amount)
            })
         })
     
    })
})