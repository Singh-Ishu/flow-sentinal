package service

import "flow-sentinel/internal/db"

type AlertService struct {
	db *db.Database
}

func NewAlertService(db *db.Database) *AlertService {
	return &AlertService{db: db}
}
