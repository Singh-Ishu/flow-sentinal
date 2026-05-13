package models

import "time"

type AlertStatus string
type AlertSeverity string

const (
	AlertStatusOpen         AlertStatus = "open"
	AlertStatusAcknowledged AlertStatus = "acknowledged"
	AlertStatusResolved     AlertStatus = "resolved"

	AlertSeverityLow      AlertSeverity = "low"
	AlertSeverityMedium   AlertSeverity = "medium"
	AlertSeverityHigh     AlertSeverity = "high"
	AlertSeverityCritical AlertSeverity = "critical"
)

type Alert struct {
	ID             int64         `db:"id" json:"id"`
	NodeID         string        `db:"node_id" json:"node_id"`
	Title          string        `db:"title" json:"title"`
	Description    string        `db:"description" json:"description"`
	Severity       AlertSeverity `db:"severity" json:"severity"`
	Status         AlertStatus   `db:"status" json:"status"`
	DetectedAt     time.Time     `db:"detected_at" json:"detected_at"`
	AcknowledgedAt *time.Time    `db:"acknowledged_at" json:"acknowledged_at,omitempty"`
	ResolvedAt     *time.Time    `db:"resolved_at" json:"resolved_at,omitempty"`
	CreatedAt      time.Time     `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time     `db:"updated_at" json:"updated_at"`
}

type AcknowledgeAlertRequest struct {
	Note string `json:"note" binding:"omitempty"`
}

type ResolveAlertRequest struct {
	Note string `json:"note" binding:"omitempty"`
}

type AlertFilter struct {
	Status   AlertStatus
	Severity AlertSeverity
	NodeID   string
	Limit    int
	Offset   int
}
