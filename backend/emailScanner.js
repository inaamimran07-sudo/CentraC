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

      // Search for unread emails from the last 7 days
      const searchCriteria = [
        'UNSEEN',
        ['SINCE', this.getDateSevenDaysAgo()]
      ];

      const fetchOptions = {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT', ''],
        struct: true,
        markSeen: false
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      console.log(`📨 Found ${messages.length} unread messages for ${email}`);

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
      const all = item.parts.find(part => part.which === 'TEXT');
      const idHeader = item.parts.find(part => part.which === 'HEADER');

      if (!all || !idHeader) {
        console.log('⚠️  Missing email parts');
        return;
      }

      // Parse the full email including headers
      const mail = await simpleParser(all.body);
      
      // Try to get subject from parsed email first, then from header attributes
      let subject = mail.subject;
      
      // If no subject from parsed email, try to extract from header
      if (!subject && idHeader.body) {
        const headerMail = await simpleParser(idHeader.body);
        subject = headerMail.subject;
      }
      
      // Fallback to checking header attributes
      if (!subject && item.attributes && item.attributes.envelope) {
        subject = item.attributes.envelope.subject;
      }
      
      subject = subject || 'No Subject';
      const from = mail.from?.text || 'Unknown Sender';
      const fromEmail = mail.from?.value?.[0]?.address || 'No email';
      const date = mail.date || new Date();
      
      // Log email details for debugging
      console.log(`📧 Email found: Subject="${subject}", From=${from}, Date=${date.toLocaleDateString()}`);
      
      // Get email body text
      const emailText = mail.text || mail.html || 'No content';
      
      // Get attachments info
      const attachments = mail.attachments || [];
      const attachmentsList = attachments.map(att => `📎 ${att.filename} (${this.formatBytes(att.size)})`).join('\n');

      // Check for keywords - prioritize specific matches
      const keywords = {
        'corporation tax return': 'Corporation Tax Returns',
        'corporation tax': 'Corporation Tax Returns',
        'corp tax return': 'Corporation Tax Returns',
        'corp tax': 'Corporation Tax Returns',
        'ct600': 'Corporation Tax Returns',
        'corporate tax': 'Corporation Tax Returns',
        'self assessment': 'Self Assessments',
        'self-assessment': 'Self Assessments',
        'sa100': 'Self Assessments',
        'sa return': 'Self Assessments',
        'personal tax return': 'Self Assessments'
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
                if (matchedCategoryName === 'Corporation Tax Returns') {
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
