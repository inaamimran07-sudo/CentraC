const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const sqlite3 = require('sqlite3').verbose();

class EmailScanner {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    this.scanningUsers = new Map(); // Track which users are being scanned
  }

  async scanAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT userId, provider, email, appPassword, lastSync FROM email_settings',
        [],
        async (err, rows) => {
          if (err) {
            console.error('Error fetching email settings:', err);
            return reject(err);
          }

          console.log(`📧 Scanning emails for ${rows.length} users...`);
          
          for (const settings of rows) {
            try {
              await this.scanUserEmails(settings);
            } catch (error) {
              console.error(`Error scanning emails for user ${settings.userId}:`, error.message);
            }
          }
          
          resolve();
        }
      );
    });
  }

  async scanUserEmails(settings) {
    const { userId, provider, email, appPassword, lastSync } = settings;

    // Prevent scanning the same user multiple times simultaneously
    if (this.scanningUsers.has(userId)) {
      console.log(`⏭️  Skipping scan for user ${userId} - already in progress`);
      return;
    }

    this.scanningUsers.set(userId, true);

    try {
      console.log(`📬 Scanning emails for ${email}...`);
      
      const decryptedPassword = Buffer.from(appPassword, 'base64').toString('utf-8');

      const config = {
        imap: {
          user: email,
          password: decryptedPassword,
          host: provider === 'gmail' ? 'imap.gmail.com' : 'imap-mail.outlook.com',
          port: 993,
          tls: true,
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 10000
        }
      };

      const connection = await imaps.connect(config);
      await connection.openBox('INBOX');

      // TEMPORARY: Search for ALL emails from the last 7 days (not just unread)
      const searchCriteria = [
        ['SINCE', this.getDateSevenDaysAgo()]
      ];

      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        struct: true,
        markSeen: false
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      console.log(`📨 Found ${messages.length} messages for ${email} (scanning ALL messages - temporary)`);

      for (const item of messages) {
        await this.processEmail(item, userId);
      }

      connection.end();

      // Update last sync time
      this.db.run(
        'UPDATE email_settings SET lastSync = CURRENT_TIMESTAMP WHERE userId = ?',
        [userId]
      );

      console.log(`✅ Completed scan for ${email}`);
    } catch (error) {
      console.error(`❌ Error scanning ${email}:`, error.message);
      throw error;
    } finally {
      this.scanningUsers.delete(userId);
    }
  }

  async processEmail(item, userId) {
    try {
      const all = item.parts.find(part => part.which === '');
      const headerPart = item.parts.find(part => part.which === 'HEADER');

      if (!all) {
        console.log('⚠️  Missing email body');
        return;
      }

      // Parse the complete email with full message
      const mail = await simpleParser(all.body);
      
      const subject = mail.subject || mail.headers.get('subject') || 'No Subject';
      
      // Extract sender info more reliably
      let from = 'Unknown Sender';
      let fromEmail = 'No email';
      
      if (mail.from && mail.from.value && mail.from.value.length > 0) {
        const sender = mail.from.value[0];
        from = sender.name || sender.address || 'Unknown Sender';
        fromEmail = sender.address || 'No email';
      } else if (mail.headers.has('from')) {
        const fromHeader = mail.headers.get('from');
        from = fromHeader;
        // Extract email from "Name <email@domain.com>" format
        const emailMatch = fromHeader.match(/<([^>]+)>/);
        fromEmail = emailMatch ? emailMatch[1] : fromHeader;
      }
      
      const date = mail.date || new Date();
      
      // Log email details for debugging
      console.log(`📧 Email found: Subject="${subject}", From=${from} (${fromEmail}), Date=${date.toLocaleDateString()}`);
      
      // Get email body text - prefer text over HTML
      let emailText = '';
      if (mail.text) {
        // Clean up text by removing excessive whitespace and boundary markers
        emailText = mail.text
          .replace(/--[0-9a-f]+/g, '') // Remove boundary markers
          .replace(/Content-Type:.*$/gm, '') // Remove content-type lines
          .replace(/charset=.*$/gm, '') // Remove charset lines
          .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
          .trim();
      } else if (mail.html) {
        // Strip HTML tags for cleaner text
        emailText = mail.html
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        emailText = 'No content';
      }
      
      // Get attachments info
      const attachments = mail.attachments || [];
      const attachmentsList = attachments.map(att => `📎 ${att.filename} (${this.formatBytes(att.size)})`).join('\n');

      // Check for keywords - prioritize specific matches
      const keywords = {
        'corporation tax return': 'Corporation Tax Return Emails',
        'corporation tax': 'Corporation Tax Return Emails',
        'corp tax return': 'Corporation Tax Return Emails',
        'corp tax': 'Corporation Tax Return Emails',
        'ct600': 'Corporation Tax Return Emails',
        'corporate tax': 'Corporation Tax Return Emails',
        'self assessment': 'Self Assessment Emails',
        'self-assessment': 'Self Assessment Emails',
        'sa100': 'Self Assessment Emails',
        'sa return': 'Self Assessment Emails',
        'personal tax return': 'Self Assessment Emails'
      };

      const textContent = `${subject} ${emailText}`.toLowerCase();
      let matchedCategoryName = null;

      // Match in order of specificity (more specific terms first)
      for (const [keyword, categoryName] of Object.entries(keywords)) {
        if (textContent.includes(keyword.toLowerCase())) {
          matchedCategoryName = categoryName;
          break;
        }
      }

      if (!matchedCategoryName) {
        console.log(`⏭️  No matching category for email: ${subject}`);
        return; // Not a relevant email
      }

      console.log(`📨 Processing email for category: ${matchedCategoryName}`);

      this.db.get(
        'SELECT id FROM categories WHERE name = ?',
        [matchedCategoryName],
        (err, category) => {
          if (err || !category) {
            console.error('Category not found:', matchedCategoryName);
            return;
          }

          // Check if we already have this email (by subject and sender email)
          this.db.get(
            `SELECT id FROM subcategories 
             WHERE categoryId = ? AND companyName = ? AND description LIKE ?`,
            [category.id, subject.substring(0, 100), `%${fromEmail}%`],
            (err, existing) => {
              if (existing) {
                console.log(`⏭️  Email already exists: ${subject}`);
                return;
              }

              // Try to extract company year end date from email content
              const yearEndDate = this.extractYearEndDate(emailText);
              
              // Build detailed description
              let description = `📧 EMAIL FROM: ${from}\n`;
              description += `📨 EMAIL ADDRESS: ${fromEmail}\n`;
              description += `📅 DATE: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}\n`;
              description += `🏷️  CATEGORY: ${matchedCategoryName}\n`;
              if (yearEndDate) {
                description += `📆 COMPANY YEAR END: ${yearEndDate.toLocaleDateString()}\n`;
              }
              description += `\n`;
              
              if (attachments.length > 0) {
                description += `📎 ATTACHMENTS (${attachments.length}):\n${attachmentsList}\n\n`;
              }
              
              description += `📄 EMAIL CONTENT:\n`;
              description += `${'-'.repeat(50)}\n`;
              description += emailText.substring(0, 2000); // Limit to 2000 chars
              if (emailText.length > 2000) {
                description += '\n... (content truncated)';
              }
              description += `\n${'-'.repeat(50)}\n\n`;
              description += `[Auto-created from email scan]`;

              // Calculate due date based on UK accountancy deadlines
              const dueDate = new Date();
              if (yearEndDate) {
                dueDate.setTime(yearEndDate.getTime());
                if (matchedCategoryName === 'Corporation Tax Return Emails') {
                  // UK CT600 filing deadline: 12 months after accounting period end
                  dueDate.setMonth(dueDate.getMonth() + 12);
                } else {
                  // UK Self Assessment: January 31st following the tax year end
                  // Tax year ends April 5th, deadline is January 31st of the next year
                  // If date is between April 6 and Dec 31, deadline is Jan 31 next year
                  // If date is between Jan 1 and April 5, deadline is Jan 31 same year (already passed for current year, so next)
                  const yearEndMonth = yearEndDate.getMonth();
                  const yearEndDay = yearEndDate.getDate();
                  
                  // Tax year runs April 6 to April 5
                  // If we're on or before April 5, deadline is Jan 31 of the following year
                  // If we're after April 5, deadline is Jan 31 of the year after next
                  if (yearEndMonth < 3 || (yearEndMonth === 3 && yearEndDay <= 5)) {
                    // Before or on April 5: deadline is Jan 31 next year
                    dueDate.setFullYear(yearEndDate.getFullYear() + 1);
                  } else {
                    // After April 5: deadline is Jan 31 of year after next
                    dueDate.setFullYear(yearEndDate.getFullYear() + 2);
                  }
                  dueDate.setMonth(0); // January
                  dueDate.setDate(31); // 31st
                }
              } else {
                // Default: 6 months from now if no year end found
                dueDate.setMonth(dueDate.getMonth() + 6);
              }

              this.db.run(
                `INSERT INTO subcategories 
                 (categoryId, companyName, description, assignedToUserId, priority, progress, dueDate, createdBy) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  category.id,
                  subject.substring(0, 100), // Company name = subject
                  description,
                  null, // Not assigned yet
                  'medium',
                  'not-started',
                  dueDate.toISOString().split('T')[0],
                  userId
                ],
                function(err) {
                  if (err) {
                    console.error('Error creating subcategory from email:', err);
                  } else {
                    console.log(`✨ Created new account from email: ${subject} → ${matchedCategoryName}`);
                  }
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('Error processing email:', error);
    }
  }

  extractYearEndDate(emailText) {
    // Common patterns for year end dates
    const patterns = [
      /year\s*end[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /year\s*ending[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /accounting\s*period\s*end[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /financial\s*year\s*end[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /period\s*end[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /y\/e[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*year\s*end/i,
      // Date format: 31 March 2024, 31st March 2024, etc.
      /year\s*end[:\s]+(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      /year\s*ending[:\s]+(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      /accounting\s*period\s*end[:\s]+(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
    ];

    for (const pattern of patterns) {
      const match = emailText.match(pattern);
      if (match) {
        const dateStr = match[1];
        try {
          // Try parsing the date
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            console.log(`📆 Found year end date: ${parsedDate.toLocaleDateString()}`);
            return parsedDate;
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }

    console.log('⚠️  No year end date found in email content');
    return null;
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getDateSevenDaysAgo() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }

  close() {
    this.db.close();
  }
}

module.exports = EmailScanner;
