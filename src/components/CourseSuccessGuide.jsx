import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, ChevronDown, ChevronUp, Star, Download,
    MessageSquare, BookOpen, AlertCircle, FileText,
    BarChart2, Users, ExternalLink, Calendar, TrendingUp
} from 'lucide-react';
import { generateCourseData } from '../utils/mockDataGenerator';

// --- SUB-COMPONENTS --- //

function CircularProgress({ value, max = 5, label, color = 'text-blue-600', subColor = 'stroke-blue-600' }) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / max) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-2">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        className="text-gray-100"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="48"
                        cy="48"
                    />
                    <circle
                        className={`${subColor} transition-all duration-1000 ease-out`}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="48"
                        cy="48"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${color}`}>{value}</span>
                </div>
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}

function ProfCard({ prof }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                        {prof.name.split(' ')[1][0]}
                    </div>
                    <h4 className="font-bold text-gray-900">{prof.name}</h4>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
                    <Star size={12} fill="currentColor" /> {prof.rating}
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                {prof.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100 font-medium">
                        {tag}
                    </span>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                <div className="text-center">
                    <span className="block font-bold text-gray-900 text-sm">{prof.difficulty}</span>
                    <span>Difficulty</span>
                </div>
                <div className="text-center border-l border-gray-50">
                    <span className="block font-bold text-gray-900 text-sm">{prof.wouldTakeAgain}</span>
                    <span>Take Again</span>
                </div>
            </div>
        </div>
    );
}

function Accordion({ title, icon: Icon, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4 transition-all hover:shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 bg-gray-50/30 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg shadow-sm ${isOpen ? 'bg-red-600 text-white' : 'bg-white text-red-700'} transition-colors`}>
                        <Icon size={20} />
                    </div>
                    <span className={`font-bold text-lg ${isOpen ? 'text-gray-900' : 'text-gray-700'}`}>{title}</span>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>

            {isOpen && (
                <div className="p-6 border-t border-gray-100 animate-slide-down">
                    {children}
                </div>
            )}
        </div>
    );
}

// --- MAIN PAGE --- //

export default function CourseSuccessGuide({ course, onBack }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        if (course) {
            setTimeout(() => {
                const generated = generateCourseData(course.code);
                setData(generated);
            }, 400);
        }
    }, [course]);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center animate-pulse">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart2 size={32} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20 animate-fade-in relative">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                {course.code}
                                <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded font-bold">ANALYSIS</span>
                            </h1>
                            <p className="text-xs text-gray-500 max-w-md line-clamp-1">{course.title}</p>
                        </div>
                    </div>

                    <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-transform active:scale-95 shadow-lg">
                        <Download size={16} /> Save Guide
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

                {/* 1. VISUALIZERS (AT TOP) */}
                <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <TrendingUp className="text-red-600" /> Vital Statistics
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 items-center">

                        {/* Circular Stats */}
                        <CircularProgress value={data.stats.difficulty} label="Difficulty" color="text-red-600" subColor="stroke-red-600" />
                        <CircularProgress value={data.stats.workload} max={10} label="Workload (Hrs)" color="text-orange-600" subColor="stroke-orange-600" />
                        <CircularProgress value={data.stats.valuable} label="Value" color="text-green-600" subColor="stroke-green-600" />

                        {/* Grade Distribution */}
                        <div className="w-full h-32 flex flex-col justify-end">
                            <div className="flex text-xs font-bold text-gray-400 mb-2 justify-between px-1">
                                <span>DISTRIBUTION</span>
                                <span className="text-green-600">AVG: B+</span>
                            </div>
                            <div className="flex items-end h-full gap-2">
                                {data.stats.gradeDistribution.map((g, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                        <div
                                            className="w-full bg-gray-100 rounded-t-md relative overflow-hidden group-hover:bg-gray-200 transition-all"
                                            style={{ height: `${g.percent}%` }}
                                        >
                                            <div className="absolute inset-x-0 bottom-0 top-[20%] bg-gradient-to-t from-blue-600 to-blue-400 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">{g.grade}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Instructors */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="text-gray-400" size={20} /> Instructors
                            </h3>
                            <button className="text-xs font-bold text-red-600 hover:underline">View All</button>
                        </div>

                        <div className="space-y-4">
                            {data.profs.map(p => <ProfCard key={p.id} prof={p} />)}
                        </div>

                        {/* Call to Actions */}
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2">Have you taken this?</h4>
                            <p className="text-xs text-blue-700 mb-4">Help 3,000+ students by sharing your grade and experience.</p>
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-colors">
                                Add Review
                            </button>
                        </div>
                    </div>

                    {/* Right: Accordions */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                            <BookOpen className="text-gray-400" size={20} /> Detailed Insights
                        </h3>

                        {/* Focus */}
                        <Accordion title="Critical Focus Areas" icon={AlertCircle} defaultOpen>
                            <div className="grid gap-4">
                                {data.focus.map((f, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${f.importance === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            !
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{f.topic}</h4>
                                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{f.tip}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Accordion>

                        {/* Syllabi */}
                        <Accordion title="Syllabi Database" icon={Calendar}>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {data.syllabi.map((s, i) => (
                                    <button key={i} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-xl group transition-all text-left">
                                        <div>
                                            <div className="font-bold text-gray-900">{s.term}</div>
                                            <div className="text-xs text-gray-500">{s.prof}</div>
                                        </div>
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-red-600 transition-colors">
                                            <Download size={16} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Accordion>

                        {/* Notes */}
                        <Accordion title="Community Notes" icon={FileText}>
                            <div className="space-y-3">
                                {data.notes.map((n, i) => (
                                    <button key={i} className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-red-200 rounded-xl hover:bg-red-50/50 transition-all group text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                                <FileText size={18} className="text-gray-500 group-hover:text-red-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm group-hover:text-red-700">{n.title}</div>
                                                <div className="text-xs text-gray-500">Shared by {n.author} • {n.date}</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            {n.upvotes} ▲
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-sm hover:border-red-300 hover:text-red-600 transition-colors">
                                + Upload Your Notes
                            </button>
                        </Accordion>

                        {/* Alumni */}
                        <Accordion title="Alumni Wisdom" icon={MessageSquare}>
                            <div className="grid gap-4">
                                {data.reviews.map((r, i) => (
                                    <div key={i} className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                    {r.author.slice(-2)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{r.author}</div>
                                                    <div className="text-[10px] text-gray-400">{r.semester}</div>
                                                </div>
                                            </div>
                                            <div className="text-yellow-500 flex text-xs">
                                                {'★'.repeat(r.rating)}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 italic leading-relaxed">"{r.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        </Accordion>

                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-center pt-8 border-t border-gray-200">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-gray-800 text-gray-700 font-bold rounded-xl transition-all shadow-sm hover:shadow-md">
                        <ExternalLink size={18} /> View Official Suggestion Page
                    </button>
                </div>
            </div>
        </div>
    );
}
