"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Mail, Check, X, Building2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Invitation {
  orgId: string;
  name: string;
  logo: string | null;
  industry: string | null;
  role: string;
  invitedAt: string;
}

export function InvitationsBanner() {
  const { refreshWorkspaces } = useWorkspace();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces/invitations");
      const json = await res.json();
      if (json.success && json.data?.invitations) {
        setInvitations(json.data.invitations);
      }
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleAccept = async (orgId: string, orgName: string) => {
    setActioningId(orgId);
    const loadId = toast.loading(`Accepting invitation to ${orgName}...`);
    try {
      const res = await fetch(`/api/workspaces/${orgId}/accept`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Welcome to ${orgName}!`, { id: loadId });
        await fetchInvitations();
        await refreshWorkspaces();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invitation", { id: loadId });
    } finally {
      setActioningId(null);
    }
  };

  const handleDecline = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to decline the invitation to join ${orgName}?`)) return;
    setActioningId(orgId);
    const loadId = toast.loading(`Declining invitation...`);
    try {
      const res = await fetch(`/api/workspaces/${orgId}/decline`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Invitation declined`, { id: loadId });
        await fetchInvitations();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to decline invitation", { id: loadId });
    } finally {
      setActioningId(null);
    }
  };

  if (loading) return null;
  if (invitations.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {invitations.map((invite) => (
          <motion.div
            key={invite.orgId}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 backdrop-blur-md border border-blue-100 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-200/50 shadow-sm shrink-0">
                  <Mail size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#003259]">
                    Workspace Invitation
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    You have been invited to join <strong className="text-blue-700 font-semibold">{invite.name}</strong> ({invite.industry || "General"}) as a <strong className="uppercase text-[10px] bg-blue-100/80 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold tracking-wide">{invite.role}</strong>.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                <button
                  disabled={actioningId !== null}
                  onClick={() => handleDecline(invite.orgId, invite.name)}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actioningId === invite.orgId ? (
                    <RefreshCw className="animate-spin" size={13} />
                  ) : (
                    <X size={13} />
                  )}
                  Decline
                </button>
                <button
                  disabled={actioningId !== null}
                  onClick={() => handleAccept(invite.orgId, invite.name)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actioningId === invite.orgId ? (
                    <RefreshCw className="animate-spin" size={13} />
                  ) : (
                    <Check size={13} />
                  )}
                  Accept & Join
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
