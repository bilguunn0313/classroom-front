"use client";

export default function MainTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        animation: "pageEnter 0.35s ease-out both",
      }}
    >
      {children}
    </div>
  );
}
