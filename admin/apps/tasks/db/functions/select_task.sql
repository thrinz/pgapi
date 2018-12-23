CREATE OR REPLACE FUNCTION select_task ( p_data json)
  RETURNS json AS
$BODY$ 
DECLARE 
  l_out json;
  l_message_text text;
  l_exception_detail text;
  l_exception_hint text;
  -- 
  l_data text;
  l_id   uuid;
  l_params json;
BEGIN 
  
  l_params := (p_data->>'urlparams')::json;

  IF l_params IS NOT NULL THEN
     l_id := (l_params->>'id')::uuid;
  END IF;

  IF l_id IS NULL THEN 
    SELECT array_to_json(array_agg(row_to_json(t.*))) INTO l_data 
    FROM (SELECT * FROM tasks) t;
  ELSE
    SELECT array_to_json(array_agg(row_to_json(t.*))) INTO l_data 
    FROM (SELECT * FROM tasks WHERE id = l_id) t;
  END IF;
   
  l_out :=  '{"status" : "S" , "message" : "OK" , "data" : ' || l_data || '}';
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