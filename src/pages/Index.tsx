import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Leaf, Shield, FileText, ArrowRight, CheckCircle2, ArrowUpRight, X,
  FileEdit, Upload, Search, HelpCircle, GitBranch, Menu,
  CloudUpload, Zap, Activity, Lock, BarChart3, TreePine,
  Send, ClipboardCheck, Award, Globe, Mail, Info, Phone,
  MapPin, ChevronRight, Star, Users, Building2, Scale,
  Sprout, Mountain, Waves, Trees, Bird, Eye, TrendingUp,
  FileCheck, Clock, Sparkles, ExternalLink, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const features = [
  { icon: CloudUpload, title: "Upload & Connect Seamlessly", desc: "Submit your environmental clearance applications digitally. Upload all required documents with drag-and-drop ease." },
  { icon: Shield, title: "Free & Fast Security", desc: "Role-based access to the entire workflow. Data with full encryption and tamper-proof audit trails." },
  { icon: Scale, title: "Flexible Compliance", desc: "Manage your compliance requirements with flexible policies adapted to your project category and scale." },
  { icon: BarChart3, title: "Cost & Analyzer Reviews", desc: "Effortlessly track your application reviews with Cost & Impact Analysis. Simplify compliance management." },
];

const standoutFeatures = [
  { icon: Eye, title: "Real-time Status Tracking", desc: "Track application stage, pending tasks, and expected timelines with live updates.", color: "bg-green-500" },
  { icon: Zap, title: "Effortless Workflow", desc: "Automated routing of applications to correct departments reduces processing time.", color: "bg-emerald-500" },
  { icon: Lock, title: "Secure & Compliant", desc: "Encrypted document storage with timestamped logs for all legal and environmental data.", color: "bg-teal-500" },
];

const services = [
  { tag: "Environmental Clearance", desc: "End-to-end digital processing of environmental clearance applications for industries across Chhattisgarh." },
  { tag: "Scrutiny & Review", desc: "Expert review and verification of submitted proposals by the environmental scrutiny team." },
  { tag: "Compliance Monitoring", desc: "Track environmental compliance status, conditions, and ongoing monitoring requirements." },
  { tag: "Forest Management", desc: "Integrated forest conservation tracking and afforestation progress monitoring." },
];

const impacts = [
  { value: "500+", label: "Applications Processed" },
  { value: "7", label: "Stage Pipeline" },
  { value: "24/7", label: "Digital Access" },
  { value: "100%", label: "Transparency Rate" },
];

const awards = [
  { title: "National e-Governance Award", highlight: "e-Governance", year: "2024" },
  { title: "Digital India Innovation Award", highlight: "Innovation", year: "2024" },
  { title: "Outstanding Environmental Initiative", highlight: "Environmental", year: "2023" },
  { title: "Pioneering Green Technology Portal", highlight: "Green Technology", year: "2023" },
  { title: "Best-in-State Portal Award", highlight: "Best-in-State", year: "TBD" },
];

const partners = [
  { name: "MoEFCC", icon: Building2 },
  { name: "CECB", icon: Shield },
  { name: "NIC", icon: Globe },
  { name: "CPCB", icon: Activity },
  { name: "CSIR", icon: Sparkles },
  { name: "ISRO", icon: Star },
];

const Index = () => {
  const [activeService, setActiveService] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white text-slate-900 font-sans">

      {/* ──────── ANNOUNCEMENT BANNER ──────── */}
      {bannerVisible && (
        <div className="bg-green-900 text-white text-center py-2.5 px-6 text-sm relative">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-300" />
            <span>Announcing our new AI-powered Environmental Impact Analysis — </span>
            <a href="#services" className="text-green-300 font-semibold underline underline-offset-2 hover:text-green-200">Learn more</a>
          </span>
          <button onClick={() => setBannerVisible(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ──────── NAVBAR ──────── */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-lg border-b border-slate-100 px-6 md:px-16 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">Parivesh <span className="text-green-600">3.0</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Features", "Services", "Impact", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors">
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-semibold rounded-xl">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="text-sm font-semibold rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 gap-1.5">
                Open an account <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 space-y-4 shadow-lg">
            {["Home", "Features", "Services", "Impact", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block text-sm font-semibold text-slate-700" onClick={() => setMobileMenuOpen(false)}>
                {item}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1"><Button variant="outline" className="w-full rounded-xl">Sign In</Button></Link>
              <Link to="/register" className="flex-1"><Button className="w-full rounded-xl bg-green-600">Register</Button></Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ──────── HERO ──────── */}
        <section id="home" className="relative bg-gradient-to-b from-green-50/80 via-white to-white pt-16 pb-8 px-6 md:px-16 overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #166534 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          <div className="relative max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-wider uppercase bg-green-100 text-green-700 rounded-full">
              <Star className="h-3.5 w-3.5" /> Whatever your project size, sector, or stage of growth
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
              Unlock the power
              <br />
              of <span className="italic font-serif text-green-600">environmental clearance</span>
            </h1>

            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Keep your environmental compliance needs safely organized under one portal — manage applications quickly, easily & efficiently.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/register">
                <Button size="lg" className="px-8 py-6 text-base font-bold rounded-xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20 gap-2 transition-all hover:-translate-y-0.5">
                  Discover Our Portal <ArrowUpRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="px-8 py-6 text-base font-bold rounded-xl border-slate-200 gap-2">
                  Learn More <ArrowUpRight className="h-5 w-5" />
                </Button>
              </a>
            </div>

            {/* ──── Dashboard Mockup ──── */}
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute -inset-4 bg-gradient-to-b from-green-200/30 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
                {/* Mockup Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-bold text-slate-700">Parivesh</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 ml-6">
                      {["Overview", "Activity", "Reports"].map((tab, i) => (
                        <span key={tab} className={`text-xs font-medium px-3 py-1 rounded-full ${i === 0 ? "bg-green-600 text-white" : "text-slate-400"}`}>
                          {tab}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-slate-300" />
                    <Bell className="h-4 w-4 text-slate-300" />
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-green-700">OP</span>
                    </div>
                  </div>
                </div>

                {/* Mockup Content */}
                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <p className="text-sm text-slate-400 mb-1">Good morning, Oripio</p>
                    <p className="text-xs text-slate-400">Stay on top of your tasks, monitor progress, and track status.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-400 mb-2">Total Applications</p>
                      <p className="text-xl font-black text-slate-900">532</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-[10px] font-bold text-green-600">+12.5%</span>
                      </div>
                    </div>
                    <div className="bg-green-600 rounded-xl p-4 text-white">
                      <p className="text-xs text-green-200 mb-2">Approved</p>
                      <p className="text-xl font-black">389</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-200" />
                        <span className="text-[10px] font-bold text-green-200">+8.2%</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-400 mb-2">Under Review</p>
                      <p className="text-xl font-black text-slate-900">97</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-400 mb-2">Pending</p>
                      <p className="text-xl font-black text-slate-900">46</p>
                    </div>
                  </div>

                  {/* Mini bar chart */}
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 55, 80, 70, 90, 60, 75, 85, 50, 95, 70].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-green-500/80 transition-all" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-300">Jan</span>
                    <span className="text-[10px] text-slate-300">Dec</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────── STATS BAR (Finixlab-style) ──────── */}
        <section className="py-12 px-6 md:px-16 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 text-slate-500">
              <Leaf className="h-6 w-6 text-green-600" />
              <span className="text-sm font-semibold">Powered and supported by<br />leading government agencies</span>
            </div>
            <div className="flex items-center gap-12 md:gap-16">
              {[
                { value: "500+", label: "Applications Processed" },
                { value: "3M+", label: "Documents Handled" },
                { value: "159+", label: "Industries Served" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <span className="block text-3xl md:text-4xl font-black text-slate-900">{stat.value}</span>
                  <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── HOW IT WORKS (Finixlab badge style) ──────── */}
        <section className="py-24 px-6 md:px-16 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-wider uppercase bg-green-100 text-green-700 rounded-full">
              <Star className="h-3.5 w-3.5" /> How it works
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
              The power of your data
              <br />
              <span className="italic font-serif text-green-600">with Parivesh 3.0</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-20">
              Know your application journey end-to-end: simple, automated, and completely transparent.
            </p>

            {/* Feature Grid (Finixlab-style 2x2) */}
            <div id="features" className="grid md:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <div key={f.title} className="text-left bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-green-600/5 hover:border-green-200 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5 group-hover:bg-green-600 transition-colors">
                    <f.icon className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── STANDOUT FEATURES (Finixlab-style with mini cards) ──────── */}
        <section className="py-24 px-6 md:px-16 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-wider uppercase bg-green-100 text-green-700 rounded-full">
                <Star className="h-3.5 w-3.5" /> Our Features
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                Can you Explore the
                <br />
                <span className="italic font-serif text-green-600">standout features</span>
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Your environmental compliance needs safety, supervision, and transparency — we provide all of it, seamlessly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {standoutFeatures.map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-green-600/5 transition-all duration-300 group">
                  {/* Mini embedded UI mockup */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${f.color} flex items-center justify-center`}>
                          <f.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="w-16 h-2 bg-slate-200 rounded-full" />
                          <div className="w-10 h-1.5 bg-slate-100 rounded-full mt-1" />
                        </div>
                      </div>
                      <span className="text-lg font-black text-slate-900">532</span>
                    </div>
                    <div className="flex items-end gap-1 h-12">
                      {[30, 50, 40, 70, 55, 80, 60].map((h, i) => (
                        <div key={i} className={`flex-1 rounded-t-sm ${f.color} opacity-70`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── PARTNERS (Finixlab pill-style) ──────── */}
        <section className="py-16 px-6 md:px-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-sm font-semibold text-slate-400 mb-10">We partner with the nation's leading agencies</p>
            <div className="flex flex-wrap justify-center gap-4">
              {partners.map((p) => (
                <div key={p.name} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:border-green-300 hover:bg-green-50 transition-all cursor-default">
                  <p.icon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── SERVICES (original agriculture-style) ──────── */}
        <section id="services" className="py-24 px-6 md:px-16 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Take a Look at Our Cutting-Edge
                <br />
                <span className="text-green-600">Services</span> For You!
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {services.map((s, i) => (
                <button
                  key={s.tag}
                  onClick={() => setActiveService(i)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeService === i
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-green-300 hover:text-green-600"
                    }`}
                >
                  {s.tag}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">{services[activeService].tag}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{services[activeService].desc}</p>
                <ul className="space-y-3">
                  {["Digital document submission", "Real-time status tracking", "Automated notifications", "Compliance reports"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="rounded-xl bg-green-600 hover:bg-green-700 mt-4 gap-2">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Trees, from: "from-green-800", to: "to-emerald-900" },
                  { icon: Mountain, from: "from-emerald-700", to: "to-green-800" },
                  { icon: Waves, from: "from-green-700", to: "to-teal-800" },
                  { icon: Bird, from: "from-teal-700", to: "to-emerald-800" },
                ].map((item, i) => (
                  <div key={i} className={`bg-gradient-to-br ${item.from} ${item.to} h-48 rounded-2xl flex items-center justify-center`}>
                    <item.icon className="h-16 w-16 text-green-300/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ──────── MONITOR SECTION (Finixlab-style with embedded cards) ──────── */}
        <section className="py-24 px-6 md:px-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold tracking-wider uppercase bg-green-100 text-green-700 rounded-full">
                  <Star className="h-3.5 w-3.5" /> Analytics Dashboard
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
                  Monitor your
                  <br />
                  clearance <span className="italic font-serif text-green-600">Analyzing</span>
                  <br />
                  <span className="italic font-serif text-green-600">progress.</span>
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Keep your environmental compliance portfolio organized. Monitor real-time progress across all your applications with our analytics dashboard.
                </p>
                <Link to="/register">
                  <Button className="rounded-xl bg-green-600 hover:bg-green-700 gap-2 shadow-lg shadow-green-600/15">
                    Discover Our Portal <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Embedded UI Cards */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-400">Total Active</p>
                      <p className="text-2xl font-black text-slate-900">$271.00</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {[35, 50, 45, 65, 55, 75, 60, 85, 70, 90, 80, 95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-green-500 opacity-80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
                    <p className="text-xs text-slate-400 mb-1">Avg. Processing</p>
                    <p className="text-xl font-black text-slate-900">$369.00 – $161.00</p>
                    <div className="mt-3 flex gap-1 items-end h-10">
                      {[40, 60, 50, 70, 55, 80].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t bg-emerald-400 opacity-70" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
                    <p className="text-xs text-slate-400 mb-1">Compliance Rate</p>
                    <div className="flex items-center gap-4 mt-2">
                      {[
                        { pct: 89, color: "text-green-600" },
                        { pct: 72, color: "text-emerald-500" },
                        { pct: 65, color: "text-teal-500" },
                      ].map((item, i) => (
                        <div key={i} className="text-center">
                          <p className={`text-lg font-black ${item.color}`}>{item.pct}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────── IMPACT ──────── */}
        <section id="impact" className="py-24 px-6 md:px-16 bg-gradient-to-br from-green-900 via-emerald-900 to-green-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-green-400 blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-emerald-400 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                We Create Through
                <br />
                Our <span className="text-green-300">Impact</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {impacts.map((item) => (
                <div key={item.label} className="text-center">
                  <span className="block text-5xl md:text-6xl font-black text-white mb-2">{item.value}</span>
                  <span className="text-sm font-medium text-green-300/80">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── AWARDS ──────── */}
        <section className="py-24 px-6 md:px-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Awards & Recognitions</h2>

            <div className="space-y-0">
              {awards.map((award) => (
                <div key={award.title} className="flex items-center justify-between py-5 border-b border-slate-200 group hover:bg-green-50 hover:px-6 hover:rounded-xl hover:border-transparent transition-all duration-300">
                  <p className="text-base md:text-lg text-slate-700 font-medium">
                    {award.title.split(award.highlight).map((part, j) => (
                      <span key={j}>
                        {part}
                        {j < award.title.split(award.highlight).length - 1 && (
                          <span className="text-green-600 font-bold">{award.highlight}</span>
                        )}
                      </span>
                    ))}
                  </p>
                  <span className="text-sm font-bold text-slate-400 group-hover:text-green-600 transition-colors">{award.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── SUSTAINABILITY BANNER ──────── */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-green-800 via-emerald-800 to-green-900 py-28 px-6">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-green-400/20 to-transparent" />
            </div>
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <p className="text-green-300/70 text-sm uppercase tracking-[0.3em] font-bold mb-6">Sustainable</p>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
                ENVIRONMENTAL
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">GOVERNANCE</span>
              </h2>
            </div>
          </div>
        </section>

        {/* ──────── CONTACT ──────── */}
        <section id="contact" className="py-24 px-6 md:px-16 bg-green-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-green-400 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                  We Look Forward To
                  <br />
                  <span className="text-green-300">Hear From You!</span>
                </h2>
                <p className="text-white/60 mb-10 text-lg">
                  Have questions about the clearance process? Get in touch with our support team.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: Phone, label: "Phone", value: "+91 771 254 XXXX" },
                    { icon: Mail, label: "Email", value: "support@parivesh3.cg.gov.in" },
                    { icon: MapPin, label: "Address", value: "CECB, Raipur, Chhattisgarh" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-green-300" />
                      </div>
                      <div>
                        <p className="text-sm text-white/50">{item.label}</p>
                        <p className="font-semibold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="First Name" className="h-12 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/40" />
                    <Input placeholder="Last Name" className="h-12 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/40" />
                  </div>
                  <Input type="email" placeholder="Email Address" className="h-12 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/40" />
                  <Input placeholder="Phone Number" className="h-12 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/40" />
                  <Textarea placeholder="Your Message" rows={4} className="rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/40" />
                  <Button className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg shadow-green-500/20">
                    Send Message <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ──────── FOOTER ──────── */}
      <footer className="bg-slate-950 text-white py-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg">Parivesh 3.0</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Unified portal for environmental clearance in Chhattisgarh. Making sustainable growth easier for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-green-400 transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-green-400 transition-colors">Register</Link></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Public Notices</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Compliance</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">Environmental Acts</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Regulatory Framework</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">EC Process Map</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Statutory Forms</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Follow Us</h4>
              <div className="flex gap-3">
                {[Globe, Mail, Info].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Chhattisgarh Environmental Conservation Board. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
