
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { geminiService } from './services/geminiService';
import { 
  UserProfile, 
  CareerRecommendation, 
  FullCareerAnalysis,
  ResumeAnalysis,
  ResumeOptimization,
  ChatMessage,
  AptitudeQuestion,
  AssessmentResult
} from './types';
import { 
  BrainCircuit, 
  Rocket, 
  FileText, 
  MessageSquare, 
  Settings,
  ChevronRight,
  Target,
  Sparkles,
  ShieldCheck,
  Zap,
  FileUp,
  Youtube,
  PlayCircle,
  Loader2,
  AlertCircle,
  Video,
  TrendingUp,
  Activity,
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  Printer,
  Copy,
  Wand2,
  ArrowRight,
  Brain,
  Code,
  Terminal,
  Lightbulb,
  Cpu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const pdfjsLib = (window as any).pdfjsLib;

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'assessment' | 'assessmentResult' | 'dashboard' | 'resume' | 'chat'>('form');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Processing...');
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    education: '',
    skills: '',
    interests: '',
    experienceLevel: 'Entry Level',
    careerGoal: '',
    location: 'United States'
  });

  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);
  const [analysis, setAnalysis] = useState<FullCareerAnalysis | null>(null);
  
  const [resumeText, setResumeText] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<ResumeOptimization | null>(null);
  const [resumeMode, setResumeMode] = useState<'edit' | 'result'>('edit');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const educationSuggestions = [
    "B.Sc Computer Science",
    "B.Sc IT",
    "B.Sc Data Science",
    "B.Tech CS",
    "M.Sc Artificial Intelligence",
    "B.Sc Business Analytics"
  ];

  const jobSuggestions = [
    "AI Architect",
    "Data Scientist",
    "Cloud Engineer",
    "Product Manager",
    "Full Stack Dev",
    "Cybersecurity Lead"
  ];

  useEffect(() => {
    if (pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;
    }
  }, []);

  const fetchFullAnalysis = useCallback(async (careerName: string) => {
    setAnalysis(null);
    setBackgroundLoading(true);
    try {
      const fullData = await geminiService.getFullAnalysis(careerName, profile);
      setAnalysis(fullData);
    } catch (error) {
      console.error("Full analysis failed:", error);
    } finally {
      setBackgroundLoading(false);
    }
  }, [profile]);

  const handleStartAptitudeTest = async () => {
    if (!profile.education.trim() || !profile.careerGoal.trim()) {
      alert("Education history and Career Goal are required for assessment.");
      return;
    }
    setLoading(true);
    setLoadingMsg('Generating Comprehensive Neural Assessment...');
    try {
      const q = await geminiService.generateAptitudeTest(profile);
      setQuestions(q);
      setAnswers({});
      setView('assessment');
    } catch (error) {
      alert("Assessment generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please complete all sections before submitting.");
      return;
    }
    setLoading(true);
    setLoadingMsg('Deconstructing Performance Metrics...');
    try {
      const result = await geminiService.evaluateAssessment(profile, questions, answers);
      setAssessmentResult(result);
      setView('assessmentResult');
    } catch (error) {
      alert("Evaluation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToTrajectory = async () => {
    setLoading(true);
    setLoadingMsg('Aligning Career Paths with Assessment Data...');
    try {
      const recs = await geminiService.getRecommendations(profile);
      setRecommendations(recs);
      if (recs.length > 0) {
        setSelectedCareer(recs[0]);
        setView('dashboard');
        fetchFullAnalysis(recs[0].name);
      }
    } catch (error) {
      alert("Market scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCareer = (career: CareerRecommendation) => {
    setSelectedCareer(career);
    fetchFullAnalysis(career.name);
  };

  const handleResumeAnalysis = async () => {
    if (!resumeText.trim()) {
      alert("Please paste or upload a resume first.");
      return;
    }
    setLoading(true);
    setLoadingMsg('Performing Neural ATS Audit...');
    try {
      const result = await geminiService.analyzeResume(resumeText);
      setResumeAnalysis(result);
      setResumeMode('result');
    } catch (error) {
      alert("Resume analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeOptimization = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setLoadingMsg('Synthesizing Optimized Dossier...');
    try {
      const target = selectedCareer?.name || profile.careerGoal || "Professional";
      const result = await geminiService.optimizeResume(resumeText, target);
      setOptimizedResume(result);
    } catch (error) {
      alert("Optimization engine error.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setLoadingMsg('Deconstructing PDF Dossier...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      setResumeText(text);
      setLoading(false);
      setView('resume'); 
      setResumeMode('edit');
    } catch (error) {
      setLoading(false);
      alert("PDF extraction failed.");
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const currentInput = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
    try {
      const context = selectedCareer 
        ? `Trajectory Focus: ${selectedCareer.name}. Profile: ${profile.education}, ${profile.skills}.` 
        : `User Profile: ${profile.education}, ${profile.skills}.`;
      const response = await geminiService.chat(currentInput, context);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Strategist offline. Connection issue." }]);
    }
  };

  const parseCurrency = (str?: string) => {
    if (!str) return 0;
    const num = parseInt(str.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const salaryData = analysis?.growth ? [
    { name: 'Year 1', salary: parseCurrency(analysis.growth.year1) },
    { name: 'Year 3', salary: parseCurrency(analysis.growth.year3) },
    { name: 'Year 5', salary: parseCurrency(analysis.growth.year5) }
  ] : [];

  const handlePrintATS = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = optimizedResume?.optimizedText || resumeText;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATS-Ready Resume</title>
          <style>
            body { font-family: "Times New Roman", serif; padding: 1in; line-height: 1.5; color: #000; font-size: 11pt; }
            pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body><pre>${content}</pre></body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-8 flex flex-col gap-10 sticky top-0 h-auto md:h-screen z-40">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-xl tracking-tight uppercase">Career<span className="text-indigo-600">Pro</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Turbo v3.5</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5 flex-1">
          <button onClick={() => setView('form')} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'form' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Settings size={20} /> <span className="text-sm font-bold">Profile Setup</span>
          </button>
          <button onClick={() => setView('dashboard')} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Activity size={20} /> <span className="text-sm font-bold">Market Intelligence</span>
          </button>
          <button onClick={() => setView('resume')} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'resume' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            <FileText size={20} /> <span className="text-sm font-bold">Resume Lab</span>
          </button>
          <button onClick={() => setView('chat')} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'chat' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            <MessageSquare size={20} /> <span className="text-sm font-bold">AI Strategist</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {loading && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-8 animate-in fade-in">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={32} className="text-indigo-600 animate-pulse" />
              </div>
            </div>
            <p className="text-slate-900 font-black text-2xl uppercase tracking-tighter">{loadingMsg}</p>
          </div>
        )}

        {/* PROFILE FORM VIEW */}
        {view === 'form' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-slide-up py-8">
            <header className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
                <Sparkles size={14} /> AI Trajectory Terminal
              </div>
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Design Your <span className="text-indigo-600 italic">2026 Goal.</span></h2>
            </header>
            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Education History</label>
                  <input 
                    type="text" placeholder="e.g. B.Sc Software Engineering"
                    className="w-full px-8 py-6 rounded-3xl border-2 border-slate-50 focus:border-indigo-500 outline-none bg-slate-50 font-bold text-lg"
                    value={profile.education} onChange={e => setProfile({...profile, education: e.target.value})}
                  />
                  <div className="flex flex-wrap gap-2">
                    {educationSuggestions.map(edu => (
                      <button key={edu} onClick={() => setProfile({...profile, education: edu})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${profile.education === edu ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-400'}`}>{edu}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Career Experience</label>
                  <select 
                    className="w-full px-8 py-6 rounded-3xl border-2 border-slate-50 focus:border-indigo-500 outline-none bg-slate-50 font-bold text-lg cursor-pointer" 
                    value={profile.experienceLevel} onChange={e => setProfile({...profile, experienceLevel: e.target.value})}
                  >
                    <option>Entry Level</option>
                    <option>Specialist</option>
                    <option>Managerial</option>
                    <option>Executive / C-Suite</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Dream Target Role</label>
                <input 
                  type="text" placeholder="e.g. Solutions Architect" 
                  className="w-full px-8 py-6 rounded-3xl border-2 border-slate-50 focus:border-indigo-500 outline-none bg-slate-50 font-bold text-lg" 
                  value={profile.careerGoal} onChange={e => setProfile({...profile, careerGoal: e.target.value})} 
                />
                <div className="flex flex-wrap gap-2">
                  {jobSuggestions.map(job => (
                    <button key={job} onClick={() => setProfile({...profile, careerGoal: job})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${profile.careerGoal === job ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}>{job}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Technical Stack / Interests</label>
                <textarea 
                  placeholder="Detail your skills like Python, React, Cloud, or specific passions..."
                  className="w-full px-8 py-6 rounded-3xl border-2 border-slate-50 focus:border-indigo-500 outline-none h-32 bg-slate-50 font-bold resize-none"
                  value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})}
                ></textarea>
              </div>
              <button onClick={handleStartAptitudeTest} className="w-full bg-slate-950 text-white py-10 rounded-[2.5rem] font-black text-2xl hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-4 group">
                START NEURAL AUDIT <Rocket size={32} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ASSESSMENT VIEW */}
        {view === 'assessment' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 py-8">
            <header className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
                <Brain size={14} /> Comprehensive Assessment
              </div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Neural <span className="text-indigo-600 italic">Validation.</span></h2>
              <p className="text-slate-500 font-bold">Checking knowledge across technical, logical, and coding domains for 2026.</p>
            </header>
            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-12 space-y-12">
              {questions.map((q, idx) => (
                <div key={q.id} className="space-y-8 pb-12 border-b border-slate-100 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      {q.type === 'technical_mcq' && <Cpu size={20} />}
                      {q.type === 'logical_mcq' && <Brain size={20} />}
                      {q.type === 'coding_challenge' && <Code size={20} />}
                      {q.type === 'situational' && <Terminal size={20} />}
                    </div>
                    <div className="space-y-2 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section 0{idx + 1} • {q.type.replace('_', ' ')}</span>
                      <h4 className="text-2xl font-black text-slate-900 leading-snug">{q.question}</h4>
                    </div>
                  </div>

                  {/* Render based on type */}
                  {(q.type === 'technical_mcq' || q.type === 'logical_mcq') && q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt) => (
                        <button 
                          key={opt}
                          onClick={() => setAnswers(prev => ({...prev, [q.id]: opt}))}
                          className={`p-6 rounded-3xl text-left font-bold transition-all border-2 ${answers[q.id] === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 text-slate-600 border-slate-50 hover:border-indigo-200'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {(q.type === 'coding_challenge' || q.type === 'situational') && (
                    <div className="relative group">
                      <div className="absolute top-4 left-4 text-slate-300 font-mono text-[10px] uppercase tracking-widest pointer-events-none">{q.type === 'coding_challenge' ? 'Write Solution Here' : 'Your Assessment Response'}</div>
                      <textarea 
                        className="w-full h-48 bg-slate-900 text-indigo-100 p-8 pt-10 rounded-3xl font-mono text-sm focus:ring-4 focus:ring-indigo-500/20 outline-none resize-none shadow-2xl"
                        placeholder={q.type === 'coding_challenge' ? "// Implement the requested logic..." : "Explain your thought process..."}
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                      ></textarea>
                    </div>
                  )}
                </div>
              ))}
              <button 
                onClick={handleAssessmentSubmit}
                className="w-full bg-slate-950 text-white py-10 rounded-[2.5rem] font-black text-2xl hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-4 group"
              >
                SUBMIT ASSESSMENT <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ASSESSMENT RESULT VIEW */}
        {view === 'assessmentResult' && assessmentResult && (
          <div className="max-w-5xl mx-auto space-y-12 animate-in zoom-in-95 py-8">
            <header className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
                <Activity size={14} /> Audit Completed
              </div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Neuro-Performance <span className="text-indigo-600">Sync.</span></h2>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-8">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Aggregated Aptitude Score</p>
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="#f1f5f9" strokeWidth="16" fill="transparent"/>
                    <circle 
                      cx="96" cy="96" r="80" stroke="#4f46e5" strokeWidth="16" fill="transparent" 
                      strokeDasharray={502} strokeDashoffset={502 - (502 * assessmentResult.score) / 100} 
                      strokeLinecap="round" className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-black text-5xl text-slate-900 tracking-tighter">{assessmentResult.score}%</span>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl w-full border border-indigo-100">
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold text-slate-700">{assessmentResult.summary}</p>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-10">
                <section className="bg-slate-950 p-10 rounded-[3.5rem] space-y-8 text-white shadow-2xl">
                  <h4 className="text-2xl font-black text-indigo-400 flex items-center gap-4"><Code /> Technical Feedback</h4>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl font-mono text-sm leading-relaxed text-slate-300 italic">
                    {assessmentResult.technicalFeedback}
                  </div>
                </section>

                <section className="bg-rose-50 border border-rose-100 p-10 rounded-[3.5rem] space-y-8">
                  <h4 className="text-2xl font-black text-rose-800 flex items-center gap-4"><AlertCircle /> Weak Spots Found</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assessmentResult.weakAreas.map((area, i) => (
                      <li key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-rose-100">
                        <XCircle size={20} className="text-rose-500 flex-shrink-0" />
                        <p className="text-sm font-bold text-rose-900/80">{area}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-indigo-50 border border-indigo-100 p-10 rounded-[3.5rem] space-y-8">
                  <h4 className="text-2xl font-black text-indigo-800 flex items-center gap-4"><Lightbulb /> Personalized Study Path</h4>
                  <div className="space-y-4">
                    {assessmentResult.studySuggestions.map((suggestion, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-lg transition-all">
                        <div>
                          <p className="text-lg font-black text-slate-900">{suggestion.topic}</p>
                          <p className="text-xs font-bold text-slate-400">Critical knowledge for {profile.careerGoal}</p>
                        </div>
                        <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                          Resouce: {suggestion.resource}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <button 
              onClick={handleProceedToTrajectory}
              className="w-full bg-slate-950 text-white py-10 rounded-[2.5rem] font-black text-2xl hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-4 group"
            >
              PROCEED TO MARKET RECOMMENDATIONS <Rocket size={32} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div className="max-w-[1280px] mx-auto space-y-12 animate-in fade-in py-8">
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-slate-200 pb-10">
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Market <span className="text-indigo-600">Intelligence.</span></h2>
                <p className="text-slate-500 font-bold">Top careers matching your assessment performance for 2026.</p>
              </div>
              <div className="flex flex-wrap gap-3 p-3 bg-white rounded-3xl border border-slate-100 shadow-xl">
                {recommendations.map((rec, i) => (
                  <button key={i} onClick={() => handleSelectCareer(rec)} className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] transition-all ${selectedCareer?.name === rec.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}>{rec.name}</button>
                ))}
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-12">
                {/* Advantages & Risks Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3.5rem] space-y-8 relative overflow-hidden group">
                      <div className="absolute -right-8 -top-8 p-12 bg-emerald-100/30 rounded-full opacity-50 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={120} className="text-emerald-500/20" />
                      </div>
                      <h4 className="text-2xl font-black text-emerald-800 flex items-center gap-4 relative z-10"><CheckCircle2 /> Key Advantages</h4>
                      <ul className="space-y-6 relative z-10">
                        {analysis?.simulation.advantages.map((adv, i) => (
                          <li key={i} className="flex gap-4 items-start">
                            <Zap size={20} className="text-emerald-500 mt-1 flex-shrink-0" />
                            <p className="text-sm font-bold text-emerald-900/80 leading-relaxed">{adv}</p>
                          </li>
                        )) || [1,2,3].map(i => <div key={i} className="h-4 bg-emerald-200/50 rounded-full animate-pulse w-full"></div>)}
                      </ul>
                   </div>
                   <div className="bg-rose-50 border border-rose-100 p-10 rounded-[3.5rem] space-y-8 relative overflow-hidden group">
                      <div className="absolute -right-8 -top-8 p-12 bg-rose-100/30 rounded-full opacity-50 group-hover:scale-110 transition-transform">
                        <AlertCircle size={120} className="text-rose-500/20" />
                      </div>
                      <h4 className="text-2xl font-black text-rose-800 flex items-center gap-4 relative z-10"><AlertCircle /> Market Risks</h4>
                      <ul className="space-y-6 relative z-10">
                        {analysis?.simulation.risks.map((risk, i) => (
                          <li key={i} className="flex gap-4 items-start">
                            <XCircle size={20} className="text-rose-500 mt-1 flex-shrink-0" />
                            <p className="text-sm font-bold text-rose-900/80 leading-relaxed">{risk}</p>
                          </li>
                        )) || [1,2,3].map(i => <div key={i} className="h-4 bg-rose-200/50 rounded-full animate-pulse w-full"></div>)}
                      </ul>
                   </div>
                </section>

                {/* Salary ROI Engine */}
                <section className="bg-slate-950 p-12 rounded-[4rem] text-white space-y-10 shadow-2xl relative overflow-hidden">
                   <div className="flex items-center justify-between relative z-10">
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black text-emerald-400 flex items-center gap-3"><TrendingUp /> Salary Forecast</h3>
                        <p className="text-slate-500 font-bold text-sm">Predicted 5-year ROI based on trajectory alignment.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em]">Trajectory ROI</p>
                        <p className="text-4xl font-black text-white">{analysis?.growth.growthPercentage || '...'}</p>
                      </div>
                   </div>
                   <div className="h-72 w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={salaryData}>
                            <defs>
                              <linearGradient id="colorSal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff'}} itemStyle={{color: '#10b981'}} />
                            <Area type="monotone" dataKey="salary" stroke="#10b981" strokeWidth={6} fillOpacity={1} fill="url(#colorSal)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </section>

                {/* Masterclass Hub */}
                <section className="space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black flex items-center gap-4 text-slate-900"><Youtube className="text-rose-600" /> Neural Masterclass Hub</h3>
                    <div className="px-5 py-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">Top-Tier Courses</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {analysis?.masterclasses.map((vid, i) => (
                      <a key={i} href={vid.url} target="_blank" rel="noopener noreferrer" className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl hover:shadow-indigo-500/20 transition-all group flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Youtube size={120} />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/20 group-hover:scale-110 transition-transform">
                            <PlayCircle size={32} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xl font-black text-white truncate">{vid.title}</h4>
                            <p className="text-xs text-rose-400 font-bold uppercase tracking-widest">{vid.channel}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-slate-400 text-sm font-medium line-clamp-2 relative z-10">
                          Complete professional curriculum specifically aligned with your 2026 trajectory.
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest relative z-10">
                          Stream Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </a>
                    )) || [1,2].map(i => <div key={i} className="h-48 bg-slate-900 rounded-[3.5rem] animate-pulse"></div>)}
                  </div>
                </section>

                {/* Coursera & Certifications Terminal */}
                <section className="space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black flex items-center gap-4 text-slate-900"><Award className="text-indigo-600" /> High-Value Certifications</h3>
                    <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">Recommended for 2026</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {analysis?.certifications.map((cert, i) => (
                      <div key={i} className="bg-white border border-slate-100 p-10 rounded-[3.5rem] shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all group border-b-[8px] border-indigo-600">
                        <div className="space-y-6">
                          <div className="flex items-start justify-between">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <BookOpen size={28} />
                            </div>
                            <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">{cert.provider}</span>
                          </div>
                          <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{cert.name}</h4>
                          <div className="flex gap-6">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-400"><Clock size={14}/> {cert.duration}</span>
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-400"><Target size={14}/> {cert.difficulty}</span>
                          </div>
                        </div>
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="mt-10 py-5 bg-slate-50 text-slate-900 font-black rounded-2xl text-center flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all">
                          ENROLL NOW <ArrowRight size={18} />
                        </a>
                      </div>
                    )) || [1,2].map(i => <div key={i} className="h-64 bg-white rounded-[3.5rem] animate-pulse"></div>)}
                  </div>
                </section>

                {/* Turbo Roadmap Section */}
                <section className="space-y-10">
                   <h3 className="text-3xl font-black flex items-center gap-4 text-slate-900"><Video className="text-indigo-600" /> Turbo Roadmap</h3>
                   <div className="space-y-8">
                      {analysis?.roadmap.map((step, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-10 rounded-[4rem] shadow-sm flex flex-col xl:flex-row gap-12 border-l-[16px] border-indigo-600 hover:shadow-xl transition-all">
                          <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-6">
                              <span className="w-16 h-16 bg-indigo-50 text-indigo-600 font-black text-2xl rounded-[2rem] flex items-center justify-center">0{step.month}</span>
                              <h4 className="text-3xl font-black text-slate-900">{step.topics[0]} Mastery</h4>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {step.topics.map((t, j) => <span key={j} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600"># {t}</span>)}
                            </div>
                            <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100">
                               <p className="text-sm font-black text-indigo-700 uppercase tracking-widest mb-2">Target Project</p>
                               <p className="text-lg font-bold text-slate-800 italic">"{step.miniProject}"</p>
                            </div>
                          </div>
                          <div className="xl:w-96 bg-slate-900 rounded-[3rem] p-8 space-y-6 text-white shadow-2xl relative overflow-hidden">
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3"><Youtube size={16}/> Essential Tutorials</p>
                             <div className="space-y-4 relative z-10">
                                {step.recommendedVideos.map((vid, k) => (
                                  <a key={k} href={vid.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                    <div className="p-3 bg-white/10 rounded-xl group-hover:bg-indigo-600 transition-colors">
                                      <PlayCircle size={24} className="text-white" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-black truncate text-white">{vid.title}</p>
                                      <p className="text-[10px] text-slate-400 uppercase font-bold">{vid.channel}</p>
                                    </div>
                                  </a>
                                ))}
                             </div>
                          </div>
                        </div>
                      )) || [1,2].map(i => <div key={i} className="h-64 bg-white rounded-[4rem] animate-pulse"></div>)}
                   </div>
                </section>
              </div>

              <div className="lg:col-span-4 space-y-12">
                {/* Fit Score Progress Circle */}
                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-8 sticky top-12">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Neural Alignment Score</h3>
                  <div className="relative w-52 h-52">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="104" cy="104" r="88" stroke="#f1f5f9" strokeWidth="16" fill="transparent"/>
                      <circle 
                        cx="104" cy="104" r="88" stroke="#4f46e5" strokeWidth="16" fill="transparent" 
                        strokeDasharray={553} strokeDashoffset={553 - (553 * (selectedCareer?.fitScore || 0)) / 100} 
                        strokeLinecap="round" className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-black text-6xl text-slate-900 tracking-tighter">{selectedCareer?.fitScore || 0}%</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-lg font-black text-slate-900 tracking-tight leading-snug">"{selectedCareer?.reason}"</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                       Market Stability: {analysis?.growth.stabilityLevel || 'High'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESUME LAB VIEW */}
        {view === 'resume' && (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in py-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-12">
               <div className="space-y-4">
                  <h2 className="text-7xl font-black text-slate-900 tracking-tighter">Resume <span className="text-indigo-600 italic">Lab.</span></h2>
                  <p className="text-slate-500 font-bold text-lg">Neural ATS optimization powered by Gemini 3.5 Turbo.</p>
               </div>
               <div className="flex flex-wrap gap-4">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-8 py-5 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-black flex items-center gap-4 hover:bg-slate-50 shadow-xl transition-all">
                    <FileUp size={28} className="text-indigo-600" /> UPLOAD DOSSIER
                  </button>
                  {resumeMode === 'result' && (
                    <button onClick={() => setResumeMode('edit')} className="px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-4 shadow-xl">
                       <Settings size={24} /> RE-CONFIGURE
                    </button>
                  )}
               </div>
            </header>

            {resumeMode === 'edit' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden group">
                   <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Input / Source Text</span>
                      <button onClick={() => setResumeText('')} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Clear Terminal</button>
                   </div>
                   <textarea 
                    placeholder="Paste raw resume content here for deep neural audit..."
                    className="w-full h-[650px] p-12 text-slate-800 font-bold text-xl outline-none resize-none bg-white leading-relaxed placeholder:text-slate-200"
                    value={resumeText} onChange={e => setResumeText(e.target.value)}
                  ></textarea>
                </div>
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-indigo-600 p-12 rounded-[4rem] text-white space-y-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-12 -bottom-12 p-16 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                       <Wand2 size={160} />
                    </div>
                    <h3 className="text-3xl font-black flex items-center gap-4 relative z-10"><Wand2 /> Start Neural Audit</h3>
                    <p className="text-lg font-bold opacity-80 relative z-10 leading-relaxed">Our optimizer will align your profile with 2026 recruitment bots and inject high-impact keywords.</p>
                    <button onClick={handleResumeAnalysis} className="w-full py-7 bg-white text-indigo-600 rounded-[2rem] font-black text-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-4 relative z-10 shadow-xl">
                      SCAN FOR ATS <ChevronRight size={28} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-4">
                <div className="lg:col-span-4 space-y-10">
                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl text-center space-y-6 relative overflow-hidden">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Neural ATS Score</p>
                    <div className="text-8xl font-black text-indigo-600 tracking-tighter">{resumeAnalysis?.score || 0}</div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-600 transition-all duration-1000" style={{width: `${resumeAnalysis?.score}%`}}></div>
                    </div>
                    <p className="text-sm font-bold text-slate-500">Trajectory visibility: <span className="text-indigo-600 font-black uppercase tracking-widest">{resumeAnalysis?.score && resumeAnalysis.score > 80 ? 'Optimal' : 'Needs Optimization'}</span></p>
                  </div>
                  <div className="bg-slate-900 p-10 rounded-[4rem] text-white space-y-8 shadow-2xl">
                    <h4 className="text-2xl font-black flex items-center gap-4"><Target className="text-indigo-400"/> Critical Keywords</h4>
                    <div className="flex flex-wrap gap-3">
                      {resumeAnalysis?.missingKeywords.map(kw => <span key={kw} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold border border-white/5">{kw}</span>)}
                    </div>
                    <button onClick={handleResumeOptimization} className="w-full py-6 bg-indigo-600 rounded-[2rem] font-black text-lg hover:bg-indigo-500 transition-all shadow-xl flex items-center justify-center gap-3">
                       GENERATE OPTIMIZED RESUME <Wand2 size={24}/>
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-10">
                  {optimizedResume ? (
                    <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[750px] animate-in zoom-in-95">
                      <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                           <ShieldCheck size={28} className="text-indigo-600" />
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">ATS-Compliant Optimized Dossier</span>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={() => {navigator.clipboard.writeText(optimizedResume.optimizedText); alert('Neural blueprint copied to clipboard.')}} className="p-5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all hover:text-indigo-600" title="Copy to Clipboard"><Copy size={24} /></button>
                          <button onClick={handlePrintATS} className="px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition-all">
                             <Printer size={20}/> PRINT ATS PDF
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 p-16 overflow-y-auto font-serif text-slate-800 whitespace-pre-wrap leading-relaxed text-[16px]">
                        {optimizedResume.optimizedText}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white h-[650px] rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                        <Loader2 size={48} className="animate-spin text-indigo-400" />
                      </div>
                      <p className="font-black uppercase text-sm tracking-[0.5em] text-slate-400">Awaiting Optimized Synthesis</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHAT VIEW */}
        {view === 'chat' && (
          <div className="max-w-5xl mx-auto h-[calc(100vh-160px)] flex flex-col py-8 animate-in fade-in">
            <div className="flex-1 bg-white rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40">
                    <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] flex items-center justify-center text-white shadow-2xl"><BrainCircuit size={64} /></div>
                    <div className="space-y-2">
                       <p className="font-black text-4xl text-slate-900 uppercase tracking-tighter">Strategist Terminal</p>
                       <p className="text-slate-500 font-bold max-w-sm mx-auto">Inquire about career negotiation, Coursera certification paths, or market trends for 2026.</p>
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-8 rounded-[3rem] font-bold text-xl leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-12 border-t border-slate-100 bg-white flex gap-6">
                <input 
                  type="text" placeholder="Engage with Neural Strategist..." 
                  className="flex-1 px-10 py-8 rounded-[2.5rem] border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-2xl text-slate-800 bg-slate-50 shadow-inner" 
                  value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} 
                />
                <button onClick={handleChat} className="px-12 bg-slate-950 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-4 text-xl">
                  SEND <ChevronRight size={32} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
