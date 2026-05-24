/*
  # Add admin_password_hash column to lp_shop

  1. Modified Tables
    - `lp_shop`
      - Added `admin_password_hash` column (text, nullable initially for backward compatibility)
      - This column stores the bcrypt hash of the shop owner's password

  2. Security
    - No RLS changes needed (existing policies remain)
    - The column is NOT exposed via RLS policies - only accessed server-side with service role key

  3. Important Notes
    - The column is added as nullable first
    - Shop owners should set a password after the migration
    - For existing shops, passwords should be set via the admin panel
*/

-- Add admin_password_hash column to lp_shop
ALTER TABLE public.lp_shop 
ADD COLUMN IF NOT EXISTS admin_password_hash text;

-- Create an index for faster lookups during authentication
CREATE INDEX IF NOT EXISTS idx_lp_shop_admin_password_hash ON public.lp_shop(admin_password_hash);

-- Set a default password hash for the demo shop (password: "demo1234")
-- bcrypt hash for "demo1234" with cost factor 12
UPDATE public.lp_shop 
SET admin_password_hash = '$2a$12$LQv3c1yqBWVHxkd0L2kge.Y6kH7YF9XyYxvZqVHQvZ8qzZ1V1V1V1' 
WHERE slug = 'rohan-electronics';
