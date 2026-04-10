-- OraHR D1 Database Schema
CREATE TABLE IF NOT EXISTS employees (
  id         TEXT    PRIMARY KEY,
  firstName  TEXT    NOT NULL,
  lastName   TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  phone      TEXT    NOT NULL DEFAULT '',
  department TEXT    NOT NULL,
  role       TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'Active',
  startDate  TEXT    NOT NULL,
  salary     INTEGER NOT NULL DEFAULT 0,
  location   TEXT    NOT NULL DEFAULT '',
  manager    TEXT    NOT NULL DEFAULT ''
);

-- Seed data: 15 employees
INSERT OR IGNORE INTO employees VALUES
  ('1','Alice','Johnson','alice.johnson@oracons.com','+1 (555) 234-5678','Engineering','Senior Software Engineer','Active','2021-03-15',125000,'San Francisco, CA','Grace Wilson'),
  ('2','Bob','Smith','bob.smith@oracons.com','+1 (555) 345-6789','Marketing','Marketing Manager','Active','2020-07-01',95000,'New York, NY','Carol White'),
  ('3','Carol','White','carol.white@oracons.com','+1 (555) 456-7890','HR','HR Director','Active','2019-01-10',110000,'San Francisco, CA',''),
  ('4','David','Brown','david.brown@oracons.com','+1 (555) 567-8901','Sales','Sales Representative','Active','2022-05-20',75000,'Chicago, IL','Isabella Anderson'),
  ('5','Emma','Davis','emma.davis@oracons.com','+1 (555) 678-9012','Engineering','Frontend Developer','Remote','2022-08-15',105000,'Austin, TX','Alice Johnson'),
  ('6','Frank','Miller','frank.miller@oracons.com','+1 (555) 789-0123','Finance','Financial Analyst','Active','2020-11-30',90000,'Boston, MA','Liam Harris'),
  ('7','Grace','Wilson','grace.wilson@oracons.com','+1 (555) 890-1234','Product','Product Manager','Active','2018-06-01',115000,'San Francisco, CA',''),
  ('8','Henry','Taylor','henry.taylor@oracons.com','+1 (555) 901-2345','Engineering','Backend Developer','Active','2021-09-01',110000,'Seattle, WA','Alice Johnson'),
  ('9','Isabella','Anderson','isabella.anderson@oracons.com','+1 (555) 012-3456','Sales','Sales Manager','On Leave','2019-04-22',100000,'Los Angeles, CA','Carol White'),
  ('10','James','Thomas','james.thomas@oracons.com','+1 (555) 123-4567','Marketing','Content Writer','Remote','2023-02-14',72000,'Denver, CO','Bob Smith'),
  ('11','Karen','Jackson','karen.jackson@oracons.com','+1 (555) 234-5679','Engineering','DevOps Engineer','Active','2020-03-10',120000,'San Francisco, CA','Alice Johnson'),
  ('12','Liam','Harris','liam.harris@oracons.com','+1 (555) 345-6780','Finance','Senior Accountant','Active','2018-11-05',95000,'New York, NY',''),
  ('13','Maria','Martinez','maria.martinez@oracons.com','+1 (555) 456-7891','HR','HR Specialist','Active','2022-01-17',78000,'Miami, FL','Carol White'),
  ('14','Nathan','Robinson','nathan.robinson@oracons.com','+1 (555) 567-8902','Engineering','Junior Developer','Active','2023-06-01',80000,'Austin, TX','Henry Taylor'),
  ('15','Olivia','Clark','olivia.clark@oracons.com','+1 (555) 678-9013','Sales','Account Executive','Remote','2021-10-12',85000,'Portland, OR','Isabella Anderson');
