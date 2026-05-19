const apiKey = 'app-AHmYu1WSQhzX8yoEJw29dwc1';
const url = 'https://api.dify.ai/v1/chat-messages';

const inputs = {
  user_name: 'Madhu',
  age: '', 
  diet_type: 'Non-Vegetarian',
  health_condition: 'high blood pressure',
  pregnancy_week: '34'
};

const payload = {
  inputs: inputs,
  query: 'How to manage morning sickness?',
  response_mode: 'blocking',
  user: 'madhu_test_user'
};

console.log('Sending payload to Dify:', JSON.stringify(payload, null, 2));

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload)
})
.then(async (res) => {
  console.log('Response Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Response Body:', text);
})
.catch((err) => {
  console.error('Fetch Error:', err);
});
