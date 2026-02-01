import express from 'express';
import cors from 'cors';
import rmp from '@mtucourses/rate-my-professors';
import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/clerk-sdk-node';

// Access the RMP library functions from the default export
const searchTeacher = rmp.default?.searchTeacher || rmp.searchTeacher;
const getTeacher = rmp.default?.getTeacher || rmp.getTeacher;

dotenv.config();

const app = express();
const PORT = 3001;

// Initialize Clerk Client
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

app.use(cors());
app.use(express.json());

const SFU_SCHOOL_ID = 'U2Nob29sLTE0ODI=';

// --- ROUTES ---

// 1. Search Instructors
app.get('/api/professors/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ error: 'Name parameter is required' });

        const professors = await searchTeacher(name, SFU_SCHOOL_ID);
        res.json(professors);
    } catch (error) {
        console.error('Error searching professors:', error);
        res.status(500).json({ error: 'Failed to search professors' });
    }
});

// 2. Get Instructor Details
app.get('/api/professors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const professor = await getTeacher(id);
        res.json(professor);
    } catch (error) {
        console.error('Error getting professor details:', error);
        res.status(500).json({ error: 'Failed to get professor details' });
    }
});

// 3. Submit Review & Unlock Content (Protected)
app.post('/api/reviews', async (req, res) => {
    try {
        const { userId, reviewData } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // In a real app, we would save reviewData to a database here.
        console.log(`[REVIEW SUBMITTED] User: ${userId}, Data:`, reviewData);

        // Update User Metadata in Clerk to mark as contributor
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                hasContributed: true
            }
        });

        res.json({ success: true, message: 'Review submitted and account unlocked!' });

    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

// 4. Get courses taught by instructor (SFU Courses API)
app.get('/api/instructor-courses', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ error: 'Name required' });

        const baseUrl = 'https://www.sfu.ca/bin/wcm/course-outlines';

        // Normalize name for matching
        const normalizeName = (n) => {
            return n.toLowerCase()
                .replace(/^(dr\.?|prof\.?|professor)\s+/i, '')
                .replace(/,/g, ' ')
                .trim();
        };
        const queryName = normalizeName(name);
        const queryParts = queryName.split(/\s+/).filter(p => p.length > 1);

        // Fetch departments
        const deptRes = await fetch(`${baseUrl}?2025/spring`);
        const depts = await deptRes.json();

        const instructorCourses = [];
        const commonDepts = ['cmpt', 'math', 'macm', 'stat', 'phys', 'chem', 'bus', 'econ', 'psyc', 'bisc'];

        // Search common departments first for performance
        const searchDepts = depts.filter(d => commonDepts.includes(d.value?.toLowerCase())).slice(0, 10);

        for (const dept of searchDepts) {
            try {
                const coursesRes = await fetch(`${baseUrl}?2025/spring/${dept.value}`);
                const courses = await coursesRes.json();

                for (const course of courses.slice(0, 20)) { // Limit courses per dept
                    try {
                        const sectionsRes = await fetch(`${baseUrl}?2025/spring/${dept.value}/${course.value}`);
                        const sections = await sectionsRes.json();

                        for (const section of sections) {
                            if (section.classType === 'e' && section.sectionCode?.startsWith('D')) {
                                try {
                                    const detailRes = await fetch(`${baseUrl}?2025/spring/${dept.value}/${course.value}/${section.value}`);
                                    const detail = await detailRes.json();

                                    // Check if any instructor matches
                                    const instructors = detail.instructor || [];
                                    const matchedInstructor = instructors.find(i => {
                                        if (!i.name) return false;
                                        const instName = normalizeName(i.name);
                                        // Check if query parts match instructor name
                                        return queryParts.every(part => instName.includes(part)) ||
                                            instName.split(/\s+/).some(part => queryParts.includes(part));
                                    });

                                    if (matchedInstructor) {
                                        instructorCourses.push({
                                            code: `${dept.text} ${course.value}`,
                                            section: section.value,
                                            title: course.title || detail.info?.title || 'Course',
                                            schedule: detail.courseSchedule || [],
                                            campus: detail.info?.campus || 'TBD',
                                            deliveryMethod: detail.info?.deliveryMethod || 'In Person',
                                            instructor: matchedInstructor.name
                                        });
                                    }
                                } catch (e) { /* Skip section */ }
                            }
                        }
                    } catch (e) { /* Skip course */ }
                }
            } catch (e) { /* Skip dept */ }
        }

        console.log(`[INSTRUCTOR COURSES] Found ${instructorCourses.length} courses for "${name}"`);
        res.json(instructorCourses);
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        res.status(500).json({ error: 'Failed to fetch instructor courses' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
