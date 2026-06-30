// Enquiries Management
let allEnquiries = [];

window.addEventListener('DOMContentLoaded', async () => {
  await loadEnquiries();
  setupEnquiryListener();
});

async function loadEnquiries() {
  try {
    const { data: enquiries, error } = await supabase
      .from('hpe_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    allEnquiries = enquiries || [];
    displayEnquiries(allEnquiries);
  } catch (error) {
    console.error('Error loading enquiries:', error);
  }
}

function displayEnquiries(enquiries) {
  const enquiriesList = document.getElementById('enquiriesList');
  
  if (enquiries.length === 0) {
    enquiriesList.innerHTML = '<p class="loading">No enquiries found</p>';
    return;
  }

  enquiriesList.innerHTML = enquiries.map(enq => `
    <div class="order-card">
      <div class="order-info">
        <h3>${enq.name}</h3>
        <p><strong>Phone:</strong> ${enq.phone}</p>
        <p><strong>Service:</strong> ${enq.service || 'General Enquiry'}</p>
        <p><strong>Message:</strong> ${enq.message || 'N/A'}</p>
        <span class="order-status status-${enq.status.toLowerCase()}">${enq.status}</span>
      </div>
    </div>
  `).join('');
}

function setupEnquiryListener() {
  supabase
    .channel('hpe_enquiries_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hpe_enquiries'
      },
      (payload) => {
        console.log('📢 Enquiry update:', payload);
        
        if (payload.eventType === 'INSERT') {
          allEnquiries.unshift(payload.new);
          displayEnquiries(allEnquiries);
        }
      }
    )
    .subscribe();
}
