# Metabase Analytics Setup

This guide explains how to connect Metabase to the HHA MVP PostgreSQL database and run analytics queries.

## 📊 Tables of Interest

The following database tables are relevant for analytics:

1. **Patient** - Patient demographics and information
   - `id`, `mrn`, `firstName`, `lastName`, `dob`, `payer`, `createdAt`

2. **AdmissionPacket** - Admission packet status and data
   - `id`, `patientId`, `dataJson`, `signedPdfPath`, `status`, `createdAt`, `updatedAt`

3. **Visit** - Patient visit records
   - `id`, `patientId`, `caregiverName`, `startPlanned`, `endPlanned`, `status`, `createdAt`

4. **EvvEvent** - Electronic Visit Verification events
   - `id`, `visitId`, `kind`, `timestamp`, `lat`, `lng`

5. **TimesheetRow** - Payroll and time tracking
   - `id`, `employeeId`, `visitId`, `minutes`, `type`, `createdAt`

6. **Referral** - Patient referral records
   - `id`, `patientId`, `source`, `pdfPath`, `status`, `createdAt`

7. **Employee** - Staff information
   - `id`, `name`, `role`, `licenseNo`, `licenseExpiry`

## 🔌 Connecting Metabase to PostgreSQL

### Step 1: Access Metabase

1. Open Metabase: http://localhost:3002 (or configured port)
2. Complete initial setup if needed
3. Login with admin credentials

### Step 2: Add Database Connection

1. Click **"Settings"** → **"Admin"** → **"Databases"**
2. Click **"Add database"**
3. Select **"PostgreSQL"**
4. Enter connection details:
   ```
   Display name: HHA MVP Production
   Host: postgres (or localhost:5432 if external)
   Port: 5432
   Database name: hha
   Username: hha
   Password: hha
   ```
5. Click **"Save"**

### Step 3: Verify Connection

1. Test the connection
2. Metabase will scan the database schema
3. Tables should appear in the data browser

## 📈 Example Questions

### 1. EVV Verification Rate by Week

**Question**: What percentage of visits are successfully verified each week?

**Use Case**: Track compliance and EVV system effectiveness

**Expected Insights**:
- Weekly verification trends
- Identify weeks with low verification rates
- Monitor system performance over time

### 2. Average Time from Referral Upload to Signed Admission

**Question**: How long does it take from referral upload to getting a signed admission packet?

**Use Case**: Measure intake efficiency and identify bottlenecks

**Expected Insights**:
- Average processing time
- Identify slow steps in the workflow
- Track improvements over time

### 3. Payroll Minutes by Employee, Week

**Question**: How many billable minutes does each employee work per week?

**Use Case**: Payroll processing, billing, and workforce planning

**Expected Insights**:
- Employee productivity metrics
- Weekly hours worked
- Overtime identification

## 💾 Example SQL Queries

### Query 1: EVV Verification Rate by Week

```sql
SELECT 
  DATE_TRUNC('week', v.start_planned) AS week_start,
  COUNT(*) AS total_visits,
  COUNT(CASE WHEN v.status = 'completed' THEN 1 END) AS verified_visits,
  ROUND(
    COUNT(CASE WHEN v.status = 'completed' THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) AS verification_rate_percent
FROM "Visit" v
WHERE v.start_planned >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', v.start_planned)
ORDER BY week_start DESC;
```

**Expected Result Columns**:
- `week_start` (date) - Monday of the week
- `total_visits` (integer) - Total visits in the week
- `verified_visits` (integer) - Visits with status='completed'
- `verification_rate_percent` (decimal) - Percentage verified (0-100)

**Example Output**:
```
week_start   | total_visits | verified_visits | verification_rate_percent
-------------|--------------|-----------------|--------------------------
2024-01-15   | 25           | 22              | 88.00
2024-01-08   | 30           | 28              | 93.33
2024-01-01   | 18           | 15              | 83.33
```

### Query 2: Average Time from Referral Upload to Signed Admission

```sql
SELECT 
  DATE_TRUNC('month', r.created_at) AS month,
  COUNT(*) AS total_admissions,
  ROUND(
    AVG(
      EXTRACT(EPOCH FROM (ap.updated_at - r.created_at)) / 86400
    )::numeric, 
    2
  ) AS avg_days_to_sign,
  MIN(
    EXTRACT(EPOCH FROM (ap.updated_at - r.created_at)) / 86400
  ) AS min_days,
  MAX(
    EXTRACT(EPOCH FROM (ap.updated_at - r.created_at)) / 86400
  ) AS max_days
FROM "Referral" r
INNER JOIN "AdmissionPacket" ap ON r.patient_id = ap.patient_id
WHERE ap.status = 'signed'
  AND ap.updated_at >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', r.created_at)
ORDER BY month DESC;
```

**Expected Result Columns**:
- `month` (date) - First day of the month
- `total_admissions` (integer) - Count of signed admissions
- `avg_days_to_sign` (decimal) - Average days from referral to signature
- `min_days` (decimal) - Fastest completion time
- `max_days` (decimal) - Slowest completion time

**Example Output**:
```
month        | total_admissions | avg_days_to_sign | min_days | max_days
-------------|------------------|-------------------|----------|----------
2024-01-01   | 45               | 3.52              | 1.2      | 7.8
2023-12-01   | 52               | 4.15              | 1.5      | 10.2
2023-11-01   | 38               | 3.89              | 1.0      | 8.5
```

### Query 3: Payroll Minutes by Employee, Week

```sql
SELECT 
  e.name AS employee_name,
  e.role AS employee_role,
  DATE_TRUNC('week', ts.created_at) AS week_start,
  SUM(ts.minutes) AS total_minutes,
  ROUND(SUM(ts.minutes)::numeric / 60, 2) AS total_hours,
  COUNT(DISTINCT ts.visit_id) AS visit_count,
  COUNT(CASE WHEN ts.type = 'visit' THEN 1 END) AS visit_rows,
  COUNT(CASE WHEN ts.type = 'travel' THEN 1 END) AS travel_rows,
  COUNT(CASE WHEN ts.type = 'admin' THEN 1 END) AS admin_rows
FROM "TimesheetRow" ts
INNER JOIN "Employee" e ON ts.employee_id = e.id
WHERE ts.created_at >= CURRENT_DATE - INTERVAL '8 weeks'
GROUP BY 
  e.id,
  e.name,
  e.role,
  DATE_TRUNC('week', ts.created_at)
ORDER BY 
  week_start DESC,
  total_minutes DESC;
```

**Expected Result Columns**:
- `employee_name` (text) - Employee full name
- `employee_role` (text) - Employee role (RN, LPN, etc.)
- `week_start` (date) - Monday of the week
- `total_minutes` (integer) - Total billable minutes
- `total_hours` (decimal) - Total hours (minutes / 60)
- `visit_count` (integer) - Number of distinct visits
- `visit_rows` (integer) - Count of visit type rows
- `travel_rows` (integer) - Count of travel type rows
- `admin_rows` (integer) - Count of admin type rows

**Example Output**:
```
employee_name    | employee_role | week_start  | total_minutes | total_hours | visit_count | visit_rows | travel_rows | admin_rows
-----------------|---------------|-------------|---------------|-------------|-------------|------------|-------------|------------
Sarah Johnson    | RN            | 2024-01-15  | 1440          | 24.00       | 12          | 10         | 2           | 0
Michael Chen     | LPN           | 2024-01-15  | 1200          | 20.00       | 10          | 8          | 2           | 0
Sarah Johnson    | RN            | 2024-01-08  | 1380          | 23.00       | 11          | 9          | 2           | 0
```

## 🎯 Creating Dashboards

### Recommended Dashboard Structure

1. **Operational Dashboard**
   - EVV Verification Rate (weekly chart)
   - Visit Status Breakdown (pie chart)
   - Active Patients Count (number card)

2. **Efficiency Dashboard**
   - Time to Signature (trend line)
   - Referral Processing Time (bar chart)
   - Admission Status Distribution (pie chart)

3. **Payroll Dashboard**
   - Weekly Hours by Employee (table)
   - Total Hours by Type (stacked bar)
   - Employee Productivity Trends (line chart)

## 🔒 Data Privacy Notes

⚠️ **Important**: When setting up Metabase queries:

- **No PHI in Production**: Consider data masking or synthetic data for development
- **Access Control**: Configure Metabase groups and permissions appropriately
- **Audit Logging**: Track who accesses what data
- **Compliance**: Ensure HIPAA compliance for patient data access

## 🧪 Testing Queries

### Test Query Connection

```sql
-- Simple test query
SELECT COUNT(*) AS patient_count FROM "Patient";
```

Expected: Returns total number of patients

### Verify Data Availability

```sql
-- Check data freshness
SELECT 
  'Patients' AS table_name,
  COUNT(*) AS record_count,
  MAX(created_at) AS latest_record
FROM "Patient"
UNION ALL
SELECT 
  'Visits',
  COUNT(*),
  MAX(created_at)
FROM "Visit"
UNION ALL
SELECT 
  'TimesheetRows',
  COUNT(*),
  MAX(created_at)
FROM "TimesheetRow";
```

## 📚 Additional Resources

- [Metabase Documentation](https://www.metabase.com/docs/)
- [PostgreSQL Date Functions](https://www.postgresql.org/docs/current/functions-datetime.html)
- [SQL Query Optimization](https://www.metabase.com/docs/latest/questions/native-editor/sql-parameters.html)

## ✅ Quick Start Checklist

- [ ] Metabase container running (docker-compose)
- [ ] PostgreSQL database accessible
- [ ] Database connection configured in Metabase
- [ ] Test query executes successfully
- [ ] Example queries imported/tested
- [ ] Dashboards created for key metrics

---

**Note**: Replace table and column names if using different naming conventions. Adjust date ranges and filters based on your data retention policies.

