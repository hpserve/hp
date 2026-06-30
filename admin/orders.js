// Orders Management
let allOrders = [];
let currentOrderId = null;

// Load orders on init
window.addEventListener('DOMContentLoaded', async () => {
  await loadOrders();
  setupOrderListener();
});

// Load all orders from Supabase
async function loadOrders() {
  try {
    const { data: orders, error } = await supabase
      .from('hpe_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    allOrders = orders || [];
    displayOrders(allOrders);
  } catch (error) {
    console.error('Error loading orders:', error);
    showAlert(`Error loading orders: ${error.message}`, 'error');
  }
}

// Display orders in list
function displayOrders(orders) {
  const ordersList = document.getElementById('ordersList');
  
  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="loading">No orders found</p>';
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <div class="order-card" onclick="openOrderModal('${order.id}')">
      <div class="order-info">
        <h3>${order.order_id}</h3>
        <p><strong>Customer:</strong> ${order.customer_name}</p>
        <p><strong>Mobile:</strong> ${order.mobile}</p>
        <p><strong>Service:</strong> ${order.service_name || 'N/A'}</p>
        <p><strong>Date:</strong> ${order.work_date || 'N/A'}</p>
        <span class="order-status status-${order.booking_status.toLowerCase().replace(' ', '-')}">${order.booking_status}</span>
      </div>
      <div class="order-amount">₹${order.grand_total.toFixed(2)}</div>
    </div>
  `).join('');
}

// Open order detail modal
function openOrderModal(orderId) {
  currentOrderId = orderId;
  const order = allOrders.find(o => o.id === orderId);
  
  if (!order) return;

  const detailHTML = `
    <div class="form-group">
      <label>Order ID</label>
      <input type="text" value="${order.order_id}" disabled>
    </div>
    <div class="form-group">
      <label>Customer Name</label>
      <input type="text" id="modalCustomerName" value="${order.customer_name}">
    </div>
    <div class="form-group">
      <label>Mobile</label>
      <input type="tel" id="modalMobile" value="${order.mobile}">
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" id="modalEmail" value="${order.email || ''}">
    </div>
    <div class="form-group">
      <label>Service</label>
      <input type="text" id="modalService" value="${order.service_name}">
    </div>
    <div class="form-group">
      <label>Work Date</label>
      <input type="date" id="modalWorkDate" value="${order.work_date || ''}">
    </div>
    <div class="form-group">
      <label>Status</label>
      <select id="modalStatus">
        <option value="New" ${order.booking_status === 'New' ? 'selected' : ''}>New</option>
        <option value="Confirmed" ${order.booking_status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
        <option value="In Progress" ${order.booking_status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Completed" ${order.booking_status === 'Completed' ? 'selected' : ''}>Completed</option>
        <option value="Cancelled" ${order.booking_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
    </div>
    <div class="form-group">
      <label>Assigned Staff</label>
      <input type="text" id="modalAssignedStaff" value="${order.assigned_staff || ''}">
    </div>
    <div class="form-group">
      <label>Admin Notes</label>
      <textarea id="modalAdminNotes" rows="3">${order.admin_notes || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Total Amount</label>
      <input type="text" value="₹${order.grand_total.toFixed(2)}" disabled>
    </div>
  `;
  
  document.getElementById('orderDetail').innerHTML = detailHTML;
  document.getElementById('orderModal').style.display = 'flex';
}

// Close order modal
function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
  currentOrderId = null;
}

// Save order changes
async function saveOrderChanges() {
  if (!currentOrderId) return;

  try {
    const updates = {
      customer_name: document.getElementById('modalCustomerName').value,
      mobile: document.getElementById('modalMobile').value,
      email: document.getElementById('modalEmail').value,
      service_name: document.getElementById('modalService').value,
      work_date: document.getElementById('modalWorkDate').value,
      booking_status: document.getElementById('modalStatus').value,
      assigned_staff: document.getElementById('modalAssignedStaff').value,
      admin_notes: document.getElementById('modalAdminNotes').value,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('hpe_bookings')
      .update(updates)
      .eq('id', currentOrderId)
      .select();

    if (error) throw error;

    console.log('✅ Order updated:', data[0]);
    showAlert('Order updated successfully!', 'success');
    
    // Reload orders
    await loadOrders();
    closeOrderModal();
  } catch (error) {
    console.error('Error saving order:', error);
    showAlert(`Error: ${error.message}`, 'error');
  }
}

// Setup real-time listener for new orders
function setupOrderListener() {
  supabase
    .channel('hpe_bookings_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hpe_bookings'
      },
      (payload) => {
        console.log('📢 Order update received:', payload);
        
        if (payload.eventType === 'INSERT') {
          console.log('🆕 NEW ORDER:', payload.new);
          allOrders.unshift(payload.new);
          displayOrders(allOrders);
          showAlert(`🔔 New order: ${payload.new.order_id} from ${payload.new.customer_name}`, 'success');
        } else if (payload.eventType === 'UPDATE') {
          console.log('✏️ ORDER UPDATED:', payload.new);
          const index = allOrders.findIndex(o => o.id === payload.new.id);
          if (index !== -1) {
            allOrders[index] = payload.new;
            displayOrders(allOrders);
          }
        } else if (payload.eventType === 'DELETE') {
          console.log('🗑️ ORDER DELETED:', payload.old.id);
          allOrders = allOrders.filter(o => o.id !== payload.old.id);
          displayOrders(allOrders);
        }
      }
    )
    .subscribe();
}

// Filter orders by status
document.getElementById('statusFilter')?.addEventListener('change', (e) => {
  const status = e.target.value;
  const filtered = status ? allOrders.filter(o => o.booking_status === status) : allOrders;
  displayOrders(filtered);
});

// Search orders
document.getElementById('searchOrders')?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allOrders.filter(o => 
    o.order_id.toLowerCase().includes(query) ||
    o.customer_name.toLowerCase().includes(query)
  );
  displayOrders(filtered);
});

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const main = document.querySelector('.admin-main');
  main.insertAdjacentElement('afterbegin', alertDiv);
  
  setTimeout(() => alertDiv.remove(), 5000);
}
