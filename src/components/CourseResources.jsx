import React, { useState } from 'react';
import { FileText, Video, Book, Lock, Download, ExternalLink, PlayCircle } from 'lucide-react';

export default function CourseResources({ course, unlocked, onUnlock }) {
    const [activeTab, setActiveTab] = useState('notes');

    // Mock personalized content generator
    const generateContent = () => {
        const dept = course.dept || course.code.split(' ')[0];

        const notes = [
            { title: `${dept} Final Exam Cheatsheet`, type: 'PDF', votes: 142 },
            { title: 'Lecture 1-5 Summary Notes', type: 'Notion', votes: 89 },
            { title: 'Community Study Guide (Spring 2025)', type: 'Google Doc', votes: 34 }
        ];

        const videos = [
            { title: `Crash Course: ${course.title}`, duration: '12:40', views: '1.2k' },
            { title: 'Midterm Review Walkthrough', duration: '45:10', views: '850' },
            { title: `Understanding ${dept} Core Concepts`, duration: '08:20', views: '3.4k' }
        ];

        const syllabi = [
            { term: 'Fall 2025', prof: 'Dr. Smith', difficulty: '4.2/5' },
            { term: 'Spring 2025', prof: 'Prof. Wong', difficulty: '3.8/5' },
            { term: 'Fall 2024', prof: 'Dr. Doe', difficulty: '4.0/5' }
        ];

        return { notes, videos, syllabi };
    };

    const content = generateContent();

    return (
        <div className="relative h-full flex flex-col">

            {/* Header Tabs */}
            <div className="flex border-b border-gray-100 mb-4">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'notes' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <FileText size={16} /> Notes
                </button>
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'videos' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Video size={16} /> Videos
                </button>
                <button
                    onClick={() => setActiveTab('syllabi')}
                    className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'syllabi' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Book size={16} /> Syllabi
                </button>
            </div>

            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto pr-1 transition-all duration-500 ${!unlocked ? 'blur-sm select-none pointer-events-none' : ''}`}>

                {/* NOTES TAB */}
                {activeTab === 'notes' && (
                    <div className="space-y-3">
                        {content.notes.map((note, i) => (
                            <div key={i} className="group p-3 border border-gray-100 rounded-xl hover:border-red-100 hover:bg-red-50/30 transition-all cursor-pointer bg-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm group-hover:text-red-700 transition-colors">{note.title}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                {note.type} • {note.votes} upvotes
                                            </p>
                                        </div>
                                    </div>
                                    <Download size={16} className="text-gray-300 group-hover:text-red-500" />
                                </div>
                            </div>
                        ))}
                        <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
                            <p className="text-xs text-gray-400 font-medium">Have notes to share? <span className="text-red-600 underline cursor-pointer">Upload here</span></p>
                        </div>
                    </div>
                )}

                {/* VIDEOS TAB */}
                {activeTab === 'videos' && (
                    <div className="space-y-3">
                        {content.videos.map((vid, i) => (
                            <div key={i} className="group flex gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                <div className="relative w-28 h-16 bg-gray-900 rounded-md overflow-hidden flex-shrink-0">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle size={24} className="text-white opacity-80" />
                                    </div>
                                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">{vid.duration}</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-red-700 transition-colors">{vid.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{vid.views} views • YouTube</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* SYLLABI TAB */}
                {activeTab === 'syllabi' && (
                    <div className="space-y-2">
                        {content.syllabi.map((syl, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{syl.term}</h4>
                                    <p className="text-xs text-gray-500">{syl.prof}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-bold text-gray-900">{syl.difficulty}</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Difficulty</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lock Overlay */}
            {!unlocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 bg-white/60 backdrop-blur-[2px] transition-all">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-[280px] hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-4 rotate-3">
                            <Lock size={24} fill="currentColor" fillOpacity={0.2} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">Unlock Resources</h4>
                        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                            Sign in to access <b>{course ? course.code : 'Course'}</b> notes, past exams, and curated videos.
                        </p>
                        <button
                            onClick={onUnlock}
                            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Sign In to View
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
