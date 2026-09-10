"use client";

export function PrintButton() {
  return (
    <div className="print-actions no-print">
      <button onClick={() => window.print()}>打印本页</button>
    </div>
  );
}
