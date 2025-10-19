"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallet = useMemo(() => [new PhantomWalletAdapter()], [network]);

    return <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallet} autoConnect={true}>
            <WalletModalProvider>
                <WalletMultiButton />
                {children}
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
}