// Orders Management
let allOrders = [];
let currentOrderId = null;
let orderListenerInitialized = false;
let lastOrdersRefresh = 0;
const POLL_INTERVAL = 15000; // 15 seconds fallback poll

// Load orders on init
window.addEventListener('DOMContentLoaded', async () => {
  console.log('📋 Orders module initialized');
  await loadOrders();
  setupOrderListener();
  setupPollingFallback();
});

// Load all orders from backend API (with service role auth)
async function loadOrders() {
  try {
    console.log('🔄 Fetching orders from API...');
    
    const response = await fetch('/api/admin/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    
    if (result.ok && result.orders) {
      allOrders = result.orders;
      lastOrdersRefresh = Date.now();
      console.log(`✅ Loaded ${allOrders.length} orders`);
      displayOrders(allOrders);
    } else {
      throw new Error(result.error || 'Failed to load orders');
    }
  } catch (error) {
    console.error('❌ Error loading orders:', error);
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
        <span class="order-status status-${(order.booking_status || 'new').toLowerCase().replace(/\s+/g, '-')}">${order.booking_status || 'New'}</span>
      </div>
      <div class="order-amount">₹${(order.grand_total || 0).toFixed(2)}</div>
    </div>
  `).join('');
}

// Open order detail modal
function openOrderModal(orderId) {
  currentOrderId = orderId;
  const order = allOrders.find(o => o.id === orderId);
  
  if (!order) {
    console.error('Order not found:', orderId);
    return;
  }

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
      <input type="text" id="modalService" value="${order.service_name || ''}">
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
      <input type="text" value="₹${(order.grand_total || 0).toFixed(2)}" disabled>
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

// Save order changes via API
async function saveOrderChanges() {
  if (!currentOrderId) return;

  try {
    const updates = {
      id: currentOrderId,
      customer_name: document.getElementById('modalCustomerName').value,
      mobile: document.getElementById('modalMobile').value,
      email: document.getElementById('modalEmail').value,
      service_name: document.getElementById('modalService').value,
      work_date: document.getElementById('modalWorkDate').value,
      booking_status: document.getElementById('modalStatus').value,
      assigned_staff: document.getElementById('modalAssignedStaff').value,
      admin_notes: document.getElementById('modalAdminNotes').value
    };

    const response = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Order updated:', result.order);
      showAlert('Order updated successfully!', 'success');
      
      // Reload orders
      await loadOrders();
      closeOrderModal();
    } else {
      throw new Error(result.error || 'Failed to update order');
    }
  } catch (error) {
    console.error('❌ Error saving order:', error);
    showAlert(`Error: ${error.message}`, 'error');
  }
}

// Setup real-time listener for new orders with error handling
function setupOrderListener() {
  try {
    if (!supabase) {
      console.warn('⚠️ Supabase not initialized, real-time updates disabled');
      return;
    }

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
          console.log('📢 Real-time update received:', payload.eventType);
          
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time listener connected');
          orderListenerInitialized = true;
        } else if (status === 'CLOSED') {
          console.warn('⚠️ Real-time listener closed');
          orderListenerInitialized = false;
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time listener error');
          orderListenerInitialized = false;
        }
      });
  } catch (error) {
    console.error('❌ Error setting up real-time listener:', error);
  }
}

// Polling fallback if real-time listener fails
function setupPollingFallback() {
  setInterval(() => {
    const timeSinceLastRefresh = Date.now() - lastOrdersRefresh;
    
    // If no refresh for POLL_INTERVAL ms AND listener not initialized, poll
    if (timeSinceLastRefresh > POLL_INTERVAL && !orderListenerInitialized) {
      console.log('🔄 Polling fallback: refreshing orders...');
      loadOrders();
    }
  }, POLL_INTERVAL / 2);
}

// Filter orders by status
document.addEventListener('DOMContentLoaded', () => {
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      const status = e.target.value;
      const filtered = status ? allOrders.filter(o => o.booking_status === status) : allOrders;
      displayOrders(filtered);
    });
  }

  // Search orders
  const searchOrders = document.getElementById('searchOrders');
  if (searchOrders) {
    searchOrders.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allOrders.filter(o => 
        o.order_id.toLowerCase().includes(query) ||
        o.customer_name.toLowerCase().includes(query)
      );
      displayOrders(filtered);
    });
  }
});

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const main = document.querySelector('.admin-main');
  if (main) {
    main.insertAdjacentElement('afterbegin', alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
  }
}
