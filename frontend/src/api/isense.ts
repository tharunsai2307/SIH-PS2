/**
 * ISense API Service Layer — Bureau of Indian Standards (BIS) Integration
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

export interface StandardClause {
  clause: string;
  title: string;
  requirement: string;
}

export interface StandardResponse {
  id: string;
  is_number: string;
  title: string;
  year: number | null;
  product_type: string | null;
  status: string;
  scope: string | null;
  clauses?: StandardClause[];
  requirements: Record<string, string> | null;
  testing_requirements: Record<string, string> | null;
  certification_scheme: {
    scheme?: string;
    license_required?: boolean;
    mandatory?: boolean;
    legal_basis?: string;
    bureau?: string;
    penalty_clause?: string;
  } | null;
  amendments: Array<{ number: string; year: number; description: string }> | null;
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

export interface ClauseAnalysisItem {
  clause: string;
  title: string;
  requirement: string;
  status: "COMPLIANT" | "OMITTED_IN_SPEC";
  risk: "NONE" | "MODERATE" | "HIGH";
}

export interface QCOOrder {
  order_title: string;
  gazette_no: string;
  date: string;
  ministry: string;
  standard_mandated: string;
  enforcement_status: string;
  summary: string;
  penalties: string;
  cvc_guideline: string;
}

export interface RelationshipItem {
  source: string;
  target: string;
  type: string;
  description: string;
  strength: number;
}

export interface AnalyzeRequest {
  specification: string;
  tender_id?: string;
  department?: string;
  domain?: string;
  strict_mode?: boolean;
}

export interface AnalyzeResponse {
  certificate_id: string;
  evaluation_timestamp: string;
  tender_id: string;
  department: string;
  domain: string;
  compliance_score: number;
  specification_summary: string;
  extracted_requirements: ExtractedRequirements;
  primary_standard: RecommendedStandard | null;
  related_standards: RecommendedStandard[];
  coverage: CoverageItem[];
  gaps: GapItem[];
  clauses_analysis?: ClauseAnalysisItem[];
  gem_clause_template?: string;
  matched_qco?: QCOOrder | null;
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
  scope?: string;
  clauses_count?: number;
  mandatory?: boolean;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
  organization: string;
  database: string;
  standards_count: number;
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
  analyze: (payload: string | AnalyzeRequest) => {
    const body = typeof payload === "string" ? { specification: payload } : payload;
    return fetchJson<AnalyzeResponse>("/api/v1/analyze", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listStandards: () => fetchJson<StandardSummary[]>("/api/v1/standards"),

  getStandard: (isNumber: string) =>
    fetchJson<StandardResponse>(`/api/v1/standards/${isNumber}`),

  getQcoOrders: () => fetchJson<QCOOrder[]>("/api/v1/qco-orders"),

  getRelationships: () => fetchJson<RelationshipItem[]>("/api/v1/relationships"),

  health: () => fetchJson<HealthResponse>("/api/v1/health"),
};
