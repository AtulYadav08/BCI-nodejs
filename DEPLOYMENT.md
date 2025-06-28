# Vercel Deployment Guide

This guide will walk you through deploying the BCI Email Service to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **SendGrid Account**: You need a SendGrid account with API key
4. **Verified Sender**: Your FROM_EMAIL must be verified in SendGrid

## Step 1: Prepare Your Repository

Ensure your repository contains all necessary files:

```
bci_mail/
├── app.js                 # Main Express server
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel configuration
├── .gitignore           # Git ignore rules
├── public/              # Static files
│   ├── index.html       # Main interface
│   └── admin.html       # Admin panel
├── src/
│   ├── services/
│   │   └── sendgridService.js
│   └── database/
│       └── database.js
├── test-email.js
└── test-config.js
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `bci-email-service` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings: `N`

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: `Node.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `./`
   - Install Command: `npm install`

## Step 3: Configure Environment Variables

1. **Go to your project dashboard** in Vercel
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables**:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `SENDGRID_API_KEY` | `your_sendgrid_api_key_here` | Production, Preview, Development |
   | `FROM_EMAIL` | `your_verified_sender@yourdomain.com` | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production, Preview, Development |

4. **Click "Save"** for each variable

## Step 4: Redeploy with Environment Variables

```bash
vercel --prod
```

## Step 5: Verify Deployment

1. **Check your deployment URL** (provided by Vercel)
2. **Test the health endpoint**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
3. **Test the main interface**: Visit `https://your-app.vercel.app`
4. **Test the admin panel**: Visit `https://your-app.vercel.app/admin`

## Important Notes for Vercel Deployment

### Database Storage
- The application uses SQLite stored in `/tmp` for Vercel compatibility
- **Note**: Data will be lost on serverless function cold starts
- For production use, consider migrating to a persistent database like:
  - Vercel Postgres
  - PlanetScale
  - Supabase
  - MongoDB Atlas

### Environment Variables
- All sensitive data must be stored in Vercel environment variables
- Never commit `.env` files to your repository
- Use different environment variables for different deployment environments

### Function Timeout
- Vercel has a 10-second timeout for Hobby plans
- The `vercel.json` configures a 30-second timeout for Pro plans
- Email sending operations should complete within these limits

### Cold Starts
- Serverless functions may experience cold starts
- The first request after inactivity may be slower
- Database initialization happens on each cold start

## Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Ensure variables are set for all environments (Production, Preview, Development)
   - Redeploy after adding environment variables
   - Check variable names match exactly (case-sensitive)

2. **Database Errors**
   - SQLite files in `/tmp` are temporary
   - Data persistence is not guaranteed
   - Consider using a cloud database for production

3. **Email Sending Failures**
   - Verify SendGrid API key is correct
   - Ensure FROM_EMAIL is verified in SendGrid
   - Check SendGrid account limits and billing

4. **Build Failures**
   - Ensure all dependencies are in `package.json`
   - Check Node.js version compatibility
   - Verify all import paths are correct

### Debugging

1. **Check Vercel Logs**:
   - Go to your project dashboard
   - Click on a deployment
   - View "Functions" tab for logs

2. **Test Locally First**:
   ```bash
   npm install
   npm start
   ```

3. **Use Vercel CLI for Debugging**:
   ```bash
   vercel logs
   vercel dev
   ```

## Production Considerations

### Database Migration
For production use, consider migrating from SQLite to a cloud database:

1. **Vercel Postgres** (Recommended)
   ```bash
   vercel storage create postgres
   ```

2. **Update database connection** in `src/database/database.js`

3. **Update environment variables** with database connection string

### Monitoring
- Set up Vercel Analytics
- Configure error monitoring (Sentry, etc.)
- Monitor email delivery rates in SendGrid

### Security
- Use HTTPS (automatic with Vercel)
- Implement rate limiting
- Add authentication for admin panel
- Regular security updates

## Custom Domain (Optional)

1. **Add custom domain** in Vercel dashboard
2. **Configure DNS** as instructed by Vercel
3. **Update SendGrid settings** if needed

## Cost Optimization

- **Hobby Plan**: Free tier with limitations
- **Pro Plan**: $20/month for more resources
- **Monitor usage** in Vercel dashboard
- **Optimize function size** and execution time

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **SendGrid Support**: [sendgrid.com/support](https://sendgrid.com/support)

---

Your BCI Email Service is now deployed and ready to use! 🚀 