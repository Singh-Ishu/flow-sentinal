package service

import "flow-sentinel/internal/db"

type TaskService struct {
	db *db.Database
}

func NewTaskService(db *db.Database) *TaskService {
	return &TaskService{db: db}
}
