# UniverBot Frontend - Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- Supabase project set up
- Backend API deployed (e.g., on Koyeb, Railway, Render)

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gowthamnachu/univerbot-frontend)

## Manual Deployment

### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 2. Configure Environment Variables

Create environment variables in Vercel dashboard or use CLI:

```bash
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

**Where to get these:**
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase Project Settings → API → Project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase Project Settings → API → Project API keys → anon public
- **NEXT_PUBLIC_API_URL**: Your deployed backend URL (e.g., https://univerbot-backend.koyeb.app)

### 3. Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. Add environment variables (see step 2)
6. Click "Deploy"

### 4. Deploy via CLI

```bash
cd frontend
vercel
# Follow prompts
# Set up environment variables when prompted
```

### 5. Set Environment Variables in Vercel

```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_API_URL
```

Or via Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add each variable for Production, Preview, and Development

## Configuration Files

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### `next.config.js`
Already configured for production with:
- Image optimization
- Remote patterns for CDN
- Output file tracing

## Build Optimization

The project is configured for optimal Vercel deployment:

✅ **Next.js 14** - Latest features and performance
✅ **App Router** - Modern routing with streaming
✅ **Server Components** - Reduced client bundle size
✅ **Static Generation** - Pre-rendered pages for speed
✅ **Image Optimization** - Automatic WebP/AVIF conversion
✅ **Edge Runtime** - Ultra-fast responses
✅ **ISR Support** - Incremental Static Regeneration

## Post-Deployment Steps

### 1. Update Supabase Redirects
Add your Vercel domain to Supabase Auth:
- Go to Supabase → Authentication → URL Configuration
- Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
- Add to **Site URL**: `https://your-app.vercel.app`

### 2. Update CORS on Backend
Configure your backend to allow requests from Vercel domain:
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "https://*.vercel.app"  # For preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Test Deployment
1. Visit your Vercel URL
2. Test authentication (register/login)
3. Create a bot
4. Test chat functionality
5. Verify file uploads work

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (up to 48 hours)
5. Update Supabase redirect URLs with new domain

## Environment-Specific Deployments

### Production
```bash
vercel --prod
```

### Preview (for testing)
```bash
vercel
```

### Development
```bash
npm run dev
```

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Authentication Issues
- Verify Supabase redirect URLs include Vercel domain
- Check NEXT_PUBLIC_SUPABASE_URL and KEY are correct
- Ensure /auth/callback route exists

### API Connection Failed
- Verify NEXT_PUBLIC_API_URL points to deployed backend
- Check backend CORS configuration
- Ensure backend is running and accessible

### Images Not Loading
- Check next.config.js remote patterns
- Verify image URLs are accessible
- Check Content Security Policy

## Monitoring & Analytics

Vercel provides built-in:
- **Analytics** - Page views, performance metrics
- **Speed Insights** - Core Web Vitals
- **Logs** - Runtime and build logs
- **Deployments** - Git integration with auto-deploy

Access via: Project → Analytics/Speed Insights/Deployments

## Rollback

If deployment has issues:
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## Best Practices

✅ Use environment variables for all secrets
✅ Enable preview deployments for testing
✅ Set up custom domain with HTTPS
✅ Monitor Core Web Vitals
✅ Use Vercel's Edge Network for global performance
✅ Enable automatic deployments from main branch
✅ Test on preview before promoting to production

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

## Performance Optimization

Already implemented:
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Font optimization
- ✅ CSS minification
- ✅ Tree shaking
- ✅ Compression (Brotli/Gzip)

Expected Lighthouse scores:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
