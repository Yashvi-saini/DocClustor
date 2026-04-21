"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Lock, Unlock, FileText, File as FileIcon,
    FileSpreadsheet, Image as ImageIcon, Music, Trash2,
    Download, Eye, ShieldCheck, ShieldAlert, KeyRound,
    Upload, AlertCircle, Delete, Fingerprint, Files,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../../dashboard/context/DashboardContext";
import toast from "react-hot-toast";
import { format } from "date-fns";

const PIN_KEY = "locker_pin";

// ── File icon badge (consistent with project)
function FileBadge({ type }: { type: string }) {
    const map: Record<string, { bg: string; text: string; Icon: React.ComponentType<{ size?: number; className?: string }> }> = {
        PDF:   { bg: "bg-red-50",    text: "text-red-500",    Icon: FileText },
        Word:  { bg: "bg-blue-50",   text: "text-blue-500",   Icon: FileIcon },
        Excel: { bg: "bg-green-50",  text: "text-green-500",  Icon: FileSpreadsheet },
        Image: { bg: "bg-purple-50", text: "text-purple-500", Icon: ImageIcon },
        Music: { bg: "bg-orange-50", text: "text-orange-500", Icon: Music },
    };
    const { bg, text, Icon } = map[type] ?? { bg: "bg-gray-100", text: "text-gray-400", Icon: FileIcon };
    return <div className={`p-2 ${bg} rounded-md`}><Icon size={20} className={text} /></div>;
}

// ── PIN dots row
function PinDots({ pin }: { pin: string }) {
    return (
        <div className="flex gap-3 justify-center my-2">
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    animate={pin[i] ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.15 }}
                    className={`w-14 h-14 rounded-md border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                        pin[i]
                            ? "border-[#018FFF] bg-[#018FFF] text-white shadow-lg shadow-[#018FFF]/25"
                            : "border-gray-200 bg-white text-transparent"
                    }`}
                >
                    {pin[i] ? "●" : ""}
                </motion.div>
            ))}
        </div>
    );
}

// ── Keypad
function Keypad({ onPress, onDelete }: { onPress: (n: string) => void; onDelete: () => void }) {
    const rows = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];
    return (
        <div className="space-y-2 w-full max-w-[220px] mx-auto">
            {rows.map((row, ri) => (
                <div key={ri} className="grid grid-cols-3 gap-2">
                    {row.map((k, ki) => {
                        if (k === "") return <div key={ki} />;
                        const isDel = k === "⌫";
                        return (
                            <motion.button
                                key={ki}
                                whileTap={{ scale: 0.91 }}
                                onClick={() => isDel ? onDelete() : onPress(k)}
                                className={`h-12 rounded-md text-sm font-bold border transition-colors shadow-sm ${
                                    isDel
                                        ? "border-red-100 bg-red-50 text-red-400 hover:bg-red-100"
                                        : "border-gray-100 bg-gray-50 text-[#003259] hover:bg-[#E0F2FE] hover:border-[#018FFF]/30"
                                }`}
                            >
                                {isDel ? <Delete size={15} className="mx-auto" /> : k}
                            </motion.button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

// ── Left branding panel for PIN screens
function LockerBrand({ isSetup }: { isSetup?: boolean }) {
    const features = [
        { icon: <ShieldCheck size={16} className="text-[#018FFF]" />, text: "AES-256 file encryption" },
        { icon: <KeyRound    size={16} className="text-[#018FFF]" />, text: "PIN stored locally, never shared" },
        { icon: <Fingerprint size={16} className="text-[#018FFF]" />, text: "Access gated by your private PIN" },
        { icon: <Files       size={16} className="text-[#018FFF]" />, text: "Supports PDF, Word, Excel, Images" },
    ];
    return (
        <div className="hidden md:flex flex-1 w-1/2 flex-col justify-between bg-gradient-to-br from-[#003259] via-[#00427a] to-[#005099] rounded-lg p-8 text-white min-h-[420px]">
            {/* Badge */}
            <div>
                <h2 className="text-2xl font-bold leading-snug mb-2">
                    {isSetup ? "Set up your\nPrivate Locker" : "Your Private\nEncrypted Locker"}
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                    {isSetup
                        ? "Create a 4-digit PIN to protect your most sensitive documents. Only you can access them."
                        : "Enter your PIN to unlock your secure vault and access your encrypted files."}
                </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3 mt-8">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                        <div className="w-7 h-7 rounded-sm bg-white/10 flex items-center justify-center shrink-0">
                            {f.icon}
                        </div>
                        {f.text}
                    </div>
                ))}
            </div>

            {/* Bottom label */}
            <div className="mt-8 pt-6 border-t border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/30">
                DocClustor · Secure Vault
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
export function LockerUI() {
    const { addFile, lockedFiles, deleteFile } = useDashboard();
    const fileInputRef = useRef<HTMLInputElement>(null);

    type View = "setup" | "confirm" | "enter" | "vault";
    const [view, setView]       = useState<View>("enter");
    const [mounted, setMounted] = useState(false);

    const [newPin,     setNewPin]     = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [enterPin,   setEnterPin]   = useState("");
    const [savedPin,   setSavedPin]   = useState<string | null>(null);

    const [pinError,      setPinError]      = useState("");
    const [mismatchError, setMismatchError] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(PIN_KEY);
        setSavedPin(stored);
        setView(stored ? "enter" : "setup");
        setMounted(true);
    }, []);

    const triggerError = (msg: string, reset: () => void) => {
        setPinError(msg);
        setTimeout(() => { setPinError(""); reset(); }, 1000);
    };

    // handlers ─────────────────────────────────────
    const handleSetup = (n: string) => {
        if (newPin.length < 4) {
            const next = newPin + n;
            setNewPin(next);
            if (next.length === 4) setTimeout(() => setView("confirm"), 300);
        }
    };

    const handleConfirm = (n: string) => {
        if (confirmPin.length < 4) {
            const next = confirmPin + n;
            setConfirmPin(next);
            if (next.length === 4) {
                setTimeout(() => {
                    if (next === newPin) {
                        localStorage.setItem(PIN_KEY, next);
                        setSavedPin(next);
                        toast.success("Locker PIN created! 🔐");
                        setNewPin(""); setConfirmPin("");
                        setView("vault");
                    } else {
                        setMismatchError(true);
                        toast.error("PINs don't match");
                        setTimeout(() => {
                            setMismatchError(false);
                            setConfirmPin(""); setNewPin("");
                            setView("setup");
                        }, 900);
                    }
                }, 300);
            }
        }
    };

    const handleEnter = (n: string) => {
        if (enterPin.length < 4) {
            const next = enterPin + n;
            setEnterPin(next);
            if (next.length === 4) {
                setTimeout(() => {
                    if (next === savedPin) {
                        toast.success("Access granted ✅");
                        setEnterPin("");
                        setView("vault");
                    } else {
                        triggerError("Incorrect PIN – try again", () => setEnterPin(""));
                        toast.error("Incorrect PIN");
                    }
                }, 300);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            addFile(file, true);
            toast.success(`"${file.name}" encrypted & saved`);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleReset = () => {
        localStorage.removeItem(PIN_KEY);
        setSavedPin(null);
        setEnterPin(""); setNewPin(""); setConfirmPin("");
        setView("setup");
        toast("PIN cleared — set a new one", { icon: "🔑" });
    };

    if (!mounted) return null;

    // ── shared PIN panel (right side) wrapper
    const PinPanel = ({
        title, subtitle, children, error, errorMsg,
    }: {
        title: string; subtitle: string;
        children: React.ReactNode;
        error?: boolean; errorMsg?: string;
    }) => (
        <div className={`flex-1 w-1/2 bg-white rounded-lg border shadow-sm p-7 flex flex-col gap-5 transition-all ${error ? "border-red-300 shadow-red-100" : "border-gray-100"}`}>
            <div>
                <h3 className="text-xl font-bold text-[#003259] mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{subtitle}</p>
            </div>
            {children}
            {error && errorMsg && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-500 text-sm font-semibold px-4 py-2.5 rounded-md"
                >
                    <AlertCircle size={15} /> {errorMsg}
                </motion.div>
            )}
        </div>
    );

    return (
        <div className="w-full space-y-6">

            {/* ── Page heading row */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#003259] font-poppins">
                        {view === "vault" ? "Encrypted Locker" : view === "setup" ? "Create Locker PIN" : view === "confirm" ? "Confirm PIN" : "Unlock Locker"}
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        {view === "vault"
                            ? `${lockedFiles.length} file${lockedFiles.length !== 1 ? "s" : ""} stored securely`
                            : "Secure your private files with a 4-digit PIN"}
                    </p>
                </div>
                {view === "vault" && (
                    <button
                        onClick={() => { setEnterPin(""); setView("enter"); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-sm font-bold text-gray-500 hover:border-[#018FFF] hover:text-[#018FFF] transition-all"
                    >
                        <Lock size={14} /> Lock Vault
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">

                {/* ══ SETUP PIN ══════════════════════════════════════ */}
                {view === "setup" && (
                    <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }}>
                        {/* progress bar */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex items-center gap-1.5">
                                <div className="w-7 h-7 rounded-full bg-[#018FFF] text-white text-xs font-bold flex items-center justify-center">1</div>
                                <span className="text-xs font-semibold text-[#018FFF]">Create PIN</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-gray-200 rounded max-w-[80px]" />
                            <div className="flex items-center gap-1.5 opacity-40">
                                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">2</div>
                                <span className="text-xs font-semibold text-gray-400">Confirm PIN</span>
                            </div>
                        </div>

                        <div className="flex gap-5 items-stretch">
                            <LockerBrand isSetup />
                            <PinPanel
                                title="Create your 4-digit PIN"
                                subtitle="This PIN will be required every time you open your locker."
                            >
                                <PinDots pin={newPin} />
                                <Keypad
                                    onPress={handleSetup}
                                    onDelete={() => setNewPin(p => p.slice(0, -1))}
                                />
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-md mt-1">
                                    <KeyRound size={13} className="text-[#018FFF] shrink-0" />
                                    PIN is stored only in your browser — never uploaded
                                </div>
                            </PinPanel>
                        </div>
                    </motion.div>
                )}

                {/* ══ CONFIRM PIN ════════════════════════════════════ */}
                {view === "confirm" && (
                    <motion.div key="confirm" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex items-center gap-1.5">
                                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center">✓</div>
                                <span className="text-xs font-semibold text-emerald-600">Create PIN</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-[#018FFF] rounded max-w-[80px]" />
                            <div className="flex items-center gap-1.5">
                                <div className="w-7 h-7 rounded-full bg-[#018FFF] text-white text-xs font-bold flex items-center justify-center">2</div>
                                <span className="text-xs font-semibold text-[#018FFF]">Confirm PIN</span>
                            </div>
                        </div>

                        <div className="flex gap-5 items-stretch">
                            <LockerBrand isSetup />
                            <PinPanel
                                title="Confirm your PIN"
                                subtitle="Re-enter the same 4-digit PIN to verify."
                                error={mismatchError}
                                errorMsg="PINs don't match — restarting from step 1"
                            >
                                <PinDots pin={confirmPin} />
                                <Keypad
                                    onPress={handleConfirm}
                                    onDelete={() => setConfirmPin(p => p.slice(0, -1))}
                                />
                                <button
                                    onClick={() => { setView("setup"); setConfirmPin(""); setNewPin(""); }}
                                    className="text-xs text-gray-400 hover:text-[#018FFF] transition-colors text-left w-fit underline"
                                >
                                    ← Back to step 1
                                </button>
                            </PinPanel>
                        </div>
                    </motion.div>
                )}

                {/* ══ ENTER PIN ══════════════════════════════════════ */}
                {view === "enter" && (
                    <motion.div key="enter" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }}>
                        <div className="flex gap-5 items-stretch">
                            <LockerBrand />
                            <PinPanel
                                title={pinError ? "Access Denied" : "Enter your Locker PIN"}
                                subtitle={pinError ? pinError : "Your encrypted files are locked behind your PIN."}
                                error={!!pinError}
                                errorMsg={pinError}
                            >
                                <motion.div animate={pinError ? { x: [-6, 6, -6, 6, 0] } : {}} transition={{ duration: 0.35 }}>
                                    <PinDots pin={enterPin} />
                                </motion.div>
                                <Keypad
                                    onPress={handleEnter}
                                    onDelete={() => setEnterPin(p => p.slice(0, -1))}
                                />
                                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                                    <span className="flex items-center gap-1.5">
                                        <KeyRound size={12} className="text-[#018FFF]" /> End-to-end encrypted
                                    </span>
                                    <button onClick={handleReset} className="text-gray-400 hover:text-red-500 underline transition-colors">
                                        Forgot PIN? Reset
                                    </button>
                                </div>
                            </PinPanel>
                        </div>
                    </motion.div>
                )}

                {/* ══ VAULT ══════════════════════════════════════════ */}
                {view === "vault" && (
                    <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="w-full space-y-6">
                        
                        {/* Exact match to home page UploadSection */}
                        <div className="w-full">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-3 border-[#1E9BFF] bg-[#E0F2FE] hover:bg-[#D0EBFF]"
                            >
                                <div className="flex items-center gap-3 pointer-events-none">
                                    <Upload className="text-[#003259] transition-transform" size={24} />
                                    <span className="text-[#003259] font-bold text-lg font-poppins">
                                        Upload file to Locker (Click or Drop)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Exact match to home page RecentFilesSection */}
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-4 mt-8">
                                <h2 className="text-xl font-bold font-poppins text-black">Encrypted Files</h2>
                            </div>

                            {lockedFiles.length === 0 ? (
                                <div className="w-full text-center p-8 text-gray-500 bg-white rounded-xl">
                                    No encrypted files yet. Upload a file above to keep it secure.
                                </div>
                            ) : (
                                <div className="space-y-3 pb-4">
                                    {lockedFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <FileBadge type={file.type} />
                                                <div className="flex flex-col">
                                                    <h3 className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-md">{file.name}</h3>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {file.type} • {file.size} • {format(file.createdAt, "dd MMM yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <button onClick={() => window.open(file.url, "_blank")} className="p-2 text-gray-400 hover:text-[#018FFF] transition-all" title="Preview"><Eye size={18} /></button>
                                                <button onClick={() => { const a = document.createElement("a"); a.href = file.url; a.download = file.name; document.body.appendChild(a); a.click(); document.body.removeChild(a); }} className="p-2 text-gray-400 hover:text-emerald-500 transition-all" title="Download"><Download size={18} /></button>
                                                <button onClick={() => { deleteFile(file.id); toast.success("File removed"); }} className="p-2 text-gray-400 hover:text-red-500 transition-all" title="Delete"><Trash2 size={18} /></button>
                                                <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                                                <Lock size={15} className="text-[#018FFF] ml-1" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
