// Load departments and services on page load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 Website app loaded');
  await loadDepartments();
  
  // Listen for order updates from admin (if customer has booked)
  setupOrderListener();
});

// Load departments from Supabase
async function loadDepartments() {
  try {
    const { data: departments, error } = await supabase
      .from('hpe_departments')
      .select('id, name, display_order')
      .eq('status', 'Active')
      .order('display_order');

    if (error) throw error;

    const deptSelect = document.getElementById('department');
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept.name;
      option.textContent = dept.name;
      deptSelect.appendChild(option);
    });

    // Load services when department changes
    deptSelect.addEventListener('change', loadServices);
  } catch (error) {
    console.error('Error loading departments:', error);
  }
}

// Load services based on selected department
async function loadServices() {
  const dept = document.getElementById('department').value;
  if (!dept) return;

  try {
    const { data: services, error } = await supabase
      .from('hpe_services')
      .select('id, name, rate, gst, display_order')
      .eq('department', dept)
      .eq('status', 'Active')
      .order('display_order');

    if (error) throw error;

    const serviceSelect = document.getElementById('service');
    serviceSelect.innerHTML = '<option value="">Select Service</option>';
    
    services.forEach(svc => {
      const option = document.createElement('option');
      option.value = JSON.stringify({ name: svc.name, rate: svc.rate, gst: svc.gst });
      option.textContent = `${svc.name} - ₹${svc.rate}`;
      serviceSelect.appendChild(option);
    });

    // Update price when service changes
    serviceSelect.addEventListener('change', updatePrice);
  } catch (error) {
    console.error('Error loading services:', error);
  }
}

// Update pricing
function updatePrice() {
  const serviceJSON = document.getElementById('service').value;
  if (!serviceJSON) {
    document.getElementById('subtotal').textContent = '₹0';
    document.getElementById('gstAmount').textContent = '₹0';
    document.getElementById('total').textContent = '₹0';
    return;
  }

  try {
    const service = JSON.parse(serviceJSON);
    const gstPercent = service.gst || 18;
    const subtotal = parseFloat(service.rate) || 0;
    const gstAmount = (subtotal * gstPercent) / 100;
    const total = subtotal + gstAmount;

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('gstAmount').textContent = `₹${gstAmount.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
  } catch (error) {
    console.error('Error updating price:', error);
  }
}

// Submit booking form
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.innerHTML = '<span class="loading"></span>Submitting...';
  btn.disabled = true;

  try {
    const serviceJSON = document.getElementById('service').value;
    const service = JSON.parse(serviceJSON);

    const subtotal = parseFloat(service.rate);
    const gstPercent = service.gst || 18;
    const gstAmount = (subtotal * gstPercent) / 100;
    const grandTotal = subtotal + gstAmount;

    const bookingData = {
      order_id: `ORD-${Date.now()}`,
      customer_name: document.getElementById('customerName').value,
      mobile: document.getElementById('mobile').value,
      email: document.getElementById('email').value || null,
      company: document.getElementById('company').value || null,
      department: document.getElementById('department').value,
      service_name: service.name,
      work_date: document.getElementById('workDate').value,
      work_time: document.getElementById('workTime').value || null,
      pickup_location: document.getElementById('location').value || null,
      notes: document.getElementById('notes').value || null,
      cart_items: JSON.stringify([service]),
      subtotal: subtotal,
      gst_percent: gstPercent,
      gst_amount: gstAmount,
      grand_total: grandTotal,
      booking_type: 'booking',
      payment_status: 'Pending',
      booking_status: 'New'
    };

    const { data, error } = await supabase
      .from('hpe_bookings')
      .insert([bookingData])
      .select();

    if (error) throw error;

    console.log('✅ Booking saved! Order ID:', data[0].order_id);

    // Show success message
    showBookingConfirmation(data[0]);

    // Listen for admin updates on this order
    if (data[0].email) {
      listenToOrderUpdates(data[0].id, data[0].email);
    }
  } catch (error) {
    console.error('Error submitting booking:', error);
    showAlert(`Error: ${error.message}`, 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}
);

// Show booking confirmation
function showBookingConfirmation(booking) {
  document.getElementById('bookingForm').style.display = 'none';
  document.getElementById('bookingStatus').style.display = 'block';

  const content = `
    <h3>✅ Booking Confirmed!</h3>
    <p><strong>Order ID:</strong> ${booking.order_id}</p>
    <p><strong>Service:</strong> ${booking.service_name}</p>
    <p><strong>Date:</strong> ${booking.work_date}</p>
    <p><strong>Amount:</strong> ₹${booking.grand_total}</p>
    <p><strong>Status:</strong> ${booking.booking_status}</p>
    <p style="margin-top: 15px; color: #667eea;">Your booking has been submitted. The admin team will review it shortly.</p>
  `;
  document.getElementById('statusContent').innerHTML = content;
}

// Listen for order updates from admin
function listenToOrderUpdates(orderId, email) {
  supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'hpe_bookings',
        filter: `id=eq.${orderId}`
      },
      (payload) => {
        console.log('📢 Order updated by admin:', payload.new);
        const newOrder = payload.new;
        
        // Update status in UI if visible
        const statusContent = document.getElementById('statusContent');
        if (statusContent && statusContent.style.display !== 'none') {
          showBookingConfirmation(newOrder);
        }

        // Show notification
        showAlert(`Order ${newOrder.order_id} updated: ${newOrder.booking_status}`, 'success');
      }
    )
    .subscribe();
}

// Setup general order listener for when page loads
function setupOrderListener() {
  // This listens for any new bookings (used by admin panel)
  // Website doesn't need this, but it's here for reference
}

// Show alert
function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const form = document.getElementById('bookingForm') || document.body;
  form.insertAdjacentElement('afterbegin', alertDiv);
  
  setTimeout(() => alertDiv.remove(), 5000);
}
