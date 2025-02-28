// Install pdf-lib before running: npm install pdf-lib
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function extractFormFields(pdfPath) {
  try {
    // Read the PDF file into a buffer
    const pdfBytes = fs.readFileSync(pdfPath);
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    // Get the form (AcroForm) from the document
    const form = pdfDoc.getForm();
    // Get all form fields
    const fields = form.getFields();
    const extractedData = {};
    
    console.log(`Found ${fields.length} form fields in the PDF`);
    
    fields.forEach(field => {
      const type = field.constructor.name;
      const name = field.getName();
      let value;
      try {
        if (type === 'PDFTextField') {
          value = field.getText();
        } else if (type === 'PDFCheckBox') {
          value = field.isChecked();
        } else if (type === 'PDFDropdown') {
          value = field.getSelected();
        } else if (type === 'PDFRadioGroup') {
          value = field.getSelected();
        } else {
          // For other field types, try to use getText if available
          value = field.getText ? field.getText() : '';
        }
      } catch (err) {
        console.warn(`Error extracting value from field ${name}:`, err.message);
        value = '';
      }
      extractedData[name] = value;
    });
    
    console.log("Extracted Form Fields:");
    console.log(JSON.stringify(extractedData, null, 2));
    
    return extractedData;
  } catch (error) {
    console.error("Error extracting form fields:", error);
    return {};
  }
}

// Use the correct path to the PDF file
extractFormFields('backend/data/SampleData/FieldServiceQuotes.pdf');
