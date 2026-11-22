from backend.database import init_db, seed_sample_data, get_all_cases, get_case_by_id, get_relationship_graph, get_heat_list
from backend.analyzer import analyze_message, analyze_url_heuristics, analyze_website_content, analyze_apk_metadata
from backend.pdf_generator import generate_case_pdf
import os

print("[1] Initializing Database & Seeding...")
init_db()
seed_sample_data()

cases = get_all_cases()
print(f"Total Cases in DB: {len(cases)}")
assert len(cases) >= 4, "Cases count should be >= 4"

print("[2] Testing Message Analyzer...")
msg_res = analyze_message("URGENT: Your SBI account is blocked due to pending KYC. Click http://sbi-kyc-verify.cc to update immediately.")
print(f"Risk Score: {msg_res['risk_score']} ({msg_res['risk_level']})")
print(f"Triggered: {[i['name'] for i in msg_res['indicators']]}")
assert msg_res['risk_level'] == "HIGH", "Should be flagged as HIGH risk"

print("[3] Testing PDF Report Generation...")
c1 = get_case_by_id(cases[0]['case_id'])
pdf_path = generate_case_pdf(c1)
print(f"Generated PDF: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
assert os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1000

print("[4] Testing Syndicate Graph & Heat List...")
graph = get_relationship_graph()
print(f"Graph Nodes: {len(graph['nodes'])}, Edges: {len(graph['edges'])}")
heat = get_heat_list()
print(f"Heat list domains: {heat.get('domain', [])}")

print("\n>>> ALL TESTS PASSED SUCCESSFULLY! SYSTEM READY FOR DEMO <<<")
