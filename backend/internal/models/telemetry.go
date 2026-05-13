package models

import "time"

type Telemetry struct {
	ID          int64     `db:"id" json:"id"`
	NodeID      string    `db:"node_id" json:"node_id"`         // unique identifier for pipeline segment/sensor
	FlowRate    float64   `db:"flow_rate" json:"flow_rate"`     // L/min
	Pressure    float64   `db:"pressure" json:"pressure"`       // PSI
	Temperature float64   `db:"temperature" json:"temperature"` // Celsius
	Timestamp   time.Time `db:"timestamp" json:"timestamp"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"` // when received by backend
}

type TelemetryIngestRequest struct {
	NodeID      string    `json:"node_id" binding:"required"`
	FlowRate    float64   `json:"flow_rate" binding:"required"`
	Pressure    float64   `json:"pressure" binding:"required"`
	Temperature float64   `json:"temperature" binding:"required"`
	Timestamp   time.Time `json:"timestamp" binding:"required"`
}

type TelemetryHistoryFilter struct {
	NodeID    string
	StartTime time.Time
	EndTime   time.Time
	Limit     int
	Offset    int
}

type LatestTelemetryResponse struct {
	Nodes map[string]Telemetry `json:"nodes"` // keyed by node_id
}
