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
  const cx = 170;
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
      width={380}
      height={380}
      viewBox="0 0 350 350"
      style={{ display: "block", margin: "auto" }}
    >
      <circle cx={cx} cy={cy} r={radiusDoubleOuter} fill="#222" />

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

        const doubleColor = isDark ? "#d32f2f" : "#ffebee";
        const tripleColor = isDark ? "#d32f2f" : "#ffebee";
        const singleDarkColor = isDark ? "#111" : "#fff";
        const singleLightColor = isDark ? "#444" : "#eee";

        return (
          <g key={i}>
            <path
              d={doublePath}
              fill={doubleColor}
              stroke="#222"
              strokeWidth="0.5"
              onClick={() => handleClick(value, 2)}
              style={{ cursor: disabled ? "default" : "pointer" }}
            />
            <path
              d={singleOuterPath}
              fill={singleLightColor}
              stroke="#222"
              strokeWidth="0.5"
              onClick={() => handleClick(value, 1)}
              style={{ cursor: disabled ? "default" : "pointer" }}
            />
            <path
              d={triplePath}
              fill={tripleColor}
              stroke="#222"
              strokeWidth="0.5"
              onClick={() => handleClick(value, 3)}
              style={{ cursor: disabled ? "default" : "pointer" }}
            />
            <path
              d={singleInnerPath}
              fill={singleDarkColor}
              stroke="#222"
              strokeWidth="0.5"
              onClick={() => handleClick(value, 1)}
              style={{ cursor: disabled ? "default" : "pointer" }}
            />
          </g>
        );
      })}

      <circle
        cx={cx}
        cy={cy}
        r={radiusOuterBull}
        fill="#00b894"
        stroke="#222"
        strokeWidth="1"
        onClick={() => handleClick(25, 1)}
        style={{ cursor: disabled ? "default" : "pointer" }}
      />

      <circle
        cx={cx}
        cy={cy}
        r={radiusBull}
        fill="#d32f2f"
        stroke="#222"
        strokeWidth="1"
        onClick={() => handleClick(50, 1)}
        style={{ cursor: disabled ? "default" : "pointer" }}
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
            fill="#111"
            textAnchor="middle"
            pointerEvents="none"
            style={{ userSelect: "none" }}
          >
            {value}
          </text>
        );
      })}
    </svg>
  );
}
