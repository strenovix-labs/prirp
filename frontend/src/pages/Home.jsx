import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ScrollHero from "../components/ScrollHero";
import ProductDetails from "../sections/ProductDetails";
import ContentSections from "../components/ContentSections";

export default function Home({ onOpenCheckout }) {
  const location = useLocation();

  useEffect(() => {
    const targetId =
      location.state?.scrollTo ||
      (location.hash ? location.hash.replace("#", "") : null);
    const itemId = location.state?.itemId;

    if (targetId) {
      const timer = setTimeout(() => {
        if (itemId === "order" || targetId === "product") {
          const productSection =
            document.getElementById("product") ||
            document.querySelector(".product-details-track");
          if (productSection) {
            const top = productSection.getBoundingClientRect().top + window.scrollY;
            const totalScrollable = productSection.offsetHeight - window.innerHeight;
            window.scrollTo({ top: top + totalScrollable * 0.85, behavior: "smooth" });
            return;
          }
        }

        if (targetId === "hero-stage" || targetId === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        let targetElement = document.getElementById(targetId);
        if (!targetElement) {
          if (targetId === "story" || targetId === "story-section") {
            targetElement =
              document.getElementById("story-section") ||
              document.getElementById("story") ||
              document.querySelector(".story-section");
          } else if (
            targetId === "ingredients" ||
            targetId === "ingredients-section"
          ) {
            targetElement =
              document.getElementById("ingredients-section") ||
              document.getElementById("ingredients") ||
              document.querySelector(".ingredients-section");
          } else if (targetId === "why-us" || targetId === "why-section") {
            targetElement =
              document.getElementById("why-section") ||
              document.getElementById("why-us") ||
              document.querySelector(".why-section");
          }
        }

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);

      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      {/* =========================
          HERO: 240-FRAME SCROLL ANIMATION
      ========================= */}
      <ScrollHero />

      {/* =========================
          PRODUCT DETAILS: Scroll-controlled frames + specs
      ========================= */}
      <ProductDetails onOpenCheckout={onOpenCheckout} />

      {/* =========================
          STORY / INGREDIENTS / WHY US / NEWSLETTER / FOOTER
      ========================= */}
      <ContentSections onOpenCheckout={onOpenCheckout} />
    </>
  );
}
