require('dotenv').config();
const { Client } = require('pg');

// Load environment variables
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

// Create a new PostgreSQL client
const client = new Client({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

const runMigration = async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database.');

    // SQL queries
    const queries = `
    
      -- Delete data 
      delete from "Jobs";
      delete from "Contracts";
      delete from "Profiles";
      
      -- Insert into Profile
      INSERT INTO "Profiles" (id, "firstName", "lastName", profession, balance, type) VALUES
        (1, 'Harry', 'Potter', 'Wizard', 1150, 'client'),
        (2, 'Mr', 'Robot', 'Hacker', 231.11, 'client'),
        (3, 'John', 'Snow', 'Knows nothing', 451.3, 'client'),
        (4, 'Ash', 'Kethcum', 'Pokemon master', 1.3, 'client'),
        (5, 'John', 'Lenon', 'Musician', 64, 'contractor'),
        (6, 'Linus', 'Torvalds', 'Programmer', 1214, 'contractor'),
        (7, 'Alan', 'Turing', 'Programmer', 22, 'contractor'),
        (8, 'Aragorn', 'II Elessar Telcontarvalds', 'Fighter', 314, 'contractor');

      -- Insert into Contract
      INSERT INTO "Contracts" (id, terms, status, "ClientId", "ContractorId") VALUES
        (1, 'bla bla bla', 'terminated', 1, 5),
        (2, 'bla bla bla', 'in_progress', 1, 6),
        (3, 'bla bla bla', 'in_progress', 2, 6),
        (4, 'bla bla bla', 'in_progress', 2, 7),
        (5, 'bla bla bla', 'new', 3, 8),
        (6, 'bla bla bla', 'in_progress', 3, 7),
        (7, 'bla bla bla', 'in_progress', 4, 7),
        (8, 'bla bla bla', 'in_progress', 4, 6),
        (9, 'bla bla bla', 'in_progress', 4, 8);

      -- Insert into Job
      INSERT INTO "Jobs" (description, price, paid, "paymentDate", "ContractId") VALUES
        ('work', 200, FALSE, NULL, 1),
        ('work', 201, FALSE, NULL, 2),
        ('work', 202, FALSE, NULL, 3),
        ('work', 200, FALSE, NULL, 4),
        ('work', 200, FALSE, NULL, 7),
        ('work', 2020, TRUE, '2020-08-15T19:11:26.737Z', 7),
        ('work', 200, TRUE, '2020-08-15T19:11:26.737Z', 2),
        ('work', 200, TRUE, '2020-08-16T19:11:26.737Z', 3),
        ('work', 200, TRUE, '2020-08-17T19:11:26.737Z', 1),
        ('work', 200, TRUE, '2020-08-17T19:11:26.737Z', 5),
        ('work', 21, TRUE, '2020-08-10T19:11:26.737Z', 1),
        ('work', 21, TRUE, '2020-08-15T19:11:26.737Z', 2),
        ('work', 121, TRUE, '2020-08-15T19:11:26.737Z', 3),
        ('work', 121, TRUE, '2020-08-14T23:11:26.737Z', 3);
    `;

    // Execute the queries
    await client.query(queries);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Disconnect from the database
    await client.end();
    console.log('Disconnected from the database.');
  }
};

// Run the migration
runMigration();
