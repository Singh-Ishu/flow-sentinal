package websocket

import "github.com/gin-gonic/gin"

type Hub struct {}

func NewHub() *Hub {
	return &Hub{}
}

func (h *Hub) Run() {
	// Simple stub for now
}
