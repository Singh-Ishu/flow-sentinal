package models

import "time"

type TaskStatus string
type TaskPriority string

const (
	TaskStatusOpen       TaskStatus = "open"
	TaskStatusInProgress TaskStatus = "in_progress"
	TaskStatusCompleted  TaskStatus = "completed"
	TaskStatusCancelled  TaskStatus = "cancelled"

	TaskPriorityLow      TaskPriority = "low"
	TaskPriorityMedium   TaskPriority = "medium"
	TaskPriorityHigh     TaskPriority = "high"
	TaskPriorityCritical TaskPriority = "critical"
)

type Task struct {
	ID          int64        `db:"id" json:"id"`
	AlertID     *int64       `db:"alert_id" json:"alert_id,omitempty"` // optional link to triggering alert
	Title       string       `db:"title" json:"title"`
	Description string       `db:"description" json:"description"`
	Priority    TaskPriority `db:"priority" json:"priority"`
	Status      TaskStatus   `db:"status" json:"status"`
	AssignedTo  *int         `db:"assigned_to" json:"assigned_to,omitempty"` // user ID
	DueDate     *time.Time   `db:"due_date" json:"due_date,omitempty"`
	CompletedAt *time.Time   `db:"completed_at" json:"completed_at,omitempty"`
	CreatedAt   time.Time    `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time    `db:"updated_at" json:"updated_at"`
}

type CreateTaskRequest struct {
	AlertID     *int64       `json:"alert_id" binding:"omitempty"`
	Title       string       `json:"title" binding:"required"`
	Description string       `json:"description" binding:"omitempty"`
	Priority    TaskPriority `json:"priority" binding:"omitempty"`
	AssignedTo  *int         `json:"assigned_to" binding:"omitempty"`
	DueDate     *time.Time   `json:"due_date" binding:"omitempty"`
}

type UpdateTaskRequest struct {
	Title       string       `json:"title" binding:"omitempty"`
	Description string       `json:"description" binding:"omitempty"`
	Priority    TaskPriority `json:"priority" binding:"omitempty"`
	Status      TaskStatus   `json:"status" binding:"omitempty"`
	AssignedTo  *int         `json:"assigned_to" binding:"omitempty"`
	DueDate     *time.Time   `json:"due_date" binding:"omitempty"`
}

type TaskFilter struct {
	Status     TaskStatus
	Priority   TaskPriority
	AssignedTo *int
	Limit      int
	Offset     int
}
