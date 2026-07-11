"use client";

export default function MessiDashboard() {
  return (
    <div
      className="w-full h-screen overflow-hidden font-['Plus_Jakarta_Sans'] text-[#131b2e]"
      style={{
        background: "#f1f5f9",
        backgroundImage: "radial-gradient(#006c49 0.5px, transparent 0.5px), linear-gradient(to bottom, #f1f5f9, #e2e7ff)",
        backgroundSize: "20px 20px, 100% 100%",
      }}
    >
      <main className="relative w-full h-[calc(100vh-48px)] p-8 overflow-hidden">
        {/* Desktop Icons */}
        <div className="absolute top-8 right-8 flex flex-col gap-8 items-center">
          <div className="group cursor-pointer flex flex-col items-center">
            <img alt="Star Icon" className="w-16 h-16 mb-1" style={{ filter: "drop-shadow(2px 2px 0px #0f172a)" }} src="https://lh3.googleusercontent.com/aida/AP1WRLu_2xfvP94WjCs9wKnT47V77vj3z_LlxC_HDMYEk23XWfRqpJggyebBvhNQ6F8BXQ1inIuH_rO1OopDXxcHJ6Ub4JxrhKQGdsh6tjNzBT_UfeY1DQ8LmbSmdQTk3Bq4pY9twrQVZKX9My0YqTUx1NT4T5s4ts4qvN8aUe9BqokOBBG8NP1ExKGp-XR5eqK-ywZ60eE80Ex4HFgvSTPqEE9QNTitOetfAaUklVmz95ALEz_wAgfDCnoPmwg" />
            <span className="text-[10px] font-bold bg-[#0f172a] text-white px-2 py-0.5 rounded-full">SYSTEM_CORE</span>
          </div>
          <div className="group cursor-pointer flex flex-col items-center">
            <img alt="Cloud Icon" className="w-16 h-16 mb-1" style={{ filter: "drop-shadow(2px 2px 0px #0f172a)" }} src="https://lh3.googleusercontent.com/aida/AP1WRLsIfRqLHSE8Dzi1uTlT_rOxqEB3JBH8BR0VWWW3o-uWJHmV5cPMp8Jax7eEBTeRp2DlHp1_qSaE0ra8HQ3G7Ep_-PK6UERlv9C8Xn7bqr9SiawJX6YIENipR3qGVfR6GtJ7T8AVcMf0ONEVg3DLlrGx4DlB1EQ3gWsHjJ8MmYuFDaa_FIcssygkD_7D_iJJL7ZKgC4cZGleKiXPJYqN3WI6bEuSoZW8Fhq-Gcc4auSucVKwX6zHgNLERGw" />
            <span className="text-[10px] font-bold bg-[#0f172a] text-white px-2 py-0.5 rounded-full">CLOUD_SYNC</span>
          </div>
        </div>

        {/* MAIN WINDOW */}
        <div
          className="absolute top-10 left-10 w-[480px] z-20"
          style={{
            background: "white",
            border: "4px solid #0f172a",
            boxShadow: "6px 6px 0px 0px #0f172a",
            borderRadius: "8px",
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: "4px solid #0f172a", cursor: "grab" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#006c49] rounded-sm" />
              <span className="font-bold text-xs uppercase tracking-wider">Ecological Simulation v4.2</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-[#0f172a] rounded-sm bg-[#f2f3ff]" />
              <div className="w-3.5 h-3.5 border-2 border-[#0f172a] rounded-sm bg-[#b61722]" />
            </div>
          </div>
          <div className="p-4" style={{ maxHeight: "400px", overflowY: "auto" }}>
            <div className="mb-4">
              <h1 className="text-2xl font-bold font-['VT323']">SECTOR_07 TELEMETRY</h1>
              <p className="text-[10px] font-['VT323'] opacity-60">SNAPSHOT_2023.10.27_14:42:01</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border-2 border-[#0f172a] bg-[#f2f3ff]">
                <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Efficiency</div>
                <div className="text-3xl font-['VT323'] font-bold text-[#006c49]">94.2%</div>
                <div className="h-1.5 bg-[#0f172a]/10 mt-2">
                  <div className="bg-[#006c49] h-full" style={{ width: "94.2%" }} />
                </div>
              </div>
              <div className="p-3 border-2 border-[#0f172a] bg-[#f2f3ff]">
                <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Mood Index</div>
                <div className="text-2xl font-['VT323'] font-bold uppercase">Optimal</div>
                <p className="text-[8px] mt-1">Wait times &lt; 120s</p>
              </div>
            </div>
            <div
              className="mt-4 p-3 border-2 border-[#0f172a] bg-[#0f172a] text-white font-['VT323'] text-[10px] h-32 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#0f172a #f1f5f9",
              }}
            >
              &gt; SYSTEM_READY...<br />
              &gt; CALIBRATING ECO-SENSORS...<br />
              &gt; WASTE REDUCTION TARGET: 30.0%<br />
              &gt; CURRENT STATUS: -28.4%<br />
              &gt; [OK] THERMAL MAPPING LOADED<br />
              &gt; [OK] AGENT FLEET ACTIVE
            </div>
          </div>
        </div>

        {/* AGENT TERMINAL */}
        <div
          className="absolute top-24 right-48 w-[400px] z-10"
          style={{
            background: "white",
            border: "4px solid #0f172a",
            boxShadow: "6px 6px 0px 0px #0f172a",
            borderRadius: "8px",
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: "4px solid #0f172a", cursor: "grab" }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" /></svg>
              <span className="font-bold text-xs uppercase tracking-wider">Agent_Unit_01.sys</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-[#0f172a] rounded-sm" />
              <div className="w-3.5 h-3.5 border-2 border-[#0f172a] rounded-sm bg-[#b61722]" />
            </div>
          </div>
          <div className="p-6 flex flex-col items-center">
            <div className="w-32 h-32 border-4 border-[#0f172a] bg-white p-2 mb-4">
              <img alt="Agent Avatar" className="w-full h-full object-contain grayscale" src="https://lh3.googleusercontent.com/aida/AP1WRLvLEiXDa9ECvHDJ94l-nEJZgi1eBSLgwvWbOIYnVMVyMhyXN9gyWTkJo3w8YYrn98tHdvNw7mz5DnVm1y8bPhDtrnZeYB5CmRahzGjsb3jyCFRA9tehCun1AGEsKGeRshykxHQkmHTQfC308OEo5eY6VxvM7BOvLwqqqnh3WtP3RcSNxhKz6juHeBBVmMaRkDvP_c43HIKKrB1ELl5Rq0-XbTN0_tTMPRVbVDIcFDzWThPre96Ne2IZEGM" />
            </div>
            <h3 className="font-bold text-lg leading-tight text-center">Chef &ldquo;Byte&rdquo; Ramsay</h3>
            <p className="text-[10px] font-['VT323'] opacity-60 uppercase mb-4">Logic-Based Menu Optimization</p>
            <div className="w-full bg-[#e2e7ff] border-2 border-[#0f172a] p-3 font-['VT323'] text-[10px] mb-4">
              &gt; Analyzing nutrient density...<br />
              &gt; Recalibrating spice levels...<br />
              &gt; SUCCESS: Margin +4%
            </div>
            <button className="w-full py-2 bg-[#006c49] text-white font-bold text-xs uppercase border-2 border-[#0f172a] transition-all" style={{ boxShadow: "2px 2px 0px 0px #0f172a" }}>
              Open Full Terminal
            </button>
          </div>
        </div>

        {/* FOLDER GRID */}
        <div className="absolute bottom-12 left-10 grid grid-cols-4 gap-8">
          {[
            { label: "RECIPES_ROOT", alert: true },
            { label: "STAFF_LOGS", alert: false },
            { label: "ENERGY_MAP", alert: false },
            { label: "ARCHIVE", alert: false, dim: true },
          ].map((folder) => (
            <div key={folder.label} className="flex flex-col items-center gap-1 w-20 cursor-pointer hover:scale-105 transition-transform">
              <div className="relative">
                <svg className="w-16 h-16 text-[#FFD04D]" fill="currentColor" viewBox="0 0 24 24" style={{ opacity: folder.dim ? 0.6 : 1 }}>
                  <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
                {folder.alert && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#ba1a1a] text-[8px] flex items-center justify-center text-white rounded-full font-bold border-2 border-[#0f172a]">!</span>
                )}
              </div>
              <span className="font-bold text-[10px] font-['VT323'] tracking-tight" style={{ opacity: folder.dim ? 0.6 : 1 }}>{folder.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* TASKBAR */}
      <nav className="fixed bottom-0 left-0 w-full h-12 bg-white border-t-4 border-[#0f172a] z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4 h-full">
          <button className="bg-[#0f172a] text-white px-4 h-8 flex items-center gap-2 font-bold text-xs uppercase">
            <div className="w-3 h-3 bg-[#4edea3] rounded-sm" />
            System
          </button>
          <div className="h-6 w-px bg-[#0f172a] opacity-20" />
          <div className="flex gap-1">
            <div className="w-8 h-8 border-2 border-[#0f172a] bg-[#eaedff] hover:bg-[#006c49] transition-colors cursor-pointer flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" /></svg>
            </div>
            <div className="w-8 h-8 border-2 border-[#0f172a] bg-[#eaedff] hover:bg-[#006c49] transition-colors cursor-pointer flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-['VT323'] font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-[#006c49] inline-block mr-1 animate-pulse" />
            OS_v1.0.4 - ONLINE
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-xs font-bold font-['VT323']">14:42:01</span>
            <span className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">27 OCT 2023</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
