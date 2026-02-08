"use client";

import { Tabs, Tab, Box } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // decide active tab based on URL
  const value =
    pathname === "/dashboard"
      ? 0
      : pathname.startsWith("/dashboard/records")
      ? 1
      : pathname.startsWith("/dashboard/reports")
      ? 2
      : 0;

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) router.push("/dashboard");
    if (newValue === 1) router.push("/dashboard/records");
    if (newValue === 2) router.push("/dashboard/reports");
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderBottom: "1px solid #e0e0e0",
        bgcolor: "#fafafa",
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ px: 2 }}
      >
        <Tab label="Add Record" />
        <Tab label="View Records" />
        <Tab label="Download Report" />
      </Tabs>
    </Box>
  );
}
