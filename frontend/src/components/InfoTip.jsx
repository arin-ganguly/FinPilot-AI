import { useEffect, useRef, useState } from "react";

function InfoTip({ text }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <span
      ref={wrapperRef}
      className={`info-tip ${isOpen ? "is-open" : ""}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="info-tip-trigger"
        type="button"
        aria-label="Show explanation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {"\u2139\uFE0F"}
      </button>
      <span className="info-tip-bubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}

export default InfoTip;
