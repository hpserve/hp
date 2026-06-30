# Setup Guide - hpserve.site Real-Time Order Sync

## Prerequisites
- Node.js 16+
- Supabase account
- Git

## Step 1: Clone Repository
```bash
git clone https://github.com/hpserve/hp.git
cd hp
```

## Step 2: Set Up Supabase

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your:
   - Project URL
   - Anon Key
   - Service Role Key

### Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase/sql/init.sql`
4. Click **Run**
5. Repeat with `supabase/sql/rls.sql`

### Enable Realtime
1. Go to **Database** → **Publications**
2. Click **Enable realtime** for:
   - `hpe_bookings`
   - `hpe_departments`
   - `hpe_services`
   - `hpe_enquiries`

## Step 3: Configure Environment

### Copy .env.example
```bash
cp .env.example .env.local
```

### Update .env.local
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Update web/config.js
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### Update admin/config.js
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## Step 4: Start Local Development

### Website (Customer)
```bash
cd web
python -m http.server 3000
# Or: python3 -m http.server 3000
```
Visit: http://localhost:3000

### Admin Panel (in another terminal)
```bash
cd admin
python -m http.server 3001
```
Visit: http://localhost:3001

## Step 5: Test Real-Time Sync

### Test Customer Order → Admin Panel
1. Open http://localhost:3000 in one browser
2. Open http://localhost:3001 in another browser
3. Fill out booking form on website
4. Submit booking
5. **Admin panel should show new order instantly!** ✅

### Test Admin Update → Website
1. Click on order in admin panel
2. Change status to "Confirmed"
3. Save changes
4. **Website should update instantly!** ✅

## Troubleshooting

### Orders not appearing in admin?
1. Check browser console for errors
2. Verify Supabase URL and keys are correct
3. Ensure Realtime is enabled on `hpe_bookings` table
4. Check that RLS policies are in place

### Real-time not working?
1. Verify Realtime is enabled in Supabase
2. Check network tab in browser dev tools
3. Look for WebSocket connection (should show `wss://`)
4. Check Supabase logs for errors

### Admin login not working?
1. Default username: `admin`
2. Default password: `HASH_THIS_PASSWORD`
3. Change after first login

## Next Steps

1. **Add proper authentication**
   - Implement Supabase Auth
   - Add JWT token verification

2. **Add more features**
   - Payment gateway integration
   - SMS/Email notifications
   - Staff management
   - Customer tracking

3. **Deploy to production**
   - Deploy website to Vercel/Netlify
   - Deploy admin panel to similar platform
   - Set up custom domain
   - Enable HTTPS

4. **Monitor and optimize**
   - Set up error tracking (Sentry)
   - Monitor real-time performance
   - Optimize database queries

## Support
For issues, check:
- Supabase documentation: https://supabase.com/docs
- GitHub Issues: https://github.com/hpserve/hp/issues
