import axios from 'axios';

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function testPubMed() {
  try {
    console.log('Testing PubMed API...');
    
    const searchParams = {
      db: 'pubmed',
      term: 'diabetes',
      rettype: 'json',
      retmax: 5,
    };

    const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
    console.log('URL:', searchUrl);
    console.log('Params:', searchParams);
    
    const searchResponse = await axios.get(searchUrl, { params: searchParams });
    
    console.log('Response Status:', searchResponse.status);
    console.log('Response Data:', JSON.stringify(searchResponse.data, null, 2));
    
    const idList = searchResponse.data?.esearchresult?.idlist || [];
    console.log('ID List:', idList);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

async function testOpenAlex() {
  try {
    console.log('\n\nTesting OpenAlex API...');
    
    const params = {
      search: 'diabetes treatment',
      per_page: 5,
    };

    const response = await axios.get('https://api.openalex.org/works', { params });
    
    console.log('Response Status:', response.status);
    console.log('Results Count:', response.data?.results?.length);
    console.log('Sample Result:', JSON.stringify(response.data?.results?.[0], null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testClinicalTrials() {
  try {
    console.log('\n\nTesting ClinicalTrials API...');
    
    const params = {
      'query.term': 'diabetes',
      pageSize: 5,
    };

    const response = await axios.get('https://clinicaltrials.gov/api/v2/studies', { params });
    
    console.log('Response Status:', response.status);
    console.log('Trials Count:', response.data?.studies?.length);
    console.log('Sample Trial:', JSON.stringify(response.data?.studies?.[0], null, 2).substring(0, 500));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

(async () => {
  await testPubMed();
  await testOpenAlex();
  await testClinicalTrials();
})();
