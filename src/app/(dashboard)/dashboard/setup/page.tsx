"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspace } from "@/context/WorkspaceContext";
import toast from "react-hot-toast";

export default function CompanySetupPage() {
    const router = useRouter();
    const { refreshWorkspaces, switchWorkspace } = useWorkspace();
    const [loading, setLoading] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [cin, setCin] = useState("");
    const [gstin, setGstin] = useState("");
    const [industry, setIndustry] = useState("Technology");
    const [logo, setLogo] = useState("");

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Organization name is required.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/workspaces", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    cin: cin.trim() || undefined,
                    gstin: gstin.trim() || undefined,
                    industry,
                    logo: logo || undefined,
                }),
            });

            const json = await res.json();
            if (json.success && json.data?.organisation) {
                toast.success("Organization workspace created! 🎉");
                await refreshWorkspaces();
                
                // Switch to the newly created workspace immediately, bypassing React state flush lag
                const org = json.data.organisation;
                switchWorkspace(org.id, {
                    type: "org",
                    id: org.id,
                    name: org.name,
                    logo: org.logo || null
                });
            } else {
                throw new Error(json.message || "Failed to create organization");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F8FA] flex items-center justify-center p-4 font-poppins">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-semibold focus:outline-none"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5">
                        {/* Side Banner */}
                        <div className="md:col-span-2 bg-[#003259] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                            {/* Decorative blur */}
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#4FF3D0]/10 rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                    <Building2 className="text-[#4FF3D0]" size={24} />
                                </div>
                                <h2 className="text-xl font-bold leading-tight mb-3">
                                    Create Organisation Workspace
                                </h2>
                                <p className="text-xs text-white/70 leading-relaxed">
                                    Set up a dedicated workspace for your enterprise. Securely collaborate with your team, partition sensitive records, and manage corporate profiles.
                                </p>
                            </div>

                            <div className="mt-8 space-y-3 relative z-10">
                                <div className="flex items-center gap-2 text-[10px] text-[#4FF3D0] uppercase font-bold tracking-wider">
                                    <ShieldCheck size={14} /> Enterprise Shield
                                </div>
                                <p className="text-[10px] text-white/50 leading-snug">
                                    All corporate workspaces benefit from strict audit trails and optional multi-signatory access levels.
                                </p>
                            </div>
                        </div>

                        {/* Setup Form */}
                        <form onSubmit={handleCreateWorkspace} className="md:col-span-3 p-8 flex flex-col gap-5 bg-white">
                            <div>
                                <h3 className="text-lg font-bold text-[#003259]">Workspace Details</h3>
                                <p className="text-xs text-gray-400">Fill in your organization identification information</p>
                            </div>

                            {/* Name input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Organization Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Acme Corporation"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-sm transition-all bg-gray-50/50"
                                />
                              </div>

                            {/* Industry choice */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Industry Vertical
                                </label>
                                <select
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-sm bg-white transition-all"
                                >
                                    <option value="Technology">Technology & SaaS</option>
                                    <option value="Healthcare">Healthcare & Bio</option>
                                    <option value="Finance">Finance & Banking</option>
                                    <option value="Education">Education & EdTech</option>
                                    <option value="Retail">Retail & E-commerce</option>
                                    <option value="Other">Other Category</option>
                                </select>
                            </div>

                            {/* CIN & GSTIN in grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        CIN (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={cin}
                                        onChange={(e) => setCin(e.target.value)}
                                        placeholder="U12345DL2024PTC123"
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-xs transition-all bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        GSTIN (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={gstin}
                                        onChange={(e) => setGstin(e.target.value)}
                                        placeholder="07AAAAA1111A1Z1"
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-xs transition-all bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            {/* Custom logo option preset */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Logo URL / Icon Preset
                                </label>
                                <input
                                    type="url"
                                    value={logo}
                                    onChange={(e) => setLogo(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-xs transition-all bg-gray-50/50"
                                />
                            </div>

                            {/* Create Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#0B76FF] hover:bg-[#0050CC] text-white rounded-xl h-11 font-bold transition-all shadow-lg shadow-blue-500/20 mt-4 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} /> Creating Workspace...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} /> Create Workspace
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
