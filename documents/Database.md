# Database

This document describes the database, the relations and significance of the tables, and their structure.
created: 2024-04-17 Jimmy Karlsson
gauged state: 2NF

## exercises [ id: int8, name: text ] pk id

this table describes the actual exercise being preformed in a set.

- id is an auto-incremental integer used to identify the tuple (exercise),
- name is a text field holding the displayed name of the exercises

## muscle_group [ id: int8, name: text, icon_component: text, icon_uri ] pk id

this table describes the muscle_groups referenced to by the exercises.muscle_groups column.
It names the muscle / muscle group and points to an image resource.

- id is an auto-incremental integer used to identify the tuple (muscle_group),
- name is a text field holding the displayed name of the muscle group,
- icon_component is the applications primary source for an image and holds the name of the react component containing the image.
- icon_uri is the applications secondary source for an image and holds a uri to a image resource, it is only used if an internal component is not available.

## exercise_muscle_group [id: int8, exercise: int8, muscle_group: int8, order: int2 ] pk id

this table describes the 1:N relationship between a row in exercises and several rows in muscle_group,
and consequently replaces the previous array muscle_groups in exercises. The change was due to the almost instant faults of deletion that occurred in the data.

- id is an auto-incremental integer used to identify the tuple,
- exercise is a foreign key to the id of the exercise that targets muscle_group(s),
- muscle_group is a foreign key to the id of the muscle_group being targeted by an exercise,
- order is how primarily the exercise targets that muscle_group and replaces the index of the array, 0 is the primary target

## set [ id:int8, exercise: int8, weight: int2, duration_minutes: int4, owner_uuid: uuid, repetitions: int4, sets: int4, rest_minutes: int4 ] pk id

this table describes a set, or if you will the planned or taken action of performing the exercise.

- id is an auto-incremental integer used to identify the tuple (set),
- exercise is a foreign key that points to a specific exercise in the exercises table being preformed in this set,
- weight is the weight in kg being lifted/used in the exercise if the exercise uses weights,
- duration_minutes is the amount of time in minutes the exercise should be preformed,
- ower_uuid is a foreign key that links the set to the user that planned / preformed it,
- repetitions is the amounts of times the exercise should be done,
- sets is the amounts of times the entire set should be repeated,
- rest_minutes is the time that should pass between sets

## training_day [ id: int8, created_at: timestampz, owner_uuid: uuid, session_name: text ] pk id

this table describes a training_day or training session… that is to say a visit to the gym.

- id is an auto-incremental integer used to identify the tuple (training_day),
- created_at is a timestamp with timezone set at the row creating,
- owner_uuid is a foreign key that links the training_day to the user that planned it,
- session_name is the display name of the training_day… example "Leg day"

## training_day_set [ id: int8, training_day_id: int8, set: int8 ] pk id

this table describes the 1:n relationship between a row in training_day and several  set(s) row(s),
as an example, what sets are included in "Leg day"

- id is an auto-incremental integer used to identify the tuple,
- training_day_id is a foreign key to training_day that identifies what training_day the set is added to
- set is a foreign key that indicates what set is added to the training_day

## preformed_training_day [ id: int8, created_at: timestampz, owner_uuid: uuid, session_name: text ] pk id

this table describes training_day that is preformed in contrast to planned, see training_day as they are identical in every aspect apart from usage.

## program [ id: int8, created_at: timestampz, owner_uuid: uuid, traning_day_id :int8, date: date, status: TRAINING_DAY_STATUS, comment: text ]

this table describes a training program, what training_day is to be / have been preformed on what date

- id is an auto-incremental integer used to identify the tuple,
- created_at is a timestamp with timezone at the moment the post is created
- owner_uuid is a foreign key linking the program to the user that created it
- training_day_is is a foreign key linking the training_day being planned or preformed to the program
- date is the date the training is planned or preformed
- status is an enum describing the state of the training_day. details below
- comment is a textfield where the user can store any other information that might be relevant, the reason for a SKIPPED_OTHER, a certain machine being broken that day, "decided to max today", "first session with PT Joe" or similar.

### TRAINING_DAY_STATUS is an enum [ PENDING, DONE, SKIPPED_INJURY, SKIPPED_SORENESS, SKIPPED_PAIN, SKIPPED_WEAK, SKIPPED_OTHER ]

  PENDING - is in the planned state  
  DONE - is completed  
  SKIPPED_INJURY - was not completed due to injury  
  SKIPPED_SORENESS - was not completed due to muscle sourness  
  SKIPPED_PAIN - was not completed due to experiencing pain  
  SKIPPED_WEAK - was not completed due to muscle fatigue  
  SKIPPED_OTHER - was not completed due to ???  

## user_details [ id: uuid, display_name: text, first_name: text, last_name: text, avarat_url: text, current_weight: float, target_weight: float ] pk id

this table stores non-auth and non-sensitive information about the user

- id is a foreign key linking to the auth database
- display_name is the users username
- first_name is the users given name, if the user wants to provide it
- last_name is the users sir name, if the user wants to provide it
- avatar_url is a uri link to an image the user wants to use as avatar.

## user_role [ id: int8, uuid: uuid, role: ROLE ] pk id

this take stores the user roles of a user, determining what the user have access to

- id is an auto-incremental integer used to identify the tuple,
- uuid is the users uuid given by the auth service, used to identify the user
- role is an enum stating what role the user has, described below.

### ROLE is an enum [ ADMIN, USER, TRAINER, GYM_ADMIN, GYM_OWNER ]

  ADMIN - System owner, has access to everything, all data, and can change the role of other users.  
  USER - Standard user, limited access and can only read and change their own data.  
  TRAINER - NOT YET IMPLEMENTED - Standard user, limited access, can read and change their own data, and read data belonging to users that have given permission.  
  GYM_ADMIN -  NOT YET IMPLEMENTED  
  GYM_OWNER - NOT YET IMPLEMENTED  
