# HP Enterprise - hpserve.site

Real-time order management system with Supabase sync between website and admin panel.

## Features
- ✅ Customer orders sync from website to admin panel in real-time
- ✅ Admin panel syncs updates back to website instantly
- ✅ Supabase real-time listeners
- ✅ Automatic order creation and status tracking

## Project Structure
```
web/                    # Customer website (HTML/CSS/JS)
admin/                  # Admin panel (HTML/CSS/JS)
supabase/              # Supabase configuration & SQL
config/                # Environment configuration
```

## Setup Instructions

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Initialize Supabase
```bash
supabase init
supabase link
supabase db pull
```

### 3. Run Schema
```bash
supabase db push
```

### 4. Update Environment Variables
Create `.env.local` with your Supabase credentials.

### 5. Start Local Server
```bash
cd web
python -m http.server 3000

# In another terminal
cd admin
python -m http.server 3001
```

## Real-time Sync Flow

**Customer → Website → Supabase → Admin Panel**
1. Customer fills booking form
2. Website sends to `hpe_bookings` table
3. Admin panel receives real-time update
4. Admin sees new order instantly ✅

**Admin → Panel → Supabase → Customer**
1. Admin updates order status
2. Database updates `hpe_bookings`
3. Website receives real-time notification
4. Customer sees status change instantly ✅

## Documentation
- See `docs/` for detailed setup guides
- See `supabase/sql/` for database schemas
- See `web/` and `admin/` for implementation
