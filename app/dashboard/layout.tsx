import Header from "@/components/Header";
import DashboardTabs from "@/components/DashboardTabs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <DashboardTabs />

      <div style={{ width: "100%", marginTop: "24px", marginBottom: "24px" }}>
        {children}
      </div>
    </>
  );
}
