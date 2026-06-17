"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Building2, User, Users, ShieldAlert, Plus, Trash2, Edit, Save, RefreshCw, Key, FileText, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import toast from "react-hot-toast";

interface Member {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  status: "PENDING" | "ACTIVE";
  joinedAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  targetId: string | null;
  metadata: any;
  ip: string | null;
  createdAt: string;
  actor: {
    name: string;
    email: string;
  };
}

export default function WorkspaceSettingsPage() {
  const { activeWorkspace, refreshWorkspaces } = useWorkspace();
  const isOrg = activeWorkspace?.type === "org";
  const userRole = activeWorkspace?.role;
  const isAdminOrOwner = userRole === "OWNER" || userRole === "ADMIN";

  const [activeTab, setActiveTab] = useState<"workspace" | "members" | "audit">("workspace");

  useEffect(() => {
    if (isOrg && !isAdminOrOwner) {
      setActiveTab("members");
    }
  }, [activeWorkspace, isOrg, isAdminOrOwner]);

  // General Settings States
  const [orgName, setOrgName] = useState("");
  const [cin, setCin] = useState("");
  const [gstin, setGstin] = useState("");
  const [industry, setIndustry] = useState("");
  const [logo, setLogo] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Members States
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("VIEWER");
  const [inviting, setInviting] = useState(false);

  // Audit Logs States
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (activeWorkspace) {
      headers["X-Workspace-Context"] = activeWorkspace.type === "personal" ? "personal" : `org:${activeWorkspace.id}`;
    }
    return headers;
  }, [activeWorkspace]);

  const fetchWorkspaceDetails = useCallback(async () => {
    if (!isOrg || !activeWorkspace) return;
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data?.organisation) {
        const org = json.data.organisation;
        setOrgName(org.name || "");
        setCin(org.cin || "");
        setGstin(org.gstin || "");
        setIndustry(org.industry || "Technology");
        setLogo(org.logo || "");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load workspace details");
    } finally {
      setLoadingDetails(false);
    }
  }, [activeWorkspace, isOrg, getHeaders]);

  const fetchMembers = useCallback(async () => {
    if (!isOrg || !activeWorkspace) return;
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/members`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data?.members) {
        setMembers(json.data.members);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load team members");
    } finally {
      setLoadingMembers(false);
    }
  }, [activeWorkspace, isOrg, getHeaders]);

  const fetchAuditLogs = useCallback(async () => {
    if (!isOrg || !activeWorkspace) return;
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/audit-logs`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data?.auditLogs) {
        setAuditLogs(json.data.auditLogs);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load audit logs");
    } finally {
      setLoadingLogs(false);
    }
  }, [activeWorkspace, isOrg, getHeaders]);

  // Fetch workspace details only when workspace changes
  useEffect(() => {
    if (activeWorkspace && isOrg) {
      fetchWorkspaceDetails();
    }
  }, [activeWorkspace?.id, isOrg, fetchWorkspaceDetails]);

  // Fetch members when workspace changes or members tab is loaded
  useEffect(() => {
    if (activeWorkspace && isOrg && activeTab === "members") {
      fetchMembers();
    }
  }, [activeWorkspace?.id, activeTab, isOrg, fetchMembers]);

  // Fetch audit logs when workspace changes or audit tab is loaded
  useEffect(() => {
    if (activeWorkspace && isOrg && activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeWorkspace?.id, activeTab, isOrg, fetchAuditLogs]);

  // Save General details handler
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          name: orgName,
          cin,
          gstin,
          industry,
          logo,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Workspace updated successfully");
        await refreshWorkspaces();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update workspace");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Invite member handler
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspace) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/invite`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        fetchMembers();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  // Update member role handler
  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    if (!activeWorkspace) return;
    const loadId = toast.loading("Updating role...");
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/members`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ userId: targetUserId, role: newRole }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Member role updated", { id: loadId });
        fetchMembers();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update role", { id: loadId });
    }
  };

  // Remove member handler
  const handleRemoveMember = async (targetUserId: string) => {
    if (!activeWorkspace || !confirm("Are you sure you want to remove this member?")) return;
    const loadId = toast.loading("Removing member...");
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/members?userId=${targetUserId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Member removed", { id: loadId });
        fetchMembers();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member", { id: loadId });
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-[#003259] font-poppins">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <p className="font-semibold text-sm">Loading workspace settings...</p>
        </div>
      </div>
    );
  }

  // Personal space styling
  if (!isOrg) {
    return (
      <div className="max-w-4xl mx-auto p-6 font-poppins">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#003259]">Workspace Settings</h1>
              <p className="text-sm text-gray-500">Manage your personal space and vault settings</p>
            </div>
          </div>

          <Card className="border border-gray-100 rounded-3xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/20 p-6 border-b border-gray-50">
              <CardTitle className="text-lg font-bold text-[#003259]">Personal Space</CardTitle>
              <CardDescription>
                You are currently in your personal sandbox space. All documents, databases, and lockers in this space are exclusively yours.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                <ShieldAlert className="shrink-0 mt-0.5" size={20} />
                <div className="text-xs space-y-1.5 leading-relaxed">
                  <p className="font-bold">Team Collaboration Limit</p>
                  <p>
                    Personal spaces do not support inviting external team members or delegating permissions. If you need corporate features like audit trails, CIN registration, and shared document lockers, please use the sidebar to create an <strong>Organisation Workspace</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Organisation Settings
  return (
    <div className="max-w-6xl mx-auto p-6 font-poppins text-gray-800">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#003259]">{activeWorkspace.name} Settings</h1>
              <p className="text-sm text-gray-500">Configure corporate identifiers, manage members, and view logs</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
          {isAdminOrOwner && (
            <button
              onClick={() => setActiveTab("workspace")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "workspace"
                  ? "border-[#0B76FF] text-[#0B76FF]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Building2 size={16} />
              Workspace Details
            </button>
          )}
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "members"
                ? "border-[#0B76FF] text-[#0B76FF]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Users size={16} />
            Team Members
          </button>
          {isAdminOrOwner && (
            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "audit"
                  ? "border-[#0B76FF] text-[#0B76FF]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Activity size={16} />
              Audit Logs
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {activeTab === "workspace" && (
              <motion.div
                key="workspace-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-gray-100 rounded-3xl shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                    <CardTitle className="text-lg font-bold text-[#003259]">Organization Information</CardTitle>
                    <CardDescription>
                      Manage corporate identification numbers, visual identity, and industry details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loadingDetails ? (
                      <div className="flex items-center justify-center py-10">
                        <RefreshCw className="animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <form onSubmit={handleSaveDetails} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Organization Name
                            </label>
                            <input
                              type="text"
                              required
                              value={orgName}
                              onChange={(e) => setOrgName(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-sm transition-all"
                            />
                          </div>

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

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Corporate Identification Number (CIN)
                            </label>
                            <input
                              type="text"
                              value={cin}
                              onChange={(e) => setCin(e.target.value)}
                              placeholder="U12345DL2024PTC123"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-sm transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              GSTIN Registration
                            </label>
                            <input
                              type="text"
                              value={gstin}
                              onChange={(e) => setGstin(e.target.value)}
                              placeholder="07AAAAA1111A1Z1"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-sm transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Logo URL / Icon Preset
                          </label>
                          <input
                            type="url"
                            value={logo}
                            onChange={(e) => setLogo(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-sm transition-all"
                          />
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                          <Button type="submit" className="bg-[#0B76FF] text-white hover:bg-[#0B76FF]/90 font-bold gap-2">
                            <Save size={16} />
                            Save Workspace details
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "members" && (
              <motion.div
                key="members-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Invite Form Card */}
                {isAdminOrOwner && (
                  <Card className="border border-gray-100 rounded-3xl shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                      <CardTitle className="text-lg font-bold text-[#003259]">Invite New Member</CardTitle>
                      <CardDescription>Add coworkers to collaborate on corporate RAG indexing and lockers.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handleInviteMember} className="flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 space-y-1.5 w-full">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="coworker@company.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-sm transition-all"
                          />
                        </div>

                        <div className="w-full md:w-48 space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Assigned Role
                          </label>
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as any)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B76FF] focus:ring-2 focus:ring-[#0B76FF]/10 outline-none text-sm bg-white transition-all"
                          >
                            <option value="VIEWER">Viewer (Read-only)</option>
                            <option value="EDITOR">Editor (Create/Edit Docs)</option>
                            <option value="ADMIN">Admin (Manage Workspace)</option>
                          </select>
                        </div>

                        <Button
                          type="submit"
                          disabled={inviting}
                          className="bg-[#003259] text-white hover:bg-[#003259]/90 font-bold gap-2 py-2.5 h-10 w-full md:w-auto"
                        >
                          {inviting ? (
                            <RefreshCw className="animate-spin" size={16} />
                          ) : (
                            <Plus size={16} />
                          )}
                          Send Invitation
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Members List Card */}
                <Card className="border border-gray-100 rounded-3xl shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-[#003259]">Active Members</CardTitle>
                      <CardDescription>Verify privileges, audit roles, and revoke memberships.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loadingMembers ? (
                      <div className="flex items-center justify-center py-10">
                        <RefreshCw className="animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <th className="pb-3 font-semibold">User</th>
                              <th className="pb-3 font-semibold">Role</th>
                              <th className="pb-3 font-semibold">Status</th>
                              <th className="pb-3 font-semibold">Joined At</th>
                              <th className="pb-3 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {members.map((m) => (
                              <tr key={m.userId} className="hover:bg-gray-50/30 transition-colors">
                                <td className="py-4 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                                    {m.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800">{m.name}</p>
                                    <p className="text-xs text-gray-400">{m.email}</p>
                                  </div>
                                </td>
                                <td className="py-4">
                                  {m.role === "OWNER" ? (
                                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                                      Owner
                                    </span>
                                  ) : isAdminOrOwner ? (
                                    <select
                                      value={m.role}
                                      onChange={(e) => handleUpdateRole(m.userId, e.target.value)}
                                      className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-blue-500"
                                    >
                                      <option value="ADMIN">Admin</option>
                                      <option value="EDITOR">Editor</option>
                                      <option value="VIEWER">Viewer</option>
                                    </select>
                                  ) : (
                                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gray-50 text-gray-600 border border-gray-150 uppercase tracking-wide">
                                      {m.role}
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 font-semibold text-xs">
                                  {m.status === "PENDING" ? (
                                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                                      Pending
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                      Active
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 text-xs text-gray-400">
                                  {new Date(m.joinedAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 text-right">
                                  {m.role !== "OWNER" && isAdminOrOwner && (
                                    <button
                                      onClick={() => handleRemoveMember(m.userId)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title={m.status === "PENDING" ? "Cancel Invitation" : "Remove Member"}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "audit" && (
              <motion.div
                key="audit-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-gray-100 rounded-3xl shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-[#003259]">Compliance Audit Logs</CardTitle>
                      <CardDescription>Immutable record of locker accesses, doc deletions, and configurations.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loadingLogs ? (
                      <div className="flex items-center justify-center py-10">
                        <RefreshCw className="animate-spin text-blue-500" />
                      </div>
                    ) : auditLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Activity size={32} className="stroke-1 mb-2" />
                        <p className="text-xs">No logs recorded yet. Changes will be audited automatically.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {auditLogs.map((log) => (
                          <div key={log.id} className="flex gap-4 p-3 hover:bg-gray-50/50 rounded-xl border border-gray-50 transition-colors">
                            <div className="mt-1 flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-500">
                              <FileText size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <p className="text-xs font-bold text-gray-800">
                                  <span className="text-[#0B76FF] font-mono mr-1.5">[{log.action}]</span>
                                  by {log.actor.name} ({log.actor.email})
                                </p>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {log.metadata && (
                                <pre className="mt-1.5 p-2 bg-gray-50 rounded-lg text-[10px] font-mono text-gray-500 overflow-x-auto max-w-full">
                                  {JSON.stringify(log.metadata)}
                                </pre>
                              )}
                              {log.ip && (
                                <p className="text-[10px] text-gray-400 mt-1">IP: {log.ip}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
