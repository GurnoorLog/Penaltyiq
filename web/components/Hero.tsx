"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export function Hero() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPos = clientX / innerWidth - 0.5;
      const yPos = clientY / innerHeight - 0.5;

      const card = document.querySelector(".glass-morphism.aspect-video") as HTMLElement | null;
      if (card) {
        card.style.transform = `perspective(1000px) rotateY(${xPos * 4}deg) rotateX(${-yPos * 4}deg) translateY(${-yPos * 8}px)`;
      }

      const bg = document.querySelector(".fixed .bg-cover") as HTMLElement | null;
      if (bg) {
        bg.style.transform = `scale(1.05) translate(${xPos * -15}px, ${yPos * -15}px)`;
      }
    };

    document.addEventListener("mousemove", onMove);

    const videoCard = document.querySelector(".glass-morphism.aspect-video") as HTMLElement | null;
    const onLeave = () => {
      if (videoCard) {
        videoCard.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)";
      }
    };
    videoCard?.addEventListener("mouseleave", onLeave);

    return () => {
      document.removeEventListener("mousemove", onMove);
      videoCard?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const startGoogleSignIn = () => signIn("google", { callbackUrl: "/onboarding" });

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDgs8GvkPg4ffGrtQc7bLKswjEkTrYehc3cIBxmlpTMqbqLOT3y43R-czDSgaAY6O80kUqWwahhgp58Tv2jNV8j8e_XyLL1CtZgwUq6mjWC03rYUIwWg89u4V4PdtDBvSvKhedPeo-aHTb8ncityZPnX_J2mrqSWieHFQHgQ3wbcBidLV5xZB8fCgrfbT6X2AZ0EKoEiEd1_3_LljdjFnVC6EsWzxdpLRr_EeHjntSahg4QcojSfUibdApn9oRa7RO1ZilxT2zmq0F0')" }}
        />
        <div className="absolute inset-0 page-bg-overlay" />
      </div>

      <header className="sticky top-0 z-50 bg-surface/20 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="flex justify-between items-center w-full px-12 py-5" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="text-2xl font-['Sora'] font-bold tracking-tighter text-on-surface neon-glow">
            Perfect Your Penalty
          </div>
          <nav className="hidden md:flex items-center space-x-10">
            <a href="#" className="text-on-surface hover:text-gold transition-colors duration-300 text-sm font-['Geist_Mono'] font-medium tracking-wider">Features</a>
            <a href="#" className="text-on-surface hover:text-gold transition-colors duration-300 text-sm font-['Geist_Mono'] font-medium tracking-wider">Science</a>
            <a href="#" className="text-on-surface hover:text-gold transition-colors duration-300 text-sm font-['Geist_Mono'] font-medium tracking-wider">Pro Coaching</a>
          </nav>
          <div className="flex items-center space-x-6">
            <button
              onClick={startGoogleSignIn}
              className="text-on-surface hover:text-gold transition-colors duration-200 px-4 py-2 text-sm font-['Geist_Mono'] font-medium"
            >
              Login
            </button>
            <button
              onClick={startGoogleSignIn}
              className="bg-gold text-on-primary-fixed font-bold px-8 py-3 rounded-xl text-sm font-['Geist_Mono'] font-medium hover:shadow-2xl hover:shadow-gold/30 active:scale-95 transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-24 pb-20 px-12 text-center">
          <div className="relative z-10 w-full" style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div className="flex justify-center mb-10">
              <div className="iq-badge-glass w-20 h-20 rounded-2xl flex items-center justify-center hover:rotate-6 transition-transform duration-500 shadow-xl border border-white/30">
                <span className="font-['Sora'] font-bold text-white tracking-tighter text-2xl drop-shadow-md">IQ</span>
              </div>
            </div>

            <h1 className="font-['Sora'] font-extrabold text-on-surface mb-8 mx-auto leading-[1.1] tracking-tight drop-shadow-2xl" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", maxWidth: "64rem" }}>
              Master the Spot.<br />
              <span className="text-gradient-primary neon-glow">Dominate the Keeper.</span>
            </h1>

            <p className="text-lg text-white mb-14 mx-auto leading-relaxed tracking-wide font-medium drop-shadow-md" style={{ maxWidth: "36rem" }}>
              Professional-grade biomechanical analysis for every kick. Master the technique that beats world-class keepers with data-driven precision in a starry environment.
            </p>

            <div className="flex flex-col items-center gap-8 mb-24">
              <button
                onClick={startGoogleSignIn}
                className="glass-morphism bg-white/10 hover:bg-white/20 text-on-surface font-bold px-12 py-6 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:translate-y-[-2px] border border-gold/30"
              >
                <img
                  alt="Google"
                  className="w-6 h-6"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ0igkEHMnJlJnmFjDf6TV6c8GdaqrpTgJ8u63ws-KGNVhfCHZDKljh8QP1qKUZRswunkPPGkOZ4Y-zEUqwGlWn9bY6EWbH-UnwCDYj7NUmhSmu0R47IrhXcYY1NSONCXngv5bptyNXW9x2g5agOkkSS26-icH6Ia9DuVx0tCmT8yaB6SOGRbKcMDkmRgbZ1JdXrmALKFEsIvNJBfttAWrSdG0iP7SsEe4q7dr2gfHtpqqmETLNY89lnyJImhFAPYudP4aChR_ItT3"
                />
                <span className="text-sm font-['Geist_Mono'] font-medium uppercase" style={{ letterSpacing: "0.15em" }}>Sign in with Google</span>
              </button>
              <p className="text-xs font-['Geist_Mono'] font-bold text-gold tracking-widest drop-shadow-sm">NO CREDIT CARD REQUIRED FOR INITIAL ANALYSIS</p>
            </div>

            <div className="relative mx-auto video-container-glow" style={{ maxWidth: "1024px" }}>
              <div className="glass-morphism aspect-video rounded-[32px] overflow-hidden group cursor-pointer border border-white/20">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-1000 opacity-90"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBlrNfNvFwAIB_PIdKMJO83OMFGa-FcnNfUI-LDHl2vtjeCUQnIwQ2c_c7-2DlwfNDKBzCw7apIr5cuqvV69I7v76Fqr_e7fsPYqqynvH8k3jIKOYQmqfc5b8ORMTL7i_RL1UBfHxTI77PUX27k3qfjnQjE4o3QiUScf9AW5FLL6QRy9ITb9butbFxd41DS6XwUBbrRH3EOi64Mduf1dl-NkW951aVQqEmz0pESDIhedcARA3IeGcxjBC_CP0tUFBNOW4VHH2_l5ago')" }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/5 transition-colors">
                  <div className="w-24 h-24 rounded-full bg-gold/30 backdrop-blur-xl border border-gold/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-gold/40 transition-all duration-500 shadow-2xl">
                    <span className="material-symbols-outlined text-gold text-5xl translate-x-1" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                </div>
                <div className="absolute top-8 left-8 flex gap-4">
                  <div className="bg-gold/80 backdrop-blur-xl px-5 py-2.5 rounded-xl border border-white/20 shadow-lg">
                    <span className="text-xs font-['Geist_Mono'] font-bold text-on-primary-fixed uppercase tracking-[0.2em]">Biometrics Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 px-12" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="performance-grid">
            <div className="col-span-12 md:col-span-8 glass-morphism p-12 rounded-[32px] relative overflow-hidden h-[450px] group border border-white/20 hover:bg-white/10 transition-colors">
              <div className="relative z-10">
                <span className="text-gold text-sm font-['Geist_Mono'] font-bold mb-4 block uppercase tracking-[0.25em]">Precision Matrix</span>
                <h2 className="font-['Sora'] font-bold text-on-surface mb-6 leading-tight neon-glow" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>Real-time <br />Biomechanics</h2>
                <p className="text-on-surface-variant text-lg leading-relaxed font-medium" style={{ maxWidth: "28rem" }}>Our AI tracks 47 key skeletal markers during your strike to find millisecond improvements that define elite performance.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-3/4 h-full opacity-40 transition-opacity duration-500 group-hover:opacity-60 pointer-events-none">
                <div
                  className="w-full h-full bg-contain bg-right-bottom bg-no-repeat"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_bO4-V7raiSAEpMEVe78hDpgcRFTrKk97nZo5WQKvZrolb8uPK9CSSfzEAFDcJaGs4GCiIk6ZkXKEMM_xA8JJKn3aifB-lZi-jYv5eCD1B7fpskkSSXSoTgu3LGAg95EI2CjIk-kkuUh65M8llYjtcYNIPRarIMpsHlCnrSxE8vTkqh85rBsrxtbDk7b24Uz0mvFfKhM3ZsxUpy5RsvnwH-RsnQLXUEMi7Vnkp1Wfemi9d7JpPgLGeP7as6h2ff-QCWzKL-qwF_8X')" }}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 glass-morphism p-12 rounded-[32px] flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 group border border-white/20">
              <div>
                <div className="iq-badge-glass w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/10 group-hover:rotate-6 transition-transform duration-500">
                  <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <h3 className="font-['Sora'] font-semibold text-gold mb-4 text-2xl">IQ Coaching</h3>
                <p className="text-on-surface-variant text-base leading-relaxed font-medium">Get instant voice and visual cues to adjust your plant foot and hip angle in real-time.</p>
              </div>
              <div className="mt-12">
                <div className="flex items-center gap-4">
                  <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold w-[88%]" style={{ boxShadow: "0 0 12px rgba(255,215,0,0.5)" }} />
                  </div>
                  <span className="text-xs font-['Geist_Mono'] font-bold text-gold tracking-widest">88% Accuracy</span>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 glass-morphism p-10 rounded-[32px] hover:translate-y-[-4px] transition-all duration-300 group border border-white/20">
              <span className="material-symbols-outlined text-gold mb-6" style={{ fontVariationSettings: "'FILL' 1", fontSize: "2.5rem" }}>leaderboard</span>
              <h3 className="font-['Sora'] font-semibold text-on-surface mb-4 text-2xl">Global Leaderboard</h3>
              <p className="text-on-surface-variant text-base mb-8 leading-relaxed font-medium">See where you rank against academy players and pros worldwide in our global performance database.</p>
              <button className="text-gold text-sm font-['Geist_Mono'] font-bold flex items-center gap-3 tracking-widest">
                VIEW RANKINGS <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform" style={{ fontSize: "1rem" }}>arrow_forward</span>
              </button>
            </div>

            <div className="col-span-12 md:col-span-8 glass-morphism p-10 rounded-[32px] flex items-center gap-12 overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 border border-white/20">
              <div className="flex-1">
                <h3 className="font-['Sora'] font-semibold text-gold mb-4 text-2xl">Scientific Method</h3>
                <p className="text-on-surface-variant text-base leading-relaxed font-medium">Developed in partnership with elite sport science labs in Europe to ensure your technique is built on proven physics and aerodynamic modeling.</p>
              </div>
              <div className="hidden sm:block w-1/3">
                <div
                  className="w-56 h-56 bg-cover bg-center rounded-3xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 shadow-2xl grayscale group-hover:grayscale-0 border-2 border-white/10"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBp_DCST3W9b78D6wE7PZwBB_PW1hpN33u1sgXRJBlGquygz6zzUYfOl73Em_R6JmH1Bj2vTX0V_CUauU_lqEHAeIU6mR8PXiO6VksMFpa9E5z2yeUVXL4t2BKLih1fehyzdl6dVZIRH2VUmz1pUYuyVAE47NLyl1yeMrsooPf-c7LSVkEqknvadVW7qy3wzf4yC6AJUg2pcZsXta3MiSko4IDcGuPhn0kJ-T8mnQ4oLVDhrM8_sgOdXybUR-4rXjfHEkVXHFp65Zyl')" }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-40 px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-[0.05]">
            <div
              className="w-full h-full"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDbh_3S_9pHRA6dl9WLwxZCPq2AOAHt-RO4n8nndmUyXREufWKgEWV-Ib65xFG7HtTKTjbrCSXd1Gzaa8ixMOOwXq7t5rZy2x1t5z6P-vb5y8797sbU-N9yc_acwE_ZtcwdxOlaQNb5F6XVjA4gd8phg3z1mxEYICLPAnwHFQfC_fWWjDfOBndQeP6FQdRRA4lqjyKZjgOj8qkDaTk0JKDcWk3oiy1_brLtIgSk0arcCmFRFKQzxTy2FGzdVmXCp3jCgS-nP6HXpbfz')", backgroundSize: "400px" }}
            />
          </div>
          <div className="relative z-10 mx-auto" style={{ maxWidth: "56rem" }}>
            <h2 className="font-['Sora'] font-extrabold text-on-surface mb-10 tracking-tight neon-glow" style={{ fontSize: "clamp(2rem, 4vw, 4rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}>Ready to dominate the spot?</h2>
            <p className="text-white text-lg mb-16 mx-auto font-medium leading-relaxed drop-shadow-md" style={{ maxWidth: "36rem" }}>Join 15,000+ athletes who have improved their conversion rate by an average of 22% in just 30 days of deliberate practice.</p>
            <button
              onClick={startGoogleSignIn}
              className="bg-gold text-on-primary-fixed font-extrabold px-16 py-7 rounded-2xl font-['Sora'] font-semibold scale-95 hover:scale-100 active:scale-95 transition-all duration-500 shadow-2xl" style={{ fontSize: "clamp(1.125rem, 2vw, 1.5rem)", boxShadow: "0 0 50px rgba(255,215,0,0.4)" }}
            >
              Get Started Free
            </button>
          </div>
        </section>
      </main>

      <footer className="py-20 bg-black/60 backdrop-blur-3xl border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 px-12" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="space-y-8">
            <div className="font-['Sora'] font-bold text-on-surface tracking-tighter neon-glow text-xl">Perfect Your Penalty</div>
            <p className="text-on-surface-variant text-base opacity-80 leading-relaxed">Elevating human performance through real-time biomechanical intelligence and professional coaching for elite athletes.</p>
          </div>
          <div>
            <h4 className="text-gold text-sm font-['Geist_Mono'] font-bold uppercase mb-8 tracking-[0.3em]">Resources</h4>
            <ul className="space-y-5">
              <li><a href="#" className="text-on-surface-variant hover:text-gold transition-colors duration-200 text-xs font-['Geist_Mono'] font-medium tracking-widest">Science of the Kick</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-gold transition-colors duration-200 text-xs font-['Geist_Mono'] font-medium tracking-widest">Case Studies</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-gold transition-colors duration-200 text-xs font-['Geist_Mono'] font-medium tracking-widest">Global Rankings</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold text-sm font-['Geist_Mono'] font-bold uppercase mb-8 tracking-[0.3em]">Company</h4>
            <ul className="space-y-5">
              <li><a href="#" className="text-on-surface-variant hover:text-gold transition-colors duration-200 text-xs font-['Geist_Mono'] font-medium tracking-widest">Privacy Policy</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-gold transition-colors duration-200 text-xs font-['Geist_Mono'] font-medium tracking-widest">Terms of Service</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-gold transition-colors duration-200 text-xs font-['Geist_Mono'] font-medium tracking-widest">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold text-sm font-['Geist_Mono'] font-bold uppercase mb-8 tracking-[0.3em]">Connect</h4>
            <div className="flex gap-6">
              <a href="#" className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-gold/10 hover:border-gold/50 transition-all hover:scale-110">
                <span className="material-symbols-outlined text-on-surface-variant text-2xl">share</span>
              </a>
              <a href="#" className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-gold/10 hover:border-gold/50 transition-all hover:scale-110">
                <span className="material-symbols-outlined text-on-surface-variant text-2xl">public</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-20 px-12 pt-10 border-t border-white/10" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p className="text-on-surface-variant text-xs font-['Geist_Mono'] font-medium opacity-60 text-center tracking-[0.2em] uppercase">© 2024 Perfect Your Penalty. Engineered for Elite Performance.</p>
        </div>
      </footer>
    </>
  );
}
