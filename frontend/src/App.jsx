import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import "./App.css";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("send");
  const heroRef = useRef(null);

  const SEPOLIA_CHAIN_ID = "0xaa36a7";

  useEffect(() => {
    checkNetwork();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    // Parallax on hero blob
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      heroRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const checkNetwork = async () => {
    if (!window.ethereum) return;
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    setNetwork(chainId);
  };

  const switchToSepolia = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  };

  const connectWallet = async () => {
    if (!window.ethereum) return showToast("Please install MetaMask!", "error");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);
    await loadBalance(accounts[0]);
    await loadTransactions();
    showToast("Wallet connected!");
  };

  const loadBalance = async (address) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const bal = await provider.getBalance(address);
    setBalance(ethers.formatEther(bal));
  };

  const loadTransactions = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const txs = await contract.getAllTransactions();
    const count = await contract.getTransactionCount();
    setTransactions([...txs].reverse());
    setTxCount(Number(count));
  };

  const sendTransaction = async () => {
    if (!receiver || !amount || !message) return showToast("Fill in all fields!", "error");
    if (network !== SEPOLIA_CHAIN_ID) return showToast("Switch to Sepolia first!", "error");
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.addToBlockchain(
        receiver,
        ethers.parseEther(amount),
        message,
        { value: ethers.parseEther(amount) }
      );
      await tx.wait();
      showToast("Transfer confirmed on chain! 🎉");
      setReceiver("");
      setAmount("");
      setMessage("");
      await loadBalance(wallet);
      await loadTransactions();
    } catch (err) {
      showToast("Transaction failed: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const formatTime = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const isWrongNetwork = network && network !== SEPOLIA_CHAIN_ID;

  return (
    <div className="root">

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-mark">⬡</div>
          ethbank
        </div>
        <div className="nav-links">
          <a href="#">transfer</a>
          <a href="#">history</a>
          <a href="#">sepolia</a>
        </div>
        <div className="nav-right">
          {isWrongNetwork && (
            <button className="btn-network-warn" onClick={switchToSepolia}>
              ⚠ wrong network
            </button>
          )}
          {wallet ? (
            <div className="nav-wallet">
              <div className="wallet-dot" />
              {shortAddress(wallet)}
              {balance && <span className="nav-balance">{parseFloat(balance).toFixed(4)} ETH</span>}
            </div>
          ) : (
            <button className="btn-connect" onClick={connectWallet}>
              connect wallet
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="blob blob-1" ref={heroRef} />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-tag">live on sepolia testnet</div>
            <h1 className="hero-title">
              money moves<br />
              <em>at the speed</em><br />
              of a block.
            </h1>
            <p className="hero-sub">
              Peer-to-peer ETH transfers recorded immutably on the blockchain.
              No banks. No middlemen. Just math.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-num">{txCount}</div>
                <div className="stat-label">transfers</div>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <div className="stat-num">~12s</div>
                <div className="stat-label">block time</div>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <div className="stat-num">0%</div>
                <div className="stat-label">our fee</div>
              </div>
            </div>
          </div>

          {/* SEND CARD */}
          <div className="send-card">
            <div className="send-card-header">
              <div className="send-card-tabs">
                <button
                  className={`tab ${activeTab === "send" ? "tab--active" : ""}`}
                  onClick={() => setActiveTab("send")}
                >send</button>
                <button
                  className={`tab ${activeTab === "history" ? "tab--active" : ""}`}
                  onClick={() => setActiveTab("history")}
                >history</button>
              </div>
            </div>

            {activeTab === "send" ? (
              <div className="send-form">
                <div className="form-group">
                  <label>you send</label>
                  <div className="amount-row">
                    <input
                      type="number"
                      className="amount-input"
                      placeholder="0.001"
                      step="0.001"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={!wallet || isWrongNetwork}
                    />
                    <div className="currency-badge">
                      <span className="currency-icon">⟠</span> ETH
                    </div>
                  </div>
                </div>

                {amount && (
                  <div className="receiver-gets">
                    <div className="gets-label">receiver gets</div>
                    <div className="gets-row">
                      <div className="gets-amount">{amount}</div>
                      <div className="currency-badge currency-badge--green">
                        <span>⟠</span> ETH
                      </div>
                    </div>
                    <div className="gets-note">*prices are on-chain, no conversion fee</div>
                  </div>
                )}

                <div className="form-group">
                  <label>to address</label>
                  <input
                    className="text-input"
                    placeholder="0x..."
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    disabled={!wallet || isWrongNetwork}
                  />
                </div>

                <div className="form-group">
                  <label>note</label>
                  <input
                    className="text-input"
                    placeholder="rent, coffee, whatever..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!wallet || isWrongNetwork}
                  />
                </div>

                <button
                  className="send-btn"
                  onClick={wallet ? sendTransaction : connectWallet}
                  disabled={isWrongNetwork || loading}
                >
                  {loading ? (
                    <span className="btn-loading">
                      <span className="spinner" /> confirming on chain...
                    </span>
                  ) : wallet ? "send" : "connect to send"}
                </button>
              </div>
            ) : (
              <div className="history-panel">
                {transactions.length === 0 ? (
                  <div className="history-empty">
                    <div className="empty-icon">◎</div>
                    <p>no transactions yet</p>
                  </div>
                ) : (
                  <div className="tx-list">
                    {transactions.map((tx, i) => (
                      <div className="tx-item" key={i}>
                        <div className="tx-left">
                          <div className="tx-icon">↑</div>
                          <div>
                            <div className="tx-msg">"{tx.message}"</div>
                            <div className="tx-addrs">
                              {shortAddress(tx.sender)} → {shortAddress(tx.receiver)}
                            </div>
                            <div className="tx-time">{formatTime(tx.timestamp)}</div>
                          </div>
                        </div>
                        <div className="tx-amount">
                          {ethers.formatEther(tx.amount)}<br />
                          <span>ETH</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="refresh-btn" onClick={loadTransactions}>↻ refresh</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="features">
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <div className="feature-title">fast settlement</div>
          <div className="feature-desc">Transactions confirm in ~12 seconds on Sepolia testnet</div>
        </div>
        <div className="feature">
          <div className="feature-icon">🔐</div>
          <div className="feature-title">non-custodial</div>
          <div className="feature-desc">Your keys, your ETH. We never touch your funds</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📜</div>
          <div className="feature-title">on-chain record</div>
          <div className="feature-desc">Every transfer is permanently recorded on the blockchain</div>
        </div>
      </section>

      {/* RECENT TRANSACTIONS FULL WIDTH */}
      {transactions.length > 0 && (
        <section className="recent-section">
          <div className="recent-header">
            <h2 className="recent-title">recent transfers</h2>
            <div className="recent-count">{txCount} total</div>
          </div>
          <div className="recent-grid">
            {transactions.slice(0, 6).map((tx, i) => (
              <div className="recent-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="recent-card-top">
                  <div className="recent-amount">{ethers.formatEther(tx.amount)} ETH</div>
                  <div className="recent-time">{formatTime(tx.timestamp)}</div>
                </div>
                <div className="recent-msg">"{tx.message}"</div>
                <div className="recent-addrs">
                  <div className="addr-chip">{shortAddress(tx.sender)}</div>
                  <div className="addr-arrow">→</div>
                  <div className="addr-chip">{shortAddress(tx.receiver)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">⬡ ethbank</div>
        <div className="footer-note">built with solidity + hardhat + react · sepolia testnet</div>
      </footer>
    </div>
  );
}