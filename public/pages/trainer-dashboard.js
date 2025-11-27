// Trainer Dashboard Logic
let currentUser = null;
let members = [];

// Initialize dashboard
async function initDashboard() {
  currentUser = await window.authUtils.protectRoute();
  if (!currentUser || currentUser.role !== 'trainer') {
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
  const createWorkoutBtn = document.querySelector('.btn-create-workout');
  if (createWorkoutBtn) createWorkoutBtn.addEventListener('click', showCreateWorkoutPlanModal);

  const filterAttendanceBtn = document.querySelector('.btn-filter-attendance');
  if (filterAttendanceBtn) filterAttendanceBtn.addEventListener('click', filterAttendance);
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
    case 'workout':
      await loadWorkoutPlans();
      break;
    case 'attendance':
      await loadAttendance();
      break;
  }
}

async function loadOverview() {
  try {
    // Get all members and their workout plans
    const allMembers = await window.api.users.getAll({ role: 'member' });
    const plans = [];
    const memberIds = new Set();
    
    for (const member of allMembers.data || []) {
      try {
        const planResponse = await window.api.workoutPlans.getByMember(member._id);
        if (planResponse.data && planResponse.data.trainerId?._id === currentUser._id) {
          plans.push(planResponse.data);
          memberIds.add(member._id);
        }
      } catch (error) {
        // No plan for this member
      }
    }
    
    document.getElementById('total-members').textContent = memberIds.size;
    document.getElementById('active-plans').textContent = plans.length;

    // Get today's check-ins
    const todayResponse = await window.api.attendance.getToday();
    document.getElementById('today-checkins').textContent = todayResponse.data?.length || 0;
  } catch (error) {
    console.error('Failed to load overview:', error);
  }
}

async function loadMembers() {
  try {
    // Get all members and check if they have workout plans from this trainer
    const allMembersResponse = await window.api.users.getAll({ role: 'member' });
    members = [];
    
    for (const member of allMembersResponse.data || []) {
      try {
        const planResponse = await window.api.workoutPlans.getByMember(member._id);
        if (planResponse.data && planResponse.data.trainerId?._id === currentUser._id) {
          members.push(member);
        }
      } catch (error) {
        // No plan for this member
      }
    }

    // Get last check-in for each member
    const tbody = document.getElementById('members-table-body');
    if (members.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--gray);">No members assigned</td></tr>';
      return;
    }

    const membersWithCheckin = await Promise.all(members.map(async (member) => {
      try {
        const attendanceResponse = await window.api.attendance.getAll({ memberId: member._id, limit: 1 });
        return {
          ...member,
          lastCheckin: attendanceResponse.data?.[0]?.checkinAt || null,
        };
      } catch (error) {
        return { ...member, lastCheckin: null };
      }
    }));

    tbody.innerHTML = membersWithCheckin.map(member => `
      <tr>
        <td>${member.name}</td>
        <td>${member.email}</td>
        <td>${member.phone || '-'}</td>
        <td>${member.lastCheckin ? window.utils.formatDateTime(member.lastCheckin) : 'Never'}</td>
        <td>
          <button class="btn btn-primary btn-create-plan" data-member-id="${member._id}" data-member-name="${member.name}" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">Create Plan</button>
        </td>
      </tr>
    `).join('');

    // Attach create plan listeners
    document.querySelectorAll('.btn-create-plan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.memberId;
        const name = e.currentTarget.dataset.memberName;
        createWorkoutPlanForMember(id, name);
      });
    });

    // Update filter dropdown
    const filter = document.getElementById('attendance-member-filter');
    filter.innerHTML = '<option value="">All Members</option>' + members.map(m => 
      `<option value="${m._id}">${m.name}</option>`
    ).join('');
  } catch (error) {
    console.error('Failed to load members:', error);
  }
}

async function loadWorkoutPlans() {
  const container = document.getElementById('workout-plans-list');
  window.utils.showLoading(container);

  try {
    // Get all members and their workout plans
    const allMembers = await window.api.users.getAll({ role: 'member' });
    const plans = [];
    
    for (const member of allMembers.data || []) {
      try {
        const planResponse = await window.api.workoutPlans.getByMember(member._id);
        if (planResponse.data && planResponse.data.trainerId?._id === currentUser._id) {
          plans.push(planResponse.data);
        }
      } catch (error) {
        // No plan for this member
      }
    }

    if (plans.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--gray);">No workout plans created yet</p>';
      return;
    }

    container.innerHTML = plans.map(plan => `
      <div class="card" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h3 style="margin-bottom: 0.5rem;">${plan.title}</h3>
            <p style="color: var(--gray);">Member: ${plan.memberId?.name || 'N/A'}</p>
            <p style="color: var(--gray); margin-top: 0.5rem;">Sessions: ${plan.sessions?.length || 0}</p>
          </div>
          <div>
            <button class="btn btn-primary btn-edit-plan" data-plan-id="${plan._id}">Edit</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach edit listeners
    document.querySelectorAll('.btn-edit-plan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planId = e.currentTarget.dataset.planId;
        editWorkoutPlan(planId);
      });
    });
  } catch (error) {
    container.innerHTML = '<p style="text-align: center; color: var(--danger);">Failed to load workout plans</p>';
  }
}

async function loadAttendance() {
  try {
    const response = await window.api.attendance.getAll({ limit: 50 });
    const records = response.data || [];

    const tbody = document.getElementById('attendance-table-body');
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--gray);">No attendance records</td></tr>';
      return;
    }

    tbody.innerHTML = records.map(record => `
      <tr>
        <td>${window.utils.formatDate(record.checkinAt)}</td>
        <td>${record.memberId?.name || 'N/A'}</td>
        <td>${new Date(record.checkinAt).toLocaleTimeString()}</td>
        <td><span class="badge badge-info">${record.method}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load attendance:', error);
  }
}

async function filterAttendance() {
  const memberId = document.getElementById('attendance-member-filter').value;
  const from = document.getElementById('attendance-from').value;
  const to = document.getElementById('attendance-to').value;

  const params = {};
  if (memberId) params.memberId = memberId;
  if (from) params.from = from;
  if (to) params.to = to;

  try {
    const response = await window.api.attendance.getAll(params);
    const records = response.data || [];

    const tbody = document.getElementById('attendance-table-body');
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--gray);">No records found</td></tr>';
      return;
    }

    tbody.innerHTML = records.map(record => `
      <tr>
        <td>${window.utils.formatDate(record.checkinAt)}</td>
        <td>${record.memberId?.name || 'N/A'}</td>
        <td>${new Date(record.checkinAt).toLocaleTimeString()}</td>
        <td><span class="badge badge-info">${record.method}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    window.utils.showToast('Failed to filter attendance', 'error');
  }
}

function showCreateWorkoutPlanModal() {
  // Get members list
  const memberOptions = members.map(m => `<option value="${m._id}">${m.name}</option>`).join('');
  
  const content = `
    <form id="workout-plan-form">
      <div class="form-group">
        <label class="form-label">Member</label>
        <select id="workout-member" class="form-input" required>
          <option value="">Select Member</option>
          ${memberOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Plan Title</label>
        <input type="text" id="workout-title" class="form-input" required>
      </div>
        <div id="workout-sessions">
        <h4 style="margin-bottom: 1rem;">Sessions</h4>
        <div id="sessions-list"></div>
        <button type="button" id="add-session-btn" class="btn btn-outline">+ Add Session</button>
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top: 1rem; width: 100%;">Create Plan</button>
    </form>
  `;

  const modal = window.utils.showModal('Create Workout Plan', content);
  
  document.getElementById('workout-plan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveWorkoutPlan();
    modal.remove();
  });

  // attach add session button
  const addBtn = document.getElementById('add-session-btn');
  if (addBtn) addBtn.addEventListener('click', addWorkoutSession);

  addWorkoutSession();
}

function addWorkoutSession() {
  const container = document.getElementById('sessions-list');
  const sessionDiv = document.createElement('div');
  sessionDiv.className = 'card';
  sessionDiv.style.marginBottom = '1rem';
  sessionDiv.innerHTML = `
    <div class="form-group">
      <label class="form-label">Day of Week</label>
      <select class="form-input session-day" required>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Exercise</label>
      <input type="text" class="form-input session-exercise" required>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <div class="form-group">
        <label class="form-label">Sets</label>
        <input type="text" class="form-input session-sets">
      </div>
      <div class="form-group">
        <label class="form-label">Reps</label>
        <input type="text" class="form-input session-reps">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-input session-notes" rows="2"></textarea>
    </div>
  `;
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-danger';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => sessionDiv.remove());
  sessionDiv.appendChild(removeBtn);
  container.appendChild(sessionDiv);
}

async function saveWorkoutPlan() {
  const memberId = document.getElementById('workout-member').value;
  const title = document.getElementById('workout-title').value;
  
  const sessions = Array.from(document.querySelectorAll('.session-day')).map((dayEl, index) => {
    const sessionDiv = dayEl.closest('.card');
    return {
      dayOfWeek: dayEl.value,
      exercise: sessionDiv.querySelector('.session-exercise').value,
      sets: sessionDiv.querySelector('.session-sets').value,
      reps: sessionDiv.querySelector('.session-reps').value,
      notes: sessionDiv.querySelector('.session-notes').value,
    };
  });

  try {
    await window.api.workoutPlans.create({ memberId, title, sessions });
    window.utils.showToast('Workout plan created successfully!', 'success');
    await loadWorkoutPlans();
    await loadMembers();
  } catch (error) {
    window.utils.showToast(error.message || 'Failed to create plan', 'error');
  }
}

function createWorkoutPlanForMember(memberId, memberName) {
  document.getElementById('workout-member').value = memberId;
  showCreateWorkoutPlanModal();
}

function editWorkoutPlan(planId) {
  window.utils.showToast('Edit functionality coming soon', 'info');
}

document.addEventListener('DOMContentLoaded', initDashboard);

