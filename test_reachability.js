import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://127.0.0.1:3001';

async function testContribution() {
    console.log('--- Testing Contribution API ---');
    console.log(`URL: ${API_BASE}/api/contributions`);

    const payload = {
        courseCode: 'CMPT 225',
        type: 'tip',
        title: 'Debug Test Tip',
        body: 'This is a test tip with at least 15 characters to pass validation.',
        section: 'advice',
        displayName: 'Debugger'
    };

    try {
        console.log('Sending request...');
        // Note: This will likely fail with 401 because we don't have a valid Clerk token here
        // But the "Failed to fetch" error is what we are looking for.
        // If it returns 401, it means the server is reachable and the FETCH worked.
        const response = await fetch(`${API_BASE}/api/contributions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_token_for_reachability_test'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log('Response:', data);

        if (response.status === 401 || response.status === 200) {
            console.log('\n✅ Reachability Test Passed: The server is reachable and responding.');
        } else {
            console.log('\n⚠️ Server responded with unexpected status.');
        }
    } catch (err) {
        console.error('\n❌ Reachability Test Failed:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.log('The server is NOT running or not listening on 127.0.0.1:3001');
        }
    }
}

testContribution();
