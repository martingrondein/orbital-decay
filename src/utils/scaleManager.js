/**
 * Dynamic Scale Manager
 * Calculates optimal game scaling based on device resolution
 */

// Base game dimensions (logical resolution)
export const GAME_WIDTH = 375;
export const GAME_HEIGHT = 720;

// Minimum and maximum zoom levels
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;

// Aspect ratio tolerance (to handle slight variations)
const ASPECT_RATIO_TOLERANCE = 0.1;

/**
 * Calculate the optimal zoom level for the current screen
 * Scale based on width only for pixel-perfect rendering
 * @returns {number} The optimal zoom level
 */
export function calculateOptimalZoom() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Calculate zoom based on width only for pixel-perfect scaling
  let zoom = screenWidth / GAME_WIDTH;

  // Floor the zoom to avoid sub-pixel rendering issues with pixel art
  zoom = Math.floor(zoom);

  // Clamp between min and max
  zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

  console.log(`Screen: ${screenWidth}x${screenHeight}, Width-based zoom: ${zoom}`);

  return zoom;
}

/**
 * Get scale configuration for Phaser
 * @returns {object} Phaser scale configuration
 */
export function getScaleConfig() {
  return {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    // Let Phaser handle the parent size detection
    parent: undefined,
    // Enable fullscreen support
    fullscreenTarget: 'game-container',
  };
}

/**
 * Setup resize handler to adjust game scale on window resize
 * @param {Phaser.Game} game - The Phaser game instance
 */
export function setupResizeHandler(game) {
  let resizeTimeout;

  const handleResize = () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newZoom = calculateOptimalZoom();

      if (game && game.scale) {
        console.log(`Resizing game to zoom: ${newZoom}`);

        // Update the game zoom
        game.scale.setZoom(newZoom);

        // Refresh the scale
        game.scale.refresh();
      }
    }, 250); // Wait 250ms after resize stops
  };

  // Listen for resize events
  window.addEventListener('resize', handleResize);

  // Listen for orientation change on mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100); // Small delay to let orientation settle
  });

  // Initial calculation
  handleResize();

  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
}

/**
 * Get device info for debugging
 * @returns {object} Device information
 */
export function getDeviceInfo() {
  return {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    aspectRatio: (window.innerWidth / window.innerHeight).toFixed(2),
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    zoom: calculateOptimalZoom(),
  };
}

/**
 * Log device and scaling information
 */
export function logScalingInfo() {
  const info = getDeviceInfo();
  console.log('=== Device & Scaling Info ===');
  console.log(`Screen: ${info.screenWidth}x${info.screenHeight}`);
  console.log(`Pixel Ratio: ${info.devicePixelRatio}`);
  console.log(`Aspect Ratio: ${info.aspectRatio}`);
  console.log(`Orientation: ${info.orientation}`);
  console.log(`Calculated Zoom: ${info.zoom}`);
  console.log(`Game Resolution: ${GAME_WIDTH}x${GAME_HEIGHT}`);
  console.log(`Canvas Size: ${GAME_WIDTH * info.zoom}x${GAME_HEIGHT * info.zoom}`);
  console.log('============================');
}
