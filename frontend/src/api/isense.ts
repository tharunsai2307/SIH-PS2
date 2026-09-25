/**
 * ISense API Service Layer
 * Communicates with the FastAPI backend
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ExtractedRequirements {
  product: string | null;
  application: string | null;
  safety_required: boolean;
  testing_required: boolean;
  certification_required: boolean;
  specific_standards: string[];
  technical_keywords: string[];
  ambiguities: string[];
}

export interface StandardResponse {
  id: string;
  is_number: string;
  title: string;
  year: number | null;
  product_type: string | null;
  status: string;
  scope: string | null;
  requirements: Record<string, string> | null;
  testing_requirements: Record<string, string> | null;
  certification_scheme: Record<string, unknown> | null;
  amendments: Array<Record<string, string>> | null;
  source_url: string | null;
  source_reference: string | null;
  confidence_level: string;
  keywords: string[] | null;
}

export interface EvidenceItem {
  standard_number: string;
  claim: string;
  source: string | null;
  confidence: string;
}

export interface RecommendedStandard {
  standard: StandardResponse;
  relevance_score: number;
  relevance_label: string;
  reason: string;
  relationship_type: string | null;
  evidence: EvidenceItem[];
}

export interface CoverageItem {
  category: string;
  status: "FOUND" | "MISSING" | "INSUFFICIENT" | "REVIEW";
  standard: string | null;
  note: string | null;
}

export interface GapItem {
  category: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  suggestion: string | null;
}

export interface AnalyzeResponse {
  specification_summary: string;
  extracted_requirements: ExtractedRequirements;
  primary_standard: RecommendedStandard | null;
  related_standards: RecommendedStandard[];
  coverage: CoverageItem[];
  gaps: GapItem[];
  explanation: string;
  processing_status: "FOUND" | "MANUAL_REVIEW" | "NOT_FOUND";
  disclaimer: string;
}

export interface StandardSummary {
  id: string;
  is_number: string;
  title: string;
  year: number | null;
  product_type: string | null;
  status: string;
  confidence_level: string;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
  database: string;
  ai_configured: boolean;
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  analyze: (specification: string) =>
    fetchJson<AnalyzeResponse>("/api/v1/analyze", {
      method: "POST",
      body: JSON.stringify({ specification }),
    }),

  listStandards: () => fetchJson<StandardSummary[]>("/api/v1/standards"),

  getStandard: (isNumber: string) =>
    fetchJson<StandardResponse>(`/api/v1/standards/${isNumber}`),

  health: () => fetchJson<HealthResponse>("/api/v1/health"),
};
