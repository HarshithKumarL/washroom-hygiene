"use client";

import { Tabs, Tab, Box } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ViewListIcon from "@mui/icons-material/ViewList";
import DownloadIcon from "@mui/icons-material/Download";

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
          : pathname.startsWith("/dashboard/analytics")
            ? 3
            : 0;

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) router.push("/dashboard");
    if (newValue === 1) router.push("/dashboard/records");
    if (newValue === 2) router.push("/dashboard/reports");
    if (newValue === 3) router.push("/dashboard/analytics");
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
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: { xs: 1, sm: 2 },
          "& .MuiTab-root": {
            minHeight: { xs: 56, sm: 64 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#F6821F",
            height: 3,
          },
          "& .Mui-selected": {
            color: "#F6821F !important",
          },
        }}
      >
        <Tab
          icon={<AddCircleIcon />}
          iconPosition="start"
          label="Add Record"
          sx={{ textTransform: "none" }}
        />
        <Tab
          icon={<ViewListIcon />}
          iconPosition="start"
          label="View Records"
          sx={{ textTransform: "none" }}
        />
        <Tab
          icon={<DownloadIcon />}
          iconPosition="start"
          label="Download Report"
          sx={{ textTransform: "none" }}
        />
        <Tab
          icon={<AssessmentIcon />}
          iconPosition="start"
          label="Analytics"
          sx={{ textTransform: "none" }}
        />
      </Tabs>
    </Box>
  );
}
