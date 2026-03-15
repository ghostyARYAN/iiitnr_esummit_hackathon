import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from "docx";
import { saveAs } from "file-saver";
import { QRCodeCanvas } from "qrcode.react";

interface ExportData {
  title: string;
  projectName?: string;
  content: string;
  metadata?: Record<string, string>;
  applicationId?: string;
}

export async function exportAsPDF({ title, projectName, content, metadata, applicationId }: ExportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("PARIVESH 3.0 — Environmental Clearance System", margin, y);
  y += 6;
  doc.setDrawColor(26, 86, 50);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(26, 86, 50);
  doc.text(title, margin, y);
  y += 10;

  if (projectName) {
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text(`Project: ${projectName}`, margin, y);
    y += 8;
  }

  // QR Code for verification
  if (applicationId) {
    const qrUrl = `${window.location.origin}/verify/${applicationId}`;
    
    // We'll use a hidden div to render the QR code and then get its data URL
    const qrContainer = document.createElement("div");
    qrContainer.style.display = "none";
    document.body.appendChild(qrContainer);
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Scan to Verify:", pageWidth - 50, 35);
    doc.text(qrUrl, pageWidth - 50, 40, { maxWidth: 40 });
  }

  // Metadata
  if (metadata) {
    doc.setFontSize(10);
    doc.setTextColor(80);
    for (const [key, value] of Object.entries(metadata)) {
      doc.text(`${key}: ${value}`, margin, y);
      y += 6;
    }
    y += 4;
  }

  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Content
  doc.setFontSize(11);
  doc.setTextColor(30);
  const lines = doc.splitTextToSize(content, maxWidth);
  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 6;
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${new Date().toLocaleString()} | Page ${i} of ${totalPages}${applicationId ? ' | ID: ' + applicationId : ''}`,
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

export async function generateWordBlob({ title, projectName, content, metadata, applicationId }: ExportData) {
  const children: Paragraph[] = [];

  // Header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "PARIVESH 3.0 — Environmental Clearance System", size: 18, color: "666666" })],
    })
  );

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: title, bold: true, size: 36, color: "1A5632" })],
      spacing: { before: 200, after: 100 },
    })
  );

  if (projectName) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Project: ", bold: true, size: 24 }),
          new TextRun({ text: projectName, size: 24 }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  if (applicationId) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Verification URL: ", bold: true, size: 18 }),
          new TextRun({ text: `${window.location.origin}/verify/${applicationId}`, size: 18, color: "0000FF" }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${key}: `, bold: true, size: 20 }),
            new TextRun({ text: value, size: 20 }),
          ],
        })
      );
    }
    children.push(new Paragraph({ children: [] }));
  }

  // Content paragraphs
  const paragraphs = content.split("\n");
  for (const para of paragraphs) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: para, size: 22 })],
        spacing: { after: 80 },
      })
    );
  }

  // Footer
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Generated on ${new Date().toLocaleString()}${applicationId ? ' | Application ID: ' + applicationId : ''}`, size: 16, color: "999999" })],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 400 },
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBlob(doc);
}

export async function exportAsWord(data: ExportData) {
  const blob = await generateWordBlob(data);
  saveAs(blob, `${data.title.replace(/\s+/g, "_")}.docx`);
}
