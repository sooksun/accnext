const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class BackupService {
  constructor() {
    // รองรับกำหนดโฟลเดอร์ backup ผ่าน ENV (ค่าเริ่มต้น ../backups)
    const configuredDir = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
    this.backupDir = configuredDir;
    this.ensureBackupDirectory();
  }

  // Ensure backup directory exists
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Create database backup
  async createDatabaseBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Get database configuration from environment
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'accnext'
      };

      // Create mysqldump command
      const dumpCommand = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ''} ${dbConfig.database} > "${backupPath}"`;

      await execAsync(dumpCommand);

      // Compress the backup file
      const compressedPath = await this.compressFile(backupPath);

      // Remove the uncompressed file
      fs.unlinkSync(backupPath);

      return {
        success: true,
        fileName: path.basename(compressedPath),
        filePath: compressedPath,
        size: fs.statSync(compressedPath).size,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Backup creation failed:', error);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  // Compress file using gzip
  async compressFile(filePath) {
    return new Promise((resolve, reject) => {
      const gzip = require('zlib').createGzip();
      const compressedPath = `${filePath}.gz`;
      const input = fs.createReadStream(filePath);
      const output = fs.createWriteStream(compressedPath);

      input.pipe(gzip).pipe(output);

      output.on('finish', () => {
        resolve(compressedPath);
      });

      output.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Restore database from backup
  async restoreFromBackup(backupFilePath) {
    try {
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'accnext'
      };

      // Decompress if needed
      let sqlFilePath = backupFilePath;
      if (backupFilePath.endsWith('.gz')) {
        sqlFilePath = await this.decompressFile(backupFilePath);
      }

      // Restore command
      const restoreCommand = `mysql -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ''} ${dbConfig.database} < "${sqlFilePath}"`;

      await execAsync(restoreCommand);

      // Clean up temporary file if it was decompressed
      if (sqlFilePath !== backupFilePath) {
        fs.unlinkSync(sqlFilePath);
      }

      return {
        success: true,
        message: 'Database restored successfully'
      };

    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error(`Failed to restore database: ${error.message}`);
    }
  }

  // Decompress gzip file
  async decompressFile(filePath) {
    return new Promise((resolve, reject) => {
      const gunzip = require('zlib').createGunzip();
      const decompressedPath = filePath.replace('.gz', '');
      const input = fs.createReadStream(filePath);
      const output = fs.createWriteStream(decompressedPath);

      input.pipe(gunzip).pipe(output);

      output.on('finish', () => {
        resolve(decompressedPath);
      });

      output.on('error', (error) => {
        reject(error);
      });
    });
  }

  // List available backups
  async listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.sql.gz')) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          
          // Extract timestamp from filename
          const timestampMatch = file.match(/backup_(.+)\.sql\.gz/);
          const timestamp = timestampMatch ? new Date(timestampMatch[1].replace(/-/g, ':')) : stats.mtime;

          backups.push({
            fileName: file,
            filePath,
            size: stats.size,
            timestamp,
            formattedSize: this.formatFileSize(stats.size)
          });
        }
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) => b.timestamp - a.timestamp);

      return backups;

    } catch (error) {
      console.error('Failed to list backups:', error);
      throw new Error(`Failed to list backups: ${error.message}`);
    }
  }

  // Clean old backups
  async cleanOldBackups(retentionDays = 30) {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const backupsToDelete = backups.filter(backup => backup.timestamp < cutoffDate);
      let deletedCount = 0;

      for (const backup of backupsToDelete) {
        try {
          fs.unlinkSync(backup.filePath);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete backup ${backup.fileName}:`, error);
        }
      }

      return {
        success: true,
        deletedCount,
        totalBackups: backups.length,
        retentionDays
      };

    } catch (error) {
      console.error('Failed to clean old backups:', error);
      throw new Error(`Failed to clean old backups: ${error.message}`);
    }
  }

  // Format file size
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Get backup statistics
  async getBackupStats() {
    try {
      const backups = await this.listBackups();
      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
      const oldestBackup = backups.length > 0 ? backups[backups.length - 1] : null;
      const newestBackup = backups.length > 0 ? backups[0] : null;

      return {
        totalBackups: backups.length,
        totalSize: this.formatFileSize(totalSize),
        oldestBackup: oldestBackup ? oldestBackup.timestamp : null,
        newestBackup: newestBackup ? newestBackup.timestamp : null,
        averageSize: backups.length > 0 ? this.formatFileSize(totalSize / backups.length) : '0 Bytes'
      };

    } catch (error) {
      console.error('Failed to get backup stats:', error);
      throw new Error(`Failed to get backup stats: ${error.message}`);
    }
  }

  // Schedule automatic backup
  scheduleBackup(cronExpression = '0 0 * * 0') { // Default: weekly on Sunday at midnight
    const cron = require('node-cron');
    
    return cron.schedule(cronExpression, async () => {
      try {
        console.log('Starting scheduled backup...');
        const result = await this.createDatabaseBackup();
        console.log('Scheduled backup completed:', result.fileName);
        
        // Clean old backups after successful backup
        await this.cleanOldBackups();
        
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    });
  }
}

module.exports = BackupService; 