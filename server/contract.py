from web3 import Web3
import os
from dotenv import load_dotenv
import json

load_dotenv()

ALCHEMY_API_KEY = os.getenv("ALCHEMY_API_KEY")
ALCHEMY_URL = f"https://eth-sepolia.g.alchemy.com/v2/{ALCHEMY_API_KEY}"

web3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))

CONTRACT_ADDRESS = "0xca5c9a13495152AB6390d0A26715fF56db404B36"

with open("abi.json", "r") as f:
    abi = json.load(f)

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)


def get_balance_and_autowithdrawStatus(address):
    if not web3.is_address(address):
        return (False, {"error": "Invalid address.", "code": 400})
    try:
        address = web3.to_checksum_address(address)
        balance = contract.functions.balanceOf(address).call()
        balance_eth = web3.from_wei(balance, 'ether')
        status = contract.functions.getAutoWithdraw(address).call()
    except Exception as e:
        return (False, {"error": str(e), "code": 500})
    else:
        return (True, {"balance": str(balance_eth), "status": status})
    

