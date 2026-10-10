
import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL dan SUPABASE_KEY wajib diatur.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const validStatuses = [
  'Dipinjam',
  'Dikembalikan',
  'Terlambat'
];

function isValidLoan(body) {
  return (
    typeof body.member_name === 'string' &&
    body.member_name.trim() !== '' &&
    typeof body.book_title === 'string' &&
    body.book_title.trim() !== '' &&
    typeof body.due_date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(body.due_date) &&
    !Number.isNaN(Date.parse(body.due_date))
  );
}

app.get('/', (req, res) => {
  res.json({
    message: 'API Peminjaman Buku berjalan.',
    endpoints: [
      'GET /loans',
      'GET /loans/:id',
      'POST /loans',
      'PUT /loans/:id',
      'DELETE /loans/:id'
    ]
  });
});

// READ: semua data dan filter status
app.get('/loans', async (req, res) => {
  try {
    let query = supabase
      .from('loans')
      .select('*')
      .order('id', { ascending: true });

    const { status } = req.query;

    if (status) {
      if (
        typeof status !== 'string' ||
        !validStatuses.includes(status)
      ) {
        return res.status(400).json({
          error: 'Status tidak valid.',
          valid_statuses: validStatuses
        });
      }

      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.json({
      message: 'Data peminjaman berhasil diambil.',
      total: data.length,
      data
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// READ: data berdasarkan ID
app.get('/loans/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }

    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        error: 'Data peminjaman tidak ditemukan.'
      });
    }

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// CREATE: menambahkan peminjaman
app.post('/loans', async (req, res) => {
  try {
    if (!isValidLoan(req.body)) {
      return res.status(400).json({
        error: 'Nama anggota, judul buku, dan due_date wajib valid.'
      });
    }

    const {
      member_name,
      book_title,
      loan_date,
      due_date,
      return_date,
      status
    } = req.body;

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Status tidak valid.',
        valid_statuses: validStatuses
      });
    }

    const payload = {
      member_name: member_name.trim(),
      book_title: book_title.trim(),
      due_date,
      ...(loan_date !== undefined && { loan_date }),
      ...(return_date !== undefined && { return_date }),
      ...(status !== undefined && { status })
    };

    const { data, error } = await supabase
      .from('loans')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: 'Peminjaman berhasil ditambahkan.',
      data
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// UPDATE: mengubah peminjaman
app.put('/loans/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }

    const allowedFields = [
      'member_name',
      'book_title',
      'loan_date',
      'due_date',
      'return_date',
      'status'
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Masukkan minimal satu kolom yang ingin diubah.'
      });
    }

    if (
      ('member_name' in updates &&
        (typeof updates.member_name !== 'string' ||
          !updates.member_name.trim())) ||
      ('book_title' in updates &&
        (typeof updates.book_title !== 'string' ||
          !updates.book_title.trim()))
    ) {
      return res.status(400).json({
        error: 'Nama anggota dan judul buku tidak boleh kosong.'
      });
    }

    if (
      'status' in updates &&
      !validStatuses.includes(updates.status)
    ) {
      return res.status(400).json({
        error: 'Status tidak valid.',
        valid_statuses: validStatuses
      });
    }

    if (
      'due_date' in updates &&
      (typeof updates.due_date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(updates.due_date) ||
        Number.isNaN(Date.parse(updates.due_date)))
    ) {
      return res.status(400).json({
        error: 'due_date harus menggunakan format YYYY-MM-DD.'
      });
    }

    if ('member_name' in updates) {
      updates.member_name = updates.member_name.trim();
    }

    if ('book_title' in updates) {
      updates.book_title = updates.book_title.trim();
    }

    const { data, error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        error: 'Data peminjaman tidak ditemukan.'
      });
    }

    return res.json({
      message: 'Peminjaman berhasil diperbarui.',
      data
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE: menghapus peminjaman
app.delete('/loans/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }

    const { data, error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        error: 'Data peminjaman tidak ditemukan.'
      });
    }

    return res.json({
      message: 'Peminjaman berhasil dihapus.',
      id: data.id
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Handler untuk endpoint yang tidak tersedia
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

// Menjalankan server hanya untuk pengembangan lokal
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

export default app;
