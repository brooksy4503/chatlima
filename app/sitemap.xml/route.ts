import { NextRequest, NextResponse } from 'next/server'
import { fetchAllModels } from '@/lib/models/fetch-models'
import { modelIdToSlug } from '@/lib/models/slug-utils'
import { getAllPrebuiltComparisonSlugs, getTopModelsForPreRender } from '@/lib/models/model-priority'

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

    // Fetch models for dynamic sitemap entries
    let modelUrls: string[] = []
    try {
        const response = await fetchAllModels({ environment: {} })
        const topModels = getTopModelsForPreRender(response.models, 100)

        // Generate model page URLs
        modelUrls = topModels.map(model => {
            const slug = modelIdToSlug(model.id)
            const isFree = model.id.endsWith(':free')
            const priority = model.premium ? '0.8' : '0.6'

            return `    <url>
        <loc>${baseUrl}/model/${slug}</loc>
        <lastmod>${model.lastChecked.toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>${priority}</priority>
    </url>`
        })

        // Generate comparison page URLs
        const comparisonSlugs = getAllPrebuiltComparisonSlugs()
        const comparisonUrls = comparisonSlugs.map(slug => `    <url>
        <loc>${baseUrl}/compare/${slug}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`)

        modelUrls = [...modelUrls, ...comparisonUrls]
    } catch (error) {
        console.error('Failed to generate dynamic sitemap entries:', error)
    }

    // Define static pages to include in sitemap
    const staticPages = [
        {
            url: '/',
            lastmod: currentDate,
            changefreq: 'daily',
            priority: '1.0'
        },
        {
            url: '/models',
            lastmod: currentDate,
            changefreq: 'daily',
            priority: '0.9'
        },
        {
            url: '/compare',
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: '0.8'
        }
    ]

    const allUrlEntries = [...staticPages.map(page => `    <url>
        <loc>${baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`), ...modelUrls]

    const urlEntries = allUrlEntries.join('\n')

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