import axios from 'axios';

const testPayload = {
  position: "Backend Developer",
  averageScore: 45,
  questions: [
    "What is REST API?",
    "Explain JWT"
  ],
  answers: [
    "REST API là...",
    "Không biết"
  ],
  scores: [90, 0],
  topics: [
    "API",
    "Security"
  ]
};

const url = 'https://jobreadyai.app.n8n.cloud/webhook/overall-feedback';

console.log('Sending request to N8N overall-feedback...');
axios.post(url, testPayload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
})
.then(res => {
    console.log('SUCCESS!');
    console.log('Response status:', res.status);
    console.log('Response data:', JSON.stringify(res.data, null, 2));
})
.catch(err => {
    console.error('FAILED!');
    if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
        console.error('Error message:', err.message);
    }
});
