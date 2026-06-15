import { WorkspaceContext } from '../types/api.types';
import { getDocuments } from './document.service';

export interface RagQueryInput {
  question: string;
  workspaceContext: WorkspaceContext;
}

export interface RagQueryOutput {
  answer: string;
  sources: Array<{ documentId: string; title: string; snippet: string }>;
}

export async function queryRag(input: RagQueryInput): Promise<RagQueryOutput> {
  const { question, workspaceContext } = input;

  const authorizedDocs = await getDocuments(workspaceContext, true);

  if (authorizedDocs.length === 0) {
    return {
      answer: 'No accessible documents found in this workspace. Please upload documents first.',
      sources: [],
    };
  }

  return {
    answer: `[RAG Multi-Tenant Shield Active] You asked: "${question}" in workspace context: ${
      workspaceContext.type === 'personal' ? 'Personal' : `Organization (${workspaceContext.orgId})`
    }. AI analyzed ${authorizedDocs.length} authorized documents.`,
    sources: authorizedDocs.slice(0, 3).map((doc) => ({
      documentId: doc.id,
      title: doc.title,
      snippet: doc.content.substring(0, 200),
    })),
  };
}
