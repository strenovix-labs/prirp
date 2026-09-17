import "./PrirqLogo.css";

export default function PrirqLogo({ size = "medium", className = "" }) {
  return (
    <div className={`prirq-logo-container ${size} ${className}`}>
      <img
        src="/prirplogoo.png"
        alt="PRIRP"
        className="prirq-logo-img"
      />
    </div>
  );
}

