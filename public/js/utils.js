// Utility functions

// Show toast notification
const showToast = (message, type = 'info') => {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    if (toast.parentElement) toast.remove();
  });
  toast.appendChild(msgSpan);
  toast.appendChild(closeBtn);

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
};

// Create toast container if it doesn't exist
const createToastContainer = () => {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
};

// Show modal
const showModal = (title, content, onClose = null) => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'modal-header';

  const h2 = document.createElement('h2');
  h2.className = 'modal-title';
  h2.textContent = title;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    overlay.remove();
    if (onClose) onClose();
  });

  header.appendChild(h2);
  header.appendChild(closeBtn);

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'modal-body';
  if (typeof content === 'string') {
    bodyDiv.innerHTML = content;
  } else if (content instanceof Node) {
    bodyDiv.appendChild(content);
  }

  modal.appendChild(header);
  modal.appendChild(bodyDiv);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('active'), 10);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onClose) onClose();
    }
  });

  return overlay;
};

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format datetime
const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate days between dates
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
};

// Validate email
const validateEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  return password.length >= 6;
};

// Show loading spinner
const showLoading = (container) => {
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  container.innerHTML = '';
  container.appendChild(spinner);
};

// Capture photo from webcam
const captureWebcamPhoto = () => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;

        const container = document.createElement('div');
        container.className = 'webcam-container';
        container.innerHTML = `
          <video id="webcam-video" autoplay playsinline style="width: 100%; max-width: 400px; border-radius: 0.5rem;"></video>
          <div style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-primary" id="capture-btn">Capture Photo</button>
            <button class="btn btn-outline" id="cancel-btn">Cancel</button>
          </div>
        `;

        const modal = showModal('Take Photo', container.outerHTML);

        const videoEl = document.getElementById('webcam-video');
        videoEl.srcObject = stream;

        document.getElementById('capture-btn').addEventListener('click', () => {
          const canvas = document.createElement('canvas');
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          canvas.getContext('2d').drawImage(videoEl, 0, 0);

          stream.getTracks().forEach((track) => track.stop());
          canvas.toBlob((blob) => {
            modal.remove();
            resolve(blob);
          }, 'image/jpeg', 0.9);
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
          stream.getTracks().forEach((track) => track.stop());
          modal.remove();
          reject(new Error('Cancelled'));
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Export
window.utils = {
  showToast,
  showModal,
  formatDate,
  formatDateTime,
  daysBetween,
  validateEmail,
  validatePassword,
  showLoading,
  captureWebcamPhoto,
};

