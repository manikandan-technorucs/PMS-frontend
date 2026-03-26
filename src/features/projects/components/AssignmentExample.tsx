/**
 * AssignmentExample.tsx
 *
 * Reference component showing how to extract MSAL token claims
 * (user email + display name) and send them in the POST body
 * when assigning a user to a project.
 *
 * This prevents "Unassigned" labels in the DB by ensuring
 * user_id, user_email, and project_id are always populated.
 */

import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { api } from '@/api/axiosInstance';

interface AssignmentExampleProps {
  projectId: number;
  onAssigned?: () => void;
}

export function AssignmentExample({ projectId, onAssigned }: AssignmentExampleProps) {
  const { accounts } = useMsal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Extract MSAL identity claims from the active account.
   *
   * idTokenClaims is populated after SSO login and contains:
   *   - emails[0]  → the user's primary email
   *   - name       → the user's display name
   *   - oid        → the Microsoft Object ID (user_id for audit)
   */
  const activeAccount = accounts[0];

  const userEmail: string =
    (activeAccount?.idTokenClaims as any)?.emails?.[0]   // preferred: from id_token
    ?? activeAccount?.username                             // fallback: UPN / email
    ?? '';

  const userName: string =
    (activeAccount?.idTokenClaims as any)?.name
    ?? activeAccount?.name
    ?? '';

  const userId: number | null =
    activeAccount ? Number((activeAccount.idTokenClaims as any)?.oid ?? activeAccount.localAccountId) || null : null;

  const handleAssign = async () => {
    if (!userId || !userEmail) {
      setError('Cannot determine user identity from MSAL. Please re-login.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      /**
       * POST /projects/{projectId}/users
       *
       * The backend expects a JSON body matching ProjectUserCreate:
       *   { user_id: int, user_email: str, project_id: int }
       *
       * This ensures all three fields are validated server-side
       * via @field_validator and never arrive as null/empty.
       */
      await api.post(`/projects/${projectId}/users`, {
        user_id: userId,
        user_email: userEmail,
        project_id: projectId,
      });

      onAssigned?.();
    } catch (err: any) {
      console.error('[AssignmentExample] Assignment failed:', err);
      setError(err?.response?.data?.detail || 'Failed to assign user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm space-y-3">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
        MSAL Assignment Demo
      </h3>

      <div className="text-xs space-y-1 text-slate-500 dark:text-slate-400">
        <p><strong>Email (from idTokenClaims):</strong> {userEmail || '—'}</p>
        <p><strong>Name (from idTokenClaims):</strong> {userName || '—'}</p>
        <p><strong>User ID (oid):</strong> {userId ?? '—'}</p>
        <p><strong>Project ID:</strong> {projectId}</p>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}

      <button
        onClick={handleAssign}
        disabled={loading || !userId}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-teal-600 text-white
                   hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        {loading ? 'Assigning...' : 'Assign Me to Project'}
      </button>
    </div>
  );
}
