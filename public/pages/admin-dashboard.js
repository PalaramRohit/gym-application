// Admin Dashboard Logic
let currentUser = null;
let attendanceChart = null;
let membershipChart = null;

// Initialize dashboard
async function initDashboard() {
  currentUser = await window.authUtils.protectRoute();
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = '../index.html';
    return;
  }

  document.getElementById('user-name').textContent = currentUser.name;
  setupNavigation();
  await loadOverview();
  
  const activeSection = document.querySelector('.nav-item.active').dataset.section;
  showSection(activeSection);
}

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

  // Attach static button listeners from the HTML (avoid inline onclick)
  const exportMembersBtn = document.querySelector('.btn-export-members');
  if (exportMembersBtn) exportMembersBtn.addEventListener('click', exportMembersCSV);

  const searchMembersBtn = document.querySelector('.btn-search-members');
  if (searchMembersBtn) searchMembersBtn.addEventListener('click', searchMembers);

  const createTrainerBtn = document.querySelector('.btn-create-trainer');
  if (createTrainerBtn) createTrainerBtn.addEventListener('click', showCreateTrainerModal);

  const createPlanBtn = document.querySelector('.btn-create-plan');
  if (createPlanBtn) createPlanBtn.addEventListener('click', showCreatePlanModal);

  const exportAttendanceBtn = document.querySelectorAll('.btn-export-attendance');
  exportAttendanceBtn.forEach(b => b.addEventListener('click', exportAttendanceCSV));

  const filterAttendanceBtn = document.querySelector('.btn-filter-attendance');
  if (filterAttendanceBtn) filterAttendanceBtn.addEventListener('click', filterAttendance);

  const exportMembersReportsBtn = document.querySelector('.btn-export-members-reports');
  if (exportMembersReportsBtn) exportMembersReportsBtn.addEventListener('click', exportMembersCSV);
}

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

async function loadSectionData(section) {
  switch (section) {
    case 'overview':
      await loadOverview();
      break;
    case 'members':
      await loadMembers();
      break;
    case 'trainers':
      await loadTrainers();
      break;
    case 'plans':
      await loadPlans();
      break;
    case 'attendance':
      await loadAttendance();
      break;
  }
}

async function loadOverview() {
  try {
    // Total members
    const membersResponse = await window.api.users.getAll({ role: 'member' });
    const totalMembers = membersResponse.pagination?.total || membersResponse.data?.length || 0;
    document.getElementById('total-members').textContent = totalMembers;

    // Active subscriptions (mock - would need subscription count endpoint)
    const allMembers = membersResponse.data || [];
    let activeSubs = 0;
    for (const member of allMembers.slice(0, 10)) { // Sample check
      try {
        const subResponse = await window.api.subscriptions.getByMember(member._id);
        const active = subResponse.data?.find(s => s.status === 'active');
        if (active) activeSubs++;
      } catch (error) {}
    }
    document.getElementById('active-subscriptions').textContent = activeSubs + '+';

    // Today's check-ins
    const todayResponse = await window.api.attendance.getToday();
    document.getElementById('today-checkins').textContent = todayResponse.data?.length || 0;

    // Monthly revenue (mock)
    const monthlyRevenue = activeSubs * 100; // Mock calculation
    document.getElementById('monthly-revenue').textContent = `$${monthlyRevenue}`;

    // Load charts
    await loadCharts();
  } catch (error) {
    console.error('Failed to load overview:', error);
  }
}

async function loadCharts() {
  try {
    // Attendance chart
    const attendanceResponse = await window.api.attendance.getAll({ limit: 100 });
    const records = attendanceResponse.data || [];
    
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

    const ctx1 = document.getElementById('attendance-chart');
    if (ctx1) {
      if (attendanceChart) attendanceChart.destroy();
      attendanceChart = new Chart(ctx1, {
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
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        },
      });
    }

    // Membership growth chart
    const membersResponse = await window.api.users.getAll({ role: 'member' });
    const members = membersResponse.data || [];
    
    const monthlyData = {};
    members.forEach(member => {
      const date = new Date(member.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    const monthLabels = Object.keys(monthlyData).sort().slice(-6);
    const memberData = monthLabels.map(label => monthlyData[label] || 0);

    const ctx2 = document.getElementById('membership-chart');
    if (ctx2) {
      if (membershipChart) membershipChart.destroy();
      membershipChart = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [{
            label: 'New Members',
            data: memberData,
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
          }],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        },
      });
    }
  } catch (error) {
    console.error('Failed to load charts:', error);
  }
}

async function loadMembers() {
  try {
    const response = await window.api.users.getAll({ role: 'member', limit: 50 });
    const members = response.data || [];

    const tbody = document.getElementById('members-table-body');
    if (members.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--gray);">No members found</td></tr>';
      return;
    }

    tbody.innerHTML = members.map(member => `
      <tr>
        <td>${member.name}</td>
        <td>${member.email}</td>
        <td>${member.phone || '-'}</td>
        <td><span class="badge badge-info">${member.role}</span></td>
        <td>${window.utils.formatDate(member.createdAt)}</td>
        <td>
          <button class="btn btn-primary btn-add-sub" data-member-id="${member._id}" data-member-name="${member.name}" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">Add Subscription</button>
        </td>
      </tr>
    `).join('');

    // Attach add-sub listeners
    document.querySelectorAll('.btn-add-sub').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.memberId;
        const name = e.currentTarget.dataset.memberName;
        createSubscription(id, name);
      });
    });
  } catch (error) {
    console.error('Failed to load members:', error);
  }
}

async function searchMembers() {
  const search = document.getElementById('member-search').value;
  try {
    const response = await window.api.users.getAll({ role: 'member', search, limit: 50 });
    const members = response.data || [];

    const tbody = document.getElementById('members-table-body');
    if (members.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--gray);">No members found</td></tr>';
      return;
    }

    tbody.innerHTML = members.map(member => `
      <tr>
        <td>${member.name}</td>
        <td>${member.email}</td>
        <td>${member.phone || '-'}</td>
        <td><span class="badge badge-info">${member.role}</span></td>
        <td>${window.utils.formatDate(member.createdAt)}</td>
        <td>
          <button class="btn btn-primary btn-add-sub" data-member-id="${member._id}" data-member-name="${member.name}" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">Add Subscription</button>
        </td>
      </tr>
    `).join('');

    // Attach add-sub listeners for search result
    document.querySelectorAll('.btn-add-sub').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.memberId;
        const name = e.currentTarget.dataset.memberName;
        createSubscription(id, name);
      });
    });
  } catch (error) {
    window.utils.showToast('Search failed', 'error');
  }
}

async function loadTrainers() {
  const container = document.getElementById('trainers-list');
  window.utils.showLoading(container);

  try {
    const response = await window.api.trainers.getAll();
    const trainers = response.data || [];

    if (trainers.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--gray);">No trainers found</p>';
      return;
    }

    container.innerHTML = trainers.map(trainer => `
      <div class="card" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h3 style="margin-bottom: 0.5rem;">${trainer.userId?.name || 'N/A'}</h3>
            <p style="color: var(--gray);">${trainer.specialty || 'No specialty'}</p>
            <p style="color: var(--gray); margin-top: 0.5rem;">Experience: ${trainer.experienceYears || 0} years</p>
            ${trainer.bio ? `<p style="margin-top: 0.5rem;">${trainer.bio}</p>` : ''}
          </div>
          <button class="btn btn-danger btn-delete-trainer" data-trainer-id="${trainer._id}">Delete</button>
        </div>
      </div>
    `).join('');

    // Attach delete trainer listeners
    document.querySelectorAll('.btn-delete-trainer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.trainerId;
        deleteTrainer(id);
      });
    });
  } catch (error) {
    container.innerHTML = '<p style="text-align: center; color: var(--danger);">Failed to load trainers</p>';
  }
}

async function loadPlans() {
  const container = document.getElementById('plans-list');
  window.utils.showLoading(container);

  try {
    const response = await window.api.plans.getAll();
    const plans = response.data || [];

    if (plans.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--gray);">No plans found</p>';
      return;
    }

    container.innerHTML = plans.map(plan => `
      <div class="card" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h3 style="margin-bottom: 0.5rem;">${plan.name}</h3>
            <p style="color: var(--gray);">Duration: ${plan.durationInDays} days | Price: $${plan.price}</p>
            <p style="color: var(--gray); margin-top: 0.5rem;">Perks: ${plan.perks.join(', ')}</p>
          </div>
          <div>
            <button class="btn btn-primary btn-edit-plan" data-plan-id="${plan._id}" style="margin-right: 0.5rem;">Edit</button>
            <button class="btn btn-danger btn-delete-plan" data-plan-id="${plan._id}">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach plan edit/delete listeners
    document.querySelectorAll('.btn-edit-plan').forEach(btn => btn.addEventListener('click', (e) => editPlan(e.currentTarget.dataset.planId)));
    document.querySelectorAll('.btn-delete-plan').forEach(btn => btn.addEventListener('click', (e) => deletePlan(e.currentTarget.dataset.planId)));
  } catch (error) {
    container.innerHTML = '<p style="text-align: center; color: var(--danger);">Failed to load plans</p>';
  }
}

async function loadAttendance() {
  try {
    const response = await window.api.attendance.getAll({ limit: 50 });
    const records = response.data || [];

    const tbody = document.getElementById('attendance-table-body');
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--gray);">No records found</td></tr>';
      return;
    }

    tbody.innerHTML = records.map(record => `
      <tr>
        <td>${window.utils.formatDate(record.checkinAt)}</td>
        <td>${record.memberId?.name || 'N/A'}</td>
        <td>${record.trainerId?.name || 'N/A'}</td>
        <td>${new Date(record.checkinAt).toLocaleTimeString()}</td>
        <td><span class="badge badge-info">${record.method}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load attendance:', error);
  }
}

async function filterAttendance() {
  const from = document.getElementById('attendance-from').value;
  const to = document.getElementById('attendance-to').value;

  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;

  try {
    const response = await window.api.attendance.getAll(params);
    const records = response.data || [];

    const tbody = document.getElementById('attendance-table-body');
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--gray);">No records found</td></tr>';
      return;
    }

    tbody.innerHTML = records.map(record => `
      <tr>
        <td>${window.utils.formatDate(record.checkinAt)}</td>
        <td>${record.memberId?.name || 'N/A'}</td>
        <td>${record.trainerId?.name || 'N/A'}</td>
        <td>${new Date(record.checkinAt).toLocaleTimeString()}</td>
        <td><span class="badge badge-info">${record.method}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    window.utils.showToast('Failed to filter attendance', 'error');
  }
}

function showCreateTrainerModal() {
  window.utils.showToast('Create trainer: First create a user with trainer role, then create trainer profile', 'info');
}

function showCreatePlanModal() {
  const content = `
    <form id="plan-form">
      <div class="form-group">
        <label class="form-label">Plan Name</label>
        <input type="text" id="plan-name" class="form-input" required>
      </div>
      <div class="form-group">
        <label class="form-label">Duration (days)</label>
        <input type="number" id="plan-duration" class="form-input" min="1" required>
      </div>
      <div class="form-group">
        <label class="form-label">Price ($)</label>
        <input type="number" id="plan-price" class="form-input" min="0" step="0.01" required>
      </div>
      <div class="form-group">
        <label class="form-label">Perks (comma-separated)</label>
        <input type="text" id="plan-perks" class="form-input" placeholder="Access to gym, Locker room">
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Create Plan</button>
    </form>
  `;

  const modal = window.utils.showModal('Create Plan', content);
  document.getElementById('plan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('plan-name').value;
    const duration = parseInt(document.getElementById('plan-duration').value);
    const price = parseFloat(document.getElementById('plan-price').value);
    const perks = document.getElementById('plan-perks').value.split(',').map(p => p.trim()).filter(p => p);

    try {
      await window.api.plans.create({ name, durationInDays: duration, price, perks });
      window.utils.showToast('Plan created successfully!', 'success');
      modal.remove();
      await loadPlans();
    } catch (error) {
      window.utils.showToast(error.message || 'Failed to create plan', 'error');
    }
  });
}

function editPlan(planId) {
  window.utils.showToast('Edit functionality coming soon', 'info');
}

async function deletePlan(planId) {
  if (!confirm('Are you sure you want to delete this plan?')) return;
  try {
    await window.api.plans.delete(planId);
    window.utils.showToast('Plan deleted successfully!', 'success');
    await loadPlans();
  } catch (error) {
    window.utils.showToast(error.message || 'Failed to delete plan', 'error');
  }
}

async function deleteTrainer(trainerId) {
  if (!confirm('Are you sure you want to delete this trainer?')) return;
  window.utils.showToast('Delete trainer functionality coming soon', 'info');
}

function createSubscription(memberId, memberName) {
  window.utils.showToast('Subscription creation coming soon', 'info');
}

function exportAttendanceCSV() {
  const from = document.getElementById('attendance-from')?.value || '';
  const to = document.getElementById('attendance-to')?.value || '';
  window.api.reports.attendanceCSV({ from, to });
}

function exportMembersCSV() {
  window.api.reports.membersCSV();
}

document.addEventListener('DOMContentLoaded', initDashboard);

