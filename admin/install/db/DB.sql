CREATE TABLE IF NOT EXISTS CONNECTIONS
( id text NOT NULL
, name text NOT NULL
, host text NOT NULL
, port integer NOT NULL
, database text NOT NULL
, username text NOT NULL
, password text NOT NULL
, ref_source_id text 
, config_flag text NOT NULL
, created timestamp with time zone NOT NULL
, created_by text 
, updated timestamp with time zone NOT NULL
, updated_by text 
, UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS FUNCTIONS
( id text NOT NULL
, name text NOT NULL
, connection_id text NOT NULL
, db_method text NOT NULL
, ref_source_id text 
, created timestamp with time zone NOT NULL
, created_by text 
, updated timestamp with time zone NOT NULL
, updated_by text 
, UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS ROUTES
( id  text NOT NULL
, name text NOT NULL
, function_id text NOT NULL
, route_method text NOT NULL
, route_url text NOT NULL
, enabled_flag text NOT NULL
, description text
, sample_request text
, sample_response text
, ref_source_id text 
, created timestamp with time zone NOT NULL
, created_by text 
, updated timestamp with time zone NOT NULL
, updated_by text 
, UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS USERS
( id text NOT NULL
, username text NOT NULL
, first_name text
, last_name text
, password text NOT NULL
, ref_user_id text 
, enabled_flag text NOT NULL
, created timestamp with time zone NOT NULL
, created_by text 
, updated timestamp with time zone NOT NULL
, updated_by text 
, UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS DELETED_USERS
( id text NOT NULL
, username text NOT NULL
, first_name text 
, last_name text 
, created timestamp with time zone NOT NULL
, created_by text 
, updated timestamp with time zone NOT NULL
, updated_by text 
, UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS tokens
(
  token text NOT NULL
, start_time  timestamp with time zone NOT NULL
, user_id text NOT NULL
, timeout_time  timestamp with time zone NOT NULL
, created timestamp with time zone NOT NULL
, created_by text 
, updated timestamp with time zone NOT NULL
, updated_by text 
, UNIQUE (token)
);

CREATE TABLE IF NOT EXISTS applications
(
  id text NOT NULL
, name text NOT NULL
, app_short_code text
, created timestamp with time zone NOT NULL
, created_by text 
, updated timestamp with time zone NOT NULL
, updated_by text 
, UNIQUE (name)
, UNIQUE (app_short_code)
);

CREATE TABLE IF NOT EXISTS current_version 
(
  created timestamp with time zone NOT NULL
, version text NOT NULL
);