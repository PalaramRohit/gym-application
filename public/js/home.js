// home.js - loads plans and sets up role-panel buttons
(async function () {
  async function loadPlans() {
    try {
      const response = await window.api.plans.getAll();
      const plans = response.data || [];
      const container = document.getElementById('plans-container');

      if (!container) return;

      if (plans.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray);">No plans available</p>';
        return;
      }

      container.innerHTML = plans
        .map(
          (plan) => `
          <div class="plan-card">
            <h3>${plan.name}</h3>
            <div class="plan-price">$${plan.price}</div>
            <p style="color: var(--gray);">${plan.durationInDays} days</p>
            <ul class="plan-perks">
              ${((plan.perks && plan.perks.map) ? plan.perks.map((perk) => `<li>${perk}</li>`).join('') : '')}
            </ul>
            <a href="pages/register.html?plan=${encodeURIComponent(plan._id || '')}" class="btn btn-primary" style="width: 100%;">Choose Plan</a>
          </div>
        `
        )
        .join('');
    } catch (error) {
      console.error('Failed to load plans:', error);
      const container = document.getElementById('plans-container');
      if (container) container.innerHTML = '<p style="text-align: center; color: var(--danger);">Failed to load plans</p>';
    }
  }

  // Setup role selection panels if present
  function setupRolePanels() {
    const adminBtn = document.getElementById('panel-admin');
    const trainerBtn = document.getElementById('panel-trainer');
    const customerBtn = document.getElementById('panel-customer');

    if (adminBtn) adminBtn.addEventListener('click', () => (location.href = 'pages/register.html?role=admin'));
    if (trainerBtn) trainerBtn.addEventListener('click', () => (location.href = 'pages/register.html?role=trainer'));
    if (customerBtn) customerBtn.addEventListener('click', () => (location.href = 'pages/register.html?role=member'));
  }

  loadPlans();
  setupRolePanels();
})();
