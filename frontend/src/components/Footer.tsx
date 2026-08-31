// ============================================================================
// FOOTER — site footer with link groups + connectivity mode legend.
// Extracted from the old renderer.tsx as a reusable JSX fragment.
// ============================================================================

export const Footer = () => (
  <footer class="bg-agri-900 text-agri-200 mt-16 border-t-4 border-tech-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div class="col-span-1 sm:col-span-2 lg:col-span-1">
        <div class="flex items-center gap-2.5 mb-3">
          <span class="w-8 h-8 rounded-md bg-tech-500 flex items-center justify-center text-agri-900 text-sm">🌾</span>
          <span class="font-display font-bold text-white">CropRakshak</span>
        </div>
        <p class="text-sm text-agri-300 leading-relaxed">Detect Early • Diagnose Right • Advise Smart • Act in Time • Protect Yield.</p>
        <p class="text-xs text-agri-400 mt-3">A Smart India Hackathon prototype for smallholder &amp; marginal farmers.</p>
      </div>
      <div>
        <h4 class="text-white font-semibold text-sm mb-3">Farmer Tools</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/scan" class="hover:text-agri-400">Scan Your Crop</a></li>
          <li><a href="/dashboard" class="hover:text-agri-400">My Dashboard</a></li>
          <li><a href="/seed" class="hover:text-agri-400">Seed Verification</a></li>
          <li><a href="/action/wheat-rust" class="hover:text-agri-400">Sample Recommendation</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-semibold text-sm mb-3">Ecosystem</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/admin" class="hover:text-agri-400">Officer / Admin View</a></li>
          <li><a href="/dealer" class="hover:text-agri-400">Dealer &amp; Lab View</a></li>
          <li><a href="#help" class="hover:text-agri-400">KVK &amp; Extension Services</a></li>
          <li><a href="#help" class="hover:text-agri-400">Weather &amp; Advisory</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-semibold text-sm mb-3">Connectivity Modes</h4>
        <ul class="space-y-2 text-sm text-agri-300">
          <li><i class="fa-solid fa-wifi text-agri-400 mr-1.5"></i> Full features on good internet</li>
          <li><i class="fa-solid fa-signal text-tech-400 mr-1.5"></i> Compressed mode on low bandwidth</li>
          <li><i class="fa-solid fa-plane-slash text-eco-400 mr-1.5"></i> Offline local inference</li>
          <li><i class="fa-solid fa-comment-sms text-tech-300 mr-1.5"></i> SMS / IVR fallback</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-agri-800 py-4 text-center text-xs text-agri-400">
      © 2026 CropRakshak — Hackathon prototype. All crop/pest data shown is simulated for demonstration.
    </div>
  </footer>
)
