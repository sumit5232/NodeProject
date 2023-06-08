const express = require('express');
const app = express();
const port = 3000;
const md5 = require('md5');
const axios = require('axios');
const clearbit = require('clearbit')('{key}');

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/check', async (req, res) => {
  const { input } = req.body;

  if (isValidEmail(input)) {
    const gravatarUrl = getGravatarUrl(input);
    res.json({ type: 'email', input, imageUrl: gravatarUrl });
  } else if (isValidDomain(input)) {
    try {
      const logoUrl = await getLogoUrl(input);
      res.json({ type: 'website', input, logoUrl });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve logo' });
    }
  } else {
    res.status(400).json({ error: 'Invalid input' });
  }
});

function isValidEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

function isValidDomain(input) {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(input);
}

function getGravatarUrl(email) {
  const gravatarHash = md5(email.toLowerCase());
  const gravatarUrl = `https://www.gravatar.com/avatar/${gravatarHash}`;
  return gravatarUrl;
}

async function getLogoUrl(domain) {
  const response = await axios.get(`https://logo.clearbit.com/${domain}`);
  return response.request.res.responseUrl;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
