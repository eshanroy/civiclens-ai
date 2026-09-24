import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  FileText,
  History,
  Info,
  MapPin,
  Menu,
  ReceiptText,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
  Users,
  X,
  Building2,
} from "lucide-react";


const API_BASE_URL = "https://civiclens-ai-scrd.onrender.com";


function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);


  // =========================================================
  // LOAD HISTORY
  // =========================================================

  const loadHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/documents/history`
      );

      if (!response.ok) {
        throw new Error("Failed to load document history.");
      }

      const data = await response.json();

      setHistory(data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };


  // =========================================================
  // FILE SELECTION
  // =========================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError("");
  };


  // =========================================================
  // DOCUMENT ANALYSIS
  // =========================================================

  const analyzeDocument = async () => {
    if (!selectedFile) {
      setError("Please select a PDF document first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysisResult(null);

    try {
      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response = await fetch(
        `${API_BASE_URL}/documents/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Document analysis failed."
        );
      }

      setAnalysisResult(data);

      await loadHistory();

      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Something went wrong while analyzing the document."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    try {
      return new Date(dateString).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return dateString;
    }
  };


  // =========================================================
  // SCROLL NAVIGATION
  // =========================================================

  const scrollToSection = (id) => {
    setShowMobileMenu(false);

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            onClick={() => scrollToSection("home")}
            className="text-left"
          >
            <div className="text-xl font-bold tracking-tight text-slate-900">
              CivicLens AI
            </div>

            <div className="text-xs font-medium tracking-wide text-slate-500">
              Understand • Decide • Act
            </div>
          </button>


          {/* Desktop navigation */}

          <nav className="hidden items-center gap-7 md:flex">

            <button
              onClick={() => scrollToSection("history")}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              History
            </button>

            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              How it works
            </button>

            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Features
            </button>

            <button
              onClick={() => scrollToSection("upload")}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Analyze Document
            </button>

          </nav>


          {/* Mobile menu button */}

          <button
            onClick={() =>
              setShowMobileMenu(!showMobileMenu)
            }
            className="rounded-lg p-2 text-slate-700 md:hidden"
          >
            {showMobileMenu ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>


        {/* Mobile navigation */}

        {showMobileMenu && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">

            <div className="flex flex-col gap-3">

              <button
                onClick={() => scrollToSection("history")}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                History
              </button>

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                How it works
              </button>

              <button
                onClick={() => scrollToSection("features")}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Features
              </button>

              <button
                onClick={() => scrollToSection("upload")}
                className="rounded-lg bg-slate-900 px-3 py-2 text-left text-sm font-semibold text-white"
              >
                Analyze Document
              </button>

            </div>

          </div>
        )}

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <main id="home">

        <section className="mx-auto max-w-7xl px-6 pb-20 pt-20">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">

                <ShieldCheck size={14} />

                AI-powered civic document assistant

              </div>


              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">

                Understand important documents
                <span className="text-slate-500">
                  {" "}without the complexity.
                </span>

              </h1>


              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">

                Upload a government, public-service, or civic document.
                CivicLens AI extracts important information, explains it
                in simple language, and highlights what needs your attention.

              </p>


              <div className="mt-8 flex flex-wrap gap-3">

                <button
                  onClick={() => scrollToSection("upload")}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Analyze a document

                  <ArrowRight size={17} />

                </button>


                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  See how it works
                </button>

              </div>


              <div className="mt-8 flex flex-wrap gap-3">

                <FeaturePill
                  icon={<Search size={15} />}
                  text="Source-grounded analysis"
                />

                <FeaturePill
                  icon={<Info size={15} />}
                  text="Simple explanations"
                />

                <FeaturePill
                  icon={<ShieldCheck size={15} />}
                  text="Evidence-backed facts"
                />

              </div>

            </div>


            {/* Hero visual */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-white p-2 shadow-sm">

                      <FileText
                        size={21}
                        className="text-slate-700"
                      />

                    </div>

                    <div>

                      <p className="text-sm font-semibold">
                        Civic document
                      </p>

                      <p className="text-xs text-slate-500">
                        AI analysis pipeline
                      </p>

                    </div>

                  </div>

                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    AI Ready
                  </div>

                </div>


                <div className="mt-6 space-y-3">

                  <PipelineStep
                    number="01"
                    title="Upload"
                    description="PDF document"
                  />

                  <PipelineStep
                    number="02"
                    title="Understand"
                    description="Structured facts"
                  />

                  <PipelineStep
                    number="03"
                    title="Ground"
                    description="Source evidence"
                  />

                </div>


                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    CivicLens principle
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                    Simplify the language, not the underlying facts.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            UPLOAD
        ===================================================== */}

        <section
          id="upload"
          className="border-y border-slate-200 bg-white"
        >

          <div className="mx-auto max-w-5xl px-6 py-20">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Start with your document
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Upload a PDF to understand it
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                CivicLens will extract the document content and prepare
                a clear, structured explanation.
              </p>

            </div>


            <div className="mx-auto mt-10 max-w-3xl">

              <label
                htmlFor="pdf-upload"
                className="block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-slate-500 hover:bg-slate-100"
              >

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">

                  <Upload
                    size={25}
                    className="text-slate-700"
                  />

                </div>


                <h3 className="mt-5 text-lg font-semibold">
                  Drop your document here
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  or choose a PDF from your computer
                </p>


                <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">

                  <FileText size={17} />

                  Choose PDF

                </span>


                <p className="mt-4 text-xs text-slate-400">
                  Supported format: PDF
                </p>

              </label>


              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />


              {selectedFile && (
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="rounded-xl bg-slate-100 p-2">

                      <FileText size={19} />

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold">
                        {selectedFile.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>

                    </div>

                  </div>


                  <button
                    onClick={analyzeDocument}
                    disabled={loading}
                    className="ml-4 inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {loading ? (
                      <>
                        <Clock3
                          size={16}
                          className="animate-spin"
                        />

                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze

                        <ArrowRight size={16} />
                      </>
                    )}

                  </button>

                </div>
              )}


              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>{error}</p>

                </div>
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            ANALYSIS RESULTS
        ===================================================== */}

        {analysisResult && (
          <AnalysisResults result={analysisResult} />
        )}


        {/* =====================================================
            HISTORY
        ===================================================== */}

        <section
          id="history"
          className="bg-slate-50"
        >

          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

              <div>

                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">

                  <History size={16} />

                  Document history

                </div>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Previously analyzed documents
                </h2>

                <p className="mt-3 max-w-2xl text-slate-600">
                  Your recent CivicLens analyses are saved so you can
                  keep track of documents you have already processed.
                </p>

              </div>


              <button
                onClick={() => scrollToSection("upload")}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 md:self-auto"
              >

                <Upload size={16} />

                Analyze new document

              </button>

            </div>


            <div className="mt-10">

              {historyLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  Loading document history...
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                  <FileText
                    size={30}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-4 font-semibold text-slate-700">
                    No documents analyzed yet.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload your first civic document to get started.
                  </p>

                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">

                  {history.map((document) => (

                    <div
                      key={document.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="rounded-xl bg-slate-100 p-2.5">

                            <FileText size={20} />

                          </div>

                          <div className="min-w-0">

                            <h3 className="truncate font-semibold text-slate-900">
                              {document.filename}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {document.document_type}
                            </p>

                          </div>

                        </div>


                        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">

                          <CheckCircle2 size={13} />

                          Analyzed

                        </div>

                      </div>


                      <p className="mt-5 line-clamp-4 text-sm leading-6 text-slate-600">
                        {document.summary}
                      </p>


                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                        <span className="text-xs text-slate-400">
                          {formatDate(document.created_at)}
                        </span>


                        <button
                          onClick={() => scrollToSection("upload")}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950"
                        >

                          Analyze another

                          <ArrowRight size={14} />

                        </button>

                      </div>

                    </div>

                  ))}

                </div>
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section
          id="how-it-works"
          className="border-t border-slate-200 bg-white"
        >

          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                How CivicLens works
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                From confusing document to clear next step
              </h2>

            </div>


            <div className="mt-12 grid gap-5 md:grid-cols-3">

              <HowStep
                number="01"
                title="Upload"
                description="Upload a civic, government, public-service, or legal document as a PDF."
              />

              <HowStep
                number="02"
                title="Understand"
                description="AI extracts important facts, dates, references, people, warnings, and required actions."
              />

              <HowStep
                number="03"
                title="Act"
                description="See what matters, what may be missing, and what the document explicitly asks you to do."
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section
          id="features"
          className="border-t border-slate-200 bg-slate-50"
        >

          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="grid gap-5 md:grid-cols-3">

              <FeatureCard
                icon={<ShieldCheck size={21} />}
                title="Source-grounded"
                description="Important extracted facts can be connected back to supporting document evidence."
              />

              <FeatureCard
                icon={<Search size={21} />}
                title="Structured understanding"
                description="Dates, people, references, amounts, actions, and missing information are organized clearly."
              />

              <FeatureCard
                icon={<Users size={21} />}
                title="Accessible by design"
                description="The platform is designed to make complex civic information easier to understand."
              />

            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-center text-sm text-slate-500">

          <span>
            © 2026 CivicLens AI
          </span>

          <span>
            Understand • Decide • Act
          </span>

        </div>

      </footer>

    </div>
  );
}


// =============================================================
// ANALYSIS RESULTS COMPONENT
// =============================================================

function AnalysisResults({ result }) {

  const analysis = result?.analysis || {};
  const evidence = result?.evidence || [];
  const document = result?.document || {};

  return (
    <section
      id="results"
      className="border-y border-slate-200 bg-slate-50"
    >

      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Header */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">

              <CheckCircle2 size={16} />

              Analysis complete

            </div>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {analysis.document_type || "Civic document"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {document.filename}
            </p>

          </div>


          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">

            <span className="font-semibold text-slate-900">
              {document.characters_extracted || 0}
            </span>

            {" "}characters extracted

          </div>

        </div>


        {/* Summary */}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex items-center gap-2">

            <FileText size={20} />

            <h3 className="text-lg font-bold">
              Summary
            </h3>

          </div>

          <p className="mt-4 max-w-5xl text-base leading-8 text-slate-700">
            {analysis.summary || "No summary available."}
          </p>

        </div>


        {/* Simple explanation */}

        {analysis.simple_explanation && (
          <div className="mt-5 rounded-3xl border border-blue-200 bg-blue-50 p-7">

            <div className="flex items-center gap-2 text-blue-900">

              <Info size={20} />

              <h3 className="text-lg font-bold">
                In simple language
              </h3>

            </div>

            <p className="mt-4 leading-7 text-blue-950">
              {analysis.simple_explanation}
            </p>

          </div>
        )}


        {/* Warnings */}

        <AnalysisSection
          title="Warnings"
          icon={<AlertTriangle size={20} />}
          items={analysis.warnings}
          emptyText="No explicit warnings were identified in this document."
          tone="warning"
        >
          {(item) => (
            <div>

              <p className="font-semibold text-slate-900">
                {item.warning}
              </p>

              {item.reason && (
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.reason}
                </p>
              )}

            </div>
          )}
        </AnalysisSection>


        {/* Required actions */}

        <AnalysisSection
          title="Required actions"
          icon={<CheckCircle2 size={20} />}
          items={analysis.required_actions}
          emptyText="No explicit required actions were identified."
          tone="action"
        >
          {(item) => (
            <div>

              <p className="font-semibold text-slate-900">
                {item.action}
              </p>

              {item.deadline && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

                  <CalendarDays size={15} />

                  Deadline: {item.deadline}

                </div>
              )}

            </div>
          )}
        </AnalysisSection>


        {/* Important dates */}

        <AnalysisSection
          title="Important dates"
          icon={<CalendarDays size={20} />}
          items={analysis.important_dates}
          emptyText="No important dates were identified."
        >
          {(item) => (
            <div>

              <p className="font-semibold text-slate-900">
                {item.date}
              </p>

              {item.description && (
                <p className="mt-1 text-sm text-slate-600">
                  {item.description}
                </p>
              )}

            </div>
          )}
        </AnalysisSection>


        {/* Amounts */}

        <AnalysisSection
          title="Amounts"
          icon={<ReceiptText size={20} />}
          items={analysis.amounts}
          emptyText="No monetary amounts were identified."
        >
          {(item) => (
            <div>

              <p className="font-semibold text-slate-900">
                {item.amount}
              </p>

              {item.description && (
                <p className="mt-1 text-sm text-slate-600">
                  {item.description}
                </p>
              )}

            </div>
          )}
        </AnalysisSection>


        {/* People */}

        <AnalysisSection
          title="People"
          icon={<UserRound size={20} />}
          items={analysis.people}
          emptyText="No people were identified."
        >
          {(item) => (
            <div>

              <p className="font-semibold text-slate-900">
                {item.name}
              </p>

              {item.role && (
                <p className="mt-1 text-sm text-slate-600">
                  {item.role}
                </p>
              )}

            </div>
          )}
        </AnalysisSection>


        {/* Organizations */}

        <AnalysisSection
          title="Organizations"
          icon={<Building2 size={20} />}
          items={analysis.organizations}
          emptyText="No organizations were identified."
        >
          {(item) => (
            <div>

              <p className="font-semibold text-slate-900">
                {item.name}
              </p>

              {item.role && (
                <p className="mt-1 text-sm text-slate-600">
                  {item.role}
                </p>
              )}

            </div>
          )}
        </AnalysisSection>


        {/* Locations */}

        <AnalysisSection
          title="Locations"
          icon={<MapPin size={20} />}
          items={analysis.locations}
          emptyText="No locations were identified."
        >
          {(item) => (
            <div>

              <p className="font-semibold text-slate-900">
                {item.location}
              </p>

              {item.description && (
                <p className="mt-1 text-sm text-slate-600">
                  {item.description}
                </p>
              )}

            </div>
          )}
        </AnalysisSection>


        {/* Reference numbers */}

        <AnalysisSection
          title="Reference numbers"
          icon={<FileText size={20} />}
          items={analysis.reference_numbers}
          emptyText="No reference numbers were identified."
        >
          {(item) => (
            <div className="flex flex-wrap items-center gap-3">

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {item.type}
              </span>

              <span className="font-semibold text-slate-900">
                {item.value}
              </span>

            </div>
          )}
        </AnalysisSection>


        {/* Missing information */}

        <AnalysisSection
          title="Missing information"
          icon={<CircleAlert size={20} />}
          items={analysis.missing_information}
          emptyText="No missing information was explicitly identified."
        >
          {(item) => (
            <p className="font-medium text-slate-800">
              {typeof item === "string"
                ? item
                : JSON.stringify(item)}
            </p>
          )}
        </AnalysisSection>


        {/* Evidence */}

        <EvidenceSection evidence={evidence} />

      </div>

    </section>
  );
}


// =============================================================
// ANALYSIS SECTION
// =============================================================

function AnalysisSection({
  title,
  icon,
  items,
  emptyText,
  tone = "default",
  children,
}) {

  const safeItems = Array.isArray(items)
    ? items
    : [];

  let wrapperClass =
    "mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm";

  if (tone === "warning") {
    wrapperClass =
      "mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-7 shadow-sm";
  }

  if (tone === "action") {
    wrapperClass =
      "mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-7 shadow-sm";
  }

  return (
    <div className={wrapperClass}>

      <div className="flex items-center gap-2">

        {icon}

        <h3 className="text-lg font-bold">
          {title}
        </h3>

        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {safeItems.length}
        </span>

      </div>


      {safeItems.length === 0 ? (

        <p className="mt-4 text-sm leading-6 text-slate-500">
          {emptyText}
        </p>

      ) : (

        <div className="mt-5 grid gap-3 md:grid-cols-2">

          {safeItems.map((item, index) => (

            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              {children(item)}
            </div>

          ))}

        </div>

      )}

    </div>
  );
}


// =============================================================
// EVIDENCE SECTION
// =============================================================

function EvidenceSection({ evidence }) {

  const [expanded, setExpanded] = useState(false);

  const safeEvidence = Array.isArray(evidence)
    ? evidence
    : [];

  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="flex items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <ShieldCheck size={20} />

            <h3 className="text-lg font-bold">
              Source evidence
            </h3>

          </div>

          <p className="mt-2 text-sm text-slate-500">
            Supporting excerpts from the uploaded document.
          </p>

        </div>


        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >

          {expanded ? "Hide evidence" : "View evidence"}

          {expanded ? (
            <ChevronUp size={15} />
          ) : (
            <ChevronDown size={15} />
          )}

        </button>

      </div>


      {expanded && (
        <div className="mt-6 space-y-4">

          {safeEvidence.length === 0 ? (

            <p className="text-sm text-slate-500">
              No evidence records are available.
            </p>

          ) : (

            safeEvidence.map((item, index) => (

              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                    {item.claim_type}
                  </span>

                </div>


                <div className="mt-3 rounded-xl bg-white p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Extracted claim
                  </p>

                  <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-700">
                    {JSON.stringify(
                      item.claim,
                      null,
                      2
                    )}
                  </pre>

                </div>


                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Document evidence
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {item.evidence || "No matching source evidence found."}
                  </p>

                </div>

              </div>

            ))

          )}

        </div>
      )}

    </div>
  );
}


// =============================================================
// SMALL UI COMPONENTS
// =============================================================

function FeaturePill({ icon, text }) {

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">

      {icon}

      {text}

    </div>
  );
}


function PipelineStep({
  number,
  title,
  description,
}) {

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
        {number}
      </div>

      <div>

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="text-xs text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}


function HowStep({
  number,
  title,
  description,
}) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

      <div className="text-sm font-bold text-slate-400">
        {number}
      </div>

      <h3 className="mt-3 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

    </div>
  );
}


function FeatureCard({
  icon,
  title,
  description,
}) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

    </div>
  );
}


export default App;