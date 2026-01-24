/* ========================================
   LEGAL CONTRACT ANALYZER - COMPLETE JS
   With Proper PDF Upload/Download Support
   ======================================== */

// State management
const appState = {
    currentUser: null,
    contractText: "",
    analysisResults: {
        clauses: [],
        risks: [],
        summary: "",
        notes: [],
        accuracy: 0,
        riskLevel: "low",
        riskPercent: 0
    },
    isAnalyzing: false
};

// DOM Elements
const contractText = document.getElementById("contractText");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");
const logoutBtn = document.getElementById("logoutBtn");
const charCount = document.getElementById("charCount");
const statusMessage = document.getElementById("statusMessage");
const statusText = document.getElementById("statusText");
const alertBanner = document.getElementById("alertBanner");
const alertText = document.getElementById("alertText");
const userDisplay = document.getElementById("userDisplay");
const userRole = document.getElementById("userRole");

const clausesOutput = document.getElementById("clausesOutput");
const risksOutput = document.getElementById("risksOutput");
const summaryOutput = document.getElementById("summaryOutput");
const notesOutput = document.getElementById("notesOutput");
const clauseCount = document.getElementById("clauseCount");

const resultsSection = document.getElementById("resultsSection");
const accuracyFill = document.getElementById("accuracyFill");
const accuracyPercent = document.getElementById("accuracyPercent");
const riskDisplay = document.getElementById("riskDisplay");
const riskLevel = document.getElementById("riskLevel");
const riskPercent = document.getElementById("riskPercent");

const downloadNotesPdfBtn = document.getElementById("downloadNotesPdfBtn");
const downloadNotesTxtBtn = document.getElementById("downloadNotesTxtBtn");
const downloadCard = document.getElementById("downloadCard");

const clausesCard = document.getElementById("clausesCard");
const risksCard = document.getElementById("risksCard");
const summaryCard = document.getElementById("summaryCard");
const notesCard = document.getElementById("notesCard");

const analyzeCheckbox = document.getElementById("analyzeCheckbox");
const risksCheckbox = document.getElementById("risksCheckbox");
const summaryCheckbox = document.getElementById("summaryCheckbox");
const notesCheckbox = document.getElementById("notesCheckbox");

const lawyerPanel = document.getElementById("lawyerPanel");

// Legal keywords
const LEGAL_KEYWORDS = {
    essential: ["hereby", "whereas", "agreement", "contract", "party", "parties", "terms and conditions", "effective date", "term", "termination", "liability", "indemnity", "confidentiality", "governing law", "jurisdiction", "dispute", "arbitration", "clause", "obligation", "covenant", "representation", "warranty", "breach", "force majeure", "intellectual property", "consideration", "executed", "signatory", "herein", "thereof"],
    important: ["payment", "fee", "invoice", "billing", "price", "cost", "insurance", "liability insurance", "indemnification", "confidential", "trade secret", "proprietary", "negotiate", "mediate", "litigate", "severability", "entire agreement", "amendment", "waive", "waiver", "void", "assignable", "assignment"]
};

const MISTAKE_PATTERNS = [
    { type: "critical", name: "Missing Signature Block", keywords: ["signature", "sign"], fix: "Add signature block with date fields for all parties" },
    { type: "critical", name: "Unclear Party Definition", keywords: ["party", "parties"], fix: "Define all parties with full legal names and addresses" },
    { type: "high", name: "Missing Effective Date", keywords: ["effective date", "commencement"], fix: "Add specific effective date" },
    { type: "high", name: "Ambiguous Termination Terms", keywords: ["termination"], fix: "Specify termination conditions and notice periods" },
    { type: "high", name: "Vague Payment Terms", keywords: ["payment", "fee", "cost"], fix: "Define payment amount, schedule and method clearly" },
    { type: "medium", name: "Missing Limitation of Liability", keywords: ["liability"], fix: "Add limitation of liability clause" },
    { type: "medium", name: "Weak Confidentiality Clause", keywords: ["confidential", "nda"], fix: "Strengthen confidentiality protections" },
    { type: "low", name: "Missing Severability Clause", keywords: ["severability"], fix: "Add severability clause for validity protection" }
];

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener("load", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
        name: "Demo User",
        role: "client",
        isVerified: false
    };

    appState.currentUser = currentUser;
    userDisplay.textContent = currentUser.name;
    userRole.textContent = currentUser.role.toUpperCase();

    if (currentUser.role === "lawyer") {
        lawyerPanel.classList.remove("hidden");
        userRole.style.background = "#8b5cf6";
    }

    attachEventListeners();
});

// ========================================
// EVENT LISTENERS
// ========================================

function attachEventListeners() {
    // Text input
    contractText.addEventListener("input", (e) => {
        appState.contractText = e.target.value;
        charCount.textContent = appState.contractText.length;
    });

    // File upload
    fileInput.addEventListener("change", handleFileSelect);
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#2563eb";
        dropZone.style.background = "rgba(37, 99, 235, 0.05)";
    });
    dropZone.addEventListener("dragleave", () => {
        dropZone.style.borderColor = "";
        dropZone.style.background = "";
    });
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "";
        dropZone.style.background = "";
        if (e.dataTransfer.files[0]) {
            handleFileSelect({ target: { files: [e.dataTransfer.files[0]] } });
        }
    });

    // Buttons
    analyzeBtn.addEventListener("click", startAnalysis);
    resetBtn.addEventListener("click", resetForm);
    logoutBtn.addEventListener("click", logout);
    downloadNotesPdfBtn.addEventListener("click", downloadAsPDF);
    downloadNotesTxtBtn.addEventListener("click", downloadAsTXT);

    // Tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            const tabName = e.target.getAttribute("data-tab");
            document.getElementById(`${tabName}-tab`).classList.add("active");
        });
    });
}

// ========================================
// FILE HANDLING
// ========================================

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > 10) {
        showAlert(`File too large (${fileSizeMB.toFixed(1)}MB). Max 10MB.`, "error");
        return;
    }

    if (file.type === "text/plain") {
        readTextFile(file);
    } else if (file.type === "application/pdf") {
        readPDFFile(file);
    } else {
        showAlert("Only .txt and .pdf files supported", "error");
    }
}

function readTextFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        contractText.value = e.target.result;
        appState.contractText = e.target.result;
        charCount.textContent = appState.contractText.length;
        showAlert("✅ Text file loaded!", "success");
    };
    reader.onerror = () => showAlert("Error reading file", "error");
    reader.readAsText(file);
}

function readPDFFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const pdfData = e.target.result;
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            
            let fullText = "";
            const maxPages = Math.min(pdf.numPages, 10);
            
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(" ") + "\n";
            }
            
            contractText.value = fullText;
            appState.contractText = fullText;
            charCount.textContent = appState.contractText.length;
            
            const msg = pdf.numPages > 10 
                ? `✅ First 10 of ${pdf.numPages} pages extracted!`
                : "✅ PDF loaded successfully!";
            showAlert(msg, "success");
        } catch (error) {
            showAlert("Could not extract PDF text. Try copying text manually.", "warning");
        }
    };
    reader.readAsArrayBuffer(file);
}

// ========================================
// ANALYSIS ENGINE
// ========================================

function startAnalysis() {
    if (appState.contractText.length < 50) {
        showAlert("Please enter at least 50 characters of contract text", "warning");
        return;
    }

    appState.isAnalyzing = true;
    analyzeBtn.disabled = true;
    showStatus("Analyzing contract...", "info");
    resultsSection.classList.remove("hidden");

    // Simulate processing
    setTimeout(() => {
        performAnalysis();
        appState.isAnalyzing = false;
        analyzeBtn.disabled = false;
        showStatus("", "");
        showAlert("✅ Analysis complete!", "success");
    }, 1500);
}

function performAnalysis() {
    const text = appState.contractText.toLowerCase();

    // Calculate accuracy
    const accuracy = calculateAccuracy();
    appState.analysisResults.accuracy = accuracy;

    // Extract clauses
    if (analyzeCheckbox.checked) {
        extractClauses();
    }

    // Detect risks
    if (risksCheckbox.checked) {
        detectRisks();
    }

    // Generate summary
    if (summaryCheckbox.checked) {
        generateSummary();
    }

    // Generate notes
    if (notesCheckbox.checked) {
        generateNotes();
    }

    // Update UI
    updateUI();
}

function calculateAccuracy() {
    const text = appState.contractText.toLowerCase();
    let score = 0;
    let maxScore = 100;

    // Check for legal keywords
    Object.values(LEGAL_KEYWORDS).forEach((keywords) => {
        keywords.forEach((keyword) => {
            if (text.includes(keyword)) score += 5;
        });
    });

    // Check for structure
    if (text.includes("signature")) score += 10;
    if (text.includes("date")) score += 10;
    if (text.includes("party") || text.includes("parties")) score += 10;
    if (text.includes("agreement")) score += 10;

    return Math.min(Math.round(score / 2), 95);
}

function extractClauses() {
    const text = appState.contractText.toLowerCase();
    const clauses = [];

    const clausePatterns = [
        { name: "Payment Terms", keywords: ["payment", "fee", "price", "cost"] },
        { name: "Termination", keywords: ["termination", "terminate", "end", "conclusion"] },
        { name: "Liability", keywords: ["liability", "liable", "responsible", "damage"] },
        { name: "Confidentiality", keywords: ["confidential", "confidentiality", "nda", "secret"] },
        { name: "Intellectual Property", keywords: ["intellectual property", "copyright", "trademark", "patent"] },
        { name: "Indemnification", keywords: ["indemnify", "indemnification", "hold harmless"] },
        { name: "Dispute Resolution", keywords: ["arbitration", "mediation", "litigation", "court"] },
        { name: "Governing Law", keywords: ["governing law", "jurisdiction", "legal"] }
    ];

    clausePatterns.forEach((pattern) => {
        const found = pattern.keywords.some(kw => text.includes(kw));
        if (found) {
            clauses.push(`✓ ${pattern.name}`);
        }
    });

    appState.analysisResults.clauses = clauses;
    clauseCount.textContent = clauses.length;
}

function detectRisks() {
    const text = appState.contractText.toLowerCase();
    const risks = [];

    const riskPatterns = [
        { severity: "high", name: "Unlimited Liability", keywords: ["unlimited", "no limit", "no cap"] },
        { severity: "high", name: "Vague Termination", keywords: ["terminate at will", "either party"] },
        { severity: "medium", name: "Automatic Renewal", keywords: ["auto renew", "automatic renewal", "renew automatically"] },
        { severity: "medium", name: "One-Sided Terms", keywords: ["sole discretion", "at our option", "unilateral"] },
        { severity: "medium", name: "Missing Dispute Resolution", keywords: text.includes("arbitration") || text.includes("mediation") ? [] : [""] },
        { severity: "low", name: "Complex Language", keywords: text.length > 10000 ? [""] : [] }
    ];

    riskPatterns.forEach((pattern) => {
        const found = pattern.keywords.length === 0 || pattern.keywords.some(kw => text.includes(kw));
        if (found && pattern.keywords.length > 0) {
            risks.push(`⚠️ [${pattern.severity.toUpperCase()}] ${pattern.name}`);
        }
    });

    appState.analysisResults.risks = risks;

    // Calculate risk level
    const highRisks = risks.filter(r => r.includes("HIGH")).length;
    const mediumRisks = risks.filter(r => r.includes("MEDIUM")).length;
    const riskScore = (highRisks * 40) + (mediumRisks * 20);

    appState.analysisResults.riskLevel = riskScore > 60 ? "high" : riskScore > 30 ? "medium" : "low";
    appState.analysisResults.riskPercent = Math.min(riskScore, 95);
}

function generateSummary() {
    const wordCount = appState.contractText.split(/\s+/).length;
    const charCount = appState.contractText.length;

    let summary = `CONTRACT SUMMARY\n`;
    summary += `================\n\n`;
    summary += `📊 Statistics:\n`;
    summary += `- Word Count: ${wordCount} words\n`;
    summary += `- Character Count: ${charCount} characters\n`;
    summary += `- Estimated Read Time: ${Math.ceil(wordCount / 200)} minutes\n\n`;
    summary += `📋 Key Elements Detected:\n`;
    
    appState.analysisResults.clauses.forEach(clause => {
        summary += `${clause}\n`;
    });

    appState.analysisResults.summary = summary;
}

function generateNotes() {
    const text = appState.contractText.toLowerCase();
    const notes = [];
    const suggestions = [];

    MISTAKE_PATTERNS.forEach((pattern) => {
        const hasKeyword = pattern.keywords.some(kw => text.includes(kw));
        const shouldFlag = pattern.absence ? !hasKeyword : hasKeyword;

        if (shouldFlag) {
            notes.push(`[${pattern.type.toUpperCase()}] ${pattern.name}`);
            suggestions.push(`💡 Fix: ${pattern.fix}`);
        }
    });

    appState.analysisResults.notes = [...notes, ...suggestions];
}

function updateUI() {
    // Update accuracy
    accuracyFill.style.width = appState.analysisResults.accuracy + "%";
    accuracyPercent.textContent = appState.analysisResults.accuracy + "%";

    // Update risk
    const riskColor = appState.analysisResults.riskLevel === "high" ? "#dc2626" : 
                      appState.analysisResults.riskLevel === "medium" ? "#ea580c" : "#16a34a";
    riskDisplay.style.borderLeftColor = riskColor;
    riskLevel.textContent = appState.analysisResults.riskLevel.charAt(0).toUpperCase() + appState.analysisResults.riskLevel.slice(1) + " Risk";
    riskLevel.style.color = riskColor;
    riskPercent.textContent = appState.analysisResults.riskPercent + "%";

    // Update clauses
    if (appState.analysisResults.clauses.length > 0) {
        clausesCard.classList.remove("hidden");
        clausesOutput.textContent = appState.analysisResults.clauses.join("\n");
    }

    // Update risks
    if (appState.analysisResults.risks.length > 0) {
        risksCard.classList.remove("hidden");
        risksOutput.textContent = appState.analysisResults.risks.join("\n");
    }

    // Update summary
    if (appState.analysisResults.summary) {
        summaryCard.classList.remove("hidden");
        summaryOutput.textContent = appState.analysisResults.summary;
    }

    // Update notes
    if (appState.analysisResults.notes.length > 0) {
        notesCard.classList.remove("hidden");
        notesOutput.textContent = appState.analysisResults.notes.join("\n");
        downloadCard.classList.remove("hidden");
    }
}

// ========================================
// DOWNLOAD FUNCTIONS (WITH JSPDF)
// ========================================

function downloadAsPDF() {
    // Load jsPDF from CDN dynamically
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        pdf.setFontSize(16);
        pdf.text("Contract Analysis Report", 20, 20);
        
        pdf.setFontSize(12);
        let yPosition = 40;
        
        // Add analysis results
        const lines = appState.analysisResults.notes.join("\n").split("\n");
        lines.forEach((line) => {
            if (yPosition > 280) {
                pdf.addPage();
                yPosition = 20;
            }
            pdf.text(line, 20, yPosition);
            yPosition += 8;
        });
        
        pdf.save("contract_analysis.pdf");
        showAlert("✅ PDF downloaded successfully!", "success");
    };
    document.head.appendChild(script);
}

function downloadAsTXT() {
    const content = appState.analysisResults.notes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contract_analysis.txt";
    link.click();
    URL.revokeObjectURL(url);
    showAlert("✅ TXT file downloaded!", "success");
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function resetForm() {
    contractText.value = "";
    appState.contractText = "";
    charCount.textContent = "0";
    resultsSection.classList.add("hidden");
    clausesCard.classList.add("hidden");
    risksCard.classList.add("hidden");
    summaryCard.classList.add("hidden");
    notesCard.classList.add("hidden");
    downloadCard.classList.add("hidden");
    fileInput.value = "";
    showAlert("Form reset", "info");
}

function showAlert(message, type = "info") {
    alertBanner.className = `alert-banner ${type}`;
    alertText.textContent = message;
    alertBanner.classList.remove("hidden");
    setTimeout(() => alertBanner.classList.add("hidden"), 4000);
}

function closeAlert() {
    alertBanner.classList.add("hidden");
}

function showStatus(message, type) {
    if (message) {
        statusText.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.classList.remove("hidden");
    } else {
        statusMessage.classList.add("hidden");
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

// Add PDF.js library
const pdfScript = document.createElement("script");
pdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
pdfScript.onload = () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
};
document.head.appendChild(pdfScript);
