ALTER TABLE "task"
    ADD CONSTRAINT fk_task_alert 
    FOREIGN KEY ("alert_id") REFERENCES "alert"("id") 
    ON DELETE SET NULL;

ALTER TABLE "task"
    ADD CONSTRAINT fk_task_assigned_to 
    FOREIGN KEY ("assigned_to") REFERENCES "user"("id") 
    ON DELETE SET NULL;