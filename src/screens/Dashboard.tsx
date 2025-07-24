import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  Container,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { incomeService, Company, IncomeDataPoint } from "../services/incomeApi";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [incomeData, setIncomeData] = useState<IncomeDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const companiesData = await incomeService.getCompanies();
        setCompanies(companiesData);
        if (companiesData.length > 0) {
          setSelectedCompany(companiesData[0].id.toString());
        }
      } catch (err) {
        setError("Failed to fetch companies");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch income data when company changes
  useEffect(() => {
    const fetchIncomeData = async () => {
      if (!selectedCompany) return;

      try {
        setLoading(true);
        const data = await incomeService.getCompanyIncome(
          parseInt(selectedCompany)
        );
        setIncomeData(data);

        const years = Array.from(
          new Set(
            data.map((item) =>
              incomeService.getYearFromPeriod(item.periodStart).toString()
            )
          )
        ).sort();
        setSelectedYears(years);
      } catch (err) {
        setError("Failed to fetch income data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeData();
  }, [selectedCompany]);

  const handleCompanyChange = (event: SelectChangeEvent) => {
    setSelectedCompany(event.target.value);
  };

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartType(event.target.value as "line" | "bar");
  };

  const handleYearToggle = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.filter((y) => y !== year)
        : [...prev, year].sort()
    );
  };

  const groupedData = incomeService.groupByYear(incomeData);
  const availableYears = Object.keys(groupedData).sort();
  const filteredData = selectedYears.reduce((acc, year) => {
    acc[year] = groupedData[parseInt(year)] || 0;
    return acc;
  }, {} as { [key: string]: number });

  // Prepare chart data
  const chartData = {
    labels: selectedYears,
    datasets: [
      {
        label: `Income - ${
          companies.find((c) => c.id === parseInt(selectedCompany))?.name ||
          "Unknown"
        }`,
        data: selectedYears.map((year) => filteredData[year]),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Annual Income Analysis",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "$" + value.toLocaleString();
          },
        },
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const latestIncome = incomeService.getLatestIncome(incomeData);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const previousIncome = incomeService.getPreviousIncome(incomeData);

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 4 }}
      ></Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                alignItems: "center",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Company</InputLabel>
                  <Select
                    value={selectedCompany}
                    label="Select Company"
                    onChange={handleCompanyChange}
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartType}
                    label="Chart Type"
                    onChange={handleChartTypeChange}
                  >
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="bar">Bar Chart</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" gutterBottom></Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {availableYears.map((year) => (
                    <Chip
                      key={year}
                      label={year}
                      onClick={() => handleYearToggle(year)}
                      color={
                        selectedYears.includes(year) ? "primary" : "default"
                      }
                      variant={
                        selectedYears.includes(year) ? "filled" : "outlined"
                      }
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Chart Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Income Trend Analysis
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 400, position: "relative" }}>
              {chartType === "line" ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom></Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {selectedYears.map((year) => {
                const income = filteredData[year] || 0;
                return (
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      flex: "1 1 200px",
                      minWidth: 0,
                    }}
                    key={year}
                  >
                    <Typography variant="h6" color="primary">
                      {year}
                    </Typography>
                    <Typography variant="body2">
                      ${income.toLocaleString()}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard;
