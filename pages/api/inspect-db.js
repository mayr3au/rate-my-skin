import { createAdminClient } from '../../lib/supabase';

export default async function handler(req, res) {
  const supabase = createAdminClient();
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({
      columns: data.length > 0 ? Object.keys(data[0]) : [],
      sample: data.length > 0 ? data[0] : null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
