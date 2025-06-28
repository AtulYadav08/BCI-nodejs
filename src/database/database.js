const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        // Use a different path for Vercel deployment
        const dbPath = process.env.NODE_ENV === 'production' 
            ? '/tmp/bci_email.db'  // Vercel uses /tmp for writable storage
            : path.join(__dirname, '../../data/bci_email.db');
        
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('✅ Connected to SQLite database');
                this.initializeTables();
            }
        });
    }

    initializeTables() {
        // Create customers table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY,
                display_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating customers table:', err.message);
            }
        });

        // Create email_logs table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS email_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                email_type TEXT NOT NULL,
                recipient_email TEXT NOT NULL,
                recipient_name TEXT NOT NULL,
                subject TEXT NOT NULL,
                status TEXT DEFAULT 'sent',
                error_message TEXT,
                sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating email_logs table:', err.message);
            }
        });

        // Create customer_id_counter table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS customer_id_counter (
                id INTEGER PRIMARY KEY,
                next_id INTEGER DEFAULT 1000
            )
        `, (err) => {
            if (err) {
                console.error('Error creating customer_id_counter table:', err.message);
            } else {
                // Initialize counter if table is empty
                this.db.get('SELECT COUNT(*) as count FROM customer_id_counter', (err, row) => {
                    if (err) {
                        console.error('Error checking counter:', err.message);
                    } else if (row.count === 0) {
                        this.db.run('INSERT INTO customer_id_counter (id, next_id) VALUES (1, 1000)', (err) => {
                            if (err) {
                                console.error('Error initializing counter:', err.message);
                            }
                        });
                    }
                });
            }
        });
    }

    async addCustomer(displayName, email) {
        return new Promise((resolve, reject) => {
            // Get next customer ID
            this.db.get('SELECT next_id FROM customer_id_counter WHERE id = 1', (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                const customerId = row ? row.next_id : 1000;

                // Insert customer
                this.db.run(
                    'INSERT INTO customers (id, display_name, email) VALUES (?, ?, ?)',
                    [customerId, displayName, email],
                    function(err) {
                        if (err) {
                            if (err.message.includes('UNIQUE constraint failed')) {
                                // Customer already exists, get existing customer
                                this.db.get('SELECT * FROM customers WHERE email = ?', [email], (err, customer) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(customer);
                                    }
                                });
                            } else {
                                reject(err);
                            }
                        } else {
                            // Update counter
                            this.db.run('UPDATE customer_id_counter SET next_id = ? WHERE id = 1', [customerId + 1], (err) => {
                                if (err) {
                                    console.error('Error updating counter:', err.message);
                                }
                            });

                            resolve({
                                id: customerId,
                                display_name: displayName,
                                email: email,
                                created_at: new Date().toISOString()
                            });
                        }
                    }.bind(this)
                );
            });
        });
    }

    async getCustomerByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM customers WHERE email = ?', [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getAllCustomers() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM customers ORDER BY created_at DESC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async logEmail(customerId, emailType, recipientEmail, recipientName, subject, status = 'sent', errorMessage = null) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO email_logs (customer_id, email_type, recipient_email, recipient_name, subject, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [customerId, emailType, recipientEmail, recipientName, subject, status, errorMessage],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    async getEmailLogs() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    el.*,
                    c.display_name as customer_name,
                    c.email as customer_email
                FROM email_logs el
                LEFT JOIN customers c ON el.customer_id = c.id
                ORDER BY el.sent_at DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getEmailStats() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    email_type,
                    COUNT(*) as total_sent,
                    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as successful,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
                FROM email_logs
                GROUP BY email_type
                ORDER BY total_sent DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

module.exports = Database; 