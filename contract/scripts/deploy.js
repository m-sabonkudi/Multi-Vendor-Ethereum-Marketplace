const { ethers } = require("hardhat");


async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract by:", deployer.address); // 👈 Confirm deployer

    const Token = await ethers.deployContract("Ecommerce")
    await Token.waitForDeployment();

    console.log("Deployed", Token.target)
}

main()
.then(() => process.exit(0))
.catch((err) => {console.error(err)})