CREATE OR REPLACE FUNCTION delete_task ( p_data json)
  RETURNS json AS
$BODY$ 
DECLARE 
  l_out json;
  l_message_text text;
  l_exception_detail text;
  l_exception_hint text;
  -- 
  l_id uuid;
  l_cnt int;
BEGIN
  l_id := (p_data->>'id')::uuid; 

  DELETE FROM tasks
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