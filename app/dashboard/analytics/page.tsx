"use client";

import React, { useEffect, useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Inventory2,
  LocationOn,
  People,
} from "@mui/icons-material";

type AnalyticsData = {
  totalProducts: number;
  totalRecords: number;
  totalSites: number;
  totalEmployees: number;
  productDistribution: { name: string; quantity: number; count: number }[];
  siteDistribution: { name: string; count: number }[];
  employeeDistribution: { name: string; count: number; products: number }[];
  dailyTrend: { date: string; records: number; products: number }[];
  monthlyTrend: { month: string; records: number; products: number }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month",
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const THEME_COLOR = "#F6821F";
  const COLORS = [
    "#F6821F",
    "#FF9944",
    "#FFB066",
    "#FFC788",
    "#FFDEAA",
    "#4CAF50",
    "#2196F3",
    "#9C27B0",
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${timeRange}`);
      const json = await res.json();

      if (!res.ok) {
        console.error("❌ API Error:", json);
        setData(null);
        return;
      }

      console.log("✅ Data loaded:", json.totalRecords);
      setData(json);
    } catch (err) {
      console.error("💥 Fetch error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress sx={{ color: THEME_COLOR }} />
            <Typography>Loading analytics…</Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography color="error">Failed to load analytics</Typography>
        </Paper>
      </Container>
    );
  }

  const {
    totalProducts = 0,
    totalRecords = 0,
    totalSites = 0,
    totalEmployees = 0,
    productDistribution = [],
    siteDistribution = [],
    employeeDistribution = [],
    dailyTrend = [],
    monthlyTrend = [],
  } = data;

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 220px" },
        minWidth: { xs: 0, sm: 200 },
        background: `linear-gradient(135deg, ${color}20, ${color}05)`,
        border: `1px solid ${color}40`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: "default" } }}>
        <Box
          sx={{
            backgroundColor: color,
            width: { xs: 40, sm: 44 },
            height: { xs: 40, sm: 44 },
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight={700}
          color={color}
        >
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2">{title}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h6"}
            fontWeight={600}
            sx={{ flex: 1 }}
          >
            Analytics & Insights
          </Typography>

          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, v) => v && setTimeRange(v)}
            size={isMobile ? "small" : "medium"}
            sx={{ flexShrink: 0 }}
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* METRICS */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <StatCard
            title="Products Distributed"
            value={totalProducts}
            icon={
              <Inventory2
                sx={{
                  color: "#fff",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              />
            }
            color={THEME_COLOR}
          />
          <StatCard
            title="Total Records"
            value={totalRecords}
            icon={
              <TrendingUp
                sx={{
                  color: "#fff",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              />
            }
            color="#2196F3"
          />
          <StatCard
            title="Active Sites"
            value={totalSites}
            icon={
              <LocationOn
                sx={{
                  color: "#fff",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              />
            }
            color="#4CAF50"
          />
          <StatCard
            title="Employees"
            value={totalEmployees}
            icon={
              <People
                sx={{
                  color: "#fff",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              />
            }
            color="#9C27B0"
          />
        </Box>

        {/* PRODUCT + SITE CHARTS */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 3,
            mb: 4,
          }}
        >
          <Box sx={{ flex: "1 1 100%", minWidth: 300 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography
                  fontWeight={600}
                  mb={2}
                  variant={isMobile ? "h6" : "h5"}
                >
                  Product Distribution
                </Typography>
                <Box sx={{ height: { xs: 250, sm: 300 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productDistribution.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={isMobile ? -30 : -45}
                        textAnchor="end"
                        height={isMobile ? 60 : 90}
                        fontSize={isMobile ? "0.8rem" : "0.875rem"}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="quantity"
                        fill={THEME_COLOR}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: "1 1 100%", minWidth: 300 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography
                  fontWeight={600}
                  mb={2}
                  variant={isMobile ? "h6" : "h5"}
                >
                  Distribution by Site
                </Typography>
                <Box sx={{ height: { xs: 250, sm: 300 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={siteDistribution.slice(0, 8)}
                        dataKey="count"
                        outerRadius={isMobile ? "75%" : 90}
                        label={isMobile ? false : true}
                      >
                        {siteDistribution.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* EMPLOYEE ACTIVITY */}
        <Box sx={{ mb: 4 }}>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography
                fontWeight={600}
                mb={2}
                variant={isMobile ? "h6" : "h5"}
              >
                Employee Activity
              </Typography>
              <Box sx={{ height: { xs: 280, sm: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      employeeDistribution.length
                        ? employeeDistribution.slice(0, 15)
                        : [{ name: "No Data", count: 0, products: 0 }]
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={isMobile ? -30 : -45}
                      textAnchor="end"
                      height={isMobile ? 70 : 90}
                      fontSize={isMobile ? "0.75rem" : "0.8rem"}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#2196F3" name="Records" />
                    <Bar
                      dataKey="products"
                      fill={THEME_COLOR}
                      name="Products"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* TREND ANALYSIS */}
        <Box>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography
                fontWeight={600}
                mb={2}
                variant={isMobile ? "h6" : "h5"}
              >
                Trend Analysis
              </Typography>
              <Box sx={{ height: { xs: 280, sm: 350 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeRange === "year" ? monthlyTrend : dailyTrend}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey={timeRange === "year" ? "month" : "date"}
                      angle={isMobile ? -30 : 0}
                      fontSize={isMobile ? "0.8rem" : "0.875rem"}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      dataKey="records"
                      stroke="#2196F3"
                      fillOpacity={0.3}
                      fill="#2196F330"
                      name="Records"
                    />
                    <Area
                      dataKey="products"
                      stroke={THEME_COLOR}
                      fillOpacity={0.3}
                      fill="#F6821F30"
                      name="Products"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Container>
  );
}
