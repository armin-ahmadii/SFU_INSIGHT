// Utility to generate unique, realistic mock data for any course
// This simulates a backend response that aggregates crowd-sourced data

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const TOPICS_POOL = {
    'CMPT': ['Binary Trees', 'Recursion', 'Memory Management', 'Pointers', 'Big O Notation', 'Graph Algorithms', 'Dynamic Programming', 'Concurrency'],
    'MATH': ['Derivatives', 'Integrals', 'Matrix Multiplication', 'Eigenvalues', 'Vector Spaces', 'Series & Sequences', 'Proof by Induction', 'Limits'],
    'BUS': ['SWOT Analysis', 'Financial Ratios', 'Marketing Mix', 'Supply Chain', 'Organizational Behavior', 'Accounting Principles', 'Business Ethics', 'Macroeconomics'],
    'DEFAULT': ['Core Concepts', 'Critical Thinking', 'Research Methods', 'Group Projects', 'Essay Writing', 'Final Exam Prep', 'Time Management', 'Case Studies']
};

const ADVICE_TEMPLATES = [
    "Focus heavily on {topic}. It was 40% of the midterm.",
    "Don't skip the readings for {topic}, the professor loves to quiz on the footnotes.",
    "The labs are free marks, but the final on {topic} is brutal. Start studying two weeks early.",
    "Best course I've taken! {topic} is actually really useful for interviews.",
    "Make sure you understand {topic} inside out. It builds on everything else."
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(1);

export function generateCourseData(courseCode) {
    const dept = courseCode.split(' ')[0].toUpperCase();
    const topics = TOPICS_POOL[dept] || TOPICS_POOL['DEFAULT'];

    // 1. Generate Professors
    const numProfs = getRandomInt(2, 4);
    const profs = Array.from({ length: numProfs }).map((_, i) => ({
        id: `prof-${i}`,
        name: `Dr. ${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
        rating: getRandomFloat(2.5, 5.0),
        difficulty: getRandomFloat(2.0, 4.8),
        wouldTakeAgain: getRandomInt(40, 98) + '%',
        tags: [getRandom(['Tough Grader', 'Respected', 'Inspirational']), getRandom(['Lecture Heavy', 'Textbook Mandatory', 'Clear Grading'])]
    }));

    // 2. Generate Statistics (Graphs)
    const stats = {
        difficulty: getRandomFloat(2.5, 5.0),
        workload: getRandomFloat(3.0, 5.0), // Hours/week (normalized)
        valuable: getRandomFloat(3.5, 5.0),
        gradeDistribution: [
            { grade: 'A', percent: getRandomInt(10, 25) },
            { grade: 'B', percent: getRandomInt(30, 45) },
            { grade: 'C', percent: getRandomInt(20, 30) },
            { grade: 'D/F', percent: getRandomInt(5, 15) }
        ]
    };

    // 3. Generate Accordion Content

    // Syllabi
    const syllabi = [
        { term: 'Spring 2025', prof: profs[0].name, url: '#' },
        { term: 'Fall 2024', prof: profs[1]?.name || profs[0].name, url: '#' },
        { term: 'Summer 2024', prof: 'Dr. T. Unknown', url: '#' }
    ];

    // Topics & Focus
    const keyTopics = Array.from({ length: 4 }).map(() => getRandom(topics));
    const uniqueTopics = [...new Set(keyTopics)]; // Dedupe
    const focus = uniqueTopics.map(t => ({
        topic: t,
        importance: getRandom(['High', 'Critical', 'Medium']),
        tip: ADVICE_TEMPLATES[getRandomInt(0, ADVICE_TEMPLATES.length - 1)].replace('{topic}', t)
    }));

    // Notes
    const notes = Array.from({ length: getRandomInt(3, 6) }).map((_, i) => ({
        title: `${uniqueTopics[i % uniqueTopics.length] || 'General'} Summary Notes`,
        author: `Student${getRandomInt(100, 999)}`,
        upvotes: getRandomInt(5, 500),
        date: '2 months ago'
    }));

    // Alumni Reviews
    const reviews = Array.from({ length: getRandomInt(3, 5) }).map(() => ({
        author: `Alumni '${getRandomInt(22, 25)}`,
        rating: getRandomInt(3, 5),
        comment: ADVICE_TEMPLATES[getRandomInt(0, 4)].replace('{topic}', getRandom(topics)),
        semester: getRandom(['Spring 2024', 'Fall 2023', 'Summer 2024'])
    }));

    return {
        courseCode,
        profs,
        stats,
        syllabi,
        focus,
        notes,
        reviews,
        resources: [
            { title: 'Official Course Page', url: 'https://sfu.ca' },
            { title: 'Discord Community', url: '#' }
        ]
    };
}
