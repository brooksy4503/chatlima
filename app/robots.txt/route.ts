import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const baseUrl = `${protocol}://${host}`

    // Check if we're in production (chatlima.com)
    const isProduction = host?.includes('chatlima.com')

    let robotsContent: string

    if (isProduction) {
        // Production robots.txt - allow crawling with restrictions
        robotsContent = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /chat/
Disallow: /checkout/
Disallow: /auth/
Crawl-delay: 1

# Protect user privacy - no crawling of chat content
User-agent: *
Disallow: /chat/*

# Allow access to public pages and SEO pages
Allow: /$
Allow: /model/
Allow: /models
Allow: /compare/
Allow: /docs
Allow: /docs/*

Sitemap: https://www.chatlima.com/sitemap.xml`
    } else {
        // Development/staging - disallow all crawling
        robotsContent = `User-agent: *
Disallow: /

# Development environment - no crawling allowed`
    }

    return new NextResponse(robotsContent, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
    })
} 