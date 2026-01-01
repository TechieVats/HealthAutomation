/**
 * HTML template for Admission Packet documents
 */

export function buildAdmissionHtml(admissionData: {
  patientFirstName?: string
  patientLastName?: string
  mrn?: string
  dob?: string
  payer?: string
  extractedFields?: Record<string, string>
  [key: string]: unknown
}): string {
  const extracted = admissionData.extractedFields || {}
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Admission Packet</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h1 {
      color: #333;
      margin: 0;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #555;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .field-row {
      display: flex;
      margin-bottom: 10px;
    }
    .field-label {
      font-weight: bold;
      width: 150px;
      color: #666;
    }
    .field-value {
      flex: 1;
      color: #333;
    }
    .signature-section {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #333;
    }
    .signature-line {
      margin-top: 60px;
      border-top: 1px solid #333;
      padding-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Home Health Admission Packet</h1>
    <p>Generated: ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="section">
    <div class="section-title">Patient Information</div>
    <div class="field-row">
      <div class="field-label">First Name:</div>
      <div class="field-value">${admissionData.patientFirstName || extracted.firstName || 'N/A'}</div>
    </div>
    <div class="field-row">
      <div class="field-label">Last Name:</div>
      <div class="field-value">${admissionData.patientLastName || extracted.lastName || 'N/A'}</div>
    </div>
    <div class="field-row">
      <div class="field-label">MRN:</div>
      <div class="field-value">${admissionData.mrn || 'N/A'}</div>
    </div>
    <div class="field-row">
      <div class="field-label">Date of Birth:</div>
      <div class="field-value">${admissionData.dob || extracted.dob || 'N/A'}</div>
    </div>
    <div class="field-row">
      <div class="field-label">Payer:</div>
      <div class="field-value">${admissionData.payer || extracted.payer || 'N/A'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Extracted Referral Data</div>
    ${Object.entries(extracted)
      .map(([key, value]) => `
        <div class="field-row">
          <div class="field-label">${key.replace(/([A-Z])/g, ' $1').trim()}:</div>
          <div class="field-value">${value || 'N/A'}</div>
        </div>
      `)
      .join('')}
  </div>

  <div class="section">
    <div class="section-title">Admission Details</div>
    <p>This admission packet contains information extracted from the referral document.</p>
    <p>Please review all information and sign below to confirm accuracy.</p>
  </div>

  <div class="signature-section">
    <div class="signature-line">
      <p><strong>Patient Signature:</strong></p>
      <p style="margin-top: 50px;">_________________________________</p>
      <p>Date: _______________</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

