import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PrirqLogo from "./PrirqLogo";
import "./Navbar.css";

const NAV_ITEMS = [
  { id: "home", label: "HOME", targetId: "hero-stage", fallbackId: "hero-stage", path: "/" },
  { id: "story", label: "STORY", targetId: "story-section", fallbackId: "story", path: "/" },
  { id: "ingredients", label: "INGREDIENTS", targetId: "ingredients-section", fallbackId: "ingredients", path: "/" },
  { id: "why-us", label: "WHY US", targetId: "why-section", fallbackId: "why-us", path: "/" },
  { id: "merch", label: "MERCH", isRoute: true, path: "/merchandise" },
  { id: "order", label: "ORDER PRIRP", targetId: "product", fallbackId: "product", isCta: true, path: "/" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isMerchPage = location.pathname === "/merchandise";

  const [activeIndex, setActiveIndex] = useState(isMerchPage ? 4 : 0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const navContainerRef = useRef(null);
  const itemRefs = useRef([]);

  // Sync active index with current route
  useEffect(() => {
    if (isMerchPage) {
      setActiveIndex(4);
    } else {
      if (activeIndex === 4) {
        setActiveIndex(0);
      }
    }
  }, [location.pathname]);

  // Dynamically calculate sliding pill indicator position & dimensions
  const updateIndicator = () => {
    const targetIdx = hoveredIndex !== null ? hoveredIndex : activeIndex;
    const currentItem = itemRefs.current[targetIdx];
    const container = navContainerRef.current;

    if (currentItem && container) {
      const itemRect = currentItem.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setIndicatorStyle({
        left: itemRect.left - containerRect.left,
        top: itemRect.top - containerRect.top,
        width: itemRect.width,
        height: itemRect.height,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [activeIndex, hoveredIndex, location.pathname]);

  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener("resize", handleResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(updateIndicator).catch(() => {});
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, hoveredIndex, location.pathname]);

  // Scroll spy for homepage sections
  useEffect(() => {
    if (isMerchPage) return;

    const sectionLookup = [
      { index: 0, ids: ["hero-stage", "hero"] },
      { index: 1, ids: ["story-section", "story"] },
      { index: 2, ids: ["ingredients-section", "ingredients"] },
      { index: 3, ids: ["why-section", "why-us"] },
      { index: 5, ids: ["product"] },
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      for (let i = sectionLookup.length - 1; i >= 0; i--) {
        const { index, ids } = sectionLookup[i];
        for (const id of ids) {
          const el = document.getElementById(id) || document.querySelector(`.${id}`);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY;
            if (scrollPos >= top) {
              setActiveIndex(index);
              return;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMerchPage]);

  const handleNavClick = (e, item, index) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    // If clicking MERCH route
    if (item.isRoute) {
      setActiveIndex(index);
      navigate(item.path);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // If we are currently on /merchandise and clicking a homepage section
    if (isMerchPage) {
      setActiveIndex(index);
      navigate("/", { state: { scrollTo: item.targetId, itemId: item.id } });
      return;
    }

    // Currently on homepage
    setActiveIndex(index);

    // HOME always scrolls cleanly to the top Hero section
    if (item.id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // ORDER PRIRP scrolls smoothly into the unboxed order phase of the product track
    if (item.id === "order") {
      const productSection =
        document.getElementById("product") ||
        document.querySelector(".product-details-track");
      if (productSection) {
        const top = productSection.getBoundingClientRect().top + window.scrollY;
        const totalScrollable = productSection.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + totalScrollable * 0.85, behavior: "smooth" });
      }
      return;
    }

    // Resolving target by ID or fallback ID or class name
    let targetElement = document.getElementById(item.targetId);
    if (!targetElement && item.fallbackId) {
      targetElement = document.getElementById(item.fallbackId);
    }

    if (!targetElement) {
      if (item.targetId === "story-section" || item.fallbackId === "story") {
        targetElement =
          document.querySelector(".story-section") || document.getElementById("story");
      } else if (
        item.targetId === "ingredients-section" ||
        item.fallbackId === "ingredients"
      ) {
        targetElement =
          document.querySelector(".ingredients-section") ||
          document.getElementById("ingredients");
      } else if (item.targetId === "why-section" || item.fallbackId === "why-us") {
        targetElement =
          document.querySelector(".why-section") || document.getElementById("why-us");
      }
    }

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isMerchPage) {
      navigate("/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveIndex(0);
  };

  const currentTargetIdx = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const isCurrentCta = currentTargetIdx === 5;

  return (
    <>
      {/* =========================================================================
          TOP-LEFT LOGO (FIXED CORNER POSITION)
          ========================================================================= */}
      <a
        href="#"
        onClick={handleLogoClick}
        className="prirq-top-left-logo-link"
        aria-label="PRIRP Energy Home"
      >
        <PrirqLogo size="small" />
      </a>

      {/* =========================================================================
          DESKTOP PILL NAV (BOTTOM CENTER FIXED DOCK)
          ========================================================================= */}
      <nav className="prirq-pill-nav-dock desktop-only" aria-label="Main Navigation">
        <div
          className="prirq-pill-container"
          ref={navContainerRef}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Animated Sliding Pill Indicator */}
          <div
            className={`prirq-pill-indicator ${isCurrentCta ? "is-cta-active" : ""}`}
            style={{
              transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
              width: `${indicatorStyle.width}px`,
              height: `${indicatorStyle.height}px`,
              opacity: indicatorStyle.opacity,
            }}
            aria-hidden="true"
          />

          {/* Navigation Links List */}
          <ul className="prirq-pill-list" role="menubar">
            {NAV_ITEMS.map((item, index) => {
              const isActive = activeIndex === index;
              const isHovered = hoveredIndex === index;
              const isCta = !!item.isCta;

              return (
                <li
                  key={item.id}
                  className="prirq-pill-item-wrapper"
                  role="none"
                  ref={(el) => (itemRefs.current[index] = el)}
                >
                  <a
                    href={item.isRoute ? item.path : `#${item.targetId}`}
                    role="menuitem"
                    className={`prirq-pill-link ${isActive ? "active" : ""} ${
                      isHovered ? "hovered" : ""
                    } ${isCta ? "pill-cta" : ""}`}
                    onClick={(e) => handleNavClick(e, item, index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    aria-label={item.label}
                  >
                    <span className="prirq-pill-text">{item.label}</span>
                    {isCta && !isActive && <span className="cta-ambient-glow" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* =========================================================================
          MOBILE COMPACT PILL CONTROL & DRAWER
          ========================================================================= */}
      <div className="mobile-only prirq-mobile-nav-wrapper">
        {/* Compact Floating Bottom Trigger Pill */}
        <button
          type="button"
          className={`prirq-mobile-pill-trigger ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="mobile-pill-status-dot" />
          <span className="mobile-pill-label">
            {mobileMenuOpen ? "CLOSE" : "MENU"}
          </span>
          <div className="mobile-hamburger-lines">
            <span className="line line-1" />
            <span className="line line-2" />
          </div>
        </button>

        {/* Mobile Popover Menu Overlay */}
        <div
          className={`prirq-mobile-popover ${mobileMenuOpen ? "active" : ""}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="prirq-mobile-popover-inner">
            <div className="mobile-popover-header">
              <span className="mobile-popover-title">PRIRP NAVIGATION</span>
            </div>

            <ul className="prirq-mobile-menu-list">
              {NAV_ITEMS.map((item, index) => {
                const isActive = activeIndex === index;
                const isCta = !!item.isCta;

                return (
                  <li key={item.id} className="mobile-menu-item">
                    <a
                      href={item.isRoute ? item.path : `#${item.targetId}`}
                      className={`mobile-menu-link ${isActive ? "active" : ""} ${
                        isCta ? "mobile-cta-link" : ""
                      }`}
                      onClick={(e) => handleNavClick(e, item, index)}
                    >
                      <span className="mobile-item-index">0{index + 1}</span>
                      <span className="mobile-item-label">{item.label}</span>
                      {isActive && <span className="mobile-item-active-dot" />}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
