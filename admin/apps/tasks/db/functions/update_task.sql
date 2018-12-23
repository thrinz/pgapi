CREATE OR REPLACE FUNCTION update_task ( p_data json)
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
  l_due_date timestamp;
  l_priority integer;
  l_cnt int;
BEGIN
  l_id := (p_data->>'id')::uuid; 
  l_name := (p_data->>'name')::text;
  l_description := (p_data->>'description')::text;
  l_due_date := (p_data->>'due_date')::timestamp;
  l_priority := (p_data->>'priority')::integer;
  
  UPDATE tasks
  SET name = COALESCE(l_name,name)
    , description = COALESCE(l_description, description)
    , due_date = COALESCE(l_due_date, due_date)
    , priority = COALESCE(l_priority, priority)
    , updated = NOW()
  WHERE id = l_id;
  
  GET DIAGNOSTICS l_cnt = row_count;  
  
  l_out :=  '{"status" : "S" , "message" : "OK" , "rows_affected" : "' || l_cnt || '"}';
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