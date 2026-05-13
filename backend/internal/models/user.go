package models

import (
	"time"
)

type Role string

const (
	RoleAdmin      Role = "admin"
	RoleAnalyst    Role = "analyst"
	RoleContractor Role = "contractor"
)

type User struct {
	ID           int       `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	FullName     string    `db:"full_name" json:"full_name"`
	PasswordHash string    `db:"password_hash" json:"-"` // never expose in JSON
	Role         Role      `db:"role" json:"role"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token     string `json:"token"`
	User      User   `json:"user"`
	ExpiresAt int64  `json:"expires_at"`
}

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	FullName string `json:"full_name" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
	Role     Role   `json:"role" binding:"required"`
}

type UpdateUserRequest struct {
	Email    string `json:"email" binding:"omitempty,email"`
	FullName string `json:"full_name" binding:"omitempty"`
	Role     Role   `json:"role" binding:"omitempty"`
}
