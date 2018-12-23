CREATE OR REPLACE FUNCTION create_bulk_tasks ( p_data json)
  RETURNS json AS
$BODY$ 
DECLARE 
  l_out json;
  l_message_text text;
  l_exception_detail text;
  l_exception_hint text;
  -- 
  l_id uuid;
  l_name text;
  l_description text;
  l_start_date timestamp;
  l_due_date timestamp;
  l_priority integer;
  l_task_record json;
  l_tasks_c CURSOR FOR SELECT json_array_elements(p_data->'tasks');

BEGIN
  
  OPEN l_tasks_c;
  LOOP
     FETCH l_tasks_c INTO l_task_record;
     EXIT WHEN NOT FOUND;
     
     l_id := md5(random()::text || clock_timestamp()::text)::uuid; 
     l_name := (l_task_record->>'name')::text;
     l_description := (l_task_record->>'description')::text;
     l_start_date := NOW();
     l_due_date := (l_task_record->>'due_date')::timestamp;
     l_priority := (l_task_record->>'priority')::integer;
     
     INSERT INTO tasks
     (
      id,
      name,
      description,
      start_date,
      due_date,
      priority,
      created,
      updated
      )
      VALUES
      (
      l_id,
      l_name,
      l_description,
      l_start_date,
      l_due_date,
      l_priority,
      NOW(),
      NOW()
      );

  
  END LOOP;
  CLOSE l_tasks_c;
  
  l_out :=  '{"status" : "S" , "message" : "OK" }';
  RETURN l_out;

EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS l_message_text = MESSAGE_TEXT,
                          l_exception_detail = PG_EXCEPTION_DETAIL,
                          l_exception_hint = PG_EXCEPTION_HINT;
  l_out := '{ "status" : "E" , "message" : "' || REPLACE(l_message_text, '"', E'\\"') || '" }';
  return l_out;  
END
$BODY$
  LANGUAGE plpgsql;