-- Clean up duplicate/invalid records in preferencias_usuario
-- Keep only the record with valid JSON object containing currentWeight
DELETE FROM preferencias_usuario 
WHERE user_email = 'noemicunha@live.com' 
AND id IN ('bc898dc6-3ddb-435e-b53c-0ca861123719', 'a3cfaaa4-ee2b-4d72-8183-6251219aeef4');