// Settings Management
window.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
});

async function loadSettings() {
  try {
    const { data, error } = await supabase
      .from('hpe_settings')
      .select('data')
      .eq('id', 'singleton')
      .single();

    if (error) throw error;

    const settings = data.data;
    document.getElementById('businessName').value = settings.name || '';
    document.getElementById('gstin').value = settings.gstin || '';
    document.getElementById('phone').value = settings.ph1 || '';
    document.getElementById('email').value = settings.email || '';
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  try {
    const updatedData = {
      name: document.getElementById('businessName').value,
      gstin: document.getElementById('gstin').value,
      ph1: document.getElementById('phone').value,
      email: document.getElementById('email').value
    };

    const { error } = await supabase
      .from('hpe_settings')
      .update({ data: updatedData })
      .eq('id', 'singleton');

    if (error) throw error;

    showAlert('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showAlert(`Error: ${error.message}`, 'error');
  }
}
