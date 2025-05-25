# SEO Improvement Plan for ChatLima

1.  **Dynamic Metadata:**
    *   **Page-specific Titles and Descriptions:** While the root layout has general metadata, individual pages (especially chat pages, if they are indexable) should have unique and descriptive titles and descriptions. For example, a chat page could have a title like "Chat with [Bot Name/Topic] | ChatLima".
    *   **Implementation:** Use Next.js's `generateMetadata` function in individual `page.tsx` files to dynamically generate these tags.

2.  **Keyword Optimization:**
    *   **Research:** Identify relevant keywords for your application. What terms would users search for to find ChatLima?
    *   **Integration:** Incorporate these keywords naturally into your titles, descriptions, and page content. Avoid keyword stuffing.
    *   **Content Strategy:** Consider creating blog posts or documentation pages that target specific keywords related to MCP clients, chat features, etc.

3.  **Structured Data (Schema Markup):**
    *   **Identify Schemas:** Determine appropriate schema types for your content. For a chat application, `SoftwareApplication` or `WebApplication` might be relevant. If you have articles or FAQs, use `Article` or `FAQPage` schemas.
    *   **Implementation:** Add JSON-LD structured data to your pages. This can be done within the `<head>` of your pages or dynamically using Next.js.
    *   **Example (`SoftwareApplication`):**
        ```json
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ChatLima",
          "applicationCategory": "CommunicationApplication",
          "operatingSystem": "Web",
          "description": "ChatLima is a minimalistic MCP client with a good feature set.",
          "offers": {
            "@type": "Offer",
            "price": "0" // Or your pricing
          }
          // Add other relevant properties
        }
        ```

4.  **Image Optimization:**
    *   **Alt Text:** Ensure all images (`next/image` components) have descriptive `alt` text. The logo image in `layout.tsx` already has `alt="ChatLima logo"`, which is good. Extend this to all images.
    *   **File Names:** Use descriptive file names for images (e.g., `chatlima-mcp-client-interface.png` instead of `img123.png`).
    *   **Image Sitemaps:** If images are a critical part of your content, consider creating an image sitemap.

5.  **Sitemap & Robots.txt:**
    *   **`sitemap.xml`:** Create a `sitemap.xml` file to help search engines discover all your indexable pages. Next.js 13+ offers built-in support for generating sitemaps. You can create a `app/sitemap.ts` (or `.js`) file.
        *   List all static pages.
        *   Dynamically generate URLs for chat pages if they are intended to be public and discoverable.
    *   **`robots.txt`:** Create a `public/robots.txt` file to instruct search engine crawlers on which pages or sections of your site should not be crawled.
        *   Example `robots.txt`:
            ```
            User-agent: *
            Allow: /
            Disallow: /api/ # Disallow API routes
            Disallow: /checkout/ # If checkout pages shouldn't be indexed
            # Add other paths you want to disallow

            Sitemap: https://www.chatlima.com/sitemap.xml
            ```

6.  **Canonical URLs:**
    *   **Purpose:** For pages with similar content or accessible via multiple URLs, specify a canonical URL to prevent duplicate content issues.
    *   **Implementation:** Use the `alternates.canonical` field in your `Metadata` object or `generateMetadata` function.
    *   `metadata.alternates = { canonical: 'https://www.chatlima.com/canonical-url-for-this-page' }`

7.  **URL Structure:**
    *   The current URL structure based on the file system router in Next.js (e.g., `app/chat/[id]/page.tsx`) is generally SEO-friendly. Ensure URLs are descriptive and human-readable.

8.  **Internal Linking:**
    *   Strategically link between relevant pages on your site. This helps distribute link equity and makes it easier for users and search engines to navigate your site. The "New Chat" button linking to `/` is a good start.

9.  **Performance:**
    *   **Core Web Vitals:** Monitor and optimize for Core Web Vitals (LCP, FID, CLS). Next.js provides good defaults, but ensure your custom components and client-side logic are performant.
    *   **Image Optimization:** Using `next/image` helps with this.
    *   **Code Splitting:** Next.js handles this automatically.

10. **Mobile-Friendliness:**
    *   Your layout appears to be responsive (`flex h-dvh w-full`). Continue to ensure a good user experience on mobile devices. Google uses mobile-first indexing.

11. **Analytics and Monitoring:**
    *   **Umami:** You already have Umami analytics script. Use it to track user behavior and identify popular content.
    *   **Google Search Console:** Set up Google Search Console to monitor your site's performance in Google search, submit sitemaps, and identify crawl errors.

12. **`lang` attribute:**
    *   The `<html lang="en">` attribute is correctly set in `app/layout.tsx`, which is good for accessibility and SEO.

**Implementation Steps (High-Level):**

*   **Priority 1: `robots.txt` and `sitemap.xml`**
    *   Create `public/robots.txt`.
    *   Create `app/sitemap.ts` to generate `sitemap.xml`.
*   **Priority 2: Dynamic Metadata for Key Pages**
    *   Identify key page types (e.g., individual chat pages if public).
    *   Implement `generateMetadata` in their respective `page.tsx` files.
*   **Priority 3: Structured Data**
    *   Add `SoftwareApplication` or other relevant JSON-LD schema to your main layout or relevant pages.
*   **Priority 4: Keyword Review & Content**
    *   Review existing content for keyword opportunities.
*   **Priority 5: Ongoing Monitoring & Refinement**
    *   Use Google Search Console and Umami to track progress.

This plan provides a comprehensive set of recommendations. Start with the foundational elements like `robots.txt`, `sitemap.xml`, and dynamic metadata for your most important pages. 