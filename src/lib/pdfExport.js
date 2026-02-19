import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

/**
 * Formats functional roles to match the Admin UI display standards.
 * @param {string} role - The raw role string.
 * @returns {string} - The formatted role.
 */
const formatFunctionalRole = (role) => {
    if (!role) return '-';
    // Roles are now stored as full display strings (e.g. "QA Engineer", "Business Analyst")
    return role;
};

/**
 * Generates and downloads a PDF report for a project.
 * @param {Object} project - The project data object.
 */
export const exportProjectToPDF = (project) => {
    try {
        if (!project) {
            console.error("Export failed: No project data provided.");
            return;
        }

        console.log("Generating PDF for project:", project.name);

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let cursorY = 20;

        // --- Header ---
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECT HANDOVER REPORT', margin, cursorY);
        cursorY += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, cursorY);
        cursorY += 15;

        // --- Project Summary ---
        doc.setDrawColor(230);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 10;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30);
        doc.text((project.name || 'UNNAMED PROJECT').toUpperCase(), margin, cursorY);
        cursorY += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        const splitDescription = doc.splitTextToSize(project.description || 'No description provided.', pageWidth - (margin * 2));
        doc.text(splitDescription, margin, cursorY);
        cursorY += (splitDescription.length * 5) + 10;

        // --- Project Details Table ---
        const summaryData = [
            ['Manager', project.managerName || 'N/A'],
            ['Status', project.status || 'N/A'],
            ['Created At', project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'],
            ['Deadline', project.deadline ? new Date(project.deadline).toLocaleDateString() : 'None'],
            ['Sections', (project.sections || []).length.toString()],
            ['Completion', `${project.completion || 0}%`]
        ];

        autoTable(doc, {
            startY: cursorY,
            head: [['Field', 'Details']],
            body: summaryData,
            margin: { left: margin, right: margin },
            theme: 'striped',
            headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
        });

        cursorY = doc.lastAutoTable.finalY + 15;

        // --- Team Members ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TEAM MEMBERS', margin, cursorY);
        cursorY += 8;

        const membersData = (project.members || []).map(m => [
            m.name || 'Unknown',
            m.ktRole || 'Member',
            formatFunctionalRole(m.functionalRole)
        ]);

        autoTable(doc, {
            startY: cursorY,
            head: [['Name', 'KT Role', 'Functional Role']],
            body: membersData,
            margin: { left: margin, right: margin },
            theme: 'grid',
            headStyles: { fillColor: [71, 85, 105], textColor: 255 },
            styles: { fontSize: 9 }
        });

        cursorY = doc.lastAutoTable.finalY + 20;

        // --- Project Sections ---
        if (project.sections && project.sections.length > 0) {
            // Check if we need a new page for sections
            if (cursorY > 200) {
                doc.addPage();
                cursorY = 20;
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30);
            doc.text('DETAILED SECTIONS', margin, cursorY);
            cursorY += 10;

            project.sections.forEach((section, index) => {
                // Section Title
                if (cursorY > 250) {
                    doc.addPage();
                    cursorY = 20;
                }

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(51, 65, 85);
                doc.text(`${index + 1}. ${(section.title || 'Untitled Section').toUpperCase()}`, margin, cursorY);
                cursorY += 6;

                const assignee = (project.members || []).find(m => m.userId === section.contributorId);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(100);
                doc.text(`Assignee: ${assignee?.name || 'Unassigned'} (${assignee?.ktRole || '-'}) | Status: ${section.status || 'Draft'}`, margin, cursorY);
                cursorY += 8;

                // Section Content
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60);

                const contentText = section.content || 'No content provided for this section.';
                const splitContent = doc.splitTextToSize(contentText, pageWidth - (margin * 2));

                // Handle page breaks for long content
                splitContent.forEach(line => {
                    if (cursorY > 270) {
                        doc.addPage();
                        cursorY = 20;
                    }
                    doc.text(line, margin, cursorY);
                    cursorY += 5;
                });

                // Attachments info
                if (section.attachments && section.attachments.length > 0) {
                    cursorY += 3;
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9);
                    doc.setTextColor(50);
                    doc.text('Attachments:', margin, cursorY);
                    cursorY += 5;
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100);
                    section.attachments.forEach(att => {
                        if (cursorY > 275) {
                            doc.addPage();
                            cursorY = 20;
                        }
                        doc.text(`- ${att.fileName} (${att.fileSize})`, margin + 5, cursorY);
                        cursorY += 5;
                    });
                }

                // Comments info
                if (section.comments && section.comments.length > 0) {
                    cursorY += 5;
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9);
                    doc.setTextColor(50);
                    doc.text('Clarifications & Comments:', margin, cursorY);
                    cursorY += 6;

                    section.comments.forEach(comment => {
                        // Header for comment (Name & Date)
                        if (cursorY > 270) {
                            doc.addPage();
                            cursorY = 20;
                        }
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(8);
                        doc.setTextColor(80);
                        const commentHeader = `${comment.userName} on ${new Date(comment.timestamp).toLocaleString()}:`;
                        doc.text(commentHeader, margin + 5, cursorY);
                        cursorY += 4;

                        // Content of comment
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(9);
                        doc.setTextColor(60);
                        const splitComment = doc.splitTextToSize(comment.text, pageWidth - (margin * 2) - 10);

                        splitComment.forEach(line => {
                            if (cursorY > 275) {
                                doc.addPage();
                                cursorY = 20;
                            }
                            doc.text(line, margin + 5, cursorY);
                            cursorY += 5;
                        });
                        cursorY += 2; // Small gap between comments
                    });
                }

                cursorY += 10; // Space between sections
            });
        }

        // --- Footer for each page ---
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, doc.internal.pageSize.getHeight() - 10);
            doc.text(`KT Project Management System - Confidential`, margin, doc.internal.pageSize.getHeight() - 10);
        }

        // --- Download ---
        const fileName = `${(project.name || 'Project_Report').replace(/\s+/g, '_')}_Report.pdf`;
        doc.save(fileName);
        console.log("PDF generated and saved:", fileName);

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error('Failed to generate PDF report. Please check the console for details.');
    }
};

