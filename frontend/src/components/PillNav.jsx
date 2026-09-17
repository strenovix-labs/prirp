import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../context/AuthContext";
import LogoutModal from "./LogoutModal";
import "./PillNav.css";

const PillNav = ({
  logo,
  logoAlt = "PRIRP Logo",
  items = [
    { label: "HOME", href: "#home", id: "home", targetId: "home" },
    { label: "STORY", href: "#story", id: "story", targetId: "story-section" },
    { label: "FORMULA", href: "#ingredients", id: "ingredients", targetId: "ingredients-section" },
    { label: "WHY PRIRP", href: "#why-us", id: "why-us", targetId: "why-section" },
    { label: "MERCHANDISE", href: "/merchandise", isRoute: true },
    { label: "ORDER PRIRP", href: "#product", id: "order", targetId: "product", isCta: true },
  ],
  activeHref,
  className = "",
  ease = "power2.out",
  baseColor = "rgba(4, 4, 6, 0.92)",
  pillColor = "transparent",
  pillTextColor = "#d1b2b2",
  hoveredPillTextColor = "#ffffff",
  onMobileMenuClick,
}) => {
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isAuthHovered, setIsAuthHovered] = useState(false);

  const circleRefs = useRef([]);
  const logoRef = useRef(null);
  const logoImgRef = useRef(null);
  const navItemsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isSubPage = location.pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEnter = (i) => {
    const circle = circleRefs.current[i];
    if (!circle) return;

    gsap.killTweensOf(circle);
    gsap.fromTo(
      circle,
      { scale: 0, opacity: 0.2 },
      {
        scale: 2.8,
        opacity: 1,
        duration: 0.35,
        ease,
      }
    );
  };

  const handleLeave = (i) => {
    const circle = circleRefs.current[i];
    if (!circle) return;

    gsap.killTweensOf(circle);
    gsap.to(circle, {
      scale: 0,
      opacity: 0,
      duration: 0.25,
      ease,
    });
  };

  const handleLogoEnter = () => {
    if (logoImgRef.current) {
      gsap.killTweensOf(logoImgRef.current);
      gsap.fromTo(
        logoImgRef.current,
        { scale: 1, rotate: 0 },
        {
          scale: 1.15,
          rotate: -6,
          duration: 0.3,
          ease: "back.out(2)",
          yoyo: true,
          repeat: 1,
        }
      );
    }
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const menu = mobileMenuRef.current;
    const lines = hamburgerRef.current?.querySelectorAll(".hamburger-line");

    if (lines) {
      if (newState) {
        gsap.to(lines[0], { rotate: 45, y: 3, duration: 0.2 });
        gsap.to(lines[1], { rotate: -45, y: -3, duration: 0.2 });
      } else {
        gsap.to(lines, { rotate: 0, y: 0, duration: 0.2 });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: "bottom center",
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: "bottom center",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };

  const handleItemClick = (e, item, index) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (item.isRoute) {
      setActiveIndex(index);
      navigate(item.href || "/merchandise");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (isSubPage) {
      setActiveIndex(index);
      navigate("/", { state: { scrollTo: item.targetId, itemId: item.id } });
      return;
    }

    setActiveIndex(index);

    if (item.id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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

    let targetElement = document.getElementById(item.targetId);
    if (!targetElement && item.targetId === "story-section") {
      targetElement = document.querySelector(".story-section") || document.getElementById("story");
    } else if (!targetElement && item.targetId === "ingredients-section") {
      targetElement = document.querySelector(".ingredients-section") || document.getElementById("ingredients");
    } else if (!targetElement && item.targetId === "why-section") {
      targetElement = document.querySelector(".why-section") || document.getElementById("why-us");
    }

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resolvedPillTextColor = pillTextColor ?? baseColor;

  const cssVars = {
    ["--base"]: baseColor,
    ["--pill-bg"]: isScrolled ? "#000000" : pillColor,
    ["--hover-text"]: isScrolled ? "#d1b2b2" : hoveredPillTextColor,
    ["--pill-text"]: resolvedPillTextColor,
  };

  const firstName = user?.full_name?.trim() ? user.full_name.trim().split(" ")[0].toUpperCase() : "VIP";

  return (
    <>
      <div className={`pill-nav-container ${isScrolled ? "is-scrolled" : ""}`}>
        <nav
          className={`pill-nav ${isScrolled ? "nav-scrolled-red" : ""} ${
            isNavHovered ? "is-expanded" : "is-shrunk"
          } ${className}`}
          aria-label="Primary"
          style={cssVars}
          onMouseEnter={() => setIsNavHovered(true)}
          onMouseLeave={() => setIsNavHovered(false)}
        >
          <Link
            className="pill-logo"
            to="/"
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            onClick={(e) => handleItemClick(e, items[0], 0)}
            role="menuitem"
            ref={(el) => {
              logoRef.current = el;
            }}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          </Link>

          <div className="pill-nav-items desktop-only" ref={navItemsRef}>
            <ul className="pill-list" role="menubar">
              {items.map((item, i) => {
                const isActive =
                  activeHref !== undefined
                    ? activeHref === item.href
                    : activeIndex === i;

                return (
                  <li
                    key={item.href || `item-${i}`}
                    className={`pill-item-wrapper ${
                      isActive ? "is-active-item" : "is-inactive-item"
                    }`}
                    role="none"
                  >
                    <a
                      role="menuitem"
                      href={item.href}
                      className={`pill${isActive ? " is-active" : ""}${
                        item.isCta ? " is-cta-pill" : ""
                      }`}
                      aria-label={item.label}
                      onClick={(e) => handleItemClick(e, item, i)}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      <span
                        className="hover-circle"
                        aria-hidden="true"
                        ref={(el) => {
                          circleRefs.current[i] = el;
                        }}
                      />
                      <span className="label-stack">
                        <span className="pill-label">{item.label}</span>
                        <span className="pill-label-hover" aria-hidden="true">
                          {item.label}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}

              {/* User Account / Sign In Pill */}
              <li className="pill-item-wrapper auth-pill-wrapper" role="none">
                <button
                  type="button"
                  className="pill is-cta-pill auth-nav-pill"
                  onClick={isAuthenticated ? () => setIsLogoutModalOpen(true) : () => openAuthModal()}
                  onMouseEnter={() => setIsAuthHovered(true)}
                  onMouseLeave={() => setIsAuthHovered(false)}
                  title={isAuthenticated ? `Connected as ${user?.email}. Click to sign out.` : "Sign in / Register"}
                >
                  <span className="auth-pill-text font-mono">
                    {isAuthenticated
                      ? isAuthHovered
                        ? "LOG OUT ?"
                        : `ACCOUNT [${firstName}]`
                      : "SIGN IN"}
                  </span>
                </button>
              </li>
            </ul>

            {/* Mini Expand Cue Indicator */}
            <div className="pill-shrunk-cue" aria-hidden="true">
              <span className="cue-dot" />
              <span className="cue-dot" />
              <span className="cue-dot" />
            </div>
          </div>

          <button
            className="mobile-menu-button mobile-only"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            ref={hamburgerRef}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </nav>

        <div
          className="mobile-menu-popover mobile-only"
          ref={mobileMenuRef}
          style={cssVars}
        >
          <ul className="mobile-menu-list">
            {items.map((item, i) => {
              const isActive =
                activeHref !== undefined
                  ? activeHref === item.href
                  : activeIndex === i;

              return (
                <li key={item.href || `mobile-item-${i}`}>
                  <a
                    href={item.href}
                    className={`mobile-menu-link${isActive ? " is-active" : ""}${
                      item.isCta ? " is-mobile-cta" : ""
                    }`}
                    onClick={(e) => handleItemClick(e, item, i)}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                className="mobile-menu-link is-mobile-cta"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isAuthenticated) {
                    setIsLogoutModalOpen(true);
                  } else {
                    openAuthModal();
                  }
                }}
              >
                {isAuthenticated ? `LOG OUT (${firstName})` : "SIGN IN / REGISTER"}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default PillNav;
