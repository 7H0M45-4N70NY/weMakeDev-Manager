# Deployment Guide

**Project:** Manager - Task Management & AI Planning PWA  
**Date:** 2025-12-09

---

## Overview

This guide covers deploying the Manager application to production using Vercel and Supabase.

---

## Prerequisites

- Vercel account (https://vercel.com)
- Supabase project configured
- GitHub repository with code
- Environment variables ready

---

## Step 1: Prepare for Deployment

### 1.1 Verify Build
```bash
npm run build
```

Should complete without errors.

### 1.2 Run Tests
```bash
npm run test
```

All tests should pass.

### 1.3 Check Linting
```bash
npm run lint
```

No errors or warnings.

---

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Click "Import"

### 2.2 Configure Environment Variables
1. In Vercel project settings, go to "Environment Variables"
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2.3 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at provided URL

---

## Step 3: Configure Supabase for Production

### 3.1 Enable Email Verification
1. Go to Supabase Authentication → Providers
2. Enable "Email" provider
3. Configure email templates

### 3.2 Set Up Custom Domain (Optional)
1. In Supabase project settings
2. Add custom domain
3. Update DNS records

### 3.3 Enable Backups
1. Go to Database → Backups
2. Enable automated backups
3. Set backup frequency

---

## Step 4: Post-Deployment Verification

### 4.1 Test Authentication
1. Visit deployed URL
2. Create test account
3. Verify email confirmation
4. Sign in and access dashboard

### 4.2 Test API
```bash
curl -X GET https://your-app.vercel.app/api/tasks \
  -H "Cookie: sb-auth-token=..."
```

Should return task list or 401 if not authenticated.

### 4.3 Test Database
1. Create a task via UI
2. Verify task appears in Supabase dashboard
3. Verify RLS policies are working

---

## Step 5: Monitoring & Maintenance

### 5.1 Enable Error Tracking
Consider adding error tracking service:
- Sentry
- LogRocket
- DataDog

### 5.2 Monitor Performance
1. Use Vercel Analytics
2. Monitor Supabase metrics
3. Set up alerts for errors

### 5.3 Regular Backups
1. Enable Supabase automated backups
2. Test restore procedures
3. Keep backup retention policy

---

## Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

---

## Security Checklist

- [ ] All environment variables set
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured in Supabase
- [ ] RLS policies enabled
- [ ] Email verification enabled
- [ ] Rate limiting configured (if available)

---

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Optimize images before upload
- Set appropriate sizes

### Database Optimization
- Verify indexes are created
- Monitor slow queries
- Optimize RLS policies

### Caching
- Enable Vercel caching
- Set appropriate cache headers
- Use ISR for static content

---

## Rollback Procedure

If deployment fails:

1. Go to Vercel project
2. Click "Deployments"
3. Select previous successful deployment
4. Click "Promote to Production"

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Verify all dependencies installed
- Check for TypeScript errors

### Authentication Fails
- Verify Supabase credentials
- Check CORS settings
- Verify email provider configured

### Database Connection Fails
- Verify connection string
- Check Supabase project status
- Verify RLS policies

---

## Scaling Considerations

### Database
- Monitor connection pool
- Consider read replicas for high traffic
- Optimize queries

### API
- Monitor request rates
- Consider caching layer
- Implement rate limiting

### Storage
- Monitor file storage usage
- Implement cleanup policies
- Consider CDN for static files

---

## Disaster Recovery

### Backup Strategy
1. Enable Supabase automated backups
2. Test restore procedures monthly
3. Keep off-site backup copies

### Monitoring
1. Set up error alerts
2. Monitor uptime
3. Track performance metrics

### Incident Response
1. Document incident procedures
2. Have rollback plan ready
3. Communicate with users

---

## Cost Optimization

### Vercel
- Use free tier for development
- Monitor usage
- Set up spending limits

### Supabase
- Monitor database size
- Optimize queries
- Consider reserved capacity

---

## Next Steps

1. Complete Supabase setup
2. Deploy to Vercel
3. Run post-deployment tests
4. Monitor for issues
5. Implement monitoring/alerting

---

## Support

For deployment issues:
- Check Vercel documentation
- Check Supabase documentation
- Review application logs
- Check browser console for errors

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-09
