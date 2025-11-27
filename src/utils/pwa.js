/**
 * PWA Install Prompt Handler
 * Manages the custom install prompt for the Progressive Web App
 */

let deferredPrompt = null;
let installButton = null;

/**
 * Initialize PWA install prompt
 */
export function initPWAInstall() {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Show the install button
    showInstallPrompt();

    console.log('PWA install prompt ready');
  });

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    hideInstallPrompt();
    deferredPrompt = null;
  });

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true) {
    console.log('PWA already installed');
    return;
  }

  // Create the install prompt UI
  createInstallPromptUI();
}

/**
 * Create the install prompt UI element
 */
function createInstallPromptUI() {
  // Create container
  const promptContainer = document.createElement('div');
  promptContainer.id = 'pwa-install-prompt';
  promptContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #0f0 0%, #0a0 100%);
    color: #000;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
    z-index: 10000;
    display: none;
    font-family: monospace;
    font-size: 14px;
    max-width: 90%;
    text-align: center;
    animation: slideUp 0.3s ease-out;
  `;

  // Create text
  const text = document.createElement('div');
  text.textContent = 'Install Orbital Decay for offline play!';
  text.style.cssText = `
    margin-bottom: 10px;
    font-weight: bold;
  `;

  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 10px;
    justify-content: center;
  `;

  // Create install button
  installButton = document.createElement('button');
  installButton.textContent = 'INSTALL';
  installButton.style.cssText = `
    background: #000;
    color: #0f0;
    border: 2px solid #0f0;
    padding: 8px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-family: monospace;
    font-weight: bold;
    font-size: 12px;
    transition: all 0.2s;
  `;
  installButton.onmouseover = () => {
    installButton.style.background = '#0f0';
    installButton.style.color = '#000';
  };
  installButton.onmouseout = () => {
    installButton.style.background = '#000';
    installButton.style.color = '#0f0';
  };
  installButton.onclick = handleInstallClick;

  // Create dismiss button
  const dismissButton = document.createElement('button');
  dismissButton.textContent = 'LATER';
  dismissButton.style.cssText = `
    background: transparent;
    color: #000;
    border: 2px solid #000;
    padding: 8px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-family: monospace;
    font-weight: bold;
    font-size: 12px;
    transition: all 0.2s;
  `;
  dismissButton.onmouseover = () => {
    dismissButton.style.background = 'rgba(0, 0, 0, 0.1)';
  };
  dismissButton.onmouseout = () => {
    dismissButton.style.background = 'transparent';
  };
  dismissButton.onclick = () => {
    hideInstallPrompt();
    // Show again after 24 hours
    const dismissedAt = Date.now();
    localStorage.setItem('pwa-install-dismissed', dismissedAt.toString());
  };

  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Assemble the prompt
  buttonContainer.appendChild(installButton);
  buttonContainer.appendChild(dismissButton);
  promptContainer.appendChild(text);
  promptContainer.appendChild(buttonContainer);
  document.body.appendChild(promptContainer);
}

/**
 * Show the install prompt
 */
function showInstallPrompt() {
  const prompt = document.getElementById('pwa-install-prompt');
  if (!prompt) return;

  // Check if user dismissed recently (within 24 hours)
  const dismissedAt = localStorage.getItem('pwa-install-dismissed');
  if (dismissedAt) {
    const hoursSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
    if (hoursSinceDismissed < 24) {
      return;
    }
  }

  prompt.style.display = 'block';
}

/**
 * Hide the install prompt
 */
function hideInstallPrompt() {
  const prompt = document.getElementById('pwa-install-prompt');
  if (prompt) {
    prompt.style.display = 'none';
  }
}

/**
 * Handle install button click
 */
async function handleInstallClick() {
  if (!deferredPrompt) {
    console.log('No deferred prompt available');
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user's response
  const { outcome } = await deferredPrompt.userChoice;

  console.log(`User response to install prompt: ${outcome}`);

  // Clear the deferred prompt
  deferredPrompt = null;

  // Hide the prompt
  hideInstallPrompt();
}

/**
 * Show update notification
 */
function showUpdateNotification() {
  // Create update notification
  const updatePrompt = document.createElement('div');
  updatePrompt.id = 'pwa-update-prompt';
  updatePrompt.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #0f0 0%, #0a0 100%);
    color: #000;
    padding: 30px 40px;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 255, 0, 0.5);
    z-index: 20000;
    font-family: 'Silkscreen', monospace;
    text-align: center;
    animation: popIn 0.3s ease-out;
    max-width: 90%;
  `;

  // Create text
  const text = document.createElement('div');
  text.innerHTML = `
    <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">UPDATE AVAILABLE!</div>
    <div style="font-size: 14px; margin-bottom: 20px;">A new version is ready to install</div>
  `;
  updatePrompt.appendChild(text);

  // Create button
  const updateButton = document.createElement('button');
  updateButton.textContent = 'RELOAD NOW';
  updateButton.style.cssText = `
    background: #000;
    color: #0f0;
    border: 3px solid #0f0;
    padding: 12px 30px;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Silkscreen', monospace;
    font-weight: bold;
    font-size: 16px;
    transition: all 0.2s;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  `;
  updateButton.onmouseover = () => {
    updateButton.style.background = '#0f0';
    updateButton.style.color = '#000';
    updateButton.style.transform = 'scale(1.05)';
  };
  updateButton.onmouseout = () => {
    updateButton.style.background = '#000';
    updateButton.style.color = '#0f0';
    updateButton.style.transform = 'scale(1)';
  };
  updateButton.onclick = () => {
    window.location.reload();
  };
  updatePrompt.appendChild(updateButton);

  // Add background overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 19999;
  `;
  document.body.appendChild(overlay);

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes popIn {
      from {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(updatePrompt);
}

/**
 * Register service worker updates
 */
export function registerSWUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/orbital-decay/sw.js').then((registration) => {
      console.log('Service Worker registered:', registration);

      // Check for updates immediately on load
      registration.update();

      // Check for updates every 5 minutes (more aggressive)
      setInterval(() => {
        console.log('Checking for updates...');
        registration.update();
      }, 5 * 60 * 1000);

      // Check for updates when page becomes visible
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          console.log('Page visible, checking for updates...');
          registration.update();
        }
      });

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New service worker found, installing...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, show update prompt
            console.log('New content available, showing update prompt');
            showUpdateNotification();
          }
        });
      });
    }).catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  }
}
