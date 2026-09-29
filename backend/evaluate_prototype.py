"""
ISense Prototype Evaluation CLI Runner — Phase 8
Runs the 14-query benchmark suite and prints a formatted terminal report.

Usage:
  cd backend
  python evaluate_prototype.py
"""

import asyncio
import sys

sys.path.insert(0, ".")
from app.services.evaluation import run_evaluation_benchmark


async def main():
    print()
    print("=" * 80)
    print("  ISENSE (SIH PS-2) PROTOTYPE EVALUATION & BENCHMARK REPORT")
    print("=" * 80)
    print("  Running 14 evaluation scenarios (Normal, Ambiguous, Out-of-Scope, Multilingual, PDF)...")
    print()

    data = await run_evaluation_benchmark()
    summary = data["summary"]
    tests = data["test_cases"]

    # Table of results
    print(f"  {'ID':<7} | {'Category':<22} | {'Expected':<10} | {'Retrieved':<10} | {'Status':<6} | {'Latency':<8}")
    print("  " + "-" * 76)

    for t in tests:
        exp = t["expected_is"] or t["expected_action"][:9]
        ret = t["retrieved_top1"] or "REFUSAL"
        status = "PASS" if t["passed"] else "FAIL"
        print(f"  {t['id']:<7} | {t['category']:<22} | {exp:<10} | {ret:<10} | {status:<6} | {t['latency_ms']} ms")

    print("  " + "-" * 76)
    print()
    print("  BENCHMARK METRICS SUMMARY:")
    print(f"  * Total Test Cases:      {summary['total_test_cases']}")
    print(f"  * Passed Test Cases:     {summary['passed_test_cases']} ({summary['overall_pass_rate_pct']}%)")
    print(f"  * Precision@1:           {summary['precision_at_1'] * 100:.1f}%")
    print(f"  * Precision@3:           {summary['precision_at_3'] * 100:.1f}%")
    print(f"  * Recall@1:              {summary['recall_at_1'] * 100:.1f}%")
    print(f"  * Refusal / Clarity Acc: {summary['refusal_accuracy'] * 100:.1f}%")
    print(f"  * Average Latency:       {summary['average_latency_ms']} ms")
    print("=" * 80)
    print()


if __name__ == "__main__":
    asyncio.run(main())
