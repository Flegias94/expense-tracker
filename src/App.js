// src/App.js
import React, { useState, useEffect } from 'react';
import { Container, Grid, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useFormik } from 'formik';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parse, isValid, startOfMonth } from 'date-fns';
import './App.css';

function App() {
  const [summariesByMonth, setSummariesByMonth] = useState(() => {
    const savedSummaries = localStorage.getItem('summariesByMonth');
    return savedSummaries ? JSON.parse(savedSummaries) : {};
  });
  const [fields, setFields] = useState(() => {
    const savedFields = localStorage.getItem('fields');
    return savedFields ? JSON.parse(savedFields) : { income: 0, bills: 0, food: 0, other: 0 };
  });
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    localStorage.setItem('summariesByMonth', JSON.stringify(summariesByMonth));
    localStorage.setItem('fields', JSON.stringify(fields));
  }, [summariesByMonth, fields]);

  const formik = useFormik({
    initialValues: {
      income: '',
      bills: '',
      food: '',
      other: '',
    },
    onSubmit: (values, { resetForm }) => {
      const newIncome = parseFloat(values.income) || 0;
      const newBills = parseFloat(values.bills) || 0;
      const newFood = parseFloat(values.food) || 0;
      const newOther = parseFloat(values.other) || 0;

      const updatedFields = {
        income: fields.income + newIncome,
        bills: fields.bills + newBills,
        food: fields.food + newFood,
        other: fields.other + newOther,
      };

      const newSummary = {
        income: updatedFields.income,
        bills: updatedFields.bills,
        food: updatedFields.food,
        other: updatedFields.other,
        totalExpenses: updatedFields.bills + updatedFields.food + updatedFields.other,
        savings: updatedFields.income - (updatedFields.bills + updatedFields.food + updatedFields.other),
        date: format(new Date(), 'MM/dd/yyyy'),
      };

      const month = format(startOfMonth(new Date()), 'MM/yyyy'); // e.g., "07/2024"

      const updatedSummariesByMonth = {
        ...summariesByMonth,
        [month]: [newSummary], // Only keep the latest summary for the month
      };

      setFields(updatedFields);
      setSummariesByMonth(updatedSummariesByMonth);
      resetForm();
    },
  });

  const clearData = () => {
    setSummariesByMonth({});
    setFields({ income: 0, bills: 0, food: 0, other: 0 });
    localStorage.removeItem('summariesByMonth');
    localStorage.removeItem('fields');
    setSelectedMonth(null);
  };

  const recordedMonths = Object.keys(summariesByMonth).sort((a, b) => parse(a, 'MM/yyyy', new Date()) - parse(b, 'MM/yyyy', new Date()));

  const selectedMonthSummaries = selectedMonth ? summariesByMonth[selectedMonth] : [];

  const getCategoryBreakdown = (summaries) => {
    const breakdown = { bills: { total: 0, count: 0 }, food: { total: 0, count: 0 }, other: { total: 0, count: 0 } };
    summaries.forEach((summary) => {
      breakdown.bills.total += summary.bills;
      breakdown.bills.count += summary.bills > 0 ? 1 : 0;
      breakdown.food.total += summary.food;
      breakdown.food.count += summary.food > 0 ? 1 : 0;
      breakdown.other.total += summary.other;
      breakdown.other.count += summary.other > 0 ? 1 : 0;
    });
    return breakdown;
  };

  const categoryBreakdown = getCategoryBreakdown(selectedMonthSummaries);

  const getMonthName = (month) => {
    const date = parse(`${month}`, 'MM/yyyy', new Date());
    const isValidDate = isValid(date);
    console.log(`Month: ${month}, Parsed Date: ${date}, Is Valid: ${isValidDate}`);
    return isValidDate ? format(date, 'MMMM yyyy') : 'Invalid Date';
  };

  console.log("Summaries by Month:", summariesByMonth);
  console.log("Selected Month:", selectedMonth);

  return (
    <Container>
      <header className="App-header">
        <Typography variant="h1" className="title">Income and Expense Tracker</Typography>
      </header>
      <main className="main-content">
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Income"
                name="income"
                type="number"
                inputProps={{ step: "0.01" }}
                onChange={formik.handleChange}
                value={formik.values.income}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bills"
                name="bills"
                type="number"
                inputProps={{ step: "0.01" }}
                onChange={formik.handleChange}
                value={formik.values.bills}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Food"
                name="food"
                type="number"
                inputProps={{ step: "0.01" }}
                onChange={formik.handleChange}
                value={formik.values.food}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Other"
                name="other"
                type="number"
                inputProps={{ step: "0.01" }}
                onChange={formik.handleChange}
                value={formik.values.other}
              />
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" color="primary" type="submit">
                Save Summary
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" color="secondary" onClick={clearData}>
                Clear Data
              </Button>
            </Grid>
          </Grid>
        </form>
        <div className="summary">
          <Typography variant="h4">Monthly Summaries</Typography>
          {selectedMonthSummaries.length > 0 && (
            <div>
              {selectedMonthSummaries.map((summary, index) => (
                <div key={index} className="summary-item">
                  <Typography>Date: {isValid(parse(summary.date, 'MM/dd/yyyy', new Date())) ? format(parse(summary.date, 'MM/dd/yyyy', new Date()), 'P') : 'Invalid Date'}</Typography>
                  <Typography>Income: {summary.income ? summary.income.toFixed(2) : 0}</Typography>
                  <Typography>Total Expenses: {summary.totalExpenses ? summary.totalExpenses.toFixed(2) : 0}</Typography>
                  <Typography>Savings: {summary.savings ? summary.savings.toFixed(2) : 0}</Typography>
                </div>
              ))}
              <div className="category-breakdown">
                <Typography variant="h5">Category Breakdown</Typography>
                <Typography>Bills: ${categoryBreakdown.bills.total.toFixed(2)} from {categoryBreakdown.bills.count} entries</Typography>
                <Typography>Food: ${categoryBreakdown.food.total.toFixed(2)} from {categoryBreakdown.food.count} entries</Typography>
                <Typography>Other: ${categoryBreakdown.other.total.toFixed(2)} from {categoryBreakdown.other.count} entries</Typography>
              </div>
            </div>
          )}
        </div>
        <div className="chart">
          <Typography variant="h4">Summary Chart for {selectedMonth ? getMonthName(selectedMonth) : ''}</Typography>
          <LineChart width={600} height={300} data={selectedMonthSummaries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => isValid(parse(date, 'MM/dd/yyyy', new Date())) ? format(parse(date, 'MM/dd/yyyy', new Date()), 'P') : 'Invalid Date'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#8884d8" />
            <Line type="monotone" dataKey="totalExpenses" stroke="#82ca9d" />
            <Line type="monotone" dataKey="savings" stroke="#ffc658" />
          </LineChart>
        </div>
        <div className="months-list">
          <Typography variant="h4">Recorded Months</Typography>
          <List>
            {recordedMonths.map((month) => (
              <ListItem button key={month} onClick={() => setSelectedMonth(month)}>
                <ListItemText primary={getMonthName(month)} />
              </ListItem>
            ))}
          </List>
        </div>
      </main>
    </Container>
  );
}

export default App;
