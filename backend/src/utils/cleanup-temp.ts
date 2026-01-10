import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';

const cleanupTempFiles = async () => {
  const tempDir = 'temp/uploads';
  const maxAge = 3 * 60 * 60 * 1000;

  try {
    await fs.access(tempDir);
  } catch {
    return;
  }

  const files = await fs.readdir(tempDir);
  const now = Date.now();

  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(tempDir, file);

      try {
        const stats = await fs.stat(filePath);
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
        }
      } catch {
        // Игнорируем ошибки
      }
    }),
  );
};

cron.schedule('0 2 * * *', cleanupTempFiles);
cleanupTempFiles();

export default cleanupTempFiles;
