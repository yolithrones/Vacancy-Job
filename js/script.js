document.getElementById('calculatorForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Get form values
  const jobTitle = document.getElementById('jobTitle').value;
  const grossPay = parseFloat(document.getElementById('grossPay').value);
  const payTimeframe = document.getElementById('payTimeframe').value;
  const hoursPerWeek = parseFloat(document.getElementById('hoursPerWeek').value);
  const taxRate = parseFloat(document.getElementById('taxRate').value) / 100;
  const niRate = parseFloat(document.getElementById('niRate').value) / 100;

  // Convert gross pay to yearly
  let yearlyGross;
  switch(payTimeframe) {
      case 'hour':
          yearlyGross = grossPay * hoursPerWeek * 52;
          break;
      case 'week':
          yearlyGross = grossPay * 52;
          break;
      case 'month':
          yearlyGross = grossPay * 12;
          break;
      default:
          yearlyGross = grossPay;
  }

  // Calculate deductions
  const taxDeduction = yearlyGross * taxRate;
  const niDeduction = yearlyGross * niRate;
  const yearlyTakeHome = yearlyGross - taxDeduction - niDeduction;

  // Calculate other time periods
  const monthlyTakeHome = yearlyTakeHome / 12;
  const weeklyTakeHome = yearlyTakeHome / 52;
  const hourlyTakeHome = weeklyTakeHome / hoursPerWeek;

  // Show results section if hidden
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.style.display = 'block';

  // Create result card
  const resultCard = document.createElement('div');
  resultCard.className = 'result-card bg-white p-3 rounded shadow-sm';
  resultCard.innerHTML = `
      <p><span class="job-title" onclick="window.open('vacancies.html')">${jobTitle}</span></p>
      <p>Working <span class="pay-amount">${hoursPerWeek} hours</span> a week for a gross pay of 
         <span class="pay-amount">£${grossPay.toFixed(2)}</span> per 
         <span class="time-period">${payTimeframe}</span>, with 
         <span class="pay-amount">${(taxRate * 100).toFixed(0)}% Tax</span> and 
         <span class="pay-amount">${(niRate * 100).toFixed(0)}% NI</span> results in a take-home pay of:</p>
      <div class="row">
          <div class="col-md-6">
              <p>£${hourlyTakeHome.toFixed(2)} <span class="time-period">per Hour</span></p>
              <p>£${weeklyTakeHome.toFixed(2)} <span class="time-period">per Week</span></p>
          </div>
          <div class="col-md-6">
              <p>£${monthlyTakeHome.toFixed(2)} <span class="time-period">per Month</span></p>
              <p>£${yearlyTakeHome.toFixed(2)} <span class="time-period">per Year</span></p>
          </div>
      </div>
  `;

  // Prepend new result to container
  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.insertBefore(resultCard, resultsContainer.firstChild);
});

// Save this as script.js
async function searchJob() {
  event.preventDefault();
  const searchInput = document.getElementById('search-input').value.trim(); 
  const resultsContainer = document.getElementById('results-container');
  const loadingSpinner = document.getElementById('loading-spinner');
  
  if (!searchInput) {
      alert('Please enter a job title, company, or keyword');
      return;
  }

  loadingSpinner.style.display = 'block';
  
  try {
      const [vacancyResponse, socResponse] = await Promise.all([
          fetch(`https://api.lmiforall.org.uk/api/v1/vacancies/search?keywords=${encodeURIComponent(searchInput)}`),
          fetch(`https://api.lmiforall.org.uk/api/v1/soc/search?q=${encodeURIComponent(searchInput)}`)
      ]);

      const jobs = await vacancyResponse.json();
      const socData = await socResponse.json();

      displayResults(jobs, socData);
  } catch (error) {
      console.error('Error fetching data:', error);
      resultsContainer.innerHTML = `
          <div class="alert alert-danger" role="alert">
              Failed to fetch jobs. Please try again.
          </div>
      `;
  } finally {
      loadingSpinner.style.display = 'none';
  }
}

function displayResults(jobs, socData) {
  const resultsContainer = document.getElementById('results-container');

  // Update the section title
  const sectionTitle = document.querySelector('.section-title');
  sectionTitle.textContent = `${jobs.length} Jobs Found`;

  // Create the job listings HTML
  let jobListingsHTML = `<ul class="job-listings mb-5">`;
  
  jobs.forEach(job => {
      jobListingsHTML += `
          <li class="job-listing d-block d-sm-flex pb-3 pb-sm-0 align-items-center">
              <div class="job-listing-about d-sm-flex custom-width w-100 justify-content-between mx-4">
                  <div class="job-listing-position custom-width w-50 mb-3 mb-sm-0">
                      <h2>
                          <a href="${escapeHTML(job.link)}" target="_blank" class="job-title-link">
                            
                          </a>
                      </h2>
                      <strong>${escapeHTML(job.company || 'Company not specified')}</strong>
                  </div>
                  <div class="job-listing-location mb-3 mb-sm-0 custom-width w-25">
                      <span class="icon-room"></span> 
                      ${escapeHTML(job.location?.location || 'Location not specified')}
                  </div>
                  <div class="job-listing-meta custom-width w-25 text-right">
                      <a href="${escapeHTML(job.link)}" target="_blank" class="btn btn-primary btn-sm">
                          View Details
                      </a>
                  </div>
              </div>
          </li>
      `;
  });
  
  jobListingsHTML += `</ul>`;

  // Add SOC data if available
  let socHTML = '';
  if (socData && socData.length > 0) {
      socHTML = `
          <div class="mb-5">
              <h3>Related Occupations:</h3>
              <ul class="list-unstyled">
                  ${socData.slice(0, 3).map(soc => `
                      <li class="mb-2">
                          <strong>${escapeHTML(soc.title)}</strong>
                          <p class="text-muted">${escapeHTML(soc.description || '')}</p>
                      </li>
                  `).join('')}
              </ul>
          </div>
      `;
  }

  // Display results
  resultsContainer.innerHTML = socHTML + jobListingsHTML;
}

// Helper function to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Add event listener for the search form
document.getElementById('search-form').addEventListener('submit', searchJob);

// Add this CSS to your stylesheet
const styles = `

`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);