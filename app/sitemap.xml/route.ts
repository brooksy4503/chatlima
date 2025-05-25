import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const baseUrl = `${protocol}://${host}`

    // Only generate sitemap for production
    const isProduction = host?.includes('chatlima.com')

    if (!isProduction) {
        return new NextResponse('Sitemap not available in development', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
        })
    }

    const currentDate = new Date().toISOString()

    // Define static pages to include in sitemap
    const staticPages = [
        {
            url: '/',
            lastmod: currentDate,
            changefreq: 'daily',
            priority: '1.0'
        }
        // Future pages can be added here:
        // {
        //     url: '/about',
        //     lastmod: currentDate,
        //     changefreq: 'monthly',
        //     priority: '0.8'
        // },
        // {
        //     url: '/pricing',
        //     lastmod: currentDate,
        //     changefreq: 'weekly',
        //     priority: '0.9'
        // }
    ]

    const urlEntries = staticPages.map(page => `    <url>
        <loc>${baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('\n')

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`

    return new NextResponse(sitemapXml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
    })
} 