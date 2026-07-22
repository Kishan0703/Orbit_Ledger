import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  FileText,
  KeyRound,
  Landmark,
  LogOut,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useWallet, kit } from "./useWallet";
import { getBalance } from "./stellar";
import { Client, networks } from "treasury";
import { scValToNative, rpc, nativeToScVal, Contract, TransactionBuilder, Networks } from "@stellar/stellar-sdk";

// ── Constants ─────────────────────────────────────────────────────────────────
const balanceCache = {};
const CACHE_TTL = 30_000;
const XLM_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const CONTRACT_ID = "CCTFAGAPN24YX4V2X7VWGTKP5QJOSPJ4CVJWUTIOZL2MMB2L7WOCJJV4";
const NET_PASSPHRASE = "Test SDF Network ; September 2015";
// Level 4: SPAY Token contract ID (update after deployment)
const SPAY_CONTRACT_ID = "CBJBY4ER5AXT6FC7M5V7PMPANDTBVELP6AOBEKXQHZPEHDPL4ZG3L547";
const HERO_WORDS = ["governed", "traceable", "multi-signed"];

const Brand = ({ compact = false }) => (
  <div className={`nav-brand ${compact ? "nav-brand-compact" : ""}`}>
    <span className="logo-icon">OL</span>
    <span className="logo-text">Orbit Ledger</span>
  </div>
);

// ── Shared footer ─────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="app-footer">
    <div className="footer-left">
      <Brand compact />
      <div className="footer-belt">Treasury Console</div>
    </div>
    <div className="footer-right">
      <div className="footer-credit">
        Soroban payroll operations on Stellar Testnet
      </div>
    </div>
  </footer>
);

const LandingPage = ({ connect }) => {
  const [heroWordIndex, setHeroWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroWordIndex((prev) => (prev + 1) % HERO_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <Brand />
        <div className="landing-nav-right">
          <a href="#features">Controls</a>
          <a href="#how-it-works">Workflow</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-kicker"><Activity size={16} /> Live testnet treasury desk</div>
          <h1 className="hero-headline">
            Run payroll through a <span key={heroWordIndex} className="hero-animated-word">{HERO_WORDS[heroWordIndex]}</span> approval desk.
          </h1>
          <p className="hero-subtext">
            Orbit Ledger turns Soroban payroll proposals into a compact command center for creating, signing, releasing, and auditing XLM payments.
          </p>
          <div className="hero-actions">
            <button onClick={connect} className="btn-hero-primary">
              <Wallet size={18} /> Connect Wallet <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="hero-free-layout">
            <div className="terminal-card-header">
              <span />
              <span />
              <span />
            </div>
            <div className="terminal-line"><span>proposal</span><strong>queued</strong></div>
            <div className="terminal-line"><span>approvals</span><strong>1 / 2</strong></div>
            <div className="terminal-line"><span>network</span><strong>testnet</strong></div>
            <div className="terminal-total">
              <small>release amount</small>
              <strong>1,250 XLM</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Treasury Controls</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={24} /></div>
            <h3>Dual Approval</h3>
            <p>Require two distinct wallets before funds can move.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Zap size={24} /></div>
            <h3>Soroban Calls</h3>
            <p>Create, approve, and execute proposals through the deployed contract.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Sparkles size={24} /></div>
            <h3>SPAY Rewards</h3>
            <p>Track token receipts minted after successful payroll execution.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FileText size={24} /></div>
            <h3>Exportable Log</h3>
            <p>Keep a local execution ledger with explorer links and CSV export.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Landmark size={24} /></div>
            <h3>Testnet Funds</h3>
            <p>Connect Freighter or another Stellar wallet and operate on testnet.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <h2 className="section-title">Three-Step Release</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Draft</h3>
            <p>Add an employee wallet and XLM amount to create a proposal.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Sign</h3>
            <p>Collect the second wallet approval from a separate signer.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Release</h3>
            <p>Execute the approved proposal and log the transaction hash.</p>
          </div>
        </div>
      </section>

      {/* Shared Footer reused here */}
      <Footer />
    </div>
  );
};

function App() {
  const { address, connect, disconnect } = useWallet();

  const [balance, setBalance] = useState("0");
  const [xlmPrice, setXlmPrice] = useState(null);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [approveId, setApproveId] = useState("");
  const [executeId, setExecuteId] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [funding, setFunding] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // ── Level 4: Payroll History (persisted to localStorage) ──────────────────────
  const [payrollHistory, setPayrollHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("orbitledger_history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [spayBalance, setSpayBalance] = useState("—");
  const [spayLoading, setSpayLoading] = useState(false);



  useEffect(() => {
    localStorage.setItem("orbitledger_history", JSON.stringify(payrollHistory));
  }, [payrollHistory]);

  const loadingRef = useRef(false);
  const lastFetchedAddress = useRef(null); // prevents stale balance on account switch

  // ── Validators ───────────────────────────────────────────────────────────────
  const isValidAddress = (a) => /^[G][A-Z2-7]{55}$/.test(a);
  const isValidId = (id) => id !== "" && !isNaN(id) && Number(id) >= 0 && Number(id) <= 4_294_967_295;

  // ── Formatters ───────────────────────────────────────────────────────────────
  const toStroops = (amt) => {
    try {
      if (!amt || isNaN(amt) || !isFinite(parseFloat(amt))) return 0n;
      const [whole, frac = ""] = String(parseFloat(amt).toFixed(7)).split(".");
      return BigInt(whole) * 10_000_000n + BigInt(frac.padEnd(7, "0").slice(0, 7));
    } catch { return 0n; }
  };

  const fmtBalance = (bal) => {
    const n = parseFloat(bal);
    return isNaN(n) ? "0" : n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 7 });
  };

  const fmtUSD = (bal, price) => {
    if (!price || !bal) return null;
    return (parseFloat(bal) * price).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  };

  const fmtINR = (bal, price) => {
    if (!price || !bal) return null;
    return "₹" + (parseFloat(bal) * price).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const extractHash = (r) =>
    r?.txHash || r?.hash || r?.response?.hash ||
    r?.sendTransactionResponse?.hash || r?.status?.hash || null;

  // Safely unwrap a Soroban SDK Result<T> to its inner value
  const resolveId = (r) => {
    try {
      const val = r?.result;
      if (val == null) return null;
      // The Soroban SDK wraps return values in a Result — call .unwrap() first
      if (typeof val === "object" && typeof val.unwrap === "function") return val.unwrap();
      if (typeof val === "object") return val._value ?? val.value ?? null;
      return val;
    } catch { return null; }
  };

  // ── SPAY token balance (queried via Soroban RPC simulation) ─────────────────
  const isEmployee = useMemo(() => {
    if (!address) return false;
    return payrollHistory.some(p => p.employee === address);
  }, [payrollHistory, address]);

  const fetchSpayBalance = useCallback(async () => {
    if (!address || !SPAY_CONTRACT_ID || !isEmployee) return;
    if (spayLoading) return;
    setSpayLoading(true);
    try {
      const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org");
      // Load a source account to build the simulation transaction
      const account = await rpcServer.getAccount(address);
      const contract = new Contract(SPAY_CONTRACT_ID);
      const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call("balance", nativeToScVal(address, { type: "address" }))
        )
        .setTimeout(30)
        .build();
      const simResult = await rpcServer.simulateTransaction(tx);
      if (simResult && simResult.result && simResult.result.retval) {
        const rawVal = scValToNative(simResult.result.retval);
        // SPAY balance is stored as i128 whole tokens (not in stroops)
        setSpayBalance(String(Number(rawVal)));
      } else {
        setSpayBalance("0");
      }
    } catch (e) {
      console.warn("SPAY balance fetch failed:", e);
      setSpayBalance("0");
    } finally {
      setSpayLoading(false);
    }
  }, [address, isEmployee, spayLoading]);

  // ── Treasury client ───────────────────────────────────────────────────────────
  const treasuryClient = useMemo(() => {
    if (!address) return null;
    return new Client({
      ...networks.testnet,
      contractId: CONTRACT_ID,
      rpcUrl: "https://soroban-testnet.stellar.org",
      publicKey: address,
      signTransaction: async (xdr) => {
        setLoadingStep("Waiting for wallet signature...");
        const r = await kit.signTransaction(xdr, { networkPassphrase: NET_PASSPHRASE });
        setLoadingStep("Broadcasting to Stellar network...");
        return r.signedXDR || r.result || r;
      },
    });
  }, [address]);

  // ── Balance ───────────────────────────────────────────────────────────────────
  const refreshBalance = useCallback(async (target) => {
    const addr = target || address;
    if (!addr) return;
    const cached = balanceCache[addr];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (lastFetchedAddress.current === addr) setBalance(cached.value);
      return;
    }
    try {
      const bal = await getBalance(addr);
      if (lastFetchedAddress.current === addr) {
        balanceCache[addr] = { value: bal, timestamp: Date.now() };
        setBalance(bal);
      }
    } catch (e) { console.warn("Balance fetch failed:", e); }
  }, [address]);

  // Reset + fetch on account change (fixes stale balance bug)
  useEffect(() => {
    if (!address) { setBalance("0"); setSpayBalance("—"); return; }
    lastFetchedAddress.current = address;
    setBalance("0");
    const cached = balanceCache[address];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) setBalance(cached.value);
    else refreshBalance(address);
    // Fetch SPAY balance whenever wallet address changes, strictly if they are an employee
    if (isEmployee) fetchSpayBalance();
  }, [address, fetchSpayBalance, isEmployee, refreshBalance]);

  // Auto-refresh every 30 s
  useEffect(() => {
    if (!address) return;
    const id = setInterval(() => { delete balanceCache[address]; refreshBalance(address); }, 30_000);
    return () => clearInterval(id);
  }, [address, refreshBalance]);

  // ── XLM price ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd,inr");
        const data = await res.json();
        setXlmPrice({ usd: data?.stellar?.usd ?? null, inr: data?.stellar?.inr ?? null });
      } catch { /* non-critical, skip */ }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Reset form & check URL ──────────────────────────────────────────────
  useEffect(() => {
    setStatus(null); setDestination(""); setAmount("");
    setExecuteId(""); setLoadingStep("");
    setLastCreatedId(null); setLinkCopied(false);

    // Magic link auto-fill
    const id = new URLSearchParams(window.location.search).get("approveId");
    if (id && isValidId(id)) setApproveId(id);
    else setApproveId("");
  }, [address]);

  // ── Fund via Friendbot ────────────────────────────────────────────────────────
  const handleFundWallet = async () => {
    if (funding || !address) return;
    setFunding(true); setStatus(null);
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${address}`);
      const data = await res.json();
      if (res.ok || data?.successful) {
        delete balanceCache[address];
        setTimeout(() => refreshBalance(address), 2000);
        setStatus({ type: "success", msg: "Wallet funded. 10,000 Testnet XLM received." });
      } else {
        const e = (data?.detail || data?.extras?.result_codes?.operations?.[0] || "").toLowerCase();
        setStatus({
          type: "error", msg: e.includes("existing") || e.includes("op_already")
            ? "Account already funded. Friendbot funds new accounts only."
            : "Funding failed. Try again in a few minutes."
        });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error. Could not reach Friendbot." });
    } finally { setFunding(false); }
  };

  // ── Copy magic link ───────────────────────────────────────────────────────────
  const handleCopyLink = () => {
    if (lastCreatedId == null) return;
    const link = `${window.location.origin}${window.location.pathname}?approveId=${lastCreatedId}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  // ── Transaction runner ────────────────────────────────────────────────────────
  const runTx = async (actionFn, context) => {
    if (loadingRef.current || !address) return;
    loadingRef.current = true;
    setLoading(true); setStatus(null);
    setLoadingStep(`Preparing ${context} transaction...`);

    try {
      const result = await actionFn();
      const hash = extractHash(result);
      const idValue = resolveId(result);
      delete balanceCache[address];

      if (context === "Create" && idValue != null) setLastCreatedId(idValue);

      // Level 4: Record executed payroll in history
      if (context === "Execute" && hash) {
        try {
          const res = await treasuryClient.get_proposal({ proposal_id: parseInt(executeId, 10) });
          const proposal = res.result && typeof res.result.unwrap === "function" ? res.result.unwrap() : res.result;

          const emp = proposal.employees && proposal.employees.length > 0 ? proposal.employees[0] : "—";
          const amtStroops = proposal.amounts && proposal.amounts.length > 0 ? proposal.amounts[0].toString() : "0";
          const amtXlm = amtStroops !== "0" ? (Number(amtStroops) / 10_000_000).toString() : "0";

          setPayrollHistory(prev => [{
            employee: emp,
            amount: amtXlm,
            proposalId: executeId,
            txHash: hash,
            timestamp: new Date().toISOString(),
          }, ...prev]);
        } catch (e) {
          console.warn("Could not fetch proposal details for history:", e);
          setPayrollHistory(prev => [{
            employee: "—",
            amount: "—",
            proposalId: executeId,
            txHash: hash,
            timestamp: new Date().toISOString(),
          }, ...prev]);
        }
        // Refresh SPAY balance after a successful execution (Treasury mints 1 SPAY per payment)
        setTimeout(() => fetchSpayBalance(), 3000);
      }

      let successMsg = context === "Create" ? `Proposal Created! ID: ${idValue ?? "Check Explorer"}` : `${context} Confirmed!`;

      if (context === "Approve" && hash) {
        try {
          const res = await treasuryClient.get_proposal({ proposal_id: parseInt(approveId, 10) });
          const proposal = res.result && typeof res.result.unwrap === 'function' ? res.result.unwrap() : res.result;
          if (proposal.approvals >= 2) {
            successMsg = `2 signs are done! Release funds instantly below.`;
            setExecuteId(approveId);
          } else {
            successMsg = `1 sign done. 1 more sign needed to release funds.`;
          }
        } catch {
          // Approval state is best-effort here; the transaction already succeeded.
        }
      }

      setStatus({
        type: "success",
        msg: successMsg,
        hash,
      });

      const addr = address;
      setTimeout(() => refreshBalance(addr), 2000);
      if (context === "Create") { setDestination(""); setAmount(""); }
      if (context === "Approve") setApproveId("");
      if (context === "Execute") setExecuteId("");

    } catch (e) {
      console.error(`[TX] ${context}:`, e);
      const s = (e?.message || "").toLowerCase();
      let msg = "Transaction failed. Please try again.";
      if (s.includes("reject") || s.includes("cancel") || s.includes("user"))
        msg = "Transaction cancelled in wallet.";
      else if (s.includes("network") || s.includes("broadcast") || s.includes("send"))
        msg = "Network broadcast failed. Please try again.";
      else if (s.includes("error(contract,")) {
        const code = e.message.match(/#(\d+)/)?.[1] || "?";
        // Error codes from TreasuryError enum in the contract:
        // 1=ProposalNotFound, 2=AlreadyExecuted, 3=NotEnoughApprovals,
        // 4=MismatchedLengths, 5=EmptyPayroll, 6=AlreadyApproved
        const contractErrors = {
          "1": "Proposal ID does not exist. Please check the ID and try again.",
          "2": "Funds have already been released for this Proposal ID.",
          "3": "Cannot execute — this proposal needs 2 approvals first.",
          "4": "Invalid input: employee addresses and amounts length must match.",
          "5": "Payroll proposal must include at least one employee address.",
          "6": "ERROR: You already signed this proposal. A different wallet must provide the 2nd approval.",
          "7": "SPAY Token contract not linked. Admin must run link_spay_token first.",
        };
        msg = contractErrors[code] || `Contract Error #${code}. Check the proposal details and try again.`;
      }
      setStatus({ type: "error", msg });
    } finally {
      loadingRef.current = false;
      setLoading(false); setLoadingStep("");
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!isValidAddress(destination))
      return setStatus({ type: "error", msg: "Invalid Stellar address. Must start with G and be 56 characters." });
    if (!amount || parseFloat(amount) <= 0 || !isFinite(parseFloat(amount)))
      return setStatus({ type: "error", msg: "Please enter a valid XLM amount greater than zero." });
    if (loadingRef.current) return;
    runTx(async () => {
      const tx = await treasuryClient.create_proposal({ proposer: address, employees: [destination], amounts: [toStroops(amount)] });
      return tx.signAndSend();
    }, "Create");
  };

  const handleApprove = async () => {
    if (!isValidId(approveId)) return setStatus({ type: "error", msg: "Please enter a valid Proposal ID." });
    // Guard: don't run if a transaction is already in flight
    if (loadingRef.current) return;

    // Pre-flight: read proposal state before signing (shows user clear feedback)
    setStatus(null);
    setLoadingStep("Checking proposal status...");
    try {
      const res = await treasuryClient.get_proposal({ proposal_id: parseInt(approveId, 10) });
      const proposal = res.result && typeof res.result.unwrap === "function" ? res.result.unwrap() : res.result;

      if (proposal.executed) {
        setLoadingStep("");
        return setStatus({ type: "error", msg: "Funds have already been released for this Proposal ID." });
      }
      if (proposal.approvals >= 2) {
        setLoadingStep("");
        setExecuteId(approveId);
        return setStatus({ type: "success", msg: `2 approvals already done! Ready to release funds for ID ${approveId}.` });
      }
      const approvers = proposal.approvers || [];
      if (approvers.includes(address)) {
        setLoadingStep("");
        return setStatus({ type: "error", msg: "ERROR: You already signed this proposal. A different wallet must provide the 2nd approval." });
      }
    } catch (e) {
      // Pre-flight failed — let the contract call itself handle the error
      console.warn("Pre-flight check failed, proceeding with approve:", e);
    }
    setLoadingStep("");

    // Now run the actual approve transaction
    runTx(async () => {
      const tx = await treasuryClient.approve_proposal({ approver: address, proposal_id: parseInt(approveId, 10) });
      return tx.signAndSend();
    }, "Approve");
  };

  const handleExecute = async () => {
    if (!isValidId(executeId)) return setStatus({ type: "error", msg: "Please enter a valid Proposal ID." });
    if (loadingRef.current) return;

    setStatus(null);
    setLoadingStep("Checking proposal status...");
    try {
      const res = await treasuryClient.get_proposal({ proposal_id: parseInt(executeId, 10) });
      const proposal = res.result && typeof res.result.unwrap === "function" ? res.result.unwrap() : res.result;

      if (proposal.executed) {
        setLoadingStep("");
        return setStatus({ type: "error", msg: "Funds have already been released for this Proposal ID." });
      }
      if (proposal.approvals < 2) {
        setLoadingStep("");
        return setStatus({ type: "error", msg: "Cannot execute — this proposal needs 2 approvals first." });
      }
    } catch (e) {
      console.warn("Pre-flight check failed, proceeding with execute:", e);
    }
    setLoadingStep("");

    runTx(async () => {
      const tx = await treasuryClient.execute_proposal({ executor: address, proposal_id: parseInt(executeId, 10), token: XLM_TOKEN });
      return tx.signAndSend();
    }, "Execute");
  };

  // ── Level 4: Analytics computations ──────────────────────────────────────────
  const analytics = useMemo(() => {
    const totalPaid = payrollHistory
      .filter(p => p.amount !== "—" && !isNaN(parseFloat(p.amount)))
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalProposals = payrollHistory.length;
    const spayMinted = payrollHistory.filter(p => p.employee !== "—").length;
    const activeEmployees = new Set(
      payrollHistory.filter(p => p.employee !== "—").map(p => p.employee)
    ).size;
    return { totalPaid, totalProposals, spayMinted, activeEmployees };
  }, [payrollHistory]);

  // ── Level 4: Export CSV ──────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (payrollHistory.length === 0) return;
    const header = "Employee Address,Amount XLM,Proposal ID,TX Hash,Date & Time";
    const rows = payrollHistory.map(p =>
      `${p.employee},${p.amount},${p.proposalId},${p.txHash},${new Date(p.timestamp).toLocaleString()}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orbit-ledger-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Connect screen ────────────────────────────────────────────────────────────
  if (!address) {
    return <LandingPage connect={connect} />;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-container">

      <header className="top-nav">
        <Brand />
        <div className="wallet-actions">
          <button onClick={handleFundWallet} className="btn-fund" disabled={funding || loading}>
            <CircleDollarSign size={16} /> {funding ? "Funding..." : "Fund Wallet"}
          </button>
          <span className="wallet-pill" title={address}>{address.slice(0, 6)}...{address.slice(-4)}</span>
          <button onClick={disconnect} className="btn-disconnect" disabled={loading}><LogOut size={16} /> Disconnect</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <aside className="sidebar">

          <div className="card balance-card">
            <div className="balance-header">
              <span className="label-text">TOTAL BALANCE</span>
              <span className="badge">Testnet</span>
            </div>
            <h2 className="big-balance">{fmtBalance(balance)}</h2>
            <span className="currency">X L M</span>
            {xlmPrice?.usd && (
              <div className="usd-value">
                <div className="price-row">
                  <span className="price-flag">US</span>
                  <span>{fmtUSD(balance, xlmPrice.usd)}</span>
                  <span className="price-rate">${xlmPrice.usd.toFixed(4)}/XLM</span>
                </div>
                {xlmPrice?.inr && (
                  <div className="price-row">
                    <span className="price-flag">IN</span>
                    <span>{fmtINR(balance, xlmPrice.inr)}</span>
                    <span className="price-rate">₹{xlmPrice.inr.toFixed(2)}/XLM</span>
                  </div>
                )}
              </div>
            )}
            <div className="status-indicator">
              <span className="dot-online" />
              Wallet Connected
            </div>
          </div>

          <div className="card info-card">
            <h3 className="info-title">Protocol Overview</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-icon"><ShieldCheck size={18} /></span>
                <div><strong>Multisig Security</strong><p>Requires 2 separate wallet approvals to release funds.</p></div>
              </div>
              <div className="info-item">
                <span className="info-icon"><Zap size={18} /></span>
                <div><strong>Soroban Powered</strong><p>Network fees less than 0.003 XLM per action.</p></div>
              </div>
              <div className="info-item">
                <span className="info-icon"><Landmark size={18} /></span>
                <div><strong>Stellar Testnet</strong><p>Live on-chain, real transactions.</p></div>
              </div>
            </div>
          </div>

          {/* Level 4: SPAY Token Balance (Hidden from Bosses/Non-employees) */}
          {SPAY_CONTRACT_ID && isEmployee && (
            <div className="card spay-card">
              <div className="spay-header">
                <span className="spay-icon"><Sparkles size={18} /></span>
                <span className="label-text">SPAY TOKEN</span>
              </div>
              <h2 className="spay-balance">
                {spayLoading ? "..." : spayBalance}
              </h2>
              <span className="spay-sub">Earned from payroll executions</span>
              <button
                className="btn-refresh-spay"
                onClick={fetchSpayBalance}
                disabled={spayLoading}
                title="Refresh SPAY balance"
              >
                {spayLoading ? "Refreshing..." : <><RefreshCw size={14} /> Refresh</>}
              </button>
            </div>
          )}

        </aside>

        <section className="content-area">

          {/* ── Level 4: Analytics Stats Bar ───────────────────────── */}
          <div className="analytics-bar">
            <div className="analytics-card">
              <span className="analytics-icon"><CircleDollarSign size={20} /></span>
              <div>
                <span className="analytics-value">{analytics.totalPaid.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                <span className="analytics-label">Total Paid (XLM)</span>
              </div>
            </div>
            <div className="analytics-card">
              <span className="analytics-icon"><ClipboardList size={20} /></span>
              <div>
                <span className="analytics-value">{analytics.totalProposals}</span>
                <span className="analytics-label">Total Proposals</span>
              </div>
            </div>
            <div className="analytics-card">
              <span className="analytics-icon"><Sparkles size={20} /></span>
              <div>
                <span className="analytics-value">{analytics.spayMinted}</span>
                <span className="analytics-label">SPAY Minted</span>
              </div>
            </div>
            <div className="analytics-card">
              <span className="analytics-icon"><Users size={20} /></span>
              <div>
                <span className="analytics-value">{analytics.activeEmployees}</span>
                <span className="analytics-label">Active Employees</span>
              </div>
            </div>
          </div>

          <div className="card form-card">
            <div className="step-header">
              <span className="step-num">01</span>
              <h2 className="card-title">Draft Payment</h2>
            </div>
            <input type="text" className="styled-input" placeholder="Recipient Address (G...)" value={destination} onChange={e => setDestination(e.target.value)} disabled={loading} autoComplete="off" spellCheck={false} aria-label="Recipient Address" />
            <input type="number" className="styled-input" placeholder="Amount (XLM)" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} min="0" step="any" aria-label="Amount in XLM" />
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading || loadingStep !== ""}>
              {(loading || loadingStep !== "") && (loadingStep.toLowerCase().includes("create") || loadingStep.toLowerCase().includes("preparing") || loadingStep.toLowerCase().includes("broadcast") || loadingStep.toLowerCase().includes("wallet")) ? "Processing..." : <><Send size={16} /> Submit Proposal</>}
            </button>
            {lastCreatedId != null && (
              <div className="magic-link-box">
                <div className="magic-link-info">
                  <span className="magic-link-icon"><Copy size={18} /></span>
                  <div>
                    <strong>Proposal #{lastCreatedId} created</strong>
                    <p>Share this link with the second approver — it auto-fills their Approve form.</p>
                  </div>
                </div>
                <button className="btn-magic" onClick={handleCopyLink}>
                  {linkCopied ? <><CheckCircle2 size={14} /> Copied</> : <><Copy size={14} /> Copy Approval Link</>}
                </button>
              </div>
            )}
          </div>

          <div className="card form-card">
            <div className="step-header">
              <span className="step-num">02</span>
              <h2 className="card-title">Authorize</h2>
            </div>
            <input type="number" className="styled-input" placeholder="Enter Proposal ID to Approve" value={approveId} onChange={e => setApproveId(e.target.value)} disabled={loading} min="0" aria-label="Proposal ID to Approve" />
            <button className="btn btn-primary" onClick={handleApprove} disabled={loading || loadingStep !== ""}>
              {(loading || loadingStep !== "") ? "Processing..." : <><KeyRound size={16} /> Approve Proposal</>}
            </button>
          </div>

          <div className="card form-card">
            <div className="step-header">
              <span className="step-num">03</span>
              <h2 className="card-title">Release</h2>
            </div>
            <input type="number" className="styled-input" placeholder="Enter Proposal ID to Execute" value={executeId} onChange={e => setExecuteId(e.target.value)} disabled={loading} min="0" aria-label="Proposal ID to Execute" />
            <button className="btn btn-primary" onClick={handleExecute} disabled={loading || loadingStep !== ""}>
              {(loading || loadingStep !== "") && (loadingStep.toLowerCase().includes("execute") || loadingStep.toLowerCase().includes("checking") || loadingStep.toLowerCase().includes("preparing") || loadingStep.toLowerCase().includes("broadcast") || loadingStep.toLowerCase().includes("wallet")) ? "Processing..." : <><ArrowRight size={16} /> Release Funds</>}
            </button>
          </div>

          {loading && loadingStep && (
            <div className="status-box status-pending" role="status">
              <p>{loadingStep}</p>
            </div>
          )}

          {status && !loading && (
            <div className={`status-box status-${status.type}`} role="alert">
              <p><strong>{status.type.toUpperCase()}:</strong> {status.msg}</p>
              {status.hash && (
                <a href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`} target="_blank" rel="noreferrer noopener">
                  Verify Transaction <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}

          {/* ── Level 4: Payroll History Table ─────────────────────── */}
          <div className="card history-card">
            <div className="history-header">
              <h2 className="card-title"><FileText size={18} /> Execution Ledger</h2>
              {payrollHistory.length > 0 && (
                <button className="btn-export" onClick={handleExportCSV}><Download size={14} /> Export CSV</button>
              )}
            </div>
            {payrollHistory.length === 0 ? (
              <div className="empty-state">
                <p>No payroll history yet. Execute your first proposal.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="payroll-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Amount (XLM)</th>
                      <th>Proposal ID</th>
                      <th>TX Hash</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollHistory.map((p, i) => (
                      <tr key={i}>
                        <td title={p.employee}>
                          {p.employee.length > 12 ? `${p.employee.slice(0, 6)}...${p.employee.slice(-4)}` : p.employee}
                        </td>
                        <td>{p.amount}</td>
                        <td>#{p.proposalId}</td>
                        <td>
                          <a href={`https://stellar.expert/explorer/testnet/tx/${p.txHash}`} target="_blank" rel="noreferrer noopener" className="hash-link">
                            {p.txHash.slice(0, 8)}...{p.txHash.slice(-4)}
                          </a>
                        </td>
                        <td>{new Date(p.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
