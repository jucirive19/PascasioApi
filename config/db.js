const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Probar conexión al iniciar
(async () => {
  try {
    const { data, error } = await supabase.from('preguntas').select('id').limit(1);
    if (error) {
      console.error('❌ Error al conectar con Supabase:', error.message);
    } else {
      console.log('✅ Conectado exitosamente a Supabase');
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
})();

module.exports = supabase;