# ISense — Chrome Browser Extension (Manifest V3)

> **Demonstrates Phase 6 of the SIH PS-2 Prototype Roadmap**  
> *"ISense can sit on top of a procurement webpage and analyze the specification without modifying the portal."*

---

## 🚀 How to Install & Test

1. Open Google Chrome (or Microsoft Edge / Brave).
2. Navigate to `chrome://extensions/` (or `edge://extensions/`).
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select this directory:  
   `SIH-PS2/chrome_extension`
6. The **ISense — BIS Standards Assistant** extension icon will appear in your browser toolbar!

---

## 🎯 How to Demonstrate on a Procurement Webpage

1. Ensure the ISense backend server is running:
   ```bash
   cd backend
   python demo_server.py
   ```
2. Open the included Mock Procurement Portal:  
   `http://localhost:8000/demo/procurement-portal`  
   *(Or test on any live tender notice on GeM / CPPP).*
3. Highlight / select any specification paragraph on the webpage (e.g. *"Protective helmets for two-wheeler motorcyclists with impact attenuation"*).
4. Notice the floating **"🔍 Analyze with ISense"** action button appear next to your cursor, OR right-click and choose **"🔍 Analyze with ISense"**.
5. An overlay modal immediately appears with:
   - ✅ Applicable Primary Indian Standard (e.g., **IS 4151:2015**)
   - 📋 **Coverage Matrix** (Primary Standard, Safety, Testing, Certification, Normative Reference, Installation)
   - ⚠️ **Missing Requirements & Coverage Gaps**
   - 🔗 **Companion & Normative Standards** (e.g., IS 7692 headforms, IS 4151 Pt 2 visors)
   - ↗ One-click link to the full ISense portal report!
