"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CleanHandsIcon from "@mui/icons-material/CleanHands";
import VerifiedIcon from "@mui/icons-material/Verified";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SecurityIcon from "@mui/icons-material/Security";

export default function HomePage() {
  const router = useRouter();

  const BRAND_ORANGE = "#F6821F";
  const DARK_TEXT = "#1a1a1a";
  const LIGHT_BG = "#f8f9fa";

  const features = [
    {
      icon: <InventoryIcon sx={{ fontSize: 48, color: BRAND_ORANGE }} />,
      title: "Stock Management",
      description:
        "Track washroom supplies, hygiene products, and cleaning materials in real-time across all your facilities.",
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 48, color: BRAND_ORANGE }} />,
      title: "Detailed Reports",
      description:
        "Generate comprehensive Excel reports on product distribution and site-wise consumption.",
    },
    {
      icon: <CleanHandsIcon sx={{ fontSize: 48, color: BRAND_ORANGE }} />,
      title: "Hygiene Standards",
      description:
        "Ensure timely restocking and maintain the highest cleanliness standards.",
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 48, color: BRAND_ORANGE }} />,
      title: "Quality Assurance",
      description:
        "Monitor product quality and ensure compliance with health regulations.",
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: BRAND_ORANGE }} />,
      title: "Usage Analytics",
      description:
        "Analyze consumption patterns and optimize inventory levels.",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: BRAND_ORANGE }} />,
      title: "Secure Records",
      description:
        "Maintain auditable, date-stamped records with accountability.",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* HERO */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${BRAND_ORANGE}, #ff9944)`,
          color: "#fff",
          py: { xs: 8, md: 12 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
              flexDirection: { xs: "column", md: "row" }, // responsive
            }}
          >
            {/* LEFT IMAGE */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src="/WHC_dp.png" // 👈 place image in /public/images
                alt="Washroom hygiene inventory"
                sx={{
                  width: "100%",
                  maxWidth: 480,
                }}
              />
            </Box>

            {/* RIGHT CONTENT */}
            <Box
              sx={{
                flex: 1,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2.2rem", md: "3.5rem" },
                  mb: 3,
                }}
              >
                Washroom Hygiene Inventory
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  maxWidth: 520,
                  mb: 5,
                  opacity: 0.95,
                  fontWeight: 300,
                  mx: { xs: "auto", md: 0 },
                }}
              >
                Professional inventory management for hygiene supplies across
                all facilities.
              </Typography>

              <Box
                display="flex"
                gap={2}
                justifyContent={{ xs: "center", md: "flex-start" }}
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/dashboard")}
                  sx={{
                    backgroundColor: "#fff",
                    color: BRAND_ORANGE,
                    px: 5,
                    borderRadius: "50px",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  Go to Dashboard
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "#fff",
                    color: "#fff",
                    px: 5,
                    borderRadius: "50px",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Everything You Need
          </Typography>
          <Typography sx={{ color: "#666" }}>
            Tools to manage hygiene stock efficiently
          </Typography>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
          {features.map((f) => (
            <Box
              key={f.title}
              sx={{
                flex: "1 1 300px",
                maxWidth: 360,
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  borderRadius: 3,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 30px rgba(246,130,31,0.15)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 4 }}>
                  <Box mb={2}>{f.icon}</Box>

                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1, color: DARK_TEXT }}
                  >
                    {f.title}
                  </Typography>

                  <Typography sx={{ color: "#666", fontSize: 14 }}>
                    {f.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* STATS */}
      <Box sx={{ backgroundColor: LIGHT_BG, py: 8 }}>
        <Container maxWidth="lg">
          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="space-between"
            textAlign="center"
            gap={4}
          >
            {[
              { value: "100%", label: "Inventory Visibility" },
              { value: "24/7", label: "Real-Time Tracking" },
              { value: "∞", label: "Sites Supported" },
            ].map((s) => (
              <Box key={s.label} flex="1 1 220px">
                <Typography
                  variant="h2"
                  sx={{ color: BRAND_ORANGE, fontWeight: 700 }}
                >
                  {s.value}
                </Typography>
                <Typography sx={{ color: "#666" }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Box
          sx={{
            backgroundColor: BRAND_ORANGE,
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            textAlign: "center",
            color: "#fff",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Get Started?
          </Typography>

          <Typography sx={{ mb: 4, opacity: 0.95 }}>
            Start managing hygiene stock today
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/dashboard")}
            sx={{
              backgroundColor: "#fff",
              color: BRAND_ORANGE,
              px: 6,
              borderRadius: "50px",
              fontWeight: 600,
            }}
          >
            Open Dashboard
          </Button>
        </Box>
      </Container>

      {/* FOOTER */}
      <Box sx={{ backgroundColor: DARK_TEXT, py: 4 }}>
        <Typography textAlign="center" sx={{ color: "#fff", opacity: 0.8 }}>
          © {new Date().getFullYear()} Washroom Hygiene Inventory
        </Typography>
      </Box>
    </Box>
  );
}
