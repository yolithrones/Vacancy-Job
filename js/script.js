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
// Enhanced Vacancy Search JavaScript
async function searchJob() {
    event.preventDefault();
    const searchInput = document.getElementById('search-input').value.trim();
    const locationFilter = document.getElementById('location-filter').value;
    const resultsContainer = document.getElementById('results-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    if (!searchInput) {
      alert('Please enter a job title, company, or keyword');
      return;
    }
  
    loadingSpinner.style.display = 'block';
    
    try {
      // First API - Vacancies
      const vacancyResponse = await fetch(
        `https://api.lmiforall.org.uk/api/v1/vacancies/search?keywords=${encodeURIComponent(searchInput)}` +
        (locationFilter ? `&location=${encodeURIComponent(locationFilter)}` : '')
      );
      
      // Second API - Job Information
      const socResponse = await fetch(
        `https://api.lmiforall.org.uk/api/v1/soc/search?q=${encodeURIComponent(searchInput)}`
      );
  
      const jobs = await vacancyResponse.json();
      const socData = await socResponse.json();
  
      displayResults(jobs.slice(0, 10), socData);
    } catch (error) {
      console.error('Error fetching data:', error);
      resultsContainer.innerHTML = `
        <div class="alert alert-danger">
          Failed to fetch jobs. Please try again.
        </div>
      `;
    } finally {
      loadingSpinner.style.display = 'none';
    }
  }
  
  function displayResults(jobs, socData) {
    const resultsContainer = document.getElementById('results-container');
    const sectionTitle = document.querySelector('.section-title');
    sectionTitle.textContent = `${jobs.length} Jobs Found`;
  
    // Job Listings HTML
    let jobListingsHTML = `<div class="job-listings">`;
    
    jobs.forEach((job, index) => {
      // Find corresponding SOC data
      const relatedSocData = socData.find(soc => 
        job.title.toLowerCase().includes(soc.title.toLowerCase())
      );
  
      jobListingsHTML += `
        <div class="job-listing" data-job-index="${index}">
          <div class="job-title-section">
            <h3 class="job-title">${escapeHTML(job.title)}</h3>
            <button class="toggle-details-btn">▼ Show Details</button>
          </div>
          
          <div class="job-details" style="display:none;">
            <div class="job-basic-info">
              <p><strong>Company:</strong> ${escapeHTML(job.company || 'Not specified')}</p>
              <p><strong>Location:</strong> ${escapeHTML(job.location?.location || 'Not specified')}</p>
              <a href="${escapeHTML(job.link)}" target="_blank" class="view-job-btn">View Full Job</a>
            </div>
            
            ${relatedSocData ? `
              <div class="job-extended-info">
                <h4>Job Description</h4>
                <p>${escapeHTML(relatedSocData.description || 'No description available')}</p>
                
                <h4>Typical Tasks</h4>
                <ul>
                  ${relatedSocData.tasks 
                    ? relatedSocData.tasks.map(task => `<li>${escapeHTML(task)}</li>`).join('') 
                    : '<li>No specific tasks listed</li>'}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });
  
    jobListingsHTML += `</div>`;
  
    resultsContainer.innerHTML = jobListingsHTML;
  
    // Add event listeners for job detail toggles
    document.querySelectorAll('.toggle-details-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const jobDetails = this.closest('.job-listing').querySelector('.job-details');
        const isHidden = jobDetails.style.display === 'none';
        
        jobDetails.style.display = isHidden ? 'block' : 'none';
        this.textContent = isHidden ? '▲ Hide Details' : '▼ Show Details';
      });
    });
  }
  
  // HTML Updates Needed
  /*
  <div id="search-container">
    <form id="search-form">
      <input type="text" id="search-input" placeholder="Job title or keyword">
      
      <select id="location-filter">
        <option value="">All Locations</option>
        <option value="London">London</option>
        <option value="Manchester">Manchester</option>
        <!-- Add more locations -->
      </select>
      
      <button type="submit">Search Jobs</button>
    </form>
  </div>
  */