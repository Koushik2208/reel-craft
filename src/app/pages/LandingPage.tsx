import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Frame,
  Layers,
  Ratio,
  Film,
  Languages,
  AudioWaveform,
  Sparkles,
  ArrowRight,
  LockOpen,
  CloudOff,
  Rocket,
  Gift,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Layers,
    accent: "text-accent-pink",
    hoverBorder: "hover:border-accent-pink/40",
    title: "Multi-scene stitching",
    body: "Combine multiple clips and transitions effortlessly into a single cohesive narrative that flows perfectly.",
  },
  {
    icon: Ratio,
    accent: "text-accent-cyan",
    hoverBorder: "hover:border-accent-cyan/40",
    title: "10+ Cinematic Frames",
    body: "Choose from a library of professionally designed frames and aspect ratios tailored for every platform.",
  },
  {
    icon: Film,
    accent: "text-accent-pink",
    hoverBorder: "hover:border-accent-pink/40",
    title: "Classic Overlays",
    body: "Apply authentic CRT, VHS, and grain overlays to give your reels that timeless analog texture and grit.",
  },
  {
    icon: Languages,
    accent: "text-accent-cyan",
    hoverBorder: "hover:border-accent-cyan/40",
    title: "Multilingual Support",
    body: "Full support for English and Telugu typography with custom font engines designed for legibility.",
  },
  {
    icon: AudioWaveform,
    accent: "text-accent-pink",
    hoverBorder: "hover:border-accent-pink/40",
    title: "Dynamic Audio",
    body: "Synchronize your visuals with high-fidelity audio tracks. Smart waveform analysis for perfect timing.",
  },
  {
    icon: Sparkles,
    accent: "text-accent-cyan",
    hoverBorder: "hover:border-accent-cyan/40",
    title: "Prompt Templates",
    body: "Stuck? Use our curated library of templates to generate visuals and text that convert instantly.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Paste Text",
    body: "Drop your script or ideas into our intelligent browser editor.",
    ring: "border-accent-pink/40 text-accent-pink shadow-[0_0_32px_rgba(255,61,154,0.2)]",
  },
  {
    n: "2",
    title: "Pick a Look",
    body: "Select from cinematic styles, overlays, and frame options.",
    ring: "border-accent-cyan/40 text-accent-cyan shadow-[0_0_32px_rgba(0,212,255,0.18)]",
  },
  {
    n: "3",
    title: "Download MP4",
    body: "Render instantly in your browser and get your high-quality video.",
    ring: "border-accent-pink/60 text-accent-pink shadow-[0_0_32px_rgba(255,61,154,0.25)]",
  },
];

const TEMPLATES = [
  {
    name: "Minimalist",
    desc: "Clean, airy, and focused on typography.",
    img: "/minimal-celebrity.png",
    label: "BRAD PITT",
    sub: "MINIMAL · CLEAN",
    labelClass: "text-[#e8e6d8]",
    glow: "shadow-[0_0_32px_rgba(255,61,154,0.25)]",
  },
  {
    name: "Cinematic",
    desc: "Moody lighting and dramatic film textures.",
    img: "/cinematic-celebrity.png",
    label: "PAWAN KALYAN",
    sub: "CINEMATIC · DRAMATIC",
    labelClass: "text-white",
    glow: "shadow-[0_0_20px_rgba(0,212,255,0.2)]",
  },
  {
    name: "Image Card",
    desc: "Perfect for quotes and product features.",
    img: "/card-celebrity.png",
    label: "WILL SMITH",
    sub: "STORYTELLER · WARM",
    labelClass: "text-[#dfe6f5]",
    glow: "",
  },
];

const BADGES = [
  { icon: LockOpen, label: "No signup" },
  { icon: CloudOff, label: "No backend" },
  { icon: Rocket, label: "Runs in your browser" },
  { icon: Gift, label: "Free to use" },
];

/** Floating chips around the phone; depth drives mouse-parallax strength. */
const CHIPS = [
  { label: "CRT overlay", cls: "-left-24 top-16", depth: 30 },
  { label: "9:16 · 1080p", cls: "-right-20 top-40", depth: 46 },
  { label: "తెలుగు ✓", cls: "-left-16 bottom-24", depth: 60 },
];

export const LandingPage: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    const phone = phoneRef.current;
    if (!root || !hero || !phone) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ── scroll progress bar ── */
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
          },
        );

        /* ── hero intro ── */
        gsap.set(phone, {
          transformPerspective: 1100,
          rotationY: -14,
          rotationX: 6,
        });
        gsap.from(".hero-item", {
          y: 48,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        });
        gsap.from(phone, {
          y: 90,
          opacity: 0,
          rotationY: -40,
          duration: 1.3,
          delay: 0.25,
          ease: "power3.out",
        });
        gsap.from(".hero-chip", {
          scale: 0,
          opacity: 0,
          duration: 0.6,
          delay: 0.9,
          stagger: 0.12,
          ease: "back.out(2)",
        });

        /* ── hero scroll parallax ── */
        const heroScrub = {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        };
        gsap.to(".hero-copy", { yPercent: -18, ease: "none", scrollTrigger: heroScrub });
        gsap.to(".phone-wrap", { yPercent: 14, ease: "none", scrollTrigger: heroScrub });
        gsap.to(".orb-1", { yPercent: 55, ease: "none", scrollTrigger: heroScrub });
        gsap.to(".orb-2", { yPercent: 30, ease: "none", scrollTrigger: heroScrub });
        gsap.to(".orb-3", { yPercent: 80, ease: "none", scrollTrigger: heroScrub });

        /* ── mouse parallax: 3D tilt on phone, depth-shift on chips ── */
        const rotX = gsap.quickTo(phone, "rotationX", { duration: 0.7, ease: "power3.out" });
        const rotY = gsap.quickTo(phone, "rotationY", { duration: 0.7, ease: "power3.out" });
        const chipEls = gsap.utils.toArray<HTMLElement>(".hero-chip");
        const chipTo = chipEls.map((el) => ({
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
          depth: Number(el.dataset.depth ?? 30),
        }));
        const onMove = (e: MouseEvent) => {
          const r = hero.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          rotY(-14 + nx * 16);
          rotX(6 - ny * 12);
          chipTo.forEach((c) => {
            c.x(nx * c.depth);
            c.y(ny * c.depth);
          });
        };
        const onLeave = () => {
          rotY(-14);
          rotX(6);
          chipTo.forEach((c) => {
            c.x(0);
            c.y(0);
          });
        };
        hero.addEventListener("mousemove", onMove);
        hero.addEventListener("mouseleave", onLeave);

        /* ── generic fade-up reveals ── */
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 56,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        });

        /* ── feature cards: 3D flip-in stagger ── */
        gsap.fromTo(
          ".feature-card",
          {
            y: 70,
            autoAlpha: 0,
            rotationX: -30,
          },
          {
            y: 0,
            autoAlpha: 1,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".feature-grid",
              start: "top 80%",
              once: true,
              invalidateOnRefresh: true,
            },
          }
        );

        /* ── workflow: connector line draws, steps pop in ── */
        gsap.from(".step-line", {
          scaleX: 0,
          transformOrigin: "0% 50%",
          ease: "none",
          scrollTrigger: {
            trigger: ".step-row",
            start: "top 80%",
            end: "top 40%",
            scrub: true,
          },
        });
        gsap.from(".step-item", {
          y: 56,
          opacity: 0,
          duration: 0.7,
          stagger: 0.18,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".step-row",
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });

        /* ── template cards: 3D entrance + inner-image parallax ── */
        gsap.from(".tpl-card", {
          y: 90,
          opacity: 0,
          rotationY: -18,
          transformPerspective: 1000,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".tpl-grid",
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
        gsap.utils.toArray<HTMLElement>(".tpl-img").forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: "none",
              scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        return () => {
          hero.removeEventListener("mousemove", onMove);
          hero.removeEventListener("mouseleave", onLeave);
        };
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-hidden bg-base text-zinc-100">
      {/* scroll progress */}
      <div
        ref={progressRef}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-gradient-progress"
      />

      {/* ── Nav ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-base/80 shadow-[0_4px_40px_rgba(255,61,154,0.08)] backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Frame size={20} className="text-accent-pink" />
            <span className="font-display text-lg font-bold tracking-tight text-zinc-100">
              Reel Craft
            </span>
          </div>
          <div className="hidden items-center gap-12 text-sm md:flex">
            <a href="#features" className="font-semibold text-accent-pink transition hover:brightness-110">Features</a>
            <a href="#templates" className="text-muted transition hover:text-accent-pink">Templates</a>
            <a href="#workflow" className="text-muted transition hover:text-accent-pink">Showcase</a>
            <a href="#workflow" className="text-muted transition hover:text-accent-pink">Community</a>
          </div>
          <Link
            to="/editor"
            className="rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_32px_rgba(123,92,240,0.35)] transition hover:scale-105 hover:brightness-110 active:scale-95"
          >
            Start Creating
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center overflow-hidden pt-20"
      >
        {/* depth orbs (parallax layers) */}
        <div className="orb-1 pointer-events-none absolute -left-40 -top-24 h-[480px] w-[480px] rounded-full bg-accent-purple/20 blur-[120px]" />
        <div className="orb-2 pointer-events-none absolute right-[-120px] top-1/3 h-[420px] w-[420px] rounded-full bg-accent-pink/15 blur-[130px]" />
        <div className="orb-3 pointer-events-none absolute bottom-[-160px] left-1/3 h-[380px] w-[380px] rounded-full bg-accent-cyan/10 blur-[110px]" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-12 lg:px-8">
          {/* copy */}
          <div className="hero-copy space-y-6 lg:col-span-7">
            <div className="hero-item inline-flex items-center gap-2 rounded-full border border-accent-pink/25 bg-accent-pink/10 px-3.5 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-pink" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-pink">
                New Engine V2.0
              </span>
            </div>
            <h1 className="hero-item font-display text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[72px] md:leading-[80px] md:tracking-[-0.04em]">
              Create Reels in{" "}
              <span className="bg-gradient-brand bg-clip-text text-transparent">
                Minutes
              </span>
            </h1>
            <p className="hero-item max-w-lg text-lg leading-relaxed text-muted">
              Paste text. Pick a look. Download MP4. Everything happens right in your browser. No signup, no backend, pure creative freedom.
            </p>
            <div className="hero-item flex flex-wrap gap-6 pt-2">
              <Link
                to="/editor"
                className="group flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(123,92,240,0.4)] transition hover:scale-105 hover:brightness-110 active:scale-95"
              >
                Start Creating
              </Link>
              <a
                href="#workflow"
                className="rounded-full border border-accent-cyan/40 bg-surface/60 px-8 py-3.5 text-sm font-semibold text-zinc-100 shadow-[0_0_20px_rgba(0,212,255,0.15)] backdrop-blur transition hover:bg-accent-cyan/10"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* phone mockup with 3D tilt */}
          <div className="phone-wrap relative hidden justify-center lg:col-span-5 lg:flex">
            <div
              ref={phoneRef}
              className="relative w-[280px] aspect-[9/16] rounded-[3rem] border-[8px] border-rim bg-surface shadow-[0_0_60px_rgba(123,92,240,0.35),0_40px_80px_rgba(0,0,0,0.6)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* screen — background image matching HTML reference */}
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_KJS1j6tXrpIWoF6gEU4pARzwBeT1DB11_1gwLZx_KFv7ip9JWOmXYCSptfDksoBrwwGRXH8L2YctiyQbeh0sxXZfGmr-eFz0eYD77co-iYTKf5YyfkDN9dIjMKwtxY42sMgKUk7ozMpF-f3ng_Uo9TG9DCSfyXqQQdjI4igEkxTdYO0MR01Mt-EVHw3JXHaQSNDjQ20U0oF5uywynWbOw_umfggv7OWOFagSmdQrgviuGTYAgB2JaC53-vF6lOGJzJId8v6JR4cB')",
                  }}
                />
                {/* gradient overlay + player chrome */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-surface/80 to-transparent p-6">
                  <div className="mb-1.5 h-1 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-2/3 rounded-full bg-accent-cyan" />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/60">
                    <span>0:15</span>
                    <span>0:24</span>
                  </div>
                </div>
              </div>
              {/* notch */}
              <div className="absolute left-1/2 top-2.5 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/60" />
            </div>

            {/* floating depth chips */}
            {CHIPS.map((chip) => (
              <span
                key={chip.label}
                data-depth={chip.depth}
                className={`hero-chip absolute ${chip.cls} rounded-full border border-rim bg-surface/80 px-4 py-2 text-xs font-medium text-zinc-200 shadow-rim backdrop-blur`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section data-reveal className="border-y border-white/5 bg-[#0b0b10] py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-6 md:gap-10">
          {BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-rim/30 bg-surface/60 px-5 py-2.5"
            >
              <Icon size={14} className="text-accent-pink" />
              <span className="text-sm font-medium text-muted">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-28 lg:px-8">
        <div data-reveal className="mb-16 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-100 md:text-5xl">
            Production Power
          </h2>
          <p className="mt-3 text-lg text-muted">
            Advanced editing capabilities, simplified for everyone.
          </p>
        </div>
        <div className="feature-grid grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map(({ icon: Icon, accent, hoverBorder, title, body }) => (
            <div
              key={title}
              className={`feature-card group rounded-2xl border border-rim bg-[rgba(22,22,32,0.8)] p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 ${hoverBorder} hover:-translate-y-1`}
            >
              <Icon size={32} className={`${accent} mb-6`} />
              <h3 className="mb-3 font-display text-[22px] font-bold leading-tight text-zinc-100">{title}</h3>
              <p className="text-base leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Workflow ── */}
      <section id="workflow" className="relative overflow-hidden bg-[#0b0b10] py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent-purple/10 blur-[130px]" />
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <h2 data-reveal className="mb-20 text-center font-display text-4xl font-bold tracking-tight md:text-5xl">
            Simple Workflow
          </h2>
          <div className="step-row relative flex flex-col gap-14 md:flex-row md:gap-8">
            <div className="step-line absolute left-0 top-10 hidden h-px w-full bg-gradient-to-r from-transparent via-rim/40 to-transparent md:block" />
            {STEPS.map((s) => (
              <div key={s.n} className="step-item relative z-10 flex-1 space-y-4 text-center">
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border bg-surface font-display text-2xl font-bold ${s.ring}`}
                >
                  {s.n}
                </div>
                <h4 className="font-display text-xl font-bold text-zinc-100">{s.title}</h4>
                <p className="mx-auto max-w-xs text-base leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates ── */}
      <section id="templates" className="mx-auto max-w-6xl px-6 py-28 lg:px-8">
        <div data-reveal className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-100 md:text-5xl">
              Curated Templates
            </h2>
            <p className="mt-3 text-lg text-muted">
              Ready-to-use styles for the modern creator.
            </p>
          </div>
          <Link
            to="/editor"
            className="group flex items-center gap-2 text-sm font-semibold text-accent-pink transition hover:brightness-110"
          >
            View all templates
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="tpl-grid grid grid-cols-1 gap-8 md:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Link key={t.name} to="/editor" className="tpl-card group block">
              <div className={`relative mb-5 aspect-[9/16] overflow-hidden rounded-2xl border border-white/5 ${t.glow} transition-transform duration-300 group-hover:scale-[1.02]`}>
                {/* oversized inner layer so the scroll parallax never shows edges */}
                <img
                  src={t.img}
                  alt={t.label}
                  className="tpl-img absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover"
                />
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 5px)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent p-6">
                  <span className={`font-display text-xl font-extrabold ${t.labelClass}`}>
                    {t.label}
                  </span>
                  <span className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/50">
                    {t.sub}
                  </span>
                </div>
              </div>
              <h5 className="font-display text-lg font-bold text-zinc-100">{t.name}</h5>
              <p className="mt-1 text-sm text-muted">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer (acts as final CTA per reference design) ── */}
      <footer className="border-t border-white/5 bg-[#0b0b10] py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 md:flex-row lg:px-8">
          {/* Left: brand + tagline + copyright */}
          <div className="space-y-3 text-center md:text-left">
            <div className="font-display text-2xl font-bold tracking-tight text-zinc-100">
              Reel Craft
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Built for creators. Everything runs in your browser with privacy at its core.
            </p>
            <p className="text-xs text-muted/60">© 2024 Reel Craft. All rights reserved.</p>
          </div>

          {/* Right: CTA button + footer links */}
          <div className="flex flex-col items-center gap-6 md:items-end">
            <Link
              to="/editor"
              className="flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_32px_rgba(123,92,240,0.35)] transition hover:scale-105 hover:brightness-110 active:scale-95"
            >
              Start Creating
              <ArrowRight size={16} />
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted">
              <a href="#features" className="transition hover:text-accent-pink">Features</a>
              <a href="#workflow" className="transition hover:text-accent-pink">Tutorials</a>
              <a href="#templates" className="transition hover:text-accent-pink">Pricing</a>
              <a href="#workflow" className="transition hover:text-accent-pink">Community</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
