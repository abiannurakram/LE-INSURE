"use client";

/**
 * Le-Insure · page.tsx
 * "Digital Protection for Your Rights & Legacy"
 *
 * The whole site is a single page with several "views" that are shown or hidden
 * by hash routing (#about, #pricing, #login, #dashboard, ...).
 *
 * How it works
 *   1. React renders the static markup below (one component per view/section).
 *   2. After the first render, bootLeInsure() loads the vendor libraries
 *      (three.js, GSAP, ScrollTrigger, Lenis) in order, then /le-insure/app.js,
 *      which adds every interaction: 3D globe, routing, modals, quiz, register
 *      flow, dashboard, chatbot and the EN/ID switch.
 *   3. React never re-renders this tree, so app.js can safely update the DOM.
 *
 * Role boundaries (AGENTS.md): Le-Insure is a technology platform. Policies and
 * claims come from OJK-licensed insurers, legal advice from partner advocates,
 * wills and deeds from partner notaries. All names and amounts are sample data.
 */

import { useEffect, type CSSProperties } from "react";

/* ------------------------------------------------------------------ */
/* Script loader                                                       */
/* ------------------------------------------------------------------ */

/** Third-party libraries, loaded in this exact order. */
const VENDOR_SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
  "https://unpkg.com/lenis@1.1.13/dist/lenis.min.js",
];

/** Our own behaviour script (public/le-insure/app.js). */
const APP_SCRIPT = "/le-insure/app.js";

/** Adds one <script> tag and resolves when it has loaded (or failed). */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) return resolve();
    const tag = document.createElement("script");
    tag.src = src;
    tag.async = false;
    tag.onload = () => resolve();
    // A missing CDN library is not fatal: app.js has fallbacks (e.g. SVG globe).
    tag.onerror = () => {
      console.warn("[Le-Insure] could not load", src);
      resolve();
    };
    document.body.appendChild(tag);
  });
}

let booting: Promise<void> | null = null;

/** Loads the vendor libraries one by one, then the app script. Runs once. */
function bootLeInsure(): Promise<void> {
  if (!booting) {
    booting = (async () => {
      for (const src of VENDOR_SCRIPTS) await loadScript(src);
      await loadScript(APP_SCRIPT);
    })();
  }
  return booting;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  useEffect(() => {
    bootLeInsure();
  }, []);

  return (
    <>
      <IconSprite />
      <SiteHeader />
      <MobileMenu />
      <GlobeLayer />
      <HomeView />
      <AboutView />
      <CoverageView />
      <ClaimsView />
      <PricingView />
      <HelpCenterView />
      <SupportView />
      <ChatAssistant />
      <HelpCenterButton />
      <ChatButton />
      <LoginView />
      <RegisterView />
      <DashboardView />
      <Toast />
      <SiteFooter />
      <ModalOverlay />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sections (static markup; app.js wires up the behaviour)             */
/* ------------------------------------------------------------------ */

/** Hidden SVG sprite.
 *  - Official logo artwork (Brand Guideline v1.0): #lg-primary (symbol + wordmark),
 *    #lg-bar (Symbol Bar), #lg-mark (Compact Mark), #lg-mark-round (mark without the square).
 *    Colours come from CSS variables (--logo-block, --logo-disc, --logo-globe, --logo-le, --logo-insure)
 *    so the same artwork switches between Primary and Reverse.
 *  - UI icons: #i-shield, #i-doc, ... used as <use href="#i-..." />. */
function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="lg-primary" viewBox="205 140 1050 750">
          <rect x="220" y="190" width="1012" height="335" style={{ fill: "var(--logo-block,#7A2433)" }} />
          <circle cx="466" cy="396" r="248" style={{ fill: "var(--logo-disc,#F7EFE6)" }} />
          <g style={{ fill: "none", stroke: "var(--logo-globe,#C9B58A)", strokeWidth: "5" }}>
            <circle cx="466" cy="396" r="245.5" />
            <ellipse cx="466" cy="396" rx="240.6" ry="109.1" />
            <ellipse cx="466" cy="396" rx="240.6" ry="188.5" />
            <ellipse cx="466" cy="396" rx="163.7" ry="244.3" />
            <line x1="466" y1="148" x2="466" y2="644" />
            <line x1="218" y1="396" x2="714" y2="396" />
          </g>
          <g style={{ fill: "var(--logo-le,#2B2320)" }}>
            <rect x="240" y="210" width="74.3" height="315" />
            <rect x="240" y="463.5" width="142.4" height="61.5" />
            <rect x="391.6" y="210" width="71.7" height="315" />
            <rect x="391.6" y="210" width="152.1" height="58.9" />
            <rect x="391.6" y="328.8" width="140.3" height="58.9" />
            <rect x="391.6" y="463.5" width="158.3" height="61.5" />
            <rect x="548" y="388" width="684" height="67" />
          </g>
          <path d="M228 875V540H300V875Z M322 875V540H402.9L439.1 700.5V540H515V875H438.2L398.8 707.5V875Z M619 875Q570.1 875 548.6 852.6Q527 830.1 527 781.2V749H597.5V790.1Q597.5 801.5 601.2 808Q605 814.4 614.3 814.4Q624 814.4 627.8 809.2Q631.5 804 631.5 792Q631.5 776.9 628.3 766.7Q625 756.5 617 747.2Q609 738 594.9 725.6L562.9 697.6Q527 666.4 527 626.2Q527 584.1 548.2 562.1Q569.3 540 609.4 540Q658.5 540 679 564.1Q699.6 588.2 699.6 637.4H627.1V614.8Q627.1 608 622.9 604.3Q618.8 600.6 611.7 600.6Q603.2 600.6 599.2 605Q595.3 609.4 595.3 616.3Q595.3 623.2 599.3 631.2Q603.4 639.3 615.3 649.7L656.4 686.2Q668.8 697 679.1 709.1Q689.4 721.1 695.7 737.1Q702 753.1 702 776.1Q702 822.5 683.5 848.7Q664.9 875 619 875Z M803.5 875Q760.6 875 740.3 851.7Q720 828.4 720 783.1V540H786.7V780.5Q786.7 788.8 787.7 796.4Q788.7 804.1 792.2 809Q795.7 813.9 803.5 813.9Q811.5 813.9 815 809.1Q818.5 804.3 819.4 796.5Q820.3 788.8 820.3 780.5V540H887V783.1Q887 828.4 866.7 851.7Q846.4 875 803.5 875Z M905 875V540H1013.6Q1040.8 540 1054.7 551.7Q1068.5 563.4 1073.3 584.4Q1078 605.5 1078 633.8Q1078 661.2 1070.7 677.6Q1063.3 694 1043 700.3Q1059.7 703.5 1066.4 716Q1073.2 728.4 1073.2 748.2V875H1003.4V743.9Q1003.4 729.2 997 725.7Q990.7 722.2 976.6 722.2V875ZM977 664.1H994.1Q1008.8 664.1 1008.8 633.8Q1008.8 614.2 1005.6 608.1Q1002.4 602.1 993.5 602.1H977Z M1093 875V540H1235.3V604.7H1165.4V670H1232.5V733H1165.4V809.7H1240V875Z" style={{ fill: "var(--logo-insure,#7A2433)" }} />
        </symbol>
        <symbol id="lg-bar" viewBox="205 140 1050 520">
          <rect x="220" y="190" width="1012" height="335" style={{ fill: "var(--logo-block,#7A2433)" }} />
          <circle cx="466" cy="396" r="248" style={{ fill: "var(--logo-disc,#F7EFE6)" }} />
          <g style={{ fill: "none", stroke: "var(--logo-globe,#C9B58A)", strokeWidth: "5" }}>
            <circle cx="466" cy="396" r="245.5" />
            <ellipse cx="466" cy="396" rx="240.6" ry="109.1" />
            <ellipse cx="466" cy="396" rx="240.6" ry="188.5" />
            <ellipse cx="466" cy="396" rx="163.7" ry="244.3" />
            <line x1="466" y1="148" x2="466" y2="644" />
            <line x1="218" y1="396" x2="714" y2="396" />
          </g>
          <g style={{ fill: "var(--logo-le,#2B2320)" }}>
            <rect x="240" y="210" width="74.3" height="315" />
            <rect x="240" y="463.5" width="142.4" height="61.5" />
            <rect x="391.6" y="210" width="71.7" height="315" />
            <rect x="391.6" y="210" width="152.1" height="58.9" />
            <rect x="391.6" y="328.8" width="140.3" height="58.9" />
            <rect x="391.6" y="463.5" width="158.3" height="61.5" />
            <rect x="548" y="388" width="684" height="67" />
          </g>
        </symbol>
        <symbol id="lg-mark" viewBox="0 0 1254 1254">
          <rect width="1254" height="1254" style={{ fill: "var(--logo-block,#7A2433)" }} />
          <circle cx="627" cy="627" r="432" style={{ fill: "var(--logo-disc,#F7EFE6)" }} />
          <g style={{ fill: "none", stroke: "var(--logo-globe,#C9B58A)", strokeWidth: "9" }}>
            <circle cx="627" cy="627" r="427.5" />
            <circle cx="627" cy="627" r="416.9" />
            <ellipse cx="627" cy="627" rx="419" ry="190.1" />
            <ellipse cx="627" cy="627" rx="419" ry="328.3" />
            <ellipse cx="627" cy="627" rx="285.1" ry="425.5" />
            <line x1="627" y1="195" x2="627" y2="1059" />
            <line x1="195" y1="627" x2="1059" y2="627" />
          </g>
          <g style={{ fill: "var(--logo-le,#2B2320)" }}>
            <rect x="300" y="325" width="145" height="615" />
            <rect x="300" y="820" width="278" height="120" />
            <rect x="596" y="325" width="140" height="615" />
            <rect x="596" y="325" width="297" height="115" />
            <rect x="596" y="557" width="274" height="115" />
            <rect x="596" y="820" width="309" height="120" />
          </g>
        </symbol>
        <symbol id="lg-mark-round" viewBox="195 195 864 864">
          <circle cx="627" cy="627" r="432" style={{ fill: "var(--logo-disc,#F7EFE6)" }} />
          <g style={{ fill: "none", stroke: "var(--logo-globe,#C9B58A)", strokeWidth: "9" }}>
            <circle cx="627" cy="627" r="427.5" />
            <circle cx="627" cy="627" r="416.9" />
            <ellipse cx="627" cy="627" rx="419" ry="190.1" />
            <ellipse cx="627" cy="627" rx="419" ry="328.3" />
            <ellipse cx="627" cy="627" rx="285.1" ry="425.5" />
            <line x1="627" y1="195" x2="627" y2="1059" />
            <line x1="195" y1="627" x2="1059" y2="627" />
          </g>
          <g style={{ fill: "var(--logo-le,#2B2320)" }}>
            <rect x="300" y="325" width="145" height="615" />
            <rect x="300" y="820" width="278" height="120" />
            <rect x="596" y="325" width="140" height="615" />
            <rect x="596" y="325" width="297" height="115" />
            <rect x="596" y="557" width="274" height="115" />
            <rect x="596" y="820" width="309" height="120" />
          </g>
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-doc" viewBox="0 0 24 24">
          <path d="M7 3h7l5 5v13H7z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M14 3v5h5M10 13h6M10 17h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </symbol>
        <symbol id="i-inf" viewBox="0 0 24 24">
          <path d="M7.5 8.5C5 8.5 3.5 10.2 3.5 12s1.5 3.5 4 3.5c3.5 0 5.5-7 9-7 2.5 0 4 1.7 4 3.5s-1.5 3.5-4 3.5c-3.5 0-5.5-7-9-7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-scale" viewBox="0 0 24 24">
          <path d="M12 4v16M7 20h10M5 7h14M5 7l-2.5 6a2.5 2.5 0 005 0L5 7zm14 0l-2.5 6a2.5 2.5 0 005 0L19 7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-finger" viewBox="0 0 24 24">
          <path d="M12 11v4a6 6 0 01-1.5 4M8.5 9.5A4 4 0 0116 11v2.5M5 13V11a7 7 0 0112.6-4.2M19 11v3a9 9 0 01-.8 3.7M8.5 13v1.5a3.5 3.5 0 01-1 2.5M15.5 16.5a7 7 0 01-1.3 3.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-key" viewBox="0 0 24 24">
          <circle cx="8" cy="14" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 11l8-8M16 6l2.5 2.5M14 8l2 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-face" viewBox="0 0 24 24">
          <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="9.5" cy="10" r=".9" fill="currentColor" />
          <circle cx="14.5" cy="10" r=".9" fill="currentColor" />
          <path d="M12 10.5v2.5h-1M9.5 15.5c1.4 1.2 3.6 1.2 5 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </symbol>
        <symbol id="i-id" viewBox="0 0 24 24">
          <rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8.5" cy="11" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.5 16c.6-1.6 1.7-2.3 3-2.3s2.4.7 3 2.3M14 10h4M14 13h3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </symbol>
        <symbol id="i-phone" viewBox="0 0 24 24">
          <rect x="7" y="3" width="10" height="18" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 18h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-bell" viewBox="0 0 24 24">
          <path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16zM10 20.5a2.2 2.2 0 004 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        </symbol>
        <symbol id="i-up" viewBox="0 0 24 24">
          <path d="M12 16V4M7 9l5-5 5 5M5 20h14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-down" viewBox="0 0 24 24">
          <path d="M12 4v12M7 11l5 5 5-5M5 20h14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></symbol>
        <symbol id="i-gavel" viewBox="0 0 24 24">
          <path d="M13.5 3.5l7 7M10.5 6.5l7 7M12 5l-4 4M16 9l-4 4M10 11L3.5 17.5a1.4 1.4 0 002 2L12 13M14 21h7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-share" viewBox="0 0 24 24">
          <circle cx="6" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="18" cy="6" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="18" cy="18" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-pin" viewBox="0 0 24 24">
          <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0C18.5 15 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-clock" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-device" viewBox="0 0 24 24">
          <rect x="3" y="5" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M1.5 18h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="17.5" y="9" width="5" height="10" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </symbol>
        <symbol id="i-wallet" viewBox="0 0 24 24">
          <path d="M4 7.5A2.5 2.5 0 016.5 5H18v3M4 7.5V17a2 2 0 002 2h13a1 1 0 001-1v-3M4 7.5A2.5 2.5 0 006.5 10H19a1 1 0 011 1v3m0 0h-4a1.5 1.5 0 010-3h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-chat" viewBox="0 0 24 24">
          <path d="M5 5h14a1 1 0 011 1v10a1 1 0 01-1 1h-7l-4.5 3.5V17H5a1 1 0 01-1-1V6a1 1 0 011-1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8.5 10h7M8.5 13h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" fill="currentColor" />
        </symbol>
        <symbol id="i-in" viewBox="0 0 24 24">
          <path d="M17 7L7 17M7 9v8h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-out" viewBox="0 0 24 24">
          <path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-book" viewBox="0 0 24 24">
          <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 006.5 23H20v-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-scan" viewBox="0 0 24 24">
          <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M8 9h8M8 12h8M8 15h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-route" viewBox="0 0 24 24">
          <circle cx="6" cy="6" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="18" cy="18" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 6H15a3 3 0 010 6H9a3 3 0 000 6h6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-user" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-track" viewBox="0 0 24 24">
          <path d="M3 12h4l3-7 4 14 3-7h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-lock" viewBox="0 0 24 24">
          <rect x="4.5" y="10" width="15" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-chev" viewBox="0 0 12 12">
          <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-arr" viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-mail" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-eye" viewBox="0 0 24 24">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
        <symbol id="i-eyeoff" viewBox="0 0 24 24">
          <path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a17.6 17.6 0 01-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a10 10 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-home" viewBox="0 0 24 24">
          <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-gear" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-logout" viewBox="0 0 24 24">
          <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4M15 8l4 4-4 4M19 12H9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-moon" viewBox="0 0 24 24">
          <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-sun" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </symbol>
      </defs>
    </svg>
  );
}

/** Floating glass navigation bar + EN/ID language switch. */
function SiteHeader() {
  return (
    <header className="nav" id="nav">
      <div className="wrap">
        <a className="brand" href="#top" aria-label="Le-Insure home">
          <svg className="logo logo-bar" viewBox="0 0 1050 520" role="img" aria-label="Le-Insure"><use href="#lg-bar" width="1050" height="520" /></svg>
        </a>
        <ul className="menu" role="menubar">
          <li className="home-li"><a className="top" href="#top">Home</a></li>
          <li><a className="top" href="#about">About Us</a></li>
          <li><a className="top" href="#team">Meet the Team</a></li>
          <li><a className="top" href="#coverage">Insurance Coverage</a></li>
          <li><a className="top" href="#claims">Claims &amp; Assistance</a></li>
          <li><a className="top" href="#pricing">Plans &amp; Pricing</a></li>
          <li><a className="top" href="#careers">Careers</a></li>
        </ul>
        <div className="actions">
          <button className="iconbtn" id="themeNav" aria-label="Switch to dark theme">
            <svg width="22" height="22" id="themeIco"><use href="#i-moon" /></svg>
          </button>
          <button className="iconbtn" id="openSearch" aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <a className="btn" href="#login" data-guest>Login</a>
          <div className="av-wrap" id="avWrap" hidden>
            <button className="avatar" id="avBtn" aria-haspopup="true" aria-expanded="false">
              <span className="ini" id="avIni" />
              <span className="nm" id="avName" />
              <svg className="chev"><use href="#i-chev" /></svg>
            </button>
            <div className="av-menu" id="avMenu">
              <div className="who" id="avWho" />
              <a href="#dashboard">
                <svg width="18" height="18"><use href="#i-home" /></svg>
                Dashboard
              </a>
              <button data-logout>
                <svg width="18" height="18"><use href="#i-logout" /></svg>
                Log out
              </button>
            </div>
          </div>
          <button className="iconbtn burger" id="burger" aria-label="Open menu" aria-expanded="false">
            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      <div className="lang lang-out" role="group" aria-label="Language">
        <button type="button" data-lang="en" aria-pressed="true">EN</button>
        <button type="button" data-lang="id" aria-pressed="false">ID</button>
      </div>
    </header>
  );
}

/** Full-screen menu that opens from the burger button on small screens. */
function MobileMenu() {
  return (
    <nav className="mm" id="mm" aria-label="Mobile">
      <a href="#about">About Us</a>
      <a href="#team">Meet the Team</a>
      <a href="#coverage">Insurance Coverage</a>
      <a href="#claims">Claims &amp; Assistance</a>
      <a href="#pricing">Plans &amp; Pricing</a>
      <a href="#careers">Careers</a>
      <div className="acts">
        <a className="btn" href="#login" data-guest>Login</a>
        <a className="btn" href="#dashboard" data-member hidden>Dashboard</a>
        <button className="btn ghost" data-logout data-member hidden>Log out</button>
      </div>
    </nav>
  );
}

/** Fixed burgundy backdrop; the 3D globe canvas is moved in here by the app script. */
function GlobeLayer() {
  return (
    <div className="globe-layer" id="gLayer" aria-hidden="true" />
  );
}

/** Landing page: hero with 3D globe, daily insights ticker, Our Services and Meet the Team. */
function HomeView() {
  return (
    <main id="top" className="view" data-view="home">
      <section className="hero" id="hero">
        <div className="globe-fallback" id="gfb" aria-hidden="true">
          <svg viewBox="0 0 400 400">
            <defs>
              <radialGradient id="gfbFill" cx="35%" cy="30%" r="75%">
                <stop offset="0" stopColor="#7A2433" />
                <stop offset=".7" stopColor="#24090F" />
                <stop offset="1" stopColor="#24090F" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="200" r="180" fill="url(#gfbFill)" stroke="#C9B58A" strokeOpacity=".6" />
            <ellipse className="par" cx="200" cy="355.9" rx="90.0" ry="12.6" />
            <ellipse className="par" cx="200" cy="290.0" rx="155.9" ry="21.8" />
            <ellipse className="par" cx="200" cy="200.0" rx="180.0" ry="25.2" />
            <ellipse className="par" cx="200" cy="110.0" rx="155.9" ry="21.8" />
            <ellipse className="par" cx="200" cy="44.1" rx="90.0" ry="12.6" />
            <ellipse className="mer" cx="200" cy="200" rx="180" ry="180" style={{ animationDelay: "-0.00s" }} />
            <ellipse className="mer" cx="200" cy="200" rx="180" ry="180" style={{ animationDelay: "-3.33s" }} />
            <ellipse className="mer" cx="200" cy="200" rx="180" ry="180" style={{ animationDelay: "-6.66s" }} />
            <ellipse className="mer" cx="200" cy="200" rx="180" ry="180" style={{ animationDelay: "-9.99s" }} />
            <ellipse className="mer" cx="200" cy="200" rx="180" ry="180" style={{ animationDelay: "-13.32s" }} />
            <ellipse className="mer" cx="200" cy="200" rx="180" ry="180" style={{ animationDelay: "-16.65s" }} />
          </svg>
        </div>
        <canvas id="globe" aria-label="Rotating 3D globe from the Le-Insure logo." role="img" />
        <div className="wrap hero-in">
          <svg className="logo hero-logo" viewBox="0 0 1050 750" role="img" aria-label="Le-Insure">
            <use href="#lg-primary" width="1050" height="750" />
          </svg>
          <h1>
            <span className="ln"><span>Digital Protection</span></span>
            <span className="ln">
              <span>
                for Your{" "}
                <em>Rights</em>
              </span>
            </span>
            <span className="ln">
              <span>
                &amp;{" "}
                <em data-id="Warisan Anda">Legacy</em>
              </span>
            </span>
          </h1>
          <p className="sub">
            An integrated digital ecosystem that brings legal cost protection, access to verified advocates, secure document management and legacy planning into one flow.
          </p>
          <div className="ctas">
            <button className="btn lg solid-light" id="exploreBtn">Explore Our Services</button>
            <button className="btn lg ghost" id="checkBtn">
              <span className="cdot" aria-hidden="true" />
              Check your readiness
            </button>
          </div>
        </div>
        <div className="ins-bar" id="insBar" aria-label="Daily insights">
          <div className="ins-lbl">
            <span className="dot" />
            Daily insights
          </div>
          <div className="ins-vp"><div className="ins-track" id="insTrack" /></div>
        </div>
      </section>
      <section className="svs" id="services" aria-labelledby="svsH">
        <div className="svs-bg" aria-hidden="true">
          <span className="au a1" />
          <span className="au a2" />
          <span className="au a3" />
          <canvas id="svsCv" />
          <span className="svs-orb" />
        </div>
        <div className="wrap">
          <div className="svs-head">
            <div>
              <span className="eyebrow chip">Our Services</span>
              <h2 id="svsH">
                <span>Prepare.</span>
                {" "}
                <span>Protect.</span>
                {" "}
                <span>Preserve.</span>
              </h2>
            </div>
            <p className="lede">Eight services in one flow, before, during and after a legal problem. Select any card to see the details.</p>
          </div>
          <div className="svs-grid" id="svsGrid" />
          <div className="svs-steps" id="svsSteps" aria-label="Service stages">
            <button type="button">01 Prepare</button>
            <button type="button">02 Protect</button>
            <button type="button">03 Preserve</button>
          </div>
        </div>
      </section>
      <section className="team" id="team" aria-labelledby="teamH">
        <div className="wrap">
          <div className="team-head">
            <div>
              <span className="eyebrow">Meet the Team</span>
              <h2 id="teamH">The people behind Le-Insure.</h2>
            </div>
            <p className="lede">A small team building one place for legal protection, secure documents and legacy planning.</p>
          </div>
          <div className="team-grid" id="teamGrid" />
        </div>
      </section>
    </main>
  );
}

/** About Us: gavel hologram, who we are, why we exist, ecosystem, philosophy. */
function AboutView() {
  return (
    <section className="view about-pg" data-view="about" hidden>
      <canvas id="abSpace" aria-hidden="true" />
      <nav className="ab-rail" id="abRail" aria-label="About sections" />
      <div className="ab-hero" id="ab-top">
        <div className="wrap ab-hero-in">
          <div className="ab-hero-t">
            <span className="lg-slot ab-lg" data-lg />
            <span className="ab-kick">About Us</span>
            <h1 className="ab-h1">
              <span className="ln"><span>We make legal</span></span>
              <span className="ln"><span>protection part of</span></span>
              <span className="ln"><span><em>everyday life.</em></span></span>
            </h1>
            <p className="ab-sub">
              Le-Insure brings legal cost protection, verified advocates, secure documents and legacy planning into one flow, built with licensed partners.
            </p>
            <div className="ab-ctas">
              <button type="button" className="btn lg solid-light" data-abgo="#ab-eco">Our ecosystem</button>
              <button type="button" className="btn lg ghost" id="abStrike">
                <span className="cdot" aria-hidden="true" />
                Tap the gavel
              </button>
            </div>
          </div>
          <div className="ab-stage"><canvas id="abCv" aria-label="A holographic judge's gavel strikes beside a holographic globe." role="img" /></div>
        </div>
      </div>
      <section className="ab-sec ab-who" id="ab-who" aria-labelledby="abWhoH">
        <div className="ab-div" aria-hidden="true"><i /></div>
        <div className="wrap who-grid">
          <div>
            <span className="ab-eb">Who We Are</span>
            <h2 id="abWhoH" className="sr-only">Who we are</h2>
            <p className="ab-big" id="abWhoP">
              Le-Insure is a digital protection platform from Indonesia. We connect people and families with licensed insurers, partner advocates and notaries, and give them one secure place for the documents that matter, so a legal problem never has to start from zero.
            </p>
            <div className="ab-stats">
              <div>
                <b className="num" data-to="8">0</b>
                <span>services in one flow</span>
              </div>
              <div>
                <b className="num" data-to="3">0</b>
                <span>stages: Prepare, Protect, Preserve</span>
              </div>
            </div>
          </div>
          <div className="who-cols" aria-hidden="true">
            <svg viewBox="0 0 420 440" id="whoCols">
              <defs>
                <linearGradient id="wcG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#F3EADB" />
                  <stop offset="1" stopColor="#E36B78" />
                </linearGradient>
                <radialGradient id="wcPool" cx="50%" cy="50%" r="50%">
                  <stop offset="0" stopColor="#E36B78" stopOpacity=".55" />
                  <stop offset="1" stopColor="#E36B78" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="210" cy="410" rx="200" ry="26" fill="url(#wcPool)" className="wc-pool" />
              <path className="wc-ped" d="M30 112 L210 30 L390 112 Z" />
              <rect className="wc-ln" x="24" y="112" width="372" height="16" rx="4" />
              <g className="wc-col" style={{ "--d": "0.0s" } as CSSProperties}>
                <rect className="wc-ln" x="40" y="136" width="70" height="14" rx="3" />
                <rect className="wc-sh" x="50" y="150" width="50" height="218" rx="2" />
                <path className="wc-fl" style={{ animationDelay: "-0.0s" }} d="M60 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-0.9s" }} d="M70 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-1.8s" }} d="M80 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-2.7s" }} d="M90 360 V158" />
                <rect className="wc-ln" x="40" y="368" width="70" height="12" rx="3" />
              </g>
              <g className="wc-col" style={{ "--d": "0.18s" } as CSSProperties}>
                <rect className="wc-ln" x="130" y="136" width="70" height="14" rx="3" />
                <rect className="wc-sh" x="140" y="150" width="50" height="218" rx="2" />
                <path className="wc-fl" style={{ animationDelay: "-0.7s" }} d="M150 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-1.6s" }} d="M160 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-2.5s" }} d="M170 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-3.4s" }} d="M180 360 V158" />
                <rect className="wc-ln" x="130" y="368" width="70" height="12" rx="3" />
              </g>
              <g className="wc-col" style={{ "--d": "0.36s" } as CSSProperties}>
                <rect className="wc-ln" x="220" y="136" width="70" height="14" rx="3" />
                <rect className="wc-sh" x="230" y="150" width="50" height="218" rx="2" />
                <path className="wc-fl" style={{ animationDelay: "-1.4s" }} d="M240 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-2.3s" }} d="M250 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-3.2s" }} d="M260 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-4.1s" }} d="M270 360 V158" />
                <rect className="wc-ln" x="220" y="368" width="70" height="12" rx="3" />
              </g>
              <g className="wc-col" style={{ "--d": "0.54s" } as CSSProperties}>
                <rect className="wc-ln" x="310" y="136" width="70" height="14" rx="3" />
                <rect className="wc-sh" x="320" y="150" width="50" height="218" rx="2" />
                <path className="wc-fl" style={{ animationDelay: "-2.1s" }} d="M330 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-3.0s" }} d="M340 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-3.9s" }} d="M350 360 V158" />
                <path className="wc-fl" style={{ animationDelay: "-4.8s" }} d="M360 360 V158" />
                <rect className="wc-ln" x="310" y="368" width="70" height="12" rx="3" />
              </g>
              <rect className="wc-ln" x="14" y="384" width="392" height="16" rx="4" />
            </svg>
          </div>
        </div>
      </section>
      <section className="ab-sec ab-why" id="ab-why" aria-labelledby="abWhyH">
        <div className="ab-div" aria-hidden="true"><i /></div>
        <div className="wrap">
          <span className="ab-eb">Why We Exist</span>
          <h2 id="abWhyH">Everyday legal problems are ordinary. Being unprepared for them shouldn&apos;t be.</h2>
          <div className="why-grid">
            <div className="why-col">
              <span className="why-lbl">Without a plan</span>
              <div className="wc bad">
                <svg className="crack" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 62 L48 55 L70 70 L112 48 L150 66 L186 44 L222 63 L260 50 L300 58" />
                  <path d="M112 48 L120 20 M186 44 L196 90" />
                </svg>
                <b>Legal costs arrive as a shock</b>
                <small>An unpaid salary or a lost deposit can turn into fees a household never planned for.</small>
              </div>
              <div className="wc bad">
                <svg className="crack" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 50 L40 64 L84 44 L120 62 L164 46 L200 66 L244 48 L300 60" />
                  <path d="M84 44 L76 12 M200 66 L214 104" />
                </svg>
                <b>Documents are scattered</b>
                <small>IDs, contracts and certificates sit in drawers, phones and inboxes when you need them most.</small>
              </div>
              <div className="wc bad">
                <svg className="crack" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 58 L36 46 L80 66 L118 50 L160 64 L198 46 L240 62 L300 52" />
                  <path d="M118 50 L128 14 M240 62 L232 102" />
                </svg>
                <b>Families don&apos;t know where to start</b>
                <small>Heirs often cannot find what was owned or who should receive it.</small>
              </div>
              <div className="wc bad">
                <svg className="crack" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 64 L44 50 L88 68 L130 46 L170 62 L210 48 L256 66 L300 54" />
                  <path d="M130 46 L140 10 M256 66 L246 106" />
                </svg>
                <b>Help is hard to judge</b>
                <small>Fees and quality are unclear, so people wait until the problem grows.</small>
              </div>
            </div>
            <div className="why-col">
              <span className="why-lbl ok">With Le-Insure</span>
              <div className="wc good">
                <span className="wi"><svg width="20" height="20"><use href="#i-shield" /></svg></span>
                <b>Cost protection from licensed insurers</b>
                <small>The Legal Protection Plan helps pay legal costs for covered disputes.</small>
              </div>
              <div className="wc good">
                <span className="wi"><svg width="20" height="20"><use href="#i-lock" /></svg></span>
                <b>One encrypted vault</b>
                <small>LE-DOCS keeps your documents together and reminds you before they expire.</small>
              </div>
              <div className="wc good">
                <span className="wi"><svg width="20" height="20"><use href="#i-inf" /></svg></span>
                <b>A legacy map your family can open</b>
                <small>LE-LEGACY records assets, beneficiaries and emergency access.</small>
              </div>
              <div className="wc good">
                <span className="wi"><svg width="20" height="20"><use href="#i-user" /></svg></span>
                <b>Verified advocates, fees upfront</b>
                <small>Triage first, then book the right partner advocate with the fee shown.</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="ab-sec ab-eco" id="ab-eco" aria-labelledby="abEcoH">
        <div className="ab-div" aria-hidden="true"><i /></div>
        <div className="wrap abeco-grid">
          <div className="eco-t">
            <span className="ab-eb">Our Ecosystem</span>
            <h2 id="abEcoH">Licensed partners do licensed work. We connect them.</h2>
            <p className="lede">
              Le-Insure is the technology and orchestration layer. Insurers carry the risk, advocates give legal advice and notaries make deeds.
            </p>
            <div className="eco-list" id="ecoList" role="list" />
            <div className="eco-det" id="ecoDet" aria-live="polite">
              <b>Le-Insure</b>
              <span>Technology and orchestration: one account, one vault, one flow.</span>
            </div>
          </div>
          <div className="abeco-map">
            <svg viewBox="-300 -300 600 600" id="ecoSvg" role="img" aria-label="Le-Insure at the centre of six partner types">
              <defs>
                <radialGradient id="ecoFill" cx="35%" cy="30%" r="75%">
                  <stop offset="0" stopColor="#7A2433" />
                  <stop offset=".7" stopColor="#24090F" />
                  <stop offset="1" stopColor="#24090F" />
                </radialGradient>
              </defs>
              <circle r="232" className="eco-orb" />
              <circle r="160" className="eco-orb o2" />
              <g className="eco-rot" id="ecoRot" />
              <g className="eco-globe">
                <circle r="86" fill="url(#ecoFill)" />
                <ellipse className="em" rx="86" ry="86" />
                <ellipse className="em" rx="86" ry="86" style={{ animationDelay: "-4s" }} />
                <ellipse className="em" rx="86" ry="86" style={{ animationDelay: "-8s" }} />
                <ellipse className="ep" rx="86" ry="22" />
                <ellipse className="ep" cy="-46" rx="72" ry="16" />
                <ellipse className="ep" cy="46" rx="72" ry="16" />
                <circle r="86" className="eg-rim" />
                <g id="ecoLogo" className="lg-rev" />
              </g>
            </svg>
          </div>
        </div>
      </section>
      <section className="ab-sec ab-phi" id="ab-phi" aria-labelledby="abPhiH">
        <div className="ab-div" aria-hidden="true"><i /></div>
        <div className="wrap phi-grid">
          <div className="phi-scale">
            <svg viewBox="-220 -40 440 380" aria-hidden="true">
              <path className="sc-base" d="M-90 330 L90 330 L60 300 L-60 300 Z" />
              <rect className="sc-post" x="-7" y="20" width="14" height="282" rx="4" />
              <circle className="sc-top" cy="14" r="16" />
              <g id="scBeam"><rect className="sc-beam" x="-170" y="30" width="340" height="10" rx="5" /></g>
              <g id="scL">
                <path className="sc-ch" d="M-160 36 L-200 170 M-160 36 L-120 170" />
                <path className="sc-pan" d="M-215 170 Q-160 214 -105 170 Z" />
              </g>
              <g id="scR">
                <path className="sc-ch" d="M160 36 L120 170 M160 36 L200 170" />
                <path className="sc-pan" d="M105 170 Q160 214 215 170 Z" />
              </g>
            </svg>
          </div>
          <div>
            <span className="ab-eb">Our Philosophy</span>
            <h2 id="abPhiH">Fair, clear and in your hands.</h2>
            <div className="phi-list">
              <div className="phi">
                <span className="pn">01</span>
                <b>Clarity before complexity</b>
                <small>Plain language, and prices shown before you commit.</small>
              </div>
              <div className="phi">
                <span className="pn">02</span>
                <b>Licensed work by licensed partners</b>
                <small>We never underwrite insurance or give legal advice ourselves.</small>
              </div>
              <div className="phi">
                <span className="pn">03</span>
                <b>Your data, your keys</b>
                <small>Encrypted by default, shared only when you choose, protected by 2FA and e-KYC.</small>
              </div>
              <div className="phi">
                <span className="pn">04</span>
                <b>Protection for everyone</b>
                <small>A free Basic plan, so preparing never depends on a crisis.</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="ab-close" id="ab-close" aria-labelledby="abCloseH">
        <div className="ab-div" aria-hidden="true"><i /></div>
        <canvas id="abCv2" aria-hidden="true" />
        <div className="wrap ab-close-in">
          <span className="lg-slot ab-lg big" data-lg />
          <h2 id="abCloseH">
            Digital Protection for Your{" "}
            <em>Rights</em>
            {" "}&amp;{" "}
            <em data-id="Warisan Anda">Legacy</em>
          </h2>
          <div className="ab-ctas">
            <a className="btn lg solid-light" href="#register">Create free account</a>
            <a className="btn lg ghost" href="#services">Explore our services</a>
          </div>
        </div>
      </section>
    </section>
  );
}

/** Insurance Coverage: what the Legal Protection Plan covers (Phase 2, illustrative). */
function CoverageView() {
  return (
    <section className="view pg" data-view="coverage" hidden>
      <header className="pg-hero">
        <div className="wrap pg-hero-in">
          <div>
            <span className="pg-kick">Insurance Coverage</span>
            <h1>
              Know what the Legal Protection Plan covers,{" "}
              <em>before you need it.</em>
            </h1>
            <p>
              The Legal Protection Plan (LPP) helps pay legal costs when you face a covered dispute. It is issued by an OJK-licensed insurance partner, who also decides claims. Le-Insure explains the cover and helps you prepare.
            </p>
            <div className="pg-ctas">
              <a className="btn lg solid-light" href="#pricing">See plans &amp; pricing</a>
              <a className="btn lg ghost" href="#claims">How claims work</a>
            </div>
            <span className="pg-pill">Policies open in Phase 2 (2028) · figures below are illustrative</span>
          </div>
          <div className="pg-art" aria-hidden="true"><canvas className="pg-cv" data-3d="coverage" /></div>
        </div>
      </header>
      <section className="pg-sec">
        <div className="wrap">
          <span className="pg-eb">What is covered</span>
          <h2>Four everyday kinds of dispute.</h2>
          <div className="pg-grid4">
            <article className="pg-card ok">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-user" /></svg></span>
              <h3>Employment</h3>
              <p>Unpaid wages, unfair termination or severance that was not paid as agreed.</p>
            </article>
            <article className="pg-card ok">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-home" /></svg></span>
              <h3>Rental housing</h3>
              <p>A deposit that is not returned, or a landlord who ends the lease against the agreement.</p>
            </article>
            <article className="pg-card ok">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-scan" /></svg></span>
              <h3>Consumer &amp; digital transactions</h3>
              <p>Online purchases that go wrong, services not delivered, or unfair seller terms.</p>
            </article>
            <article className="pg-card ok">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-doc" /></svg></span>
              <h3>Personal contracts</h3>
              <p>Agreements between individuals, such as loans between friends or private sale contracts.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="pg-sec alt">
        <div className="wrap pg-split">
          <div>
            <span className="pg-eb">Limits</span>
            <h2>What the plan pays, and up to how much.</h2>
            <p className="pg-lede">
              Legal costs for a covered dispute, such as advocate fees and case costs, up to the limits in your policy. The insurer sets the final terms.
            </p>
          </div>
          <dl className="pg-lim">
            <div>
              <dt>Limit per case</dt>
              <dd>Rp25,000,000</dd>
            </div>
            <div>
              <dt>Limit per year</dt>
              <dd>Rp50,000,000</dd>
            </div>
            <div>
              <dt>Waiting period</dt>
              <dd>90 days</dd>
            </div>
            <div>
              <dt>Own risk</dt>
              <dd>10% of each claim</dd>
            </div>
            <div>
              <dt>Retail premium</dt>
              <dd>Rp40,000 / month</dd>
            </div>
            <div>
              <dt>Paid to</dt>
              <dd>The insurer</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="pg-sec">
        <div className="wrap">
          <span className="pg-eb">What is not covered</span>
          <h2>Read this before you buy.</h2>
          <div className="pg-grid3">
            <article className="pg-card no">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-clock" /></svg></span>
              <h3>Disputes that began before the policy</h3>
              <p>Including problems that start during the 90-day waiting period.</p>
            </article>
            <article className="pg-card no">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-gavel" /></svg></span>
              <h3>Intentional crimes</h3>
              <p>Costs from a crime you committed on purpose are excluded.</p>
            </article>
            <article className="pg-card no">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-scale" /></svg></span>
              <h3>Claims without reasonable grounds</h3>
              <p>The insurer can decline a case that has no reasonable legal basis.</p>
            </article>
          </div>
          <p className="pg-note">
            Le-Insure does not underwrite insurance or decide claims. Other exclusions may apply under the insurer&apos;s policy wording.
          </p>
        </div>
      </section>
    </section>
  );
}

/** Claims & Assistance: step-by-step help and LPP claims. */
function ClaimsView() {
  return (
    <section className="view pg" data-view="claims" hidden>
      <header className="pg-hero">
        <div className="wrap pg-hero-in">
          <div>
            <span className="pg-kick">Claims &amp; Assistance</span>
            <h1>
              From the first report{" "}
              <em>to a decision,</em>
              {" "}step by step.
            </h1>
            <p>
              Every member can get help through Legal Triage and a partner advocate. Policyholders of the Legal Protection Plan can also claim legal costs from the insurer, with Le-Insure helping them prepare.
            </p>
            <div className="pg-ctas">
              <a className="btn lg solid-light" href="#register">Report a legal issue</a>
              <a className="btn lg ghost" href="#coverage">What is covered</a>
            </div>
          </div>
          <div className="pg-art" aria-hidden="true"><canvas className="pg-cv" data-3d="claims" /></div>
        </div>
      </header>
      <section className="pg-sec">
        <div className="wrap">
          <span className="pg-eb">Assistance · all members</span>
          <h2>Getting help.</h2>
          <ol className="pg-steps">
            <li>
              <b>Report the issue</b>
              <p>Answer a few questions in Legal Triage. It takes about five minutes.</p>
            </li>
            <li>
              <b>Get your next steps</b>
              <p>A Le-Insure reviewer classifies the issue and replies within 1 working day.</p>
            </li>
            <li>
              <b>Talk to a partner advocate</b>
              <p>Choose a verified advocate with the fee shown upfront, plus a Rp25,000 platform fee.</p>
            </li>
            <li>
              <b>Follow your case</b>
              <p>Status, deadlines and required documents stay in the Case Tracker.</p>
            </li>
          </ol>
        </div>
      </section>
      <section className="pg-sec alt">
        <div className="wrap">
          <span className="pg-eb">Claims · Legal Protection Plan</span>
          <h2>Claiming legal costs.</h2>
          <ol className="pg-steps">
            <li>
              <b>Notify early</b>
              <p>Tell the insurer through Le-Insure as soon as a covered dispute starts.</p>
            </li>
            <li>
              <b>Prepare your file</b>
              <p>We help you gather the policy number, a timeline, evidence and the advocate&apos;s cost estimate from LE-DOCS.</p>
            </li>
            <li>
              <b>Insurer reviews</b>
              <p>The insurer checks the claim against the policy and makes the decision.</p>
            </li>
            <li>
              <b>Costs are paid</b>
              <p>Approved costs are paid up to your limits, minus the 10% own risk. You see each update in the Case Tracker.</p>
            </li>
          </ol>
        </div>
      </section>
      <section className="pg-sec">
        <div className="wrap pg-split">
          <div>
            <span className="pg-eb">Documents</span>
            <h2>What to have ready.</h2>
            <ul className="pg-list">
              <li>Your ID card (KTP) and policy number</li>
              <li>A short timeline of what happened</li>
              <li>Contracts, receipts, chats or letters</li>
              <li>The advocate&apos;s cost estimate or invoice</li>
            </ul>
          </div>
          <div className="pg-who">
            <div>
              <b>Le-Insure</b>
              <span>Triage, matching, document preparation and status updates.</span>
            </div>
            <div>
              <b>Partner advocate</b>
              <span>Legal advice and representation.</span>
            </div>
            <div>
              <b>Licensed insurer</b>
              <span>Reviews claims, decides and pays covered costs.</span>
            </div>
          </div>
        </div>
      </section>
      <section className="pg-sec alt">
        <div className="wrap">
          <span className="pg-eb">Questions</span>
          <h2>Common questions.</h2>
          <div className="pg-faq">
            <details>
              <summary>Can Le-Insure approve my claim?</summary>
              <p>No. Only the insurer decides claims. Le-Insure helps you prepare a complete file so the review is faster.</p>
            </details>
            <details>
              <summary>How long does a claim take?</summary>
              <p>Timelines follow the insurer&apos;s policy terms. You can see each step in the Case Tracker.</p>
            </details>
            <details>
              <summary>What if my claim is declined?</summary>
              <p>You can ask the insurer to review the decision. If you are still not satisfied, you can use the OJK consumer complaint service.</p>
            </details>
            <details>
              <summary>Can I get help without the Legal Protection Plan?</summary>
              <p>Yes. Legal Triage is free on every plan, and you can book a partner advocate and pay their fee directly.</p>
            </details>
          </div>
        </div>
      </section>
    </section>
  );
}

/** Plans & Pricing: plan cards, trust badges, other fees and the comparison table. */
function PricingView() {
  return (
    <section className="view pg" data-view="pricing" hidden>
      <header className="pg-hero">
        <canvas className="pg-cv pg-cv-bg" data-3d="pricing" aria-hidden="true" />
        <div className="wrap pg-hero-in solo">
          <div>
            <span className="pg-kick">Plans &amp; Pricing</span>
            <h1>
              Choose your protection{" "}
              <em>before you sign up.</em>
            </h1>
            <p>Start free, add more when you need it. Prices are shown before you commit.</p>
            <div className="seg pg-bill" role="group" aria-label="Billing period">
              <button type="button" data-bill="m" aria-pressed="true">Monthly</button>
              <button type="button" data-bill="y" aria-pressed="false">Yearly</button>
            </div>
          </div>
        </div>
      </header>
      <section className="pg-sec pg-plans-sec">
        <div className="wrap">
          <div className="pg-plans">
            <article className="pg-plan t1">
              <span className="fx" aria-hidden="true" />
              <svg className="emb" viewBox="0 0 62 62" aria-hidden="true">
                <circle cx="31" cy="31" r="22" />
                <circle cx="31" cy="31" r="14" />
              </svg>
              <span className="pl-lv">
                <i aria-hidden="true">
                  <b />
                  <b />
                  <b />
                  <b />
                </i>
                Level 1
              </span>
              <span className="pg-tag">For everyone</span>
              <h3>Le-Insure Basic</h3>
              <div className="pg-price"><b>Free</b></div>
              <p>Get informed and organized at no cost.</p>
              <ul>
                <li>Education hub and legal check-up</li>
                <li>Legal Triage</li>
                <li>LE-DOCS vault, 1 GB</li>
                <li>Partner advocate referral, pay per session</li>
              </ul>
              <a className="btn ghost" href="#register">Create free account</a>
            </article>
            <article className="pg-plan hot t2">
              <span className="fx" aria-hidden="true" />
              <svg className="emb" viewBox="0 0 62 62" aria-hidden="true">
                <circle className="o" cx="31" cy="31" r="24" />
                <g className="g1"><circle className="d" cx="31" cy="7" r="3" /></g>
                <g className="g2"><circle className="d" cx="31" cy="47" r="2.2" /></g>
                <circle className="d" cx="31" cy="31" r="4" />
              </svg>
              <span className="pl-lv">
                <i aria-hidden="true">
                  <b />
                  <b />
                  <b />
                  <b />
                </i>
                Level 2
              </span>
              <span className="pg-tag">Most popular</span>
              <h3>Le-Insure Plus</h3>
              <div className="pg-price">
                <b data-m="Rp29,000" data-y="Rp290,000">Rp29,000</b>
                <small data-m="/ month" data-y="/ year">/ month</small>
              </div>
              <p>For people who sign contracts and keep important papers.</p>
              <ul>
                <li>Everything in Basic</li>
                <li>AI-assisted contract review</li>
                <li>LE-DOCS vault, 20 GB, with expiry reminders</li>
                <li>Case Tracker</li>
                <li>Basic LE-LEGACY</li>
              </ul>
              <a className="btn" href="#register">Start with Plus</a>
            </article>
            <article className="pg-plan t3">
              <span className="fx" aria-hidden="true" />
              <svg className="emb" viewBox="0 0 62 62" aria-hidden="true">
                <path d="M31 6 L52 14 V30 C52 44 42 52 31 57 C20 52 10 44 10 30 V14 Z" />
                <path className="chk" d="M22 31 L29 38 L41 24" />
              </svg>
              <span className="pl-lv">
                <i aria-hidden="true">
                  <b />
                  <b />
                  <b />
                  <b />
                </i>
                Level 3
              </span>
              <span className="pg-tag">Phase 2 · 2028</span>
              <h3>Legal Protection Plan · Retail</h3>
              <div className="pg-price">
                <b>Rp40,000</b>
                <small>/ month premium</small>
              </div>
              <p>Cover for legal costs, issued by an OJK-licensed insurer.</p>
              <ul>
                <li>Up to Rp25 million per case</li>
                <li>Up to Rp50 million per year</li>
                <li>90-day waiting period, 10% own risk</li>
                <li>Premium paid to the insurer</li>
              </ul>
              <a className="btn" href="#register">Start with LPP</a>
            </article>
            <article className="pg-plan t4">
              <span className="fx" aria-hidden="true" />
              <svg className="emb" viewBox="0 0 62 62" aria-hidden="true">
                <g>
                  <line x1="31" y1="31" x2="31" y2="6" />
                  <line x1="31" y1="31" x2="53" y2="43" />
                  <line x1="31" y1="31" x2="9" y2="43" />
                  <circle cx="31" cy="6" r="3" />
                  <circle cx="53" cy="43" r="3" />
                  <circle cx="9" cy="43" r="3" />
                </g>
                <path className="crown" d="M23 36 L21 25 L27 29 L31 22 L35 29 L41 25 L39 36 Z" />
              </svg>
              <span className="pl-lv">
                <i aria-hidden="true">
                  <b />
                  <b />
                  <b />
                  <b />
                </i>
                Level 4
              </span>
              <span className="pg-tag">Through your employer</span>
              <h3>Employee Package</h3>
              <div className="pg-price">
                <b>Rp15,000</b>
                <small>/ employee / month</small>
              </div>
              <p>Paid by the employer as a benefit for the whole team.</p>
              <ul>
                <li>All Plus features</li>
                <li>One 30-minute advocate consultation a year</li>
                <li>Legal education sessions</li>
                <li>Option to add group Legal Protection Plan</li>
              </ul>
              <button type="button" className="btn" id="pgEmp">Start with Employee Package</button>
            </article>
          </div>
          <div className="trust">
            <h3 className="trust-h">Why you can trust Le-Insure</h3>
            <div className="trust-g">
              <div className="tb" style={{ "--i": "0" } as CSSProperties}>
                <span className="tb-ic"><svg width="22" height="22"><use href="#i-shield" /></svg></span>
                <b>Insurance by OJK-licensed partners</b>
                <small>The Legal Protection Plan is issued and underwritten by a licensed insurance partner, not by Le-Insure.</small>
              </div>
              <div className="tb" style={{ "--i": "1" } as CSSProperties}>
                <span className="tb-ic"><svg width="22" height="22"><use href="#i-scale" /></svg></span>
                <b>Verified partner advocates</b>
                <small>Every advocate is checked before joining. 6 sample advocates in this preview.</small>
              </div>
              <div className="tb" style={{ "--i": "2" } as CSSProperties}>
                <span className="tb-ic"><svg width="22" height="22"><use href="#i-lock" /></svg></span>
                <b>Encrypted document vault</b>
                <small>Files are encrypted and shared only when you choose, with an end date.</small>
              </div>
              <div className="tb" style={{ "--i": "3" } as CSSProperties}>
                <span className="tb-ic"><svg width="22" height="22"><use href="#i-key" /></svg></span>
                <b>2FA and e-KYC</b>
                <small>A second sign-in step and an identity check protect your account.</small>
              </div>
              <div className="tb" style={{ "--i": "4" } as CSSProperties}>
                <span className="tb-ic"><svg width="22" height="22"><use href="#i-id" /></svg></span>
                <b>Built for UU PDP</b>
                <small>Designed to follow Indonesia&apos;s Personal Data Protection Law.</small>
              </div>
              <div className="tb" style={{ "--i": "5" } as CSSProperties}>
                <span className="tb-ic"><svg width="22" height="22"><use href="#i-wallet" /></svg></span>
                <b>Fees shown upfront</b>
                <small>Advocate and platform fees are shown before you book. No hidden costs.</small>
              </div>
            </div>
            <p className="trust-n">
              Le-Insure is a technology platform, not an insurer. Partner names will be announced at launch. Advocate numbers are sample data for this preview.
            </p>
          </div>
        </div>
      </section>
      <section className="pg-sec alt">
        <div className="wrap pg-split">
          <div>
            <span className="pg-eb">Other fees</span>
            <h2>Pay only when you use it.</h2>
            <p className="pg-lede">Advocate and notary fees go to them in full and are shown before you book.</p>
          </div>
          <dl className="pg-lim">
            <div>
              <dt>Platform fee per paid consultation</dt>
              <dd>Rp25,000</dd>
            </div>
            <div>
              <dt>LE-LEGACY setup package</dt>
              <dd>Rp250,000</dd>
            </div>
            <div>
              <dt>Advocate fee</dt>
              <dd>Set by the advocate</dd>
            </div>
            <div>
              <dt>Notary fee</dt>
              <dd>Set by the notary</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="pg-sec">
        <div className="wrap">
          <span className="pg-eb">Compare</span>
          <h2>Plans side by side.</h2>
          <div className="pg-cmp2" role="table" aria-label="Plan comparison">
            <div className="cm-scroll">
              <div className="cm-grid">
                <div className="cm-row cm-head" role="row">
                  <span className="cm-f" role="columnheader">
                    <b>Pick what fits you</b>
                    <small>Every plan starts with a free account. Upgrade or cancel any time.</small>
                  </span>
                  <div className="cm-col t1" role="columnheader" data-c="0">
                    <span className="pl-lv">
                      <i aria-hidden="true">
                        <b />
                        <b />
                        <b />
                        <b />
                      </i>
                      Level 1
                    </span>
                    <b className="nm">Le-Insure Basic</b>
                    <span className="pr">
                      <b>Free</b>
                      <small />
                    </span>
                    <small className="best">Best for getting started</small>
                    <a className="btn sm" href="#register">Create free account</a>
                  </div>
                  <div className="cm-col t2" role="columnheader" data-c="1">
                    <em className="rib">Most popular</em>
                    <span className="pl-lv">
                      <i aria-hidden="true">
                        <b />
                        <b />
                        <b />
                        <b />
                      </i>
                      Level 2
                    </span>
                    <b className="nm">Le-Insure Plus</b>
                    <span className="pr">
                      <b>Rp29,000</b>
                      <small>/ month</small>
                    </span>
                    <small className="best">Best for people with contracts and important papers</small>
                    <a className="btn sm" href="#register">Start with Plus</a>
                  </div>
                  <div className="cm-col t4" role="columnheader" data-c="2">
                    <span className="pl-lv">
                      <i aria-hidden="true">
                        <b />
                        <b />
                        <b />
                        <b />
                      </i>
                      Level 4
                    </span>
                    <b className="nm">Employee Package</b>
                    <span className="pr">
                      <b>Rp15,000</b>
                      <small>/ employee / month</small>
                    </span>
                    <small className="best">Best for companies and their teams</small>
                    <button type="button" className="btn sm" data-empgo>Start with Employee Package</button>
                  </div>
                </div>
                <div className="cm-g" role="row">
                  <span role="rowheader">
                    <svg width="16" height="16"><use href="#i-book" /></svg>
                    Prepare
                  </span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">Legal check-up and education</span>
                  <span className="ck y" role="cell" data-c="0">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="1">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="2">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">AI-assisted contract review</span>
                  <span className="ck n" role="cell" data-c="0">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="1">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="2">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">LE-DOCS storage</span>
                  <span className="ck v " role="cell" data-c="0">1 GB</span>
                  <span className="ck v up" role="cell" data-c="1">20 GB</span>
                  <span className="ck v up" role="cell" data-c="2">20 GB</span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">Expiry reminders</span>
                  <span className="ck n" role="cell" data-c="0">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="1">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="2">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                </div>
                <div className="cm-g" role="row">
                  <span role="rowheader">
                    <svg width="16" height="16"><use href="#i-shield" /></svg>
                    Protect
                  </span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">Legal Triage</span>
                  <span className="ck y" role="cell" data-c="0">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="1">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="2">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">Partner advocate referral</span>
                  <span className="ck v " role="cell" data-c="0">Pay per session</span>
                  <span className="ck v " role="cell" data-c="1">Pay per session</span>
                  <span className="ck v " role="cell" data-c="2">Pay per session</span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">Case Tracker</span>
                  <span className="ck n" role="cell" data-c="0">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="1">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="2">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">Advocate consultation included</span>
                  <span className="ck n" role="cell" data-c="0">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck n" role="cell" data-c="1">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck v up" role="cell" data-c="2">1 × 30 min / year</span>
                </div>
                <div className="cm-g" role="row">
                  <span role="rowheader">
                    <svg width="16" height="16"><use href="#i-inf" /></svg>
                    Preserve
                  </span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">Basic LE-LEGACY</span>
                  <span className="ck n" role="cell" data-c="0">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="1">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="2">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                </div>
                <div className="cm-g" role="row">
                  <span role="rowheader">
                    <svg width="16" height="16"><use href="#i-user" /></svg>
                    For teams
                  </span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">Legal education sessions</span>
                  <span className="ck n" role="cell" data-c="0">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck n" role="cell" data-c="1">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="2">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                </div>
                <div className="cm-row" role="row">
                  <span className="cm-f" role="rowheader">Option to add group Legal Protection Plan</span>
                  <span className="ck n" role="cell" data-c="0">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck n" role="cell" data-c="1">
                    <i />
                    <span className="sr-only">Not included</span>
                  </span>
                  <span className="ck y" role="cell" data-c="2">
                    <svg width="14" height="14"><use href="#i-check" /></svg>
                    <span className="sr-only">Included</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="cm-add t3">
              <span className="fx" aria-hidden="true" />
              <svg className="emb" viewBox="0 0 62 62" aria-hidden="true">
                <path d="M31 6 L52 14 V30 C52 44 42 52 31 57 C20 52 10 44 10 30 V14 Z" />
                <path className="chk" d="M22 31 L29 38 L41 24" />
              </svg>
              <div>
                <span className="pl-lv">
                  <i aria-hidden="true">
                    <b />
                    <b />
                    <b />
                    <b />
                  </i>
                  Level 3 · Add-on
                </span>
                <b className="nm">Legal Protection Plan · Retail</b>
                <small>
                  Insurance for legal costs. Add it to any plan above. Up to Rp25 million per case, issued by an OJK-licensed insurer. Opens in Phase 2 (2028).
                </small>
              </div>
              <div className="pr">
                <b>Rp40,000</b>
                <small>/ month premium</small>
              </div>
              <a className="btn" href="#register">Start with LPP</a>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

/** Help Center: topics, FAQ search and the assistant entry point. */
function HelpCenterView() {
  return (
    <section className="view pg" data-view="help" hidden>
      <header className="pg-hero">
        <div className="wrap pg-hero-in solo">
          <div>
            <span className="pg-kick">Help Center</span>
            <h1>
              How can we{" "}
              <em>help you today?</em>
            </h1>
            <p>Guides for registration, account verification, the Legal Protection Plan, documents, claims and using the platform.</p>
            <label className="hc-search">
              <svg width="20" height="20"><use href="#i-search" /></svg>
              <input type="search" id="hcQ" placeholder="Search for answers" aria-label="Search help articles" />
            </label>
          </div>
        </div>
      </header>
      <section className="pg-sec">
        <div className="wrap">
          <div className="hc-topics" id="hcTopics" />
          <div className="hc-body">
            <div>
              <h2 className="hc-h" id="hcH">Frequently asked questions</h2>
              <div className="pg-faq" id="hcFaq" />
            </div>
            <aside className="hc-side">
              <div className="pg-card">
                <span className="pg-ic"><svg width="22" height="22"><use href="#i-chat" /></svg></span>
                <h3>Still need help?</h3>
                <p>Chat with our assistant, or contact the support team.</p>
                <button type="button" className="btn" id="hcChatOpen">Chat with assistant</button>
                <a className="btn ghost" href="#support">How to contact support</a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </section>
  );
}

/** Contact Support: channels and the support form. */
function SupportView() {
  return (
    <section className="view pg" data-view="support" hidden>
      <header className="pg-hero">
        <div className="wrap pg-hero-in solo">
          <div>
            <span className="pg-kick">Contact Support</span>
            <h1>
              Talk to{" "}
              <em>a real person.</em>
            </h1>
            <p>Choose the channel that suits you. For urgent legal deadlines, mention the date in your message.</p>
            <div className="pg-ctas" style={{ justifyContent: "center" }}><a className="btn lg ghost" href="#help">Back to Help Center</a></div>
          </div>
        </div>
      </header>
      <section className="pg-sec">
        <div className="wrap">
          <div className="pg-grid3">
            <article className="pg-card">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-chat" /></svg></span>
              <h3>Live chat</h3>
              <p>Every day, 08:00 to 20:00 WIB. Usually answered within 5 minutes.</p>
              <button type="button" className="btn ghost" data-chat>Start chat</button>
            </article>
            <article className="pg-card">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-mail" /></svg></span>
              <h3>Email</h3>
              <p>We reply within 1 working day. Address will be confirmed at launch.</p>
            </article>
            <article className="pg-card">
              <span className="pg-ic"><svg width="22" height="22"><use href="#i-phone" /></svg></span>
              <h3>Phone</h3>
              <p>Monday to Friday, 09:00 to 17:00 WIB. Number will be confirmed at launch.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="pg-sec alt">
        <div className="wrap pg-split">
          <div>
            <span className="pg-eb">Send a message</span>
            <h2>We will get back to you.</h2>
            <p className="pg-lede">You get a ticket number right away, and updates by email.</p>
            <div className="pg-who" style={{ marginTop: "22px" }}>
              <div>
                <b>Complaints about a claim</b>
                <span>Ask the insurer to review first. If you are not satisfied, you can use the OJK consumer complaint service.</span>
              </div>
            </div>
          </div>
          <form className="dz-form pg-form" id="supF" noValidate>
            <div className="dz-f2">
              <label>
                Full name
                <input id="supN" autoComplete="name" />
              </label>
              <label>
                Email
                <input id="supE" type="email" autoComplete="email" />
              </label>
            </div>
            <label>
              Topic
              <select id="supT">
                <option>Registration</option>
                <option>Account verification</option>
                <option>Legal Protection Plan</option>
                <option>Documents</option>
                <option>Claims</option>
                <option>Using the platform</option>
                <option>Billing</option>
              </select>
            </label>
            <label>
              Message
              <textarea id="supM" rows={5} placeholder="Tell us what happened" />
            </label>
            <button className="btn lg" type="submit">Send message</button>
          </form>
        </div>
      </section>
    </section>
  );
}

/** Help chatbot panel (answers from the Help Center FAQ). */
function ChatAssistant() {
  return (
    <div className="bot" id="bot" hidden role="dialog" aria-label="Le-Insure assistant">
      <div className="bot-h">
        <span className="bot-av">LI</span>
        <div>
          <b>Le-Insure Assistant</b>
          <small>Answers from our Help Center</small>
        </div>
        <button type="button" className="iconbtn" id="botX" aria-label="Close chat">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="bot-log" id="botLog" aria-live="polite" />
      <div className="bot-chips" id="botChips" />
      <form className="bot-f" id="botF">
        <input id="botI" placeholder="Type your question" aria-label="Your question" autoComplete="off" />
        <button className="btn" type="submit" aria-label="Send">Send</button>
      </form>
    </div>
  );
}

/** Floating Help Center button. */
function HelpCenterButton() {
  return (
    <a className="help-fab" href="#help">
      <svg width="20" height="20"><use href="#i-chat" /></svg>
      <span>Help Center</span>
    </a>
  );
}

/** Floating chat button on Help / Support pages. */
function ChatButton() {
  return (
    <button type="button" className="bot-fab" id="botFab" aria-label="Open help chat"><svg width="24" height="24"><use href="#i-chat" /></svg></button>
  );
}

/** Login page. */
function LoginView() {
  return (
    <section className="view auth" data-view="login" hidden>
      <div className="wrap">
        <div className="auth-card">
          <a className="auth-x" href="#top" aria-label="Close and go back to home">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          </a>
          <div className="auth-art">
            <svg className="logo hero-logo" viewBox="0 0 1050 750" aria-hidden="true"><use href="#lg-primary" width="1050" height="750" /></svg>
            <div className="colonnade" aria-hidden="true">
              <canvas className="colcv" />
              <span className="sunb" />
            </div>
            <blockquote>
              Prepared before. Protected during. Preserved after.
              <small>Digital Protection for Your Rights &amp; Legacy</small>
            </blockquote>
          </div>
          <div className="auth-form">
            <div>
              <h1>Welcome back</h1>
              <p className="sub">Continue your protection journey with Le-Insure.</p>
            </div>
            <form id="loginForm" noValidate>
              <div className="inp">
                <label htmlFor="lEmail">Email address</label>
                <div className="inbox">
                  <svg width="18" height="18"><use href="#i-mail" /></svg>
                  <input id="lEmail" type="email" autoComplete="email" placeholder="you@example.com" />
                </div>
                <p className="ferr" id="lEmailE" />
              </div>
              <div className="inp">
                <label htmlFor="lPass">Password</label>
                <div className="inbox">
                  <svg width="18" height="18"><use href="#i-lock" /></svg>
                  <input id="lPass" type="password" autoComplete="current-password" placeholder="Enter your password" />
                  <button type="button" className="eye" data-eye="lPass" aria-label="Show password"><svg width="20" height="20"><use href="#i-eye" /></svg></button>
                </div>
                <p className="ferr" id="lPassE" />
              </div>
              <div className="row2">
                <label className="chk">
                  <input type="checkbox" id="lRem" defaultChecked />
                  Remember me
                </label>
                <button type="button" className="lnk" id="forgot">Forgot password?</button>
              </div>
              <button className="btn lg" type="submit">Log in</button>
              <div className="or">or continue with</div>
              <div className="sso">
                <button type="button" data-sso>Google</button>
                <button type="button" data-sso>Apple</button>
              </div>
            </form>
            <p className="auth-alt">
              Don&apos;t have an account?{" "}
              <a className="lnk" href="#register">Register here</a>
            </p>
            <p className="prev-note">Preview: your details stay in this browser and are never sent anywhere.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 5-step registration: account, OTP, 2FA, e-KYC, access. */
function RegisterView() {
  return (
    <section className="view auth" data-view="register" hidden>
      <div className="wrap">
        <div className="auth-card">
          <a className="auth-x" href="#top" aria-label="Close and go back to home">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          </a>
          <div className="auth-art">
            <svg className="logo hero-logo" viewBox="0 0 1050 750" aria-hidden="true"><use href="#lg-primary" width="1050" height="750" /></svg>
            <div className="colonnade" aria-hidden="true">
              <canvas className="colcv" />
              <span className="sunb" />
            </div>
            <blockquote>
              One place for your documents, your advocate and your family&apos;s plan.
              <small>Start free with Le-Insure Basic</small>
            </blockquote>
          </div>
          <div className="auth-form reg">
            <ol className="rstep" id="rStep" aria-label="Registration steps">
              <li data-i="1">
                <i>1</i>
                <span>Account</span>
              </li>
              <li data-i="2">
                <i>2</i>
                <span>Verify</span>
              </li>
              <li data-i="3">
                <i>3</i>
                <span>2FA</span>
              </li>
              <li data-i="4">
                <i>4</i>
                <span>Identity</span>
              </li>
              <li data-i="5">
                <i>5</i>
                <span>Access</span>
              </li>
            </ol>
            <div className="rs" data-rs="1">
              <div>
                <span className="rkick">Step 1 of 5</span>
                <h1>Create your account</h1>
                <p className="sub">Start your digital protection journey with Le-Insure.</p>
              </div>
              <form id="regForm" noValidate>
                <div className="inp">
                  <label htmlFor="rName">Full name</label>
                  <div className="inbox">
                    <svg width="18" height="18"><use href="#i-user" /></svg>
                    <input id="rName" type="text" autoComplete="name" placeholder="Your full name" />
                  </div>
                  <p className="ferr" id="rNameE" />
                </div>
                <div className="inp">
                  <label htmlFor="rEmail">Email address</label>
                  <div className="inbox">
                    <svg width="18" height="18"><use href="#i-mail" /></svg>
                    <input id="rEmail" type="email" autoComplete="email" placeholder="you@example.com" />
                  </div>
                  <p className="ferr" id="rEmailE" />
                </div>
                <div className="inp">
                  <label htmlFor="rPhone">Phone number</label>
                  <div className="inbox">
                    <svg width="18" height="18"><use href="#i-phone" /></svg>
                    <span className="pre62">+62</span>
                    <input id="rPhone" className="ph62" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="812 3456 7890" />
                  </div>
                  <p className="ferr" id="rPhoneE" />
                </div>
                <div className="inp">
                  <label htmlFor="rPass">Password</label>
                  <div className="inbox">
                    <svg width="18" height="18"><use href="#i-lock" /></svg>
                    <input id="rPass" type="password" autoComplete="new-password" placeholder="At least 8 characters" />
                    <button type="button" className="eye" data-eye="rPass" aria-label="Show password"><svg width="20" height="20"><use href="#i-eye" /></svg></button>
                  </div>
                  <div className="meter" id="meter" data-s="0">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <p className="mhint" id="mhint">Use 8+ characters with a mix of letters, numbers and symbols.</p>
                  <p className="ferr" id="rPassE" />
                </div>
                <div className="inp">
                  <label htmlFor="rPass2">Confirm password</label>
                  <div className="inbox">
                    <svg width="18" height="18"><use href="#i-lock" /></svg>
                    <input id="rPass2" type="password" autoComplete="new-password" placeholder="Re-enter your password" />
                    <button type="button" className="eye" data-eye="rPass2" aria-label="Show password"><svg width="20" height="20"><use href="#i-eye" /></svg></button>
                  </div>
                  <p className="ferr" id="rPass2E" />
                </div>
                <label className="chk">
                  <input type="checkbox" id="rTerms" />
                  <span>
                    I agree to the{" "}
                    <button type="button" className="lnk" data-legal="terms">Terms of Service</button>
                    {" "}and{" "}
                    <button type="button" className="lnk" data-legal="privacy">Privacy Policy</button>
                    {" "}of Le-Insure.
                  </span>
                </label>
                <p className="ferr" id="rTermsE" />
                <button className="btn lg" type="submit">Create account</button>
              </form>
              <p className="auth-alt">
                Already have an account?{" "}
                <a className="lnk" href="#login">Log in here</a>
              </p>
            </div>
            <div className="rs" data-rs="2" id="rs2" hidden />
            <div className="rs" data-rs="3" id="rs3" hidden />
            <div className="rs" data-rs="4" id="rs4" hidden />
            <div className="rs" data-rs="5" id="rs5" hidden />
            <p className="prev-note">Preview: your details stay in this browser and are never sent anywhere.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Member dashboard shell. Its content is rendered by the app script. */
function DashboardView() {
  return (
    <section className="view" data-view="dashboard" hidden>
      <div className="dz">
        <aside className="dz-side" aria-label="Account navigation">
          <a className="dz-brand" href="#top" aria-label="Le-Insure home">
            <span className="dz-lg" data-lg="mark" />
            <span className="dz-bt">
              <b>Le-Insure</b>
              <small>Member area</small>
            </span>
          </a>
          <div className="dz-me">
            <span className="dz-av" id="dzAv" />
            <span>
              <small id="dzGreet">Good evening</small>
              <b id="dzName" />
            </span>
          </div>
          <nav className="dz-nav" id="dzNav" />
          <div className="dz-extra" id="dzExtra" />
          <span className="sp" />
          <button className="dz-out" data-logout>
            <svg width="20" height="20"><use href="#i-logout" /></svg>
            Log out
          </button>
        </aside>
        <div className="dz-body">
          <nav className="dz-mob" id="dzMob" aria-label="Account sections" />
          <div className="dz-main" id="dash" />
        </div>
      </div>
    </section>
  );
}

/** Small status message at the bottom of the screen. */
function Toast() {
  return (
    <div className="toast" id="toast" role="status" aria-live="polite" />
  );
}

/** Footer with the legal disclaimer (role boundaries of Le-Insure). */
function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div className="fl">
            <a className="brand" href="#top" aria-label="Back to top">
              <svg className="logo" viewBox="0 0 1050 750" role="img" aria-label="Le-Insure"><use href="#lg-primary" width="1050" height="750" /></svg>
            </a>
            <p>Digital Protection for Your Rights &amp; Legacy</p>
          </div>
        </div>
        <div className="legal">
          <p>
            Le-Insure is a technology platform. It does not underwrite insurance, provide legal advice or guarantee legal outcomes. Insurance products are provided by OJK-licensed insurance companies, legal services by partner advocates, and deeds, including wills, by partner notaries. LE-LEGACY does not replace a will.
          </p>
          <div className="row">
            <span>
              © 2026 Le-Insure · Innovation concept by Group 4, KIKD 2026, Vocational School, Universitas Indonesia. Preview site; forms do not send data.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Shared modal (search, readiness quiz, service details, articles). */
function ModalOverlay() {
  return (
    <div className="ov" id="ov" hidden><div className="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle" id="modal" /></div>
  );
}
