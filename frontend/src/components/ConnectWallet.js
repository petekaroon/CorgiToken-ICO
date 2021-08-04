import React from "react";

export function ConnectWallet({ connectWallet }) {
  return (
    <div>
      <p>Please connect to your wallet.</p>
        <button
          className="btn btn-warning"
          type="button"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
    </div>
  )
}