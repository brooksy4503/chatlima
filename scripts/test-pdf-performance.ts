import { createPDF, addWrappedText, setTypography, addPageIfNeeded } from '../lib/pdf-utils';

// Test performance with large chat
async function testLargeChatPerformance() {
    console.log('🧪 Testing PDF generation performance with large chat...');

    const startTime = Date.now();

    // Create PDF
    const doc = createPDF({ format: 'a4' });

    // Set typography
    setTypography(doc, 12, 'helvetica');

    let y = 30; // Starting position

    // Simulate a large chat with 100 messages
    for (let i = 0; i < 100; i++) {
        const userMessage = `User message ${i + 1}: This is a sample user message with some content to test PDF generation performance.`;
        const assistantMessage = `Assistant message ${i + 1}: This is a sample assistant response with detailed information about the topic being discussed. It includes multiple sentences to ensure proper text wrapping and page management.`;

        // Add user message
        doc.setFont('helvetica', 'bold');
        doc.text('User:', 20, y);
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(doc, userMessage, 30, y + 5, 150, 6);

        y += 10; // Space between messages

        // Add assistant message
        doc.setFont('helvetica', 'bold');
        doc.text('Assistant:', 20, y);
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(doc, assistantMessage, 30, y + 5, 150, 6);

        y += 15; // Space between conversation pairs

        // Check if we need a new page
        addPageIfNeeded(doc, y, 270);
        if (y > 270) {
            y = 30; // Reset to top of new page
        }
    }

    // Generate the PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ PDF generation completed in ${duration}ms`);
    console.log(`📄 Generated PDF size: ${(pdfBuffer as ArrayBuffer).byteLength} bytes`);

    // Check performance target
    if (duration < 2000) {
        console.log('✅ Performance target met: < 2 seconds');
    } else {
        console.log('❌ Performance target not met: >= 2 seconds');
    }

    return duration;
}

// Run the test
testLargeChatPerformance().catch(console.error);