// Member Dashboard Logic
let currentUser = null;
let attendanceChart = null;

// Initialize dashboard
async function initDashboard() {
  // Check authentication
  currentUser = await window.authUtils.protectRoute();
  if (!currentUser) return;

  // Set user name
  document.getElementById('user-name').textContent = currentUser.name;

  // Setup navigation
  setupNavigation();

  // Load overview data
  await loadOverview();

  // Load sections based on active nav
  const activeSection = document.querySelector('.nav-item.active').dataset.section;
  showSection(activeSection);
}

// Setup navigation
function setupNavigation() {
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      showSection(item.dataset.section);
    });
  });
  const logoutEl = document.querySelector('.nav-logout');
  if (logoutEl) {
    logoutEl.addEventListener('click', (e) => {
      e.preventDefault();
      window.authUtils.logout();
    });
  }
  const checkinCameraBtn = document.querySelector('.btn-checkin-camera');
  if (checkinCameraBtn) checkinCameraBtn.addEventListener('click', checkinWithCamera);

  const checkinFileBtn = document.querySelector('.btn-checkin-file');
  if (checkinFileBtn) checkinFileBtn.addEventListener('click', checkinWithFile);

  const checkinManualBtn = document.querySelector('.btn-checkin-manual');
  if (checkinManualBtn) checkinManualBtn.addEventListener('click', checkinManual);
}

// Show section
function showSection(section) {
  document.querySelectorAll('.dashboard-section').forEach(sec => {
    sec.style.display = 'none';
  });

  const sectionEl = document.getElementById(`${section}-section`);
  if (sectionEl) {
    sectionEl.style.display = 'block';
    loadSectionData(section);
  }
}

// Load section data
async function loadSectionData(section) {
  switch (section) {
    case 'overview':
      await loadOverview();
      break;
    case 'workout':
      await loadWorkoutPlan();
      break;
    case 'attendance':
      await loadAttendance();
      break;
    case 'profile':
      await loadProfile();
      break;
  }
}

// Load overview
async function loadOverview() {
  try {
    // Load subscription
    const subResponse = await window.api.subscriptions.getByMember(currentUser._id);
    const subscriptions = subResponse.data || [];
    const activeSub = subscriptions.find(s => s.status === 'active');

    if (activeSub) {
      document.getElementById('current-plan').textContent = activeSub.planId?.name || 'N/A';
      const daysLeft = window.utils.daysBetween(new Date(), new Date(activeSub.endDate));
      document.getElementById('days-remaining').textContent = daysLeft;
      document.getElementById('plan-status').textContent = `Expires: ${window.utils.formatDate(activeSub.endDate)}`;
    } else {
      document.getElementById('current-plan').textContent = 'No active plan';
      document.getElementById('days-remaining').textContent = '0';
      document.getElementById('plan-status').textContent = 'Please subscribe to a plan';
    }

    // Load trainer info (from workout plan)
    try {
      const wpResponse = await window.api.workoutPlans.getByMember(currentUser._id);
      if (wpResponse.data && wpResponse.data.trainerId) {
        document.getElementById('assigned-trainer').textContent = wpResponse.data.trainerId.name || 'N/A';
        // Try to get trainer specialty
        const trainers = await window.api.trainers.getAll();
        const trainer = trainers.data.find(t => t.userId._id === wpResponse.data.trainerId._id);
        if (trainer) {
          document.getElementById('trainer-specialty').textContent = trainer.specialty || '';
        }
      }
    } catch (error) {
      document.getElementById('assigned-trainer').textContent = 'Not assigned';
    }

    // Load monthly check-ins
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const attendanceResponse = await window.api.attendance.getAll({
      from: startOfMonth.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
    });
    document.getElementById('month-checkins').textContent = attendanceResponse.data?.length || 0;
  } catch (error) {
    console.error('Failed to load overview:', error);
  }
}

// Load workout plan
async function loadWorkoutPlan() {
  const container = document.getElementById('workout-plan-content');
  window.utils.showLoading(container);

  try {
    const response = await window.api.workoutPlans.getByMember(currentUser._id);
    const plan = response.data;

    if (!plan) {
      container.innerHTML = '<p style="text-align: center; color: var(--gray);">No workout plan assigned yet. Contact your trainer.</p>';
      return;
    }

    const sessionsByDay = {};
    plan.sessions.forEach(session => {
      if (!sessionsByDay[session.dayOfWeek]) {
        sessionsByDay[session.dayOfWeek] = [];
      }
      sessionsByDay[session.dayOfWeek].push(session);
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    container.innerHTML = `
      <h3 style="margin-bottom: 1rem;">${plan.title}</h3>
      <p style="color: var(--gray); margin-bottom: 1.5rem;">Trainer: ${plan.trainerId?.name || 'N/A'}</p>
      ${days.map(day => {
        if (!sessionsByDay[day]) return '';
        return `
          <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--light); border-radius: var(--radius);">
            <h4 style="margin-bottom: 0.5rem; color: var(--primary);">${day}</h4>
            ${sessionsByDay[day].map(session => `
              <div style="margin-bottom: 0.75rem; padding: 0.75rem; background: var(--white); border-radius: var(--radius);">
                <strong>${session.exercise}</strong>
                <div style="margin-top: 0.5rem; color: var(--gray);">
                  ${session.sets ? `Sets: ${session.sets}` : ''} 
                  ${session.reps ? `Reps: ${session.reps}` : ''}
                </div>
                ${session.notes ? `<p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--gray);">${session.notes}</p>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
    `;
  } catch (error) {
    container.innerHTML = '<p style="text-align: center; color: var(--danger);">Failed to load workout plan</p>';
  }
}

// Load attendance
async function loadAttendance() {
  try {
    const response = await window.api.attendance.getAll({ limit: 30 });
    const records = response.data || [];

    // Update table
    const tbody = document.getElementById('attendance-table-body');
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--gray);">No attendance records</td></tr>';
    } else {
      tbody.innerHTML = records.map(record => `
        <tr>
          <td>${window.utils.formatDate(record.checkinAt)}</td>
          <td>${new Date(record.checkinAt).toLocaleTimeString()}</td>
          <td><span class="badge badge-info">${record.method}</span></td>
          <td>${record.photoUrl ? `<img class="checkin-photo" data-photo-url="${record.photoUrl}" src="${record.photoUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.25rem; cursor: pointer;">` : '-'}</td>
        </tr>
      `).join('');

      // Attach click listeners to photos to open modal
      document.querySelectorAll('.checkin-photo').forEach(img => {
        img.addEventListener('click', (e) => {
          const url = e.currentTarget.dataset.photoUrl;
          if (url) window.utils.showModal('Check-in Photo', `<img src="${url}" style="max-width: 100%">`);
        });
      });
    }

    // Create chart
    createAttendanceChart(records);
  } catch (error) {
    console.error('Failed to load attendance:', error);
  }
}

// Create attendance chart
function createAttendanceChart(records) {
  const ctx = document.getElementById('attendance-chart');
  if (!ctx) return;

  // Group by week
  const weeklyData = {};
  records.forEach(record => {
    const date = new Date(record.checkinAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
  });

  const labels = Object.keys(weeklyData).sort().slice(-8);
  const data = labels.map(label => weeklyData[label] || 0);

  if (attendanceChart) {
    attendanceChart.destroy();
  }

  attendanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.map(l => window.utils.formatDate(l)),
      datasets: [{
        label: 'Check-ins',
        data: data,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

// Load profile
async function loadProfile() {
  try {
    const user = await window.authUtils.getCurrentUser();
    if (user) {
      document.getElementById('profile-name').value = user.name || '';
      document.getElementById('profile-email').value = user.email || '';
      document.getElementById('profile-phone').value = user.phone || '';
      document.getElementById('profile-dob').value = user.dob ? new Date(user.dob).toISOString().split('T')[0] : '';
      document.getElementById('profile-emergency-name').value = user.emergencyContact?.name || '';
      document.getElementById('profile-emergency-phone').value = user.emergencyContact?.phone || '';
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}

// Check-in functions
async function checkinWithCamera() {
  try {
    const blob = await window.utils.captureWebcamPhoto();
    await uploadAndCheckin(blob, 'photo');
  } catch (error) {
    if (error.message !== 'Cancelled') {
      window.utils.showToast('Failed to capture photo', 'error');
    }
  }
}

async function checkinWithFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadAndCheckin(file, 'photo');
    }
  };
  input.click();
}

async function checkinManual() {
  try {
    await window.api.attendance.checkin({ method: 'manual' });
    window.utils.showToast('Check-in recorded successfully!', 'success');
    await loadOverview();
  } catch (error) {
    window.utils.showToast(error.message || 'Check-in failed', 'error');
  }
}

async function uploadAndCheckin(file, method) {
  try {
    window.utils.showToast('Uploading photo...', 'info');
    const uploadResponse = await window.api.upload.checkinPhoto(file);
    
    await window.api.attendance.checkin({
      method: method,
      photoUrl: uploadResponse.data.url,
    });

    window.utils.showToast('Check-in recorded successfully!', 'success');
    await loadOverview();
  } catch (error) {
    window.utils.showToast(error.message || 'Check-in failed', 'error');
  }
}

// Profile form submit
document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await window.api.users.update(currentUser._id, {
      name: document.getElementById('profile-name').value,
      phone: document.getElementById('profile-phone').value,
      dob: document.getElementById('profile-dob').value,
      emergencyContact: {
        name: document.getElementById('profile-emergency-name').value,
        phone: document.getElementById('profile-emergency-phone').value,
      },
    });
    window.utils.showToast('Profile updated successfully!', 'success');
    currentUser = await window.authUtils.getCurrentUser();
  } catch (error) {
    window.utils.showToast(error.message || 'Update failed', 'error');
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initDashboard);

