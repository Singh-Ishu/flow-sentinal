package service

import "flow-sentinel/internal/db"

type UserService struct {
	db *db.Database
}

func NewUserService(db *db.Database) *UserService {
	return &UserService{db: db}
}
