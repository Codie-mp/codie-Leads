// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const nameInput = document.getElementById('name');
  const titleInput = document.getElementById('title');
  const companyInput = document.getElementById('company');
  const websiteInput = document.getElementById('website');
  const linkedinUrlInput = document.getElementById('linkedinUrl');
  const sendBtn = document.getElementById('sendBtn');
  const statusDiv = document.getElementById('status');

  // Load saved app URL from storage
  const { appUrl } = await chrome.storage.local.get('appUrl');
  
  // Scrape the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const isProfile = window.location.href.includes('/in/');
        const isCompany = window.location.href.includes('/company/');

        if (isProfile) {
          const name = document.querySelector('.text-heading-xlarge')?.innerText || '';
          const title = document.querySelector('.text-body-medium.break-words')?.innerText || '';
          const company = document.querySelector('.experience-item__company-name')?.innerText || '';
          
          return {
            name,
            title,
            company,
            linkedinUrl: window.location.href,
            source: 'linkedin_profile'
          };
        } else if (isCompany) {
          const name = document.querySelector('.org-top-card-summary__title')?.innerText || '';
          const website = document.querySelector('.org-top-card-primary-actions__inner a')?.href || '';
          
          return {
            name,
            website,
            linkedinUrl: window.location.href,
            source: 'linkedin_company'
          };
        }
        
        return null;
      }
    }, (results) => {
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        nameInput.value = data.name || '';
        titleInput.value = data.title || '';
        companyInput.value = data.company || '';
        websiteInput.value = data.website || '';
        linkedinUrlInput.value = data.linkedinUrl || '';
      }
    });
  });

  // Send data to GTM Maps
  sendBtn.addEventListener('click', async () => {
    const data = {
      name: nameInput.value,
      title: titleInput.value,
      company: companyInput.value,
      website: websiteInput.value,
      linkedinUrl: linkedinUrlInput.value,
      source: 'extension'
    };

    if (!data.name) {
      statusDiv.innerText = 'Name is required';
      statusDiv.className = 'error';
      return;
    }

    sendBtn.disabled = true;
    statusDiv.innerText = 'Sending...';
    statusDiv.className = '';

    try {
      // Use the current origin as the default app URL if not set
      const targetUrl = appUrl || window.location.origin;
      const response = await fetch(`${targetUrl}/api/extension/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        statusDiv.innerText = 'Lead added successfully!';
        statusDiv.className = 'success';
        setTimeout(() => window.close(), 1500);
      } else {
        throw new Error('Failed to send data');
      }
    } catch (error) {
      statusDiv.innerText = 'Error: ' + error.message;
      statusDiv.className = 'error';
      sendBtn.disabled = false;
    }
  });
});
