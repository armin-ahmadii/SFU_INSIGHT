import express from 'express';
import cors from 'cors';
import ratings from '@mtucourses/rate-my-professors';
import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/clerk-sdk-node';

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

        const professors = await ratings.searchTeacher(name, SFU_SCHOOL_ID);
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
        const professor = await ratings.getTeacher(id);
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

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
