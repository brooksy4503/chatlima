# Sitemap Implementation

## Overview
This document describes the static sitemap implementation for ChatLima.

## Implementation Details

### Location
- **Route**: `/app/sitemap.xml/route.ts`
- **URL**: `https://www.chatlima.com/sitemap.xml`

### Features
- **Environment-aware**: Only serves sitemap in production
- **Static pages**: Currently includes homepage only
- **Extensible**: Easy to add new pages
- **SEO optimized**: Proper XML format with metadata

### Current Pages Included
- Homepage (`/`) - Priority 1.0, Daily updates

### Pages Excluded (Privacy & Security)
- Chat pages (`/chat/*`) - Contains private user conversations
- API routes (`/api/*`) - Backend endpoints
- Auth pages (`/auth/*`) - Authentication flows
- Checkout pages (`/checkout/*`) - Private user transactions

### Configuration
The sitemap is referenced in `robots.txt` for production:
```
Sitemap: https://www.chatlima.com/sitemap.xml
```

### Adding New Pages
To add new public pages to the sitemap, edit the `staticPages` array in `/app/sitemap.xml/route.ts`:

```typescript
const staticPages = [
    {
        url: '/',
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0'
    },
    {
        url: '/about',
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.8'
    }
]
```

### SEO Considerations
- **Priority**: Homepage = 1.0, other pages 0.8-0.9
- **Change frequency**: Homepage = daily, static pages = monthly/weekly
- **Cache**: 24-hour cache for performance
- **Privacy**: No user-generated or private content included

### Testing
- Development: Returns 404 (intended behavior)
- Production: Returns XML sitemap
- Validation: Use Google Search Console or online XML validators

### Future Enhancements
- Dynamic sitemap for blog posts (if added)
- Multiple sitemaps for large sites
- Image sitemap for media content
- News sitemap for time-sensitive content 