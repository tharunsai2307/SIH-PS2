/**
 * ISense API Service Layer — Decision-Support Engine
 * Smart India Hackathon (SIH 2024-25 PS-2 Prototype)
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
  explicit_requirements?: string[];
  inferred_requirements?: string[];
  requirement_sources?: Record<string, string>;
  unknown_standards?: string[];
  specification_needs_clarification?: boolean;
  clarification_prompt?: string | null;
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
  evidence_type?: string;
}

export interface RecommendedStandard {
  standard: StandardResponse;
  relevance_score: number;
  relevance_label: string;
  reason: string;
  relationship_type: string | null;
  evidence: EvidenceItem[];
  signals_contributed?: string[];
}

export interface CoverageItem {
  category: string;
  status: "FOUND" | "PARTIAL" | "MISSING" | "REVIEW" | "INSUFFICIENT";
  standard: string | null;
  note: string | null;
  evidence?: string | null;
  suggested_action?: string | null;
}

export interface GapItem {
  category: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  suggestion: string | null;
  supporting_evidence?: string | null;
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
  decision_support_notice?: string;
  disclaimer: string;
  unknown_standards_detected?: string[];
  specification_needs_clarification?: boolean;
  clarification_prompt?: string | null;
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

export const api = {
  async health(): Promise<{ status: string; standards_count: number }> {
    const res = await fetch(`${API_BASE}/api/v1/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  async analyze(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
    const res = await fetch(`${API_BASE}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Unknown server error" }));
      throw new Error(err.detail || `Server responded with status ${res.status}`);
    }
    return res.json();
  },

  async getStandards(): Promise<StandardSummary[]> {
    const res = await fetch(`${API_BASE}/api/v1/standards`);
    if (!res.ok) throw new Error("Failed to load standards");
    return res.json();
  },

  async listStandards(): Promise<StandardSummary[]> {
    return this.getStandards();
  },

  async getStandardDetail(isNumber: string): Promise<StandardResponse> {
    const cleanNumber = isNumber.replace(/\s+/g, "-");
    const res = await fetch(`${API_BASE}/api/v1/standards/${cleanNumber}`);
    if (!res.ok) throw new Error(`Standard ${isNumber} not found`);
    return res.json();
  },

  async getStandard(isNumber: string): Promise<StandardResponse> {
    return this.getStandardDetail(isNumber);
  },

  async getRelationships(): Promise<RelationshipItem[]> {
    const res = await fetch(`${API_BASE}/api/v1/relationships`);
    if (!res.ok) throw new Error("Failed to load relationships");
    return res.json();
  },

  async getQCOOrders(): Promise<QCOOrder[]> {
    const res = await fetch(`${API_BASE}/api/v1/qco-orders`);
    if (!res.ok) throw new Error("Failed to load QCO orders");
    return res.json();
  },

  async getQcoOrders(): Promise<QCOOrder[]> {
    return this.getQCOOrders();
  },
};
