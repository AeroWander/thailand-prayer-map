import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fehizraqlenwkrkxlvfp.supabase.co';
const supabaseKey = 'sb_publishable_HmTGVDy-fb1cS3e5NtQFrw_7F4XcLo1';

export const supabase = createClient(supabaseUrl, supabaseKey);
