"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";

export function Hero() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const card = document.querySelector(".glass-card") as HTMLElement | null;
    if (!card) return;

    const onMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPos = (clientX / innerWidth - 0.5) * 15;
      const yPos = (clientY / innerHeight - 0.5) * 15;
      card.style.transform = `perspective(1000px) rotateY(${xPos}deg) rotateX(${-yPos}deg)`;
    };

    const onLeave = () => {
      card.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
    };

    document.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      window.location.href = "/api/auth/signin/google";
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-xl">
        <div className="flex justify-between items-center w-full px-12 py-4" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="text-2xl font-['Sora'] font-bold text-on-surface tracking-tighter">
            Perfect Your Penalty
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 text-sm font-['Geist_Mono'] font-medium tracking-wider">Features</a>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 text-sm font-['Geist_Mono'] font-medium tracking-wider">Science</a>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 text-sm font-['Geist_Mono'] font-medium tracking-wider">Pro Coaching</a>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/demo")}
              className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 px-4 py-2 text-sm font-['Geist_Mono'] font-medium tracking-wider"
            >
              Login
            </button>
            <button
              onClick={handleSignIn}
              className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg text-sm font-['Geist_Mono'] font-medium tracking-wider scale-95 active:scale-90 transition-transform shadow-lg"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden px-12">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtbu3biv40Tg3SQr6trj9kl0mdXiywcApUUYnHyg0lsrSP4Mws3gakBgNg7QV3jMIenrwN9_mlCZ3VqnYJoKSr2JUfgXuLuONa5i2-rznmH20aoqmQ8rdKigIJaXZpZPQQbydSBJT7NbNFoS2cxRjN8pU7KF08UcegRdrWsjSDIdGlojfdCX2hgncDaC1LFlz2rRiftgO0F5_nkvaM2ciiXBM1HEm_WwnMVv8MbRwaui8sf_PrY3MfYz0oNbSvkzhy9aaMmW5FwJ2r')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/60 to-surface" />
          </div>

          <div className="relative z-10 w-full text-center" style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div className="flex justify-center mb-8">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300"
                style={{ background: "linear-gradient(135deg, #6e06d0 0%, #b16bff 100%)" }}
              >
                <span className="font-['Sora'] font-bold text-white tracking-tighter text-2xl">IQ</span>
              </div>
            </div>

            <h1 className="font-['Sora'] font-extrabold text-on-surface mb-6 mx-auto leading-tight tracking-tighter" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}>
              Master the Spot. <span className="text-primary">Dominate the Keeper.</span>
            </h1>

            <p className="text-lg text-on-surface-variant mb-12 mx-auto opacity-90 max-w-2xl" style={{ lineHeight: "1.6" }}>
              Professional-grade biomechanical analysis for every kick. Master the technique that beats world-class keepers with data-driven precision.
            </p>

            <div className="flex flex-col items-center gap-6 mb-20">
              <button
                onClick={handleSignIn}
                className="primary-btn-glow bg-primary-container text-on-primary-container font-bold px-10 py-5 rounded-full flex items-center gap-3 scale-95 active:scale-90 transition-all duration-300 hover:brightness-110"
              >
                <img
                  alt="Google"
                  className="w-6 h-6"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ0igkEHMnJlJnmFjDf6TV6c8GdaqrpTgJ8u63ws-KGNVhfCHZDKljh8QP1qKUZRswunkPPGkOZ4Y-zEUqwGlWn9bY6EWbH-UnwCDYj7NUmhSmu0R47IrhXcYY1NSONCXngv5bptyNXW9x2g5agOkkSS26-icH6Ia9DuVx0tCmT8yaB6SOGRbKcMDkmRgbZ1JdXrmALKFEsIvNJBfttAWrSdG0iP7SsEe4q7dr2gfHtpqqmETLNY89lnyJImhFAPYudP4aChR_ItT3"
                />
                <span className="text-sm font-['Geist_Mono'] font-medium uppercase tracking-wider">Sign in with Google</span>
              </button>
              <p className="text-xs font-['Geist_Mono'] font-medium text-on-surface-variant/60 tracking-widest">
                No credit card required for initial analysis.
              </p>
            </div>

            <div className="relative mx-auto" style={{ maxWidth: "1024px" }}>
              <div className="glass-card aspect-video rounded-3xl overflow-hidden group cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBlrNfNvFwAIB_PIdKMJO83OMFGa-FcnNfUI-LDHl2vtjeCUQnIwQ2c_c7-2DlwfNDKBzCw7apIr5cuqvV69I7v76Fqr_e7fsPYqqynvH8k3jIKOYQmqfc5b8ORMTL7i_RL1UBfHxTI77PUX27k3qfjnQjE4o3QiUScf9AW5FLL6QRy9ITb9butbFxd41DS6XwUBbrRH3EOi64Mduf1dl-NkW951aVQqEmz0pESDIhedcARA3IeGcxjBC_CP0tUFBNOW4VHH2_l5ago')" }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-surface/20 group-hover:bg-surface/10 transition-colors">
                  <div className="w-24 h-24 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-primary text-5xl" style={{ transform: "translateX(4px)", fontVariationSettings: "'FILL' 1, 'wght' 400" }}>play_arrow</span>
                  </div>
                </div>
                <div className="absolute top-6 left-6 flex gap-3">
                  <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-xs font-['Geist_Mono'] font-medium text-primary uppercase tracking-widest">Biometrics Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-12" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="performance-grid">
            <div className="col-span-12 md:col-span-8 glass-card p-10 rounded-3xl relative overflow-hidden" style={{ height: "400px" }}>
              <div className="relative z-10">
                <span className="text-primary text-sm font-['Geist_Mono'] font-medium mb-2 block uppercase tracking-widest">Precision Matrix</span>
                <h2 className="font-['Sora'] font-bold text-on-surface mb-4 tracking-tight" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>Real-time Biomechanics</h2>
                <p className="text-on-surface-variant" style={{ maxWidth: "28rem" }}>Our AI tracks 47 key skeletal markers during your run-up and strike to find millisecond improvements.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-2/3 h-full opacity-50">
                <div
                  className="w-full h-full bg-contain bg-right-bottom bg-no-repeat"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_bO4-V7raiSAEpMEVe78hDpgcRFTrKk97nZo5WQKvZrolb8uPK9CSSfzEAFDcJaGs4GCiIk6ZkXKEMM_xA8JJKn3aifB-lZi-jYv5eCD1B7fpskkSSXSoTgu3LGAg95EI2CjIk-kkuUh65M8llYjtcYNIPRarIMpsHlCnrSxE8vTkqh85rBsrxtbDk7b24Uz0mvFfKhM3ZsxUpy5RsvnwH-RsnQLXUEMi7Vnkp1Wfemi9d7JpPgLGeP7as6h2ff-QCWzKL-qwF_8X')" }}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 glass-card p-10 rounded-3xl flex flex-col justify-between">
              <div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ background: "linear-gradient(135deg, #6e06d0 0%, #b16bff 100%)" }}
                >
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>psychology</span>
                </div>
                <h3 className="font-['Sora'] font-semibold text-on-surface mb-2 text-2xl">IQ Coaching</h3>
                <p className="text-on-surface-variant text-base">Get instant voice and visual cues to adjust your plant foot and hip angle.</p>
              </div>
              <div className="mt-8">
                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "88%" }} />
                  </div>
                  <span className="text-xs font-['Geist_Mono'] font-medium text-primary tracking-widest">88% Accuracy</span>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 glass-card p-8 rounded-3xl">
              <span className="material-symbols-outlined text-primary mb-4" style={{ fontSize: "2rem" }}>leaderboard</span>
              <h3 className="font-['Sora'] font-semibold text-on-surface mb-2 text-2xl">Global Leaderboard</h3>
              <p className="text-on-surface-variant text-base mb-6">See where you rank against academy players and pros worldwide.</p>
              <button className="text-primary text-sm font-['Geist_Mono'] font-medium flex items-center gap-2 group">
                VIEW RANKINGS <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: "1rem" }}>arrow_forward</span>
              </button>
            </div>

            <div className="col-span-12 md:col-span-8 glass-card p-8 rounded-3xl flex items-center gap-10 overflow-hidden group">
              <div className="flex-1">
                <h3 className="font-['Sora'] font-semibold text-on-surface mb-2 text-2xl">Scientific Method</h3>
                <p className="text-on-surface-variant text-base">Developed in partnership with elite sport science labs in Europe to ensure your technique is built on proven physics.</p>
              </div>
              <div className="hidden sm:block w-1/3">
                <div
                  className="w-48 h-48 bg-cover bg-center rounded-2xl group-hover:rotate-6 transition-transform"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBp_DCST3W9b78D6wE7PZwBB_PW1hpN33u1sgXRJBlGquygz6zzUYfOl73Em_R6JmH1Bj2vTX0V_CUauU_lqEHAeIU6mR8PXiO6VksMFpa9E5z2yeUVXL4t2BKLih1fehyzdl6dVZIRH2VUmz1pUYuyVAE47NLyl1yeMrsooPf-c7LSVkEqknvadVW7qy3wzf4yC6AJUg2pcZsXta3MiSko4IDcGuPhn0kJ-T8mnQ4oLVDhrM8_sgOdXybUR-4rXjfHEkVXHFp65Zyl')" }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 px-12 text-center bg-surface-container-low relative">
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div
              className="w-full h-full opacity-20"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDbh_3S_9pHRA6dl9WLwxZCPq2AOAHt-RO4n8nndmUyXREufWKgEWV-Ib65xFG7HtTKTjbrCSXd1Gzaa8ixMOOwXq7t5rZy2x1t5z6P-vb5y8797sbU-N9yc_acwE_ZtcwdxOlaQNb5F6XVjA4gd8phg3z1mxEYICLPAnwHFQfC_fWWjDfOBndQeP6FQdRRA4lqjyKZjgOj8qkDaTk0JKDcWk3oiy1_brLtIgSk0arcCmFRFKQzxTy2FGzdVmXCp3jCgS-nP6HXpbfz')" }}
            />
          </div>
          <div className="relative z-10 mx-auto" style={{ maxWidth: "48rem" }}>
            <h2 className="font-['Sora'] font-extrabold text-on-surface mb-8 tracking-tighter" style={{ fontSize: "clamp(2rem, 4vw, 4rem)", letterSpacing: "-0.02em", lineHeight: "1.1" }}>Ready to dominate the spot?</h2>
            <p className="text-on-surface-variant text-lg mb-12" style={{ lineHeight: "1.6" }}>Join 15,000+ athletes who have improved their conversion rate by an average of 22% in just 30 days.</p>
            <button
              onClick={handleSignIn}
              className="primary-btn-glow bg-primary text-on-primary font-bold px-12 py-5 rounded-full font-['Sora'] font-semibold scale-95 active:scale-90 transition-transform hover:brightness-110"
              style={{ fontSize: "clamp(1.125rem, 2vw, 1.5rem)" }}
            >
              Get Started Free
            </button>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-12" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="space-y-6">
            <div className="font-['Sora'] font-bold text-on-surface-variant text-xl">Perfect Your Penalty</div>
            <p className="text-on-surface-variant text-base opacity-60">Elevating human performance through real-time biomechanical intelligence and professional coaching.</p>
          </div>
          <div>
            <h4 className="text-primary text-sm font-['Geist_Mono'] font-medium uppercase mb-6 tracking-widest">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline text-xs font-['Geist_Mono'] font-medium tracking-widest">Science of the Kick</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline text-xs font-['Geist_Mono'] font-medium tracking-widest">Case Studies</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline text-xs font-['Geist_Mono'] font-medium tracking-widest">Global Rankings</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-primary text-sm font-['Geist_Mono'] font-medium uppercase mb-6 tracking-widest">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline text-xs font-['Geist_Mono'] font-medium tracking-widest">Privacy Policy</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline text-xs font-['Geist_Mono'] font-medium tracking-widest">Terms of Service</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline text-xs font-['Geist_Mono'] font-medium tracking-widest">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-primary text-sm font-['Geist_Mono'] font-medium uppercase mb-6 tracking-widest">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "1.25rem" }}>share</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "1.25rem" }}>public</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 px-12 pt-8 border-t border-white/5" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p className="text-on-surface-variant text-xs font-['Geist_Mono'] font-medium opacity-40 text-center tracking-widest">© 2024 Perfect Your Penalty. Engineered for Elite Performance.</p>
        </div>
      </footer>
    </>
  );
}
