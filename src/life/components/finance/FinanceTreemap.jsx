import React, { useMemo } from "react";
import { Treemap, ResponsiveContainer } from "recharts";

/** FinanceTreemap — levende treemap: hoeveel procent van het TOTAAL INKOMEN
 *  elke portefeuille verbruikt (maandelijkse reservering). Portfolio-kleuren,
 *  afgeronde tegels, past meteen aan (geen animatie-vertraging). */
export default function FinanceTreemap({ portfolios, totalIncome }) {
  const data = useMemo(() => (portfolios || []).filter((p) => !p.archived).map((p) => ({
    name: p.name,
    size: Math.max(Number(p.monthly_reservation_actual) || 0, 0.001),
    color: p.color || "hsl(var(--ridge))",
    res: Number(p.monthly_reservation_actual) || 0,
  })), [portfolios]);

  const income = Math.max(Number(totalIncome) || 0, 0.001);

  const renderTile = (props) => {
    const { x, y, width, height, name, color, res } = props;
    if (!width || !height) return null;
    const pct = Math.round((Number(res || 0) / income) * 100);
    const rx = Math.min(width, height) * 0.16;
    const label = name ? name.split(" ")[0] : "";
    return (
      <g>
        <rect x={x + 2} y={y + 2} width={Math.max(width - 4, 0)} height={Math.max(height - 4, 0)} rx={rx} ry={rx} fill={color || "hsl(var(--ridge))"} stroke="hsl(var(--ivory))" strokeWidth={2} />
        {width > 46 && height > 34 && (
          <>
            <text x={x + width / 2} y={y + height / 2 - 4} textAnchor="middle" fill="hsl(var(--ivory))" fontSize={11} fontWeight={700} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }}>{label}</text>
            <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="hsl(var(--ivory))" fontSize={13} fontWeight={600} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }}>{pct}%</text>
          </>
        )}
      </g>
    );
  };

  return (
    <div style={{ width: "100%", height: 230 }}>
      <ResponsiveContainer>
        <Treemap data={data} dataKey="size" aspectRatio={4 / 3} content={renderTile} isAnimationActive={false} />
      </ResponsiveContainer>
    </div>
  );
}