INSERT INTO patient (name, gender, birth_date, email, blood_group)
VALUES
    ('Archit Sharma', 'MALE', '1990-05-10', 'archit.sharma@example.com', 'O_POSITIVE'),
    ('Harshit Patel', 'FEMALE', '1995-08-20', 'harshit.patel@example.com', 'A_POSITIVE'),
    ('Dishant Verma', 'MALE', '1988-03-15', 'dishant.verma@example.com', 'A_POSITIVE'),
    ('Krishnan Iyer', 'FEMALE', '1992-12-01', 'krish.iyer@example.com', 'AB_POSITIVE'),
    ('Harshit Singh', 'MALE', '1993-07-11', 'harshit.singh@example.com', 'O_POSITIVE');

INSERT INTO doctor (name, specialization, email)
VALUES
    ('Dr. Aman Kumar', 'Cardiology', 'aman.kumar@example.com'),
    ('Dr. Archit Mishra', 'Dermatology', 'archit.mishra@example.com'),
    ('Dr. Akash Rawat', 'Orthopedics', 'akash.rawat@example.com');

INSERT INTO appointment (appointment_time, reason, doctor_id, patient_id)
VALUES
  ('2025-07-01 10:30:00', 'General Checkup', 1, 2),
  ('2025-07-02 11:00:00', 'Skin Rash', 2, 2),
  ('2025-07-03 09:45:00', 'Knee Pain', 3, 3),
  ('2025-07-04 14:00:00', 'Follow-up Visit', 1, 1),
  ('2025-07-05 16:15:00', 'Consultation', 1, 4),
  ('2025-07-06 08:30:00', 'Allergy Treatment', 2, 5);