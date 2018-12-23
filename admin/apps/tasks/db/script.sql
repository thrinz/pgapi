CREATE TABLE IF NOT EXISTS tasks (
  id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  due_date   timestamp with time zone NOT NULL,
  priority   integer NOT NULL,
  created timestamp with time zone NOT NULL,
  updated timestamp with time zone NOT NULL
  );