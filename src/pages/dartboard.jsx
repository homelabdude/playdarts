import React from "react";

const SECTORS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

const SECTOR_ANGLE = 360 / SECTORS.length;

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(cx, cy, radiusInner, radiusOuter, startAngle, endAngle) {
  const p1 = polarToCartesian(cx, cy, radiusOuter, endAngle);
  const p2 = polarToCartesian(cx, cy, radiusOuter, startAngle);
  const p3 = polarToCartesian(cx, cy, radiusInner, startAngle);
  const p4 = polarToCartesian(cx, cy, radiusInner, endAngle);

  return `
    M ${p1.x} ${p1.y}
    A ${radiusOuter} ${radiusOuter} 0 0 0 ${p2.x} ${p2.y}
    L ${p3.x} ${p3.y}
    A ${radiusInner} ${radiusInner} 0 0 1 ${p4.x} ${p4.y}
    Z
  `;
}

export default function Dartboard({ onHit, disabled }) {
  const cx = 165;
  const cy = 165;

  // Radii for rings (adjusted)
  const radiusDoubleOuter = 140;
  const radiusDoubleInner = 120;

  const radiusSingleOuter = 120;
  const radiusSingleInner = 70;

  const radiusTripleOuter = 70;
  const radiusTripleInner = 53;

  const radiusOuterBull = 30;
  const radiusBull = 12;

  const handleClick = (value, multiplier) => {
    if (disabled) return;
    onHit({ value, multiplier });
  };

  return (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 350 350"
      style={{
        display: "block",
        margin: "12px auto",
        filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.12))",
        borderRadius: "50%",
        maxWidth: "340px",
        width: "100%",
      }}
    >
      <circle cx={cx} cy={cy} r={radiusDoubleOuter + 5} fill="#0f172a" />
      <circle cx={cx} cy={cy} r={radiusDoubleOuter} fill="#1e293b" />

      {SECTORS.map((value, i) => {
        const startAngle = i * SECTOR_ANGLE - 90;
        const endAngle = startAngle + SECTOR_ANGLE;

        const isDark = i % 2 === 0;

        const doublePath = describeArc(
          cx,
          cy,
          radiusDoubleInner,
          radiusDoubleOuter,
          startAngle,
          endAngle
        );

        const singleOuterPath = describeArc(
          cx,
          cy,
          radiusSingleInner,
          radiusSingleOuter,
          startAngle,
          endAngle
        );

        const triplePath = describeArc(
          cx,
          cy,
          radiusTripleInner,
          radiusTripleOuter,
          startAngle,
          endAngle
        );

        const singleInnerPath = describeArc(
          cx,
          cy,
          radiusTripleOuter,
          radiusSingleInner,
          startAngle,
          endAngle
        );

        const doubleColor = isDark ? "#dc2626" : "#fef2f2";
        const tripleColor = isDark ? "#dc2626" : "#fef2f2";
        const singleDarkColor = isDark ? "#0f172a" : "#f8fafc";
        const singleLightColor = isDark ? "#334155" : "#e2e8f0";

        return (
          <g key={i}>
            <path
              d={doublePath}
              fill={doubleColor}
              stroke="#0f172a"
              strokeWidth="0.8"
              onClick={() => handleClick(value, 2)}
              style={{
                cursor: disabled ? "default" : "pointer",
                transition: "opacity 0.15s ease",
                opacity: disabled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!disabled) e.target.style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                if (!disabled) e.target.style.opacity = "1";
              }}
            />
            <path
              d={singleOuterPath}
              fill={singleLightColor}
              stroke="#0f172a"
              strokeWidth="0.8"
              onClick={() => handleClick(value, 1)}
              style={{
                cursor: disabled ? "default" : "pointer",
                transition: "opacity 0.15s ease",
                opacity: disabled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!disabled) e.target.style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                if (!disabled) e.target.style.opacity = "1";
              }}
            />
            <path
              d={triplePath}
              fill={tripleColor}
              stroke="#0f172a"
              strokeWidth="0.8"
              onClick={() => handleClick(value, 3)}
              style={{
                cursor: disabled ? "default" : "pointer",
                transition: "opacity 0.15s ease",
                opacity: disabled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!disabled) e.target.style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                if (!disabled) e.target.style.opacity = "1";
              }}
            />
            <path
              d={singleInnerPath}
              fill={singleDarkColor}
              stroke="#0f172a"
              strokeWidth="0.8"
              onClick={() => handleClick(value, 1)}
              style={{
                cursor: disabled ? "default" : "pointer",
                transition: "opacity 0.15s ease",
                opacity: disabled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!disabled) e.target.style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                if (!disabled) e.target.style.opacity = "1";
              }}
            />
          </g>
        );
      })}

      <circle
        cx={cx}
        cy={cy}
        r={radiusOuterBull}
        fill="#10b981"
        stroke="#0f172a"
        strokeWidth="1.5"
        onClick={() => handleClick(25, 1)}
        style={{
          cursor: disabled ? "default" : "pointer",
          transition: "opacity 0.15s ease",
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.target.style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          if (!disabled) e.target.style.opacity = "1";
        }}
      />

      <circle
        cx={cx}
        cy={cy}
        r={radiusBull}
        fill="#dc2626"
        stroke="#0f172a"
        strokeWidth="1.5"
        onClick={() => handleClick(50, 1)}
        style={{
          cursor: disabled ? "default" : "pointer",
          transition: "opacity 0.15s ease",
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.target.style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          if (!disabled) e.target.style.opacity = "1";
        }}
      />

      {/* Number placement */}
      {SECTORS.map((value, i) => {
        // Calculate the center angle of sector i, adjusted so 20 is at top (-90deg)
        const angle = i * SECTOR_ANGLE - 90 + SECTOR_ANGLE / 2;

        const numberRadius = radiusDoubleOuter + 15;
        const textPos = polarToCartesian(cx, cy, numberRadius, angle);

        return (
          <text
            key={"num" + i}
            x={textPos.x}
            y={textPos.y + 6}
            fontSize="18"
            fontWeight="bold"
            fill="#f8fafc"
            textAnchor="middle"
            pointerEvents="none"
            style={{
              userSelect: "none",
              filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))",
            }}
          >
            {value}
          </text>
        );
      })}
    </svg>
  );
}
