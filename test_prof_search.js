import fetch from 'node-fetch';

const API_BASE = 'http://127.0.0.1:3001';

async function testProfSearch(query) {
    console.log(`--- Testing Professor Search: "${query}" ---`);
    try {
        const response = await fetch(`${API_BASE}/api/professors/search?name=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Results count:', data.length);
        if (data.length > 0) {
            console.log('First 3 results:', data.slice(0, 3).map(p => p.name).join(', '));
            console.log('✅ Professor search returned results.');
        } else {
            console.log('❌ No results found for this query.');
        }
    } catch (err) {
        console.error('❌ Professor search failed:', err.message);
    }
}

async function runTests() {
    await testProfSearch('Diana');
    await testProfSearch('Cukierman');
    await testProfSearch('Brian');
    await testProfSearch('Fraser');
    await testProfSearch('XyzNonExistent');
}

runTests();
