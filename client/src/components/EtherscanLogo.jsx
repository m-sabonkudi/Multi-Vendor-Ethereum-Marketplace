import React from "react";
import etherscanLogo from "../../public/etherscan-light.svg";

function EtherscanLogo({ size = 24 }) {
  return (
    <img
      src={etherscanLogo}
      alt="Etherscan"
      width={size}
      height={size}
    />
  );
}

export default EtherscanLogo;