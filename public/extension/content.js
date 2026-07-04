// Scraper logic for LinkedIn
function scrapeLinkedIn() {
  const isProfile = window.location.href.includes('/in/');
  const isCompany = window.location.href.includes('/company/');

  if (isProfile) {
    const name = document.querySelector('.text-heading-xlarge')?.innerText || '';
    const title = document.querySelector('.text-body-medium.break-words')?.innerText || '';
    const company = document.querySelector('[data-field="experience_company_name"]')?.innerText || '';
    
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

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    const data = scrapeLinkedIn();
    sendResponse(data);
  }
});
